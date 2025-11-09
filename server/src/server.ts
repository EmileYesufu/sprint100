import express, { type NextFunction } from "express";
import http from "http";
import { Server as SocketIOServer, type Socket } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "./prismaClient";
import { calculateEloChange } from "./utils/elo";
import { calculateMultiplayerElo } from "./utils/multiplayerElo";
import {
  createRace,
  getRace,
  updatePlayerProgress,
  getRaceProgress,
  startRace,
  startCountdown,
  finishRace,
  deleteRace,
  computeFinishThreshold,
} from "./services/raceService";
import {
  buildRaceSnapshot,
  handleRaceRejoin,
  handleRaceTap,
  type RaceSocketContext,
} from "./socket/raceHandlers";
import {
  enqueueUser,
  dequeueUser,
  getNextMatchCandidates,
  createMatchFromQueue,
  createChallenge,
  acceptChallenge,
  declineChallenge,
  linkSocketToMatch,
  persistResult,
  type PersistedResultPlayer,
} from "./services/matchStore";
import { MatchStatus, QueueStatus } from "@prisma/client";
import { createPasswordResetRequest, PasswordResetError, resetPasswordWithToken } from "./services/passwordResetService";
import { recordEvents, ALLOWED_EVENTS } from "./services/eventService";

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
import { 
  HOST, 
  PORT, 
  JWT_SECRET, 
  ALLOWED_ORIGINS, 
  NODE_ENV,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX,
  ENABLE_REQUEST_LOGGING
} from "./config";

const app = express();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Security headers (helmet)
app.use(helmet({
  contentSecurityPolicy: NODE_ENV === "production",
}));

// Request logging (morgan)
if (ENABLE_REQUEST_LOGGING) {
  app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
  message: { error: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// CORS configuration - use configured origins
app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Authentication middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const payload: any = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Health check endpoints
app.get("/health/live", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/health/ready", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const pendingQueue = await prisma.matchQueue.count({ where: { status: "PENDING" } });
    res.json({
      status: "ready",
      database: "connected",
      pendingQueue,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(503).json({
      status: "not ready",
      database: "disconnected",
      error: error?.message ?? "Database connection failed",
    });
  }
});

// Username validation: alphanumeric + underscore, 3-20 chars
function validateUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}


// Search users by username (for challenge feature)
app.get("/api/users/search", async (req, res) => {
  const query = req.query.q as string;
  if (!query || query.length < 2) {
    return res.status(400).json({ error: "query too short (min 2 chars)" });
  }
  
  try {
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: query,
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
        elo: true,
      },
      take: 10, // Limit results
    });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: "search failed" });
  }
});

// Get leaderboard (protected)
app.get("/api/leaderboard", authenticateToken, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        username: true,
        elo: true,
        matchesPlayed: true,
        wins: true,
      },
      orderBy: { elo: 'desc' },
      take: 50,
    });

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      elo: user.elo,
      matchesPlayed: user.matchesPlayed ?? 0,
      wins: user.wins ?? 0,
    }));

    res.status(200).json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(500).json({ error: "failed to fetch leaderboard" });
  }
});

// Get user data by ID (protected)
app.get("/api/users/:userId", authenticateToken, async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) {
    return res.status(400).json({ error: "invalid user ID" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        elo: true,
        matchesPlayed: true,
        wins: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "failed to fetch user" });
  }
});

