import jwt from "jsonwebtoken";
import type { Server as SocketIOServer, Socket } from "socket.io";
import {
  finishRace,
  getRace,
  getRaceProgress,
  updatePlayerProgress,
  computeFinishThreshold,
  type RaceState,
} from "../services/raceService";

interface TapPayload {
  matchId: number;
  side: "left" | "right";
  ts?: number;
}

interface RejoinPayload {
  matchId: number;
  token: string;
}

export interface RaceSocketContext {
  io: SocketIOServer;
  matches: Map<number, any>;
  userSockets: Map<number, string>;
  jwtSecret: string;
  endMatch: (raceOrMatch: any, finishedPlayers: any[]) => Promise<void> | void;
}

interface RaceSnapshotPlayer {
  userId: number;
  username: string;
  meters: number;
  steps: number;
  finished: boolean;
  finishPosition: number | null;
  timeMs: number | null;
  elo: number;
}

export interface RaceSnapshot {
  matchId: number;
  elapsedMs: number;
  countdownStart: number | null;
  raceStart: number | null;
  finished: boolean;
  threshold: number;
  players: RaceSnapshotPlayer[];
  me?: RaceSnapshotPlayer;
  opponents: RaceSnapshotPlayer[];
}

export function buildRaceSnapshot(race: RaceState, viewingUserId: number): RaceSnapshot {
  const elapsedMs = race.raceStart ? Date.now() - race.raceStart : 0;
  const players: RaceSnapshotPlayer[] = race.players.map((p) => ({
    userId: p.userId,
    username: p.username,
    meters: p.meters,
    steps: p.steps,
    finished: p.finishedAt !== null,
    finishPosition: p.finishPosition ?? null,
    timeMs: p.timeMs ?? null,
    elo: p.elo,
  }));

  const me = players.find((p) => p.userId === viewingUserId);
  const opponents = players.filter((p) => p.userId !== viewingUserId);

  const threshold = computeFinishThreshold(race.players.length);

  const snapshot: RaceSnapshot = {
    matchId: race.id,
    elapsedMs,
    countdownStart: race.countdownStart,
    raceStart: race.raceStart,
    finished: race.finished,
    threshold,
    players,
    me,
    opponents,
  };

  return snapshot;
}

export function handleRaceTap(
  context: RaceSocketContext,
  socket: Socket,
  payload: TapPayload
): void {
  const { matchId, side } = payload;
  if (!matchId || (side !== "left" && side !== "right")) {
    return;
  }

  const raceResult = updatePlayerProgress(matchId, socket.id, side);

  if (raceResult) {
    const { race, shouldEnd, finishedPlayers } = raceResult;

    const progress = getRaceProgress(matchId);
    if (progress) {
      context.io.to(race.roomName).emit("race_update", {
        matchId,
        players: progress.players,
        timestamp: Date.now(),
      });
    }

    if (shouldEnd) {
      const finishedRace = finishRace(matchId);
      if (finishedRace) {
        context.endMatch(finishedRace, finishedPlayers);
      }
    }
    return;
  }

  const legacyMatch = context.matches.get(matchId);
  if (!legacyMatch) return;

  const player = legacyMatch.players.find((p: any) => p.socketId === socket.id);
  if (!player) return;

  if (player.lastSide === side) {
    return;
  }

  player.lastSide = side;
  player.steps++;
  player.meters = player.steps * 0.6;

  const state = {
    players: legacyMatch.players.map((p: any) => ({
      userId: p.userId,
      meters: p.meters,
      steps: p.steps,
    })),
    timestamp: Date.now(),
    matchId,
  };

  legacyMatch.players.forEach((p: any) => context.io.to(p.socketId).emit("race_update", state));

  const finished = legacyMatch.players.filter((p: any) => p.meters >= 100);
  if (finished.length > 0) {
    context.endMatch(legacyMatch, finished);
  }
}

export function handleRaceRejoin(
  context: RaceSocketContext,
  socket: Socket,
  payload: RejoinPayload
): void {
  const { matchId, token } = payload;
  if (!matchId || !token) {
    socket.emit("race_error", { error: "invalid_rejoin_payload" });
    return;
  }

  let decoded: any;
  try {
    decoded = jwt.verify(token, context.jwtSecret);
  } catch (error) {
    socket.emit("race_error", { error: "invalid_token" });
    return;
  }

  const userId = decoded?.userId;
  if (!userId) {
    socket.emit("race_error", { error: "invalid_token" });
    return;
  }

  const race = getRace(matchId);
  if (race) {
    const racePlayer = race.players.find((p) => p.userId === userId);
    if (!racePlayer) {
      socket.emit("race_error", { error: "not_in_race" });
      return;
    }

    racePlayer.socketId = socket.id;
    context.userSockets.set(userId, socket.id);
    socket.join(race.roomName);

    const snapshot = buildRaceSnapshot(race, userId);
    socket.emit("race_snapshot", snapshot);

    socket.to(race.roomName).emit("race_player_rejoined", {
      userId: racePlayer.userId,
      username: racePlayer.username,
    });
    return;
  }

  const legacyMatch = context.matches.get(matchId);
  if (!legacyMatch) {
    socket.emit("race_error", { error: "race_not_found" });
    return;
  }

  const legacyPlayer = legacyMatch.players.find((p: any) => p.userId === userId);
  if (!legacyPlayer) {
    socket.emit("race_error", { error: "not_in_race" });
    return;
  }

  legacyPlayer.socketId = socket.id;
  context.userSockets.set(userId, socket.id);

  const players = legacyMatch.players.map((p: any) => ({
    userId: p.userId,
    username: p.username,
    meters: p.meters,
    steps: p.steps,
    finished: p.meters >= 100,
    finishPosition: p.finishPosition ?? null,
    timeMs: p.timeMs ?? null,
    elo: p.elo ?? 0,
  }));

  socket.emit("race_snapshot", {
    matchId,
    elapsedMs: Date.now() - (legacyMatch.startedAt || Date.now()),
    countdownStart: null,
    raceStart: legacyMatch.startedAt || null,
    finished: legacyMatch.finished ?? false,
    threshold: players.length,
    players,
    me: players.find((p: RaceSnapshotPlayer) => p.userId === userId),
    opponents: players.filter((p: RaceSnapshotPlayer) => p.userId !== userId),
  });

  if (legacyMatch.roomName) {
    socket.to(legacyMatch.roomName).emit("race_player_rejoined", {
      userId: legacyPlayer.userId,
      username: legacyPlayer.username,
    });
  }
}

