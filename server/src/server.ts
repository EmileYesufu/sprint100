import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
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

const prisma = new PrismaClient();
const app = express();

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
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/ready", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ready", database: "connected", timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: "not ready", database: "disconnected", error: "Database connection failed" });
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

// Token refresh endpoint (protected)
app.post("/api/refresh", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      select: { id: true, email: true, username: true, elo: true }
    });
    
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }
    
    const newToken = jwt.sign(
      { userId: user.id, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ token: newToken, user });
  } catch (error) {
    res.status(500).json({ error: "failed to refresh token" });
  }
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
app.post("/api/auth/forgot-password", authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email address is required" });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email address format" });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    
    // For security, always return success message even if user doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      return res.json({ 
        message: "If an account exists with that email, a password reset link has been sent." 
      });
    }

    // TODO: Generate reset token and send email
    // For MVP, we'll just return a success message
    // In production, you would:
    // 1. Generate a secure token (using crypto.randomBytes or uuid)
    // 2. Store it in database with expiration (e.g., 1 hour)
    // 3. Send email with reset link containing the token
    // 4. Implement /api/auth/reset-password endpoint to validate token and update password

    return res.json({ 
      message: "Password reset link has been sent to your email address." 
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ 
      error: "Unable to process password reset request. Please try again later." 
    });
  }
});

const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { 
    origin: ALLOWED_ORIGINS,
    credentials: true,
  },
});