// Get user matches (protected)
app.get("/api/users/:userId/matches", authenticateToken, async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) {
    return res.status(400).json({ error: "invalid user ID" });
  }

  try {
    const limit = parseInt(req.query.limit as string) || 20;
    
    const matches = await prisma.match.findMany({
      where: {
        players: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        players: {
          select: {
            userId: true,
            finishPosition: true,
            deltaElo: true,
            user: {
              select: {
                username: true,
                elo: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // Format response for each match
    const formattedMatches = matches.map((match) => {
      // Find the requesting user's player data
      const userPlayer = match.players.find((p) => p.userId === userId);
      
      // Get opponents (all other players)
      const opponents = match.players
        .filter((p) => p.userId !== userId)
        .map((p) => ({
          username: p.user.username || 'Unknown',
          elo: p.user.elo,
        }));

      return {
        matchId: match.id,
        timestamp: match.createdAt.toISOString(),
        placement: userPlayer?.finishPosition || null,
        eloDelta: userPlayer?.deltaElo || null,
        opponents: opponents,
      };
    });

    res.json(formattedMatches);
  } catch (error) {
    console.error("Error fetching user matches:", error);
    res.status(500).json({ error: "failed to fetch user matches" });
  }
});

const handleTokenRefresh = async (req: express.Request, res: express.Response) => {
  try {
    const authUser = req.user;
    if (!authUser?.userId) {
      return res.status(401).json({ error: "unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: { id: true, email: true, username: true, elo: true },
    });

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    const newToken = jwt.sign(
      { userId: user.id, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ token: newToken, user });
  } catch (error) {
    res.status(500).json({ error: "failed to refresh token" });
  }
};

app.post("/api/auth/refresh", authenticateToken, handleTokenRefresh);

// DEPRECATED: use /api/auth/refresh; maintained temporarily for legacy clients
app.post("/api/refresh", authenticateToken, (req, res) => {
  return handleTokenRefresh(req, res);
});

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: "Too many authentication attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to auth endpoints
app.post("/api/register", authLimiter, async (req, res) => {
  const { email, password, username } = req.body;
  if (!email || !password || !username) return res.status(400).json({ error: "email, password, and username required" });

  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "invalid email format" });
  }
  
  if (!validateUsername(username)) {
    return res.status(400).json({ error: "Invalid username. Use 3-20 alphanumeric characters or underscores." });
  }
  
  const emailExists = await prisma.user.findUnique({ where: { email } });
  if (emailExists) return res.status(400).json({ error: "email already taken" });
  
  const usernameExists = await prisma.user.findUnique({ where: { username } });
  if (usernameExists) return res.status(400).json({ error: "username already taken" });
  
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, username, password: hash } });
  const token = jwt.sign(
    { userId: user.id, email: user.email, username: user.username }, 
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  res.json({ token, user: { id: user.id, email: user.email, username: user.username, elo: user.elo } });
});

app.post("/api/login", authLimiter, async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "invalid credentials" });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: "invalid credentials" });
  const token = jwt.sign(
    { userId: user.id, email: user.email, username: user.username }, 
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  res.json({ token, user: { id: user.id, email: user.email, username: user.username, elo: user.elo } });
});

// Forgot password endpoint

const forgotPasswordHandler = async (req: express.Request, res: express.Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: { code: "invalid_request", message: "Email address is required." } });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: { code: "invalid_email", message: "Invalid email address format." } });
    }

    await createPasswordResetRequest(email);

    return res.json({
      message: "If an account exists with that email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      error: { code: "server_error", message: "Unable to process password reset request. Please try again later." },
    });
  }
};

app.post("/api/auth/forgot", authLimiter, forgotPasswordHandler);
app.post("/api/auth/forgot-password", authLimiter, forgotPasswordHandler);

app.post("/api/auth/reset", authLimiter, async (req, res) => {
  try {
    const { token, password } = req.body || {};

    if (!token || !password) {
      return res.status(400).json({
        error: { code: "invalid_request", message: "Token and new password are required." },
      });
    }

    await resetPasswordWithToken(token, password);

    return res.json({ message: "Password reset successful. You can now log in with your new password." });
  } catch (error: any) {
    if (error instanceof PasswordResetError) {
      const status = error.code === "invalid_password" ? 400 : 400;
      return res.status(status).json({ error: { code: error.code, message: error.message } });
    }

    console.error("Reset password error:", error);
    return res.status(500).json({
      error: { code: "server_error", message: "Unable to reset password. Please try again later." },
    });
  }
});

