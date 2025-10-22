/**
 * Calculate new ELO ratings for two players after a match
 *
 * @param rating1 - Player 1's current ELO rating
 * @param rating2 - Player 2's current ELO rating
 * @param result - Match result: true (player 1 wins), false (player 2 wins), null (draw)
 * @returns Object with new ratings for both players
 */
export declare function calculateElo(rating1: number, rating2: number, result: boolean | null): {
    p1New: number;
    p2New: number;
    winnerNew?: number;
    loserNew?: number;
};
/**
 * Legacy function: Calculate ELO change (delta) for player A
 * Kept for backward compatibility
 *
 * @param ratingA - Player A's current ELO rating
 * @param ratingB - Player B's current ELO rating
 * @param scoreA - Player A's score: 1 (win), 0 (loss), 0.5 (draw)
 * @returns ELO delta for player A
 */
export declare function calculateEloChange(ratingA: number, ratingB: number, scoreA: number): number;
//# sourceMappingURL=elo.d.ts.map