/**
 * Shared TypeScript types for the Sprint100 client
 */

// ===== ONLINE MULTIPLAYER TYPES =====

export interface User {
  id: number;
  email: string;
  username: string;
  elo: number;
  displayName?: string;
}

export interface UserSearchResult {
  id: number;
  username: string;
  email: string;
  elo: number;
}

export interface Challenge {
  from: string; // username
  fromId: number;
  fromElo: number;
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

// ===== OFFLINE TRAINING MODE TYPES =====

export type AIDifficulty = "Easy" | "Medium" | "Hard";
export type AIPersonality = "Consistent" | "Erratic" | "Aggressive";

export interface AIConfig {
  difficulty: AIDifficulty;
  personality: AIPersonality;
  seed: number;
  seedOffset: number; // Unique offset for each AI to differentiate them
}

export interface TrainingConfig {
  aiCount: 1 | 3 | 7;
  difficulty: AIDifficulty;
  personality: AIPersonality;
  seed: number;
}

export interface RunnerStep {
  runnerId: string;
  timestamp: number;
  side: "left" | "right";
  totalSteps: number;
  meters: number;
}

export interface RunnerState {
  id: string;
  name: string;
  isPlayer: boolean;
  steps: number;
  meters: number;
  finished: boolean;
  finishTime?: number;
  finishPosition?: number; // Immutable position assigned at moment of crossing
  color: string;
}

export interface TrainingRaceState {
  status: "setup" | "countdown" | "racing" | "finished";
  startTime?: number;
  elapsedMs: number;
  runners: RunnerState[];
  stepHistory: RunnerStep[];
}

export interface TrainingResult {
  config: TrainingConfig;
  runners: Array<{
    id: string;
    name: string;
    isPlayer: boolean;
    position: number;
    finalMeters: number;
    finishTime: number;
    steps: number;
  }>;
  seed: number;
  completedAt: string;
}

export interface AIState {
  id: string;
  name: string;
  config: AIConfig;
  steps: number;
  meters: number;
  finished: boolean;
  nextStepTime: number;
  lastSide: "left" | "right" | null;
}

export interface TrainingRecord {
  difficulty: AIDifficulty;
  aiCount: number;
  bestPosition: number;
  bestTime: number;
  date: string;
}