app.post("/api/events", authenticateToken, async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ error: { code: "unauthorized", message: "User context required" } });
  }

  const payload = Array.isArray(req.body?.events)
    ? req.body.events
    : req.body
    ? [req.body]
    : [];

  if (!payload.length) {
    return res.status(400).json({
      error: { code: "invalid_request", message: "events payload required" },
    });
  }

  try {
    const normalized = payload.map((event: any) => ({
      eventName: event?.eventName,
      timestamp: event?.timestamp,
      metadata:
        event && typeof event.metadata === "object" && event.metadata !== null && !Array.isArray(event.metadata)
          ? event.metadata
          : null,
    }));

    await recordEvents(userId, normalized);

    return res.status(202).json({ success: true, recorded: normalized.length });
  } catch (error: any) {
    if (error instanceof Error) {
      if (error.message === "invalid_event_name" || error.message === "unsupported_event") {
        return res.status(400).json({
          error: {
            code: error.message,
            message: `eventName must be one of: ${Array.from(ALLOWED_EVENTS).join(", ")}`,
          },
        });
      }
      if (error.message === "invalid_timestamp") {
        return res.status(400).json({
          error: { code: "invalid_timestamp", message: "timestamp must be ISO8601" },
        });
      }
    }
    console.error("Error recording events:", error);
    return res.status(500).json({ error: { code: "server_error", message: "Unable to record events" } });
  }
});

// Global error handler for structured logging
app.use((err: any, req: express.Request, res: express.Response, _next: NextFunction) => {
  const status = typeof err?.status === "number" ? err.status : 500;

  const logEntry = {
    scope: "http",
    level: status >= 500 ? "error" : "warn",
    status,
    method: req.method,
    path: req.originalUrl,
    message: err?.message || "Unhandled error",
    timestamp: new Date().toISOString(),
  };

  console.error(JSON.stringify(logEntry));

  if (res.headersSent) {
    return;
  }

  const safeMessage = status >= 500 ? "Internal server error" : err?.message || "Request failed";
  res.status(status).json({ error: safeMessage });
});

const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { 
    origin: ALLOWED_ORIGINS,
    credentials: true,
  },
});

const matches = new Map<number, any>();
const userSockets = new Map<number, string>(); // userId -> socketId mapping
let matchIdCounter = 1;

async function broadcastQueueState() {
  const entries = await prisma.matchQueue.findMany({
    where: { status: QueueStatus.PENDING },
    orderBy: { createdAt: "asc" },
    include: { user: true },
  });

  const payload = entries.map((entry) => ({
    userId: entry.userId,
    email: entry.user.email,
    elo: entry.user.elo,
  }));

  io.emit("queue_update", payload);
}

async function maybeCreateMatchFromQueue() {
  const candidates = await getNextMatchCandidates(2);
  if (candidates.length < 2) {
    return;
  }

  const matchRecord = await createMatchFromQueue(candidates.map((candidate: any) => candidate.userId));
  await broadcastQueueState();
  await startMatchFromRecord(matchRecord);
}

async function startMatchFromRecord(matchRecord: any) {
  const playersWithSockets = matchRecord.players
    .map((player: any) => {
      const socketId = userSockets.get(player.userId);
      if (!socketId) {
        return null;
      }

      return {
        socketId,
        userId: player.userId,
        email: player.user?.email ?? `player${player.userId}@example.com`,
        username: player.user?.username ?? `Player ${player.userId}`,
        elo: player.user?.elo ?? 1200,
      };
    })
    .filter((p: any): p is { socketId: string; userId: number; email: string; username: string; elo: number } => Boolean(p));

  if (playersWithSockets.length !== matchRecord.players.length) {
    console.warn(`Not all players are connected for match ${matchRecord.id}, cancelling.`);
    await prisma.match.update({
      where: { id: matchRecord.id },
      data: { status: MatchStatus.CANCELLED },
    });

    const missing = matchRecord.players
      .filter((player: any) => !userSockets.get(player.userId))
      .map((player: any) => player.userId);

    await Promise.all(missing.map((userId: number) => enqueueUser(userId)));
    await broadcastQueueState();
    return;
  }

  matchIdCounter = Math.max(matchIdCounter, matchRecord.id + 1);
  createMatchWithPlayers(playersWithSockets, matchRecord.id);

  await Promise.all(
    playersWithSockets.map((player: any) => linkSocketToMatch(matchRecord.id, player.userId, player.socketId))
  );
}

io.use(async (socket, next) => {
  // token via socket.handshake.auth.token
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("auth required"));
  try {
    const payload: any = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return next(new Error("user not found"));
    (socket as any).user = { id: user.id, email: user.email, username: user.username, elo: user.elo };
    next();
  } catch (err) {
    next(new Error("invalid token"));
  }
});

