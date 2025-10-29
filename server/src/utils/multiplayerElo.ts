/**
 * Multi-Player ELO Calculation
 * 
 * Calculates ELO changes for races with 2-8 players using position-based scoring.
 * Uses the new calculateEloChanges() function with scaled K-factor and average opponent ELO.
 */

import { calculateEloChanges, PlayerForElo, EloChangeResult } from "./elo";

export interface PlayerResult {
  userId: number;
  finishPosition: number;
  elo: number;
}

export interface EloDelta {
  userId: number;
  delta: number;
  newElo?: number;
}

/**
 * Calculate ELO changes for all players in a multi-player race
 * 
 * Uses the new calculateEloChanges() function that:
 * - Scales K-factor as 32 / log2(playerCount + 1)
 * - Computes expected score against average opponent ELO
 * - Uses position-based actual scoring: 1 - (position / (playerCount - 1))
 * 
 * @param players - Array of players with finish positions and ELO ratings
 * @returns Array of ELO deltas for each player
 */
export function calculateMultiplayerElo(players: PlayerResult[]): EloDelta[] {
  if (players.length < 2) {
    return [];
  }

  // Sort players by finish position (1st, 2nd, 3rd, etc.)
  const sortedPlayers = [...players].sort((a, b) => a.finishPosition - b.finishPosition);

  // Convert to format expected by calculateEloChanges
  const playersForElo: PlayerForElo[] = sortedPlayers.map(p => ({
    id: p.userId,
    elo: p.elo,
  }));

  // Calculate ELO changes using the new function
  const results: EloChangeResult[] = calculateEloChanges(playersForElo);

  // Map back to EloDelta format (maintain backward compatibility)
  return results.map(r => ({
    userId: r.userId,
    delta: r.delta,
    newElo: r.newElo,
  }));
}

/**
 * Calculate ELO using simplified position-based scoring
 * Alternative approach: award points based on position, then calculate ELO
 */
export function calculateMultiplayerEloPositionBased(players: PlayerResult[]): EloDelta[] {
  if (players.length < 2) {
    return [];
  }

  // Position scores: 1st gets highest, last gets lowest
  // Score = (totalPlayers - position) / totalPlayers
  // This gives 1st place score of (N-1)/N, 2nd gets (N-2)/N, etc.
  const totalPlayers = players.length;
  const playerScores = players.map(p => ({
    ...p,
    score: (totalPlayers - p.finishPosition) / totalPlayers,
  }));

  // Calculate average ELO in the race
  const avgElo = players.reduce((sum, p) => sum + p.elo, 0) / players.length;

  const K = 32; // ELO K-factor
  const eloDeltas: EloDelta[] = [];

  for (const player of playerScores) {
    // Expected score based on player's ELO vs average ELO
    const expectedScore = 1 / (1 + Math.pow(10, (avgElo - player.elo) / 400));
    
    // Calculate delta based on actual vs expected score
    const delta = Math.round(K * (player.score - expectedScore));
    
    eloDeltas.push({
      userId: player.userId,
      delta,
      newElo: player.elo + delta,
    });
  }

  return eloDeltas;
}

