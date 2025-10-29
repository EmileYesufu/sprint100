/**
 * Calculate new ELO ratings for two players after a match
 * 
 * @param rating1 - Player 1's current ELO rating
 * @param rating2 - Player 2's current ELO rating  
 * @param result - Match result: true (player 1 wins), false (player 2 wins), null (draw)
 * @returns Object with new ratings for both players
 */
export function calculateElo(
  rating1: number,
  rating2: number,
  result: boolean | null
): { p1New: number; p2New: number; winnerNew?: number; loserNew?: number } {
  const K = 32; // ELO K-factor
  
  // Calculate expected scores
  const expected1 = 1 / (1 + Math.pow(10, (rating2 - rating1) / 400));
  const expected2 = 1 / (1 + Math.pow(10, (rating1 - rating2) / 400));
  
  // Determine actual scores
  let score1: number;
  let score2: number;
  
  if (result === null) {
    // Draw
    score1 = 0.5;
    score2 = 0.5;
  } else if (result === true) {
    // Player 1 wins
    score1 = 1;
    score2 = 0;
  } else {
    // Player 2 wins
    score1 = 0;
    score2 = 1;
  }
  
  // Calculate new ratings
  const p1New = Math.round(rating1 + K * (score1 - expected1));
  const p2New = Math.round(rating2 + K * (score2 - expected2));
  
  // Return object with both formats for compatibility
  const response: any = { p1New, p2New };
  
  // Add winnerNew/loserNew for convenience when there's a winner
  if (result === true) {
    response.winnerNew = p1New;
    response.loserNew = p2New;
  } else if (result === false) {
    response.winnerNew = p2New;
    response.loserNew = p1New;
  }
  
  return response;
}

/**
 * Legacy function: Calculate ELO change (delta) for player A
 * Kept for backward compatibility
 * 
 * @param ratingA - Player A's current ELO rating
 * @param ratingB - Player B's current ELO rating
 * @param scoreA - Player A's score: 1 (win), 0 (loss), 0.5 (draw)
 * @returns ELO delta for player A
 */
export function calculateEloChange(ratingA: number, ratingB: number, scoreA: number): number {
  const K = 32;
  const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  const newA = Math.round(ratingA + K * (scoreA - expectedA));
  const deltaA = newA - ratingA;
  return deltaA;
}

/**
 * Player interface for multiplayer ELO calculation
 */
export interface PlayerForElo {
  id: number;
  elo: number;
}

/**
 * Result interface for multiplayer ELO calculation
 */
export interface EloChangeResult {
  userId: number;
  delta: number;
  newElo: number;
}

/**
 * Calculate ELO changes for N-player races (2-8 players)
 * 
 * Uses position-based scoring with scaled K-factor:
 * - K-factor scales as: 32 / log2(playerCount + 1)
 * - Expected score computed against average ELO of all opponents
 * - Actual score based on position: 1 - (position / (playerCount - 1))
 * 
 * @param players - Array of players sorted by finish position (1st, 2nd, 3rd, etc.)
 *                  Must have `id` and `elo` properties
 * @returns Array of ELO deltas for each player
 */
export function calculateEloChanges(players: PlayerForElo[]): EloChangeResult[] {
  if (players.length < 2) {
    return [];
  }

  // Calculate scaled K-factor based on player count
  // Formula: K = 32 / log2(playerCount + 1)
  const kFactor = 32 / Math.log2(players.length + 1);

  // Calculate average ELO of all players
  const avgElo = players.reduce((sum, p) => sum + p.elo, 0) / players.length;

  const results: EloChangeResult[] = [];

  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    const position = i; // 0-based position (0 = 1st, 1 = 2nd, etc.)

    // Calculate expected score against average opponent ELO
    // Expected = 1 / (1 + 10^((avgElo - playerElo) / 400))
    const expected = 1 / (1 + Math.pow(10, (avgElo - player.elo) / 400));

    // Calculate actual score based on position
    // Formula: actual = 1 - position / (playerCount - 1)
    // 1st place (i=0): actual = 1 - 0/(N-1) = 1.0
    // 2nd place (i=1): actual = 1 - 1/(N-1)
    // Last place (i=N-1): actual = 1 - (N-1)/(N-1) = 0.0
    const actual = players.length === 1 
      ? 1 
      : 1 - position / (players.length - 1);

    // Calculate ELO delta: delta = K * (actual - expected)
    const delta = Math.round(kFactor * (actual - expected));

    results.push({
      userId: player.id,
      delta,
      newElo: player.elo + delta,
    });
  }

  return results;
}