io.on("connection", (socket) => {
  const user = (socket as any).user;
  console.log("connected", user.username || user.email);
  
  // Register user socket for challenge routing
  userSockets.set(user.id, socket.id);

  socket.on("join_queue", async () => {
    try {
      await enqueueUser(user.id);
      socket.emit("queue_joined");
      await broadcastQueueState();
      await maybeCreateMatchFromQueue();
    } catch (error) {
      console.error("Failed to join queue", error);
      socket.emit("queue_error", { error: "failed_to_join_queue" });
    }
  });

  socket.on("leave_queue", async () => {
    try {
      await dequeueUser(user.id);
      socket.emit("queue_left");
      await broadcastQueueState();
    } catch (error) {
      console.error("Failed to leave queue", error);
      socket.emit("queue_error", { error: "failed_to_leave_queue" });
    }
  });

  // Challenge system - send challenge to another user by username
  socket.on("send_challenge", async (payload: { targetUsername: string }) => {
    try {
      const targetUser = await prisma.user.findUnique({ where: { username: payload.targetUsername } });
      if (!targetUser) {
        socket.emit("challenge_error", { error: "User not found" });
        return;
      }

      if (targetUser.id === user.id) {
        socket.emit("challenge_error", { error: "Cannot challenge yourself" });
        return;
      }

      await createChallenge(user.id, targetUser.id);

      const targetSocketId = userSockets.get(targetUser.id);
      if (targetSocketId) {
        io.to(targetSocketId).emit("challenge_received", {
          from: user.username,
          fromId: user.id,
          fromElo: user.elo,
        });
      }

      socket.emit("challenge_sent", { to: targetUser.username });
    } catch (error) {
      console.error("Failed to create challenge", error);
      socket.emit("challenge_error", { error: "Failed to send challenge" });
    }
  });

  // Accept challenge
  socket.on("accept_challenge", async (payload: { fromId: number }) => {
    try {
      const result = await acceptChallenge(payload.fromId, user.id);
      if (!result) {
        socket.emit("challenge_error", { error: "Challenge not found or already handled" });
        return;
      }

      const matchRecord = result.match;
      await startMatchFromRecord(matchRecord);
    } catch (error) {
      console.error("Failed to accept challenge", error);
      socket.emit("challenge_error", { error: "Failed to accept challenge" });
    }
  });

  // Decline challenge
  socket.on("decline_challenge", async (payload: { fromId: number }) => {
    try {
      await declineChallenge(payload.fromId, user.id);

      const challengerSocketId = userSockets.get(payload.fromId);
      if (challengerSocketId) {
        io.to(challengerSocketId).emit("challenge_declined", { by: user.username });
      }
    } catch (error) {
      console.error("Failed to decline challenge", error);
      socket.emit("challenge_error", { error: "Failed to decline challenge" });
    }
  });

  // Join race room (called when player enters race screen)
  socket.on("join_race", (payload: { matchId: number }) => {
    const race = getRace(payload.matchId);
    if (!race) {
      socket.emit("race_error", { error: "Race not found" });
      return;
    }

    const player = race.players.find(p => p.socketId === socket.id);
    if (!player) {
      socket.emit("race_error", { error: "Not a participant in this race" });
      return;
    }

    // Join the race room
    socket.join(race.roomName);
    linkSocketToMatch(payload.matchId, user.id, socket.id);
    
    // If countdown hasn't started, start it
    if (!race.countdownStart) {
      const countdownStartTime = Date.now();
      startCountdown(payload.matchId, countdownStartTime);
      
      // Broadcast countdown start to all players in room
      io.to(race.roomName).emit("countdown_start", { 
        matchId: payload.matchId,
        countdownStart: countdownStartTime,
      });

      // Start race after countdown (3-2-1-GO = ~3 seconds)
      setTimeout(() => {
        if (startRace(payload.matchId)) {
          io.to(race.roomName).emit("race_start", { matchId: payload.matchId });
        }
      }, 3000);
    }

    socket.emit("race_joined", { matchId: payload.matchId, roomName: race.roomName });
  });

  // Leave race room
  socket.on("leave_race", (payload: { matchId: number }) => {
    const race = getRace(payload.matchId);
    if (race) {
      socket.leave(race.roomName);
    }
  });

  const raceContext: RaceSocketContext = {
    io,
    matches,
    userSockets,
    jwtSecret: JWT_SECRET,
    endMatch: (raceOrMatch: any, finishedPlayers: any[]) => endMatch(raceOrMatch, finishedPlayers),
    linkSocketToMatch: (matchId: number, userId: number, socketId: string) =>
      linkSocketToMatch(matchId, userId, socketId),
  };

  socket.on("tap", (payload: { matchId: number; side: "left" | "right"; ts: number }) => {
    handleRaceTap(raceContext, socket as Socket, payload);
  });

  socket.on("race_tap", (payload: { matchId: number; side: "left" | "right"; ts?: number }) => {
    handleRaceTap(raceContext, socket as Socket, payload);
  });

  socket.on("rejoin_race", (payload: { matchId: number; token: string }) => {
    handleRaceRejoin(raceContext, socket as Socket, payload);
  });

  socket.on("disconnect", async () => {
    try {
      await dequeueUser(user.id);
      await broadcastQueueState();
    } catch (error) {
      console.error("Failed to dequeue on disconnect", error);
    }

    // Remove from userSockets mapping
    userSockets.delete(user.id);
    
    // Handle disconnect during match
    const activeMatch = findMatchBySocketId(socket.id);
    if (activeMatch) {
      handleMatchDisconnection(activeMatch, socket.id, user.id);
    }
    
    console.log("disconnected", user.username || user.email);
  });
});

