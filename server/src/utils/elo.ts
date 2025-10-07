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
