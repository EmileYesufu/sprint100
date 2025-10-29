/**
 * Race Service - Manages race state for multiplayer races
 * 
 * Handles:
 * - Race room creation and management
 * - Player progress tracking
 * - Early finish threshold detection (4→3, 8→4)
 * - Thread-safe race state updates
 * - Race completion detection
 */

interface RacePlayer {
  socketId: string;
  userId: number;
  email: string;
  username: string;
  elo: number;
  steps: number;
  meters: number;
  lastSide: "left" | "right" | null;
  timeMs: number | null;
  finishedAt: number | null;
  finishPosition: number | null;
}

export interface RaceState {
  id: number;
  players: RacePlayer[];
  startedAt: number;
  countdownStart: number | null;
  raceStart: number | null;
  finished: boolean;
  roomName: string;
}

/**
 * Compute finish threshold based on total racers
 * - 4 racers → race ends when 3 finish
 * - 8 racers → race ends when 4 finish
 * - All others → race ends when all finish
 */
export function computeFinishThreshold(totalRacers: number): number {
  const thresholdMap: Record<number, number> = {
    4: 3,
    8: 4,
  };
  return thresholdMap[totalRacers] ?? totalRacers;
}

/**
 * Race state storage (in-memory, thread-safe per Node.js event loop)
 * Key: matchId, Value: RaceState
 */
const races = new Map<number, RaceState>();

/**
 * Create a new race with multiple players
 */
export function createRace(
  matchId: number,
  players: Array<{
    socketId: string;
    userId: number;
    email: string;
    username: string;
    elo: number;
  }>
): RaceState {
  const roomName = `race:${matchId}`;
  
  const raceState: RaceState = {
    id: matchId,
    players: players.map(p => ({
      socketId: p.socketId,
      userId: p.userId,
      email: p.email,
      username: p.username,
      elo: p.elo,
      steps: 0,
      meters: 0,
      lastSide: null,
      timeMs: null,
      finishedAt: null,
      finishPosition: null,
    })),
    startedAt: Date.now(),
    countdownStart: null,
    raceStart: null,
    finished: false,
    roomName,
  };

  races.set(matchId, raceState);
  return raceState;
}

/**
 * Get race state by match ID
 */
export function getRace(matchId: number): RaceState | undefined {
  return races.get(matchId);
}

/**
 * Update player progress in race
 * Returns updated race state and whether race should end
 */
export function updatePlayerProgress(
  matchId: number,
  socketId: string,
  side: "left" | "right"
): { race: RaceState; shouldEnd: boolean; finishedPlayers: RacePlayer[] } | null {
  const race = races.get(matchId);
  if (!race || race.finished) return null;

  const player = race.players.find(p => p.socketId === socketId);
  if (!player) return null;

  // Validate alternate sides
  if (player.lastSide === side) {
    // Ignore repeated same-side taps
    return null;
  }

  // Update player progress
  player.lastSide = side;
  player.steps++;
  player.meters = player.steps * 0.6; // Each step = 0.6m

  // Check if player finished
  if (player.meters >= 100 && !player.finishedAt) {
    player.finishedAt = Date.now();
    player.timeMs = player.finishedAt - (race.raceStart || race.startedAt);
  }

  // Get all finished players
  const finishedPlayers = race.players.filter(p => p.finishedAt !== null);

  // Determine finishing positions based on finish time
  const sortedFinished = finishedPlayers
    .slice()
    .sort((a, b) => (a.finishedAt || Infinity) - (b.finishedAt || Infinity));
  
  sortedFinished.forEach((p, index) => {
    p.finishPosition = index + 1;
  });

  // Check if race should end based on threshold
  const threshold = computeFinishThreshold(race.players.length);
  const shouldEnd = finishedPlayers.length >= threshold;

  return {
    race,
    shouldEnd,
    finishedPlayers: sortedFinished,
  };
}

/**
 * Get current race progress state for broadcasting
 */
export function getRaceProgress(matchId: number): {
  players: Array<{
    userId: number;
    meters: number;
    steps: number;
    finished?: boolean;
    finishPosition?: number | null;
  }>;
} | null {
  const race = races.get(matchId);
  if (!race) return null;

  return {
    players: race.players.map(p => ({
      userId: p.userId,
      meters: p.meters,
      steps: p.steps,
      finished: p.finishedAt !== null,
      finishPosition: p.finishPosition,
    })),
  };
}

/**
 * Mark race as started (after countdown)
 */
export function startRace(matchId: number): boolean {
  const race = races.get(matchId);
  if (!race) return false;

  race.raceStart = Date.now();
  return true;
}

/**
 * Set countdown start time
 */
export function startCountdown(matchId: number, countdownStart: number): boolean {
  const race = races.get(matchId);
  if (!race) return false;

  race.countdownStart = countdownStart;
  return true;
}

/**
 * Mark race as finished and cleanup
 */
export function finishRace(matchId: number): RaceState | null {
  const race = races.get(matchId);
  if (!race) return null;

  // Assign final positions to all players
  const sorted = race.players
    .slice()
    .sort((a, b) => {
      // Finished players come first, sorted by finish time
      if (a.finishedAt && b.finishedAt) {
        return a.finishedAt - b.finishedAt;
      }
      if (a.finishedAt) return -1;
      if (b.finishedAt) return 1;
      // Unfinished players sorted by meters
      return b.meters - a.meters;
    });

  sorted.forEach((p, index) => {
    if (!p.finishPosition) {
      p.finishPosition = index + 1;
    }
  });

  race.finished = true;
  return race;
}

/**
 * Delete race from memory (after persistence to DB)
 */
export function deleteRace(matchId: number): void {
  races.delete(matchId);
}

/**
 * Get all active races (for debugging/monitoring)
 */
export function getAllActiveRaces(): RaceState[] {
  return Array.from(races.values());
}