/**
 * Find the active match containing a player with the given socket ID
 */
function findMatchBySocketId(socketId: string): any | null {
  for (const match of matches.values()) {
    if (match.players.some((p: any) => p.socketId === socketId)) {
      return match;
    }
  }
  return null;
}

/**
 * Handle player disconnection during an active match
 * Marks disconnected player as DNF, awards win to remaining player, updates ELO
 */
async function handleMatchDisconnection(match: any, disconnectedSocketId: string, disconnectedUserId: number) {
  const disconnectedPlayer = match.players.find((p: any) => p.socketId === disconnectedSocketId);
  const remainingPlayer = match.players.find((p: any) => p.socketId !== disconnectedSocketId);
  
  if (!disconnectedPlayer || !remainingPlayer) {
    // Invalid match state, just clean up
    matches.delete(match.id);
    return;
  }
  
  // Store match in database with DNF status
  const dbMatch = await prisma.match.create({ 
    data: { 
      duration: Date.now() - match.startedAt 
    } 
  });
  
  // Calculate ELO changes: remaining player wins, disconnected player loses
  const outcomeRemaining = 1; // Remaining player wins
  const deltaRemaining = calculateEloChange(remainingPlayer.elo, disconnectedPlayer.elo, outcomeRemaining);
  const deltaDisconnected = -deltaRemaining;
  
  // Create MatchPlayer records
  await prisma.matchPlayer.create({
    data: { 
      matchId: dbMatch.id, 
      userId: remainingPlayer.userId, 
      finishPosition: 1, 
      timeMs: null, 
      deltaElo: deltaRemaining 
    },
  });
  
  await prisma.matchPlayer.create({
    data: { 
      matchId: dbMatch.id, 
      userId: disconnectedPlayer.userId, 
      finishPosition: null, // null = DNF (Did Not Finish)
      timeMs: null, 
      deltaElo: deltaDisconnected 
    },
  });
  
  // Update ELO ratings
  await prisma.user.update({ 
    where: { id: remainingPlayer.userId }, 
    data: { 
      elo: { increment: deltaRemaining },
      matchesPlayed: { increment: 1 },
      wins: { increment: 1 }
    } 
  });
  
  await prisma.user.update({ 
    where: { id: disconnectedPlayer.userId }, 
    data: { 
      elo: { increment: deltaDisconnected },
      matchesPlayed: { increment: 1 }
    } 
  });
  
  // Notify remaining player about the disconnection
  io.to(remainingPlayer.socketId).emit("match_end", {
    matchId: match.id,
    result: [
      { userId: remainingPlayer.userId, meters: remainingPlayer.meters },
      { userId: disconnectedPlayer.userId, meters: disconnectedPlayer.meters, dnf: true }
    ],
    eloDeltas: [
      { userId: remainingPlayer.userId, delta: deltaRemaining },
      { userId: disconnectedPlayer.userId, delta: deltaDisconnected }
    ],
    reason: "opponent_disconnected"
  });
  
  // Clean up match
  matches.delete(match.id);
  
  console.log(`Match ${match.id} ended due to disconnection: ${disconnectedPlayer.username || disconnectedPlayer.email} disconnected`);
}

