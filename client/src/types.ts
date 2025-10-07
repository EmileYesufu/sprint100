/**
 * Shared TypeScript types for the Sprint100 client
 */

export interface User {
  id: number;
  email: string;
  elo: number;
  displayName?: string;
}

export interface MatchState {
  matchId: number;
  players: PlayerState[];
  status: "waiting" | "countdown" | "racing" | "finished";
  startTime?: number;
  endTime?: number;
}

export interface PlayerState {
  userId: number;
  email: string;
  meters: number;
  taps: number;
  elo?: number;
}

export interface RaceUpdate {
  matchId: number;
  players: PlayerState[];
  timestamp: number;
}

export interface MatchResult {
  matchId: number;
  winnerId: number | null;
  loserEloDelta: number;
  winnerEloDelta: number;
  players: Array<{
    userId: number;
    email: string;
    finalMeters: number;
    eloDelta: number;
    newElo: number;
  }>;
  finishedAt: string;
}

export interface QueuedPlayer {
  userId: number;
  email: string;
  elo: number;
}

export interface LeaderboardEntry {
  userId: number;
  email: string;
  elo: number;
  rank: number;
}

export interface MatchHistoryEntry {
  matchId: number;
  opponentEmail: string;
  won: boolean;
  eloDelta: number;
  finalMeters: number;
  createdAt: string;
}

