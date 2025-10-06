import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { calculateEloChange } from "./utils/elo";

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const PORT = Number(process.env.PORT || 4000);

app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "email+password required" });
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(400).json({ error: "user exists" });
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, password: hash } });
  const token = jwt.sign({ userId: user.id }, JWT_SECRET);
  res.json({ token, user: { id: user.id, email: user.email, elo: user.elo } });
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "invalid credentials" });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: "invalid credentials" });
  const token = jwt.sign({ userId: user.id }, JWT_SECRET);
  res.json({ token, user: { id: user.id, email: user.email, elo: user.elo } });
});

const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: "*" },
});

// Simple in-memory queue + matches store (dev only)
const queue: Array<{ socketId: string; userId: number; email: string; elo: number }> = [];
const matches = new Map<number, any>();
let matchIdCounter = 1;

io.use(async (socket, next) => {
  // token via socket.handshake.auth.token
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("auth required"));
  try {
    const payload: any = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return next(new Error("user not found"));
    (socket as any).user = { id: user.id, email: user.email, elo: user.elo };
    next();
  } catch (err) {
    next(new Error("invalid token"));
  }
});

io.on("connection", (socket) => {
  const user = (socket as any).user;
  console.log("connected", user.email);

  socket.on("join_queue", () => {
    if (queue.find((q) => q.socketId === socket.id)) return;
    queue.push({ socketId: socket.id, userId: user.id, email: user.email, elo: user.elo });
    socket.emit("queue_joined");
    tryPair();
  });

  socket.on("leave_queue", () => {
    const idx = queue.findIndex((q) => q.socketId === socket.id);
    if (idx >= 0) queue.splice(idx, 1);
    socket.emit("queue_left");
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
    // TODO: handle disconnect during match
    console.log("disconnected", user.email);
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
    match.players.forEach((p: any) => io.to(p.socketId).emit("match_start", { matchId: id, opponent: match.players.find((x: any) => x.socketId !== p.socketId).email }));
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

httpServer.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