/**
 * Create a match with specified number of players (2-8)
 */
function createMatchWithPlayers(
  players: Array<{ socketId: string; userId: number; email: string; username: string; elo: number }>,
  existingMatchId?: number
): void {
  if (players.length < 2 || players.length > 8) {
    console.error(`Invalid player count: ${players.length}. Must be between 2 and 8.`);
    return;
  }

  const matchId = existingMatchId ?? matchIdCounter++;
  if (existingMatchId) {
    matchIdCounter = Math.max(matchIdCounter, existingMatchId + 1);
  }
  
  // Create race using race service
  const race = createRace(matchId, players);
  
  // Store in matches map for backward compatibility
  matches.set(matchId, {
    id: matchId,
    players: race.players.map(p => ({
      socketId: p.socketId,
      userId: p.userId,
      email: p.email,
      username: p.username,
      elo: p.elo,
      steps: p.steps,
      meters: p.meters,
      lastSide: p.lastSide,
      timeMs: p.timeMs,
    })),
    startedAt: race.startedAt,
  });

  // Notify all players match started
  race.players.forEach((p) => {
    const opponents = race.players
      .filter(x => x.socketId !== p.socketId)
      .map(x => x.username || x.email || "Unknown");
    
    io.to(p.socketId).emit("match_start", { 
      matchId, 
      opponent: opponents.length === 1 ? opponents[0] : opponents.join(", "),
      playerCount: players.length,
      roomName: race.roomName,
    });
  });
}

