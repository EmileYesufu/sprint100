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
        id: true,
        username: true,
        elo: true,
        matchesPlayed: true,
        wins: true,
      },
      orderBy: {
        elo: 'desc',
      },
      take: 50, // Top 50 players
    });
    res.json(users);
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
          include: {
            user: {
              select: {
                id: true,
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
      take: 20, // Last 20 matches
    });
    res.json(matches);
  } catch (error) {
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
    
    // Create match (same as queue pairing)
    const challenger = await prisma.user.findUnique({ where: { id: payload.fromId } });
    if (!challenger) return;
    
    const id = matchIdCounter++;
    const match = {
      id,
      players: [
        { socketId: challengerSocketId, userId: challenger.id, email: challenger.email, username: challenger.username, elo: challenger.elo, steps: 0, meters: 0, lastSide: null, timeMs: null },
        { socketId: socket.id, userId: user.id, email: user.email, username: user.username, elo: user.elo, steps: 0, meters: 0, lastSide: null, timeMs: null },
      ],
      startedAt: Date.now(),
    };
    matches.set(id, match);
    
    // Remove challenge
    challenges.delete(challengeKey);
    
    // Notify both players match started
    match.players.forEach((p: any) => {
      const opponent = match.players.find((x: any) => x.socketId !== p.socketId);
      io.to(p.socketId).emit("match_start", { 
        matchId: id, 
        opponent: opponent?.username || opponent?.email || "Unknown"
      });
    });
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

  socket.on("tap", (payload: { matchId: number; side: "left" | "right"; ts: number }) => {
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
    
    // TODO: handle disconnect during match
    console.log("disconnected", user.username || user.email);
  });
});

function tryPair() {
  if (queue.length >= 2) {
    const [a, b] = queue.splice(0, 2);
    const id = matchIdCounter++;
    const match = {
      id,
      players: [
        { socketId: a.socketId, userId: a.userId, email: a.email, elo: a.elo, steps: 0, meters: 0, lastSide: null, timeMs: null },
        { socketId: b.socketId, userId: b.userId, email: b.email, elo: b.elo, steps: 0, meters: 0, lastSide: null, timeMs: null },
      ],
      startedAt: Date.now(),
    };
    matches.set(id, match);
    // notify both players match started
    match.players.forEach((p: any) => {
      const opp = match.players.find((x: any) => x.socketId !== p.socketId);
      io.to(p.socketId).emit("match_start", { matchId: id, opponent: opp?.email || "Unknown" });
    });
  }
}

async function endMatch(match: any, finishedPlayers: any[]) {
  // compute finishing order and times
  // For simplicity: whoever reached >=100 first is winner (we used meters only)
  const ordered = match.players.slice().sort((a: any, b: any) => b.meters - a.meters);
  // store match
  const dbMatch = await prisma.match.create({ data: { duration: Date.now() - match.startedAt } });
  // compute Elo for two players only (this skeleton assumes 2-player races)
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
    await prisma.user.update({ where: { id: pA.userId }, data: { elo: { increment: deltaA } } });
    await prisma.user.update({ where: { id: pB.userId }, data: { elo: { increment: deltaB } } });

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
