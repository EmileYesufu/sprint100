/**
 * Multi-Player ELO Calculation
 * 
 * Calculates ELO changes for races with 2-8 players using position-based scoring.
 * Uses pairwise comparison approach: each player's ELO is adjusted based on
 * performance against all other players in the race.
 * 
 * Position Scoring:
 * - 1st place: wins against all other players
 * - 2nd place: wins against all except 1st, loses to 1st
 * - etc.
 */

import { calculateEloChange } from "./elo";

export interface PlayerResult {
  userId: number;
  finishPosition: number;
  elo: number;
}

export interface EloDelta {
  userId: number;
  delta: number;
  newElo: number;
}

/**
 * Calculate ELO changes for all players in a multi-player race
 * 
 * @param players - Array of players with finish positions and ELO ratings
 * @returns Array of ELO deltas for each player
 */
export function calculateMultiplayerElo(players: PlayerResult[]): EloDelta[] {
  if (players.length < 2) {
    return [];
  }

  // If only 2 players, use existing 2-player ELO calculation
  if (players.length === 2) {
    const [p1, p2] = players;
    const delta1 = calculateEloChange(p1.elo, p2.elo, p1.finishPosition < p2.finishPosition ? 1 : 0);
    const delta2 = -delta1;

    return [
      { userId: p1.userId, delta: delta1, newElo: p1.elo + delta1 },
      { userId: p2.userId, delta: delta2, newElo: p2.elo + delta2 },
    ];
  }

  // For 3+ players, use pairwise comparison approach
  // Each player's ELO change = average of all pairwise ELO changes
  const eloDeltas: EloDelta[] = [];

  for (const player of players) {
    let totalDelta = 0;

    // Compare against all other players
    for (const opponent of players) {
      if (player.userId === opponent.userId) continue;

      // Determine outcome in this pairwise comparison
      // If player finished before opponent, they win this comparison
      const score = player.finishPosition < opponent.finishPosition ? 1 : 0;

      // Calculate ELO change for this pairwise comparison
      const pairwiseDelta = calculateEloChange(player.elo, opponent.elo, score);
      totalDelta += pairwiseDelta;
    }

    // Average the ELO changes across all pairwise comparisons
    // Divide by (players.length - 1) since we compared against all others
    const avgDelta = Math.round(totalDelta / (players.length - 1));
    eloDeltas.push({
      userId: player.userId,
      delta: avgDelta,
      newElo: player.elo + avgDelta,
    });
  }

  return eloDeltas;
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