async function endMatch(matchOrRace: any, finishedPlayers: any[]) {
  const raceState = getRace(matchOrRace.id);
  
  if (raceState) {
    const duration = Date.now() - raceState.startedAt;
    
    const playerResults = raceState.players.map(p => ({
      userId: p.userId,
      finishPosition: p.finishPosition || raceState.players.length,
      elo: p.elo,
    }));

    const eloDeltas = calculateMultiplayerElo(playerResults);

    const persistedPlayers: PersistedResultPlayer[] = raceState.players.map((player) => {
      const eloDelta = eloDeltas.find(e => e.userId === player.userId);
      return {
        userId: player.userId,
        finishPosition: player.finishPosition ?? null,
        timeMs: player.timeMs ?? null,
        deltaElo: eloDelta?.delta ?? null,
      };
    });

    try {
      await persistResult(matchOrRace.id, persistedPlayers, MatchStatus.COMPLETED);
      await prisma.match.update({
        where: { id: matchOrRace.id },
        data: { duration },
      });
    } catch (error) {
      console.warn(`Persist result fallback for match ${matchOrRace.id}:`, error);
      const fallbackMatch = await prisma.match.upsert({
        where: { id: matchOrRace.id },
        update: { duration, status: MatchStatus.COMPLETED },
        create: {
          id: matchOrRace.id,
          status: MatchStatus.COMPLETED,
          duration,
        },
      });

      await Promise.all(
        raceState.players.map((player) =>
          prisma.matchPlayer.upsert({
            where: { matchId_userId: { matchId: fallbackMatch.id, userId: player.userId } },
            update: {
              finishPosition: player.finishPosition ?? null,
              timeMs: player.timeMs ?? null,
            },
            create: {
              matchId: fallbackMatch.id,
              userId: player.userId,
              finishPosition: player.finishPosition ?? null,
              timeMs: player.timeMs ?? null,
            },
          })
        )
      );
    }

    const updatePromises = [];
    for (const player of raceState.players) {
      const eloDelta = eloDeltas.find(e => e.userId === player.userId);
      if (!eloDelta) continue;

      const updateData: any = {
        elo: { increment: eloDelta.delta },
        matchesPlayed: { increment: 1 },
      };
      
      if (player.finishPosition === 1) {
        updateData.wins = { increment: 1 };
      }

      updatePromises.push(
        prisma.user.update({
          where: { id: player.userId },
          data: updateData,
        })
      );
    }

    await Promise.all(updatePromises);

    const raceResults = raceState.players.map(p => ({
      userId: p.userId,
      meters: p.meters,
      finishPosition: p.finishPosition,
      timeMs: p.timeMs,
    }));

    const completionPayload = {
      matchId: matchOrRace.id,
      result: raceResults,
      eloDeltas: eloDeltas.map(e => ({ userId: e.userId, delta: e.delta })),
      threshold: computeFinishThreshold(raceState.players.length),
    };

    io.to(raceState.roomName).emit("race_complete", completionPayload);
    io.to(raceState.roomName).emit("race_end", completionPayload);

    const legacyPayload = {
      matchId: matchOrRace.id,
      result: raceResults,
      eloDeltas: eloDeltas.map(e => ({ userId: e.userId, delta: e.delta })),
    };

    io.to(raceState.roomName).emit("match_end", legacyPayload);

    // Cleanup
    deleteRace(matchOrRace.id);
    matches.delete(matchOrRace.id);

    console.log(`Race ${matchOrRace.id} completed with ${raceState.players.length} players`);
    return;
  }

  const match = matchOrRace;
  const ordered = match.players.slice().sort((a: any, b: any) => b.meters - a.meters);
  const dbMatch = await prisma.match.create({ data: { duration: Date.now() - match.startedAt, status: MatchStatus.COMPLETED } });
  if (match.players.length === 2) {
    const pA = match.players[0];
    const pB = match.players[1];
    const outcomeA = (pA.meters >= 100 && pA.meters >= pB.meters) ? 1 : 0;
    const deltaA = calculateEloChange(pA.elo, pB.elo, outcomeA);
    const deltaB = -deltaA;
    await prisma.matchPlayer.create({
      data: { matchId: dbMatch.id, userId: pA.userId, finishPosition: outcomeA === 1 ? 1 : 2, timeMs: null, deltaElo: deltaA },
    });
    await prisma.matchPlayer.create({
      data: { matchId: dbMatch.id, userId: pB.userId, finishPosition: outcomeA === 1 ? 2 : 1, timeMs: null, deltaElo: deltaB },
    });
    const updateA: any = { 
      elo: { increment: deltaA },
      matchesPlayed: { increment: 1 }
    };
    if (outcomeA === 1) {
      updateA.wins = { increment: 1 };
    }
    await prisma.user.update({ 
      where: { id: pA.userId }, 
      data: updateA
    });
    
    const updateB: any = { 
      elo: { increment: deltaB },
      matchesPlayed: { increment: 1 }
    };
    if (outcomeA === 0) {
      updateB.wins = { increment: 1 };
    }
    await prisma.user.update({ 
      where: { id: pB.userId }, 
      data: updateB
    });

    match.players.forEach((p: any) => {
      io.to(p.socketId).emit("match_end", { matchId: match.id, result: ordered.map((q: any) => ({ userId: q.userId, meters: q.meters })), eloDeltas: [{ userId: pA.userId, delta: deltaA }, { userId: pB.userId, delta: deltaB }] });
    });
  }
  matches.delete(match.id);
}

// Export app for testing
export { app, httpServer };

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'testing') {
  httpServer.listen(PORT, HOST, () => {
    console.log(`\n🚀 Sprint100 Server Started`);
    console.log(`   Environment: ${NODE_ENV}`);
    console.log(`   Listening on: http://${HOST}:${PORT}`);
    console.log(`   Local access: http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/health`);

    const primaryOrigin = ALLOWED_ORIGINS.find((origin) => origin.startsWith("http"));
    if (primaryOrigin) {
      console.log(`   External access: ${primaryOrigin}`);
    }
    if (HOST === "0.0.0.0" && !primaryOrigin) {
      console.log(`   External access: configure ALLOWED_ORIGINS for public usage`);
    }
    console.log("");
  });
}