// Simple in-memory queue, matches, and challenges store (dev only)
const queue: Array<{ socketId: string; userId: number; email: string; username: string; elo: number }> = [];
const matches = new Map<number, any>();
const challenges = new Map<string, any>(); // key: challengerId-targetId
const userSockets = new Map<number, string>(); // userId -> socketId mapping
let matchIdCounter = 1;

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

  socket.on("join_queue", () => {
    if (queue.find((q) => q.socketId === socket.id)) return;
    queue.push({ socketId: socket.id, userId: user.id, email: user.email, username: user.username, elo: user.elo });
    socket.emit("queue_joined");
    tryPair();
  });

  socket.on("leave_queue", () => {
    const idx = queue.findIndex((q) => q.socketId === socket.id);
    if (idx >= 0) queue.splice(idx, 1);
    socket.emit("queue_left");
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
      
      const targetSocketId = userSockets.get(targetUser.id);
      if (!targetSocketId) {
        socket.emit("challenge_error", { error: "User is offline" });
        return;
      }
      
      const challengeKey = `${user.id}-${targetUser.id}`;
      if (challenges.has(challengeKey)) {
        socket.emit("challenge_error", { error: "Challenge already sent" });
        return;
      }
      
      // Store challenge
      const challenge = {
        challengerId: user.id,
        challengerUsername: user.username,
        challengerElo: user.elo,
        targetId: targetUser.id,
        targetUsername: targetUser.username,
        createdAt: Date.now(),
      };
      challenges.set(challengeKey, challenge);
      
      // Notify target
      io.to(targetSocketId).emit("challenge_received", {
        from: user.username,
        fromId: user.id,
        fromElo: user.elo,
      });
      
      socket.emit("challenge_sent", { to: targetUser.username });
    } catch (error) {
      socket.emit("challenge_error", { error: "Failed to send challenge" });
    }
  });

  // Accept challenge
  socket.on("accept_challenge", async (payload: { fromId: number }) => {
    const challengeKey = `${payload.fromId}-${user.id}`;
    const challenge = challenges.get(challengeKey);
    
    if (!challenge) {
      socket.emit("challenge_error", { error: "Challenge not found or expired" });
      return;
    }
    
    const challengerSocketId = userSockets.get(payload.fromId);
    if (!challengerSocketId) {
      socket.emit("challenge_error", { error: "Challenger is offline" });
      challenges.delete(challengeKey);
      return;
    }
    
    // Create match using race service
    const challenger = await prisma.user.findUnique({ where: { id: payload.fromId } });
    if (!challenger) return;
    
    const matchPlayers = [
      { socketId: challengerSocketId, userId: challenger.id, email: challenger.email, username: challenger.username, elo: challenger.elo },
      { socketId: socket.id, userId: user.id, email: user.email, username: user.username, elo: user.elo },
    ];
    
    createMatchWithPlayers(matchPlayers);
    
    // Remove challenge
    challenges.delete(challengeKey);
  });

  // Decline challenge
  socket.on("decline_challenge", (payload: { fromId: number }) => {
    const challengeKey = `${payload.fromId}-${user.id}`;
    const challenge = challenges.get(challengeKey);
    
    if (challenge) {
      challenges.delete(challengeKey);
      
      const challengerSocketId = userSockets.get(payload.fromId);
      if (challengerSocketId) {
        io.to(challengerSocketId).emit("challenge_declined", { by: user.username });
      }
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

  socket.on("tap", (payload: { matchId: number; side: "left" | "right"; ts: number }) => {
    // Try race service first (multiplayer)
    const raceResult = updatePlayerProgress(payload.matchId, socket.id, payload.side);
    
    if (raceResult) {
      // Using race service (multiplayer)
      const { race, shouldEnd, finishedPlayers } = raceResult;
      
      // Broadcast progress update to all players in the room
      const progress = getRaceProgress(payload.matchId);
      if (progress) {
        io.to(race.roomName).emit("race_update", {
          matchId: payload.matchId,
          players: progress.players,
        });
      }

      // Check if race should end based on threshold
      if (shouldEnd) {
        const finishedRace = finishRace(payload.matchId);
        if (finishedRace) {
          endMatch(finishedRace, finishedPlayers);
        }
      }
      return;
    }
    const m = matches.get(payload.matchId);
    if (!m) return;
    const player = m.players.find((p: any) => p.socketId === socket.id);
    if (!player) return;
    // simple validation: alternate sides
    if (player.lastSide === payload.side) {
      // ignore repeated same-side taps (simple rule)
      return;
    }
    player.lastSide = payload.side;
    player.steps++;
    // compute progress -- assume step = 0.6m
    player.meters = player.steps * 0.6;
    // notify both
    const state = {
      players: m.players.map((p: any) => ({ userId: p.userId, meters: p.meters, steps: p.steps })),
    };
    m.players.forEach((p: any) => io.to(p.socketId).emit("race_update", state));
    // check finish
    const finished = m.players.filter((p: any) => p.meters >= 100);
    if (finished.length > 0) {
      endMatch(m, finished);
    }
  });

  socket.on("disconnect", () => {
    // remove from queue
    const idx = queue.findIndex((q) => q.socketId === socket.id);
    if (idx >= 0) queue.splice(idx, 1);
    
    // Remove from userSockets mapping
    userSockets.delete(user.id);
    
    // Clean up any challenges from/to this user
    const challengesToDelete: string[] = [];
    challenges.forEach((challenge, key) => {
      if (challenge.challengerId === user.id || challenge.targetId === user.id) {
        challengesToDelete.push(key);
      }
    });
    challengesToDelete.forEach(key => challenges.delete(key));
    
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
function createMatchWithPlayers(players: Array<{ socketId: string; userId: number; email: string; username: string; elo: number }>): void {
  if (players.length < 2 || players.length > 8) {
    console.error(`Invalid player count: ${players.length}. Must be between 2 and 8.`);
    return;
  }

  const id = matchIdCounter++;
  
  // Create race using race service
  const race = createRace(id, players);
  
  // Store in matches map for backward compatibility
  matches.set(id, {
    id,
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
      matchId: id, 
      opponent: opponents.length === 1 ? opponents[0] : opponents.join(", "),
      playerCount: players.length,
      roomName: race.roomName,
    });
  });
}

/**
 * Try to pair players from queue (2-player default)
 */
function tryPair() {
  if (queue.length >= 2) {
    const [a, b] = queue.splice(0, 2);
    createMatchWithPlayers([a, b]);
  }
}

/**
 * Try to create multi-player race (4 or 8 players)
 */
function tryMultiplayerRace(playerCount: 4 | 8) {
  if (queue.length >= playerCount) {
    const players = queue.splice(0, playerCount);
    createMatchWithPlayers(players);
  }
}

async function endMatch(matchOrRace: any, finishedPlayers: any[]) {
  // Get race state from race service (if using race service)
  const raceState = getRace(matchOrRace.id);
  
  if (raceState) {
    // Using race service (multiplayer)
    const duration = Date.now() - raceState.startedAt;
    
    // Store match in database
    const dbMatch = await prisma.match.create({ 
      data: { 
        duration 
      } 
    });

    // Prepare players with finish positions for ELO calculation
    const playerResults = raceState.players.map(p => ({
      userId: p.userId,
      finishPosition: p.finishPosition || raceState.players.length,
      elo: p.elo,
    }));

    // Calculate ELO changes (supports 2-8 players)
    const eloDeltas = calculateMultiplayerElo(playerResults);

    // Create MatchPlayer records and update ELO
    const updatePromises = [];
    
    for (const player of raceState.players) {
      const eloDelta = eloDeltas.find(e => e.userId === player.userId);
      if (!eloDelta) continue;

      // Create MatchPlayer record
      updatePromises.push(
        prisma.matchPlayer.create({
          data: {
            matchId: dbMatch.id,
            userId: player.userId,
            finishPosition: player.finishPosition,
            timeMs: player.timeMs,
            deltaElo: eloDelta.delta,
          },
        })
      );

      // Update user ELO and statistics
      const updateData: any = {
        elo: { increment: eloDelta.delta },
        matchesPlayed: { increment: 1 },
      };
      
      // Increment wins if player finished in top position
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

    // Prepare race results for clients
    const raceResults = raceState.players.map(p => ({
      userId: p.userId,
      meters: p.meters,
      finishPosition: p.finishPosition,
      timeMs: p.timeMs,
    }));

    // Notify all players in the race room
    io.to(raceState.roomName).emit("race_complete", {
      matchId: matchOrRace.id,
      result: raceResults,
      eloDeltas: eloDeltas.map(e => ({ userId: e.userId, delta: e.delta })),
      threshold: computeFinishThreshold(raceState.players.length),
    });

    // Legacy match_end event for backward compatibility
    io.to(raceState.roomName).emit("match_end", {
      matchId: matchOrRace.id,
      result: raceResults,
      eloDeltas: eloDeltas.map(e => ({ userId: e.userId, delta: e.delta })),
    });

    // Cleanup
    deleteRace(matchOrRace.id);
    matches.delete(matchOrRace.id);

    console.log(`Race ${matchOrRace.id} completed with ${raceState.players.length} players`);
    return;
  }

  // Legacy 2-player match logic (backward compatibility)
  const match = matchOrRace;
  const ordered = match.players.slice().sort((a: any, b: any) => b.meters - a.meters);
  // store match
  const dbMatch = await prisma.match.create({ data: { duration: Date.now() - match.startedAt } });
  // compute Elo for two players only
  if (match.players.length === 2) {
    const pA = match.players[0];
    const pB = match.players[1];
    // determine outcome: 1 => pA wins else 0
    const outcomeA = (pA.meters >= 100 && pA.meters >= pB.meters) ? 1 : 0;
    const deltaA = calculateEloChange(pA.elo, pB.elo, outcomeA);
    const deltaB = -deltaA;
    // update DB and create MatchPlayer rows
    const mp1 = await prisma.matchPlayer.create({
      data: { matchId: dbMatch.id, userId: pA.userId, finishPosition: outcomeA === 1 ? 1 : 2, timeMs: null, deltaElo: deltaA },
    });
    const mp2 = await prisma.matchPlayer.create({
      data: { matchId: dbMatch.id, userId: pB.userId, finishPosition: outcomeA === 1 ? 2 : 1, timeMs: null, deltaElo: deltaB },
    });
    // Update ELO ratings and match statistics
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

    // notify players
    match.players.forEach((p: any) => {
      io.to(p.socketId).emit("match_end", { matchId: match.id, result: ordered.map((q: any) => ({ userId: q.userId, meters: q.meters })), eloDeltas: [{ userId: pA.userId, delta: deltaA }, { userId: pB.userId, delta: deltaB }] });
    });
  }
  matches.delete(match.id);
}

// Export app for testing
export { app };

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'testing') {
  httpServer.listen(PORT, HOST, () => {
    console.log(`\n🚀 Sprint100 Server Started`);
    console.log(`   Environment: ${NODE_ENV}`);
    console.log(`   Listening on: http://${HOST}:${PORT}`);
    console.log(`   Local access: http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/health`);
    if (HOST === "0.0.0.0") {
      console.log(`   Network access: http://192.168.1.250:${PORT}`);
      console.log(`\n💡 To expose publicly, run: npm run start:ngrok`);
    }
    console.log("");
  });
}
