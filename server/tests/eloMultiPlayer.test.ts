/**
 * Unit tests for multiplayer ELO calculation
 * 
 * Tests verify:
 * - Correct ELO ordering (winner gets highest delta, losers lose proportionally)
 * - Scaled K-factor based on player count
 * - Expected score computation using average opponent ELO
 * - Position-based actual scoring
 * 
 * Note: These are pure unit tests that don't require database access.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { calculateEloChanges, PlayerForElo, EloChangeResult } from '../src/utils/elo';
import { calculateMultiplayerElo, PlayerResult } from '../src/utils/multiplayerElo';

// Override global beforeEach from setup.ts to avoid database operations
// These are pure unit tests that don't need database cleanup
beforeEach(() => {
  // No-op: pure unit tests don't need database cleanup
});

describe('Multiplayer ELO Calculation', () => {
  describe('calculateEloChanges', () => {
    it('should handle 2-player race correctly', () => {
      const players: PlayerForElo[] = [
        { id: 1, elo: 1200 },
        { id: 2, elo: 1200 },
      ];

      const results = calculateEloChanges(players);

      expect(results).toHaveLength(2);
      
      // Winner (1st place) should gain ELO
      expect(results[0].delta).toBeGreaterThan(0);
      expect(results[0].userId).toBe(1);
      expect(results[0].newElo).toBe(1200 + results[0].delta);

      // Loser (2nd place) should lose ELO
      expect(results[1].delta).toBeLessThan(0);
      expect(results[1].userId).toBe(2);
      expect(results[1].newElo).toBe(1200 + results[1].delta);

      // Deltas should sum to approximately 0 (within rounding)
      const sum = results[0].delta + results[1].delta;
      expect(Math.abs(sum)).toBeLessThanOrEqual(1); // Allow for rounding
    });

    it('should handle 4-player race correctly', () => {
      const players: PlayerForElo[] = [
        { id: 1, elo: 1200 }, // 1st place
        { id: 2, elo: 1200 }, // 2nd place
        { id: 3, elo: 1200 }, // 3rd place
        { id: 4, elo: 1200 }, // 4th place
      ];

      const results = calculateEloChanges(players);

      expect(results).toHaveLength(4);

      // Verify ordering: 1st place gets highest delta, 4th gets lowest
      expect(results[0].delta).toBeGreaterThan(results[1].delta);
      expect(results[1].delta).toBeGreaterThan(results[2].delta);
      expect(results[2].delta).toBeGreaterThan(results[3].delta);

      // 1st place should gain ELO
      expect(results[0].delta).toBeGreaterThan(0);
      
      // 4th place should lose ELO
      expect(results[3].delta).toBeLessThan(0);

      // Verify new ELO calculations
      expect(results[0].newElo).toBe(1200 + results[0].delta);
      expect(results[3].newElo).toBe(1200 + results[3].delta);
    });

    it('should handle 8-player race correctly', () => {
      const players: PlayerForElo[] = [
        { id: 1, elo: 1200 }, // 1st
        { id: 2, elo: 1200 }, // 2nd
        { id: 3, elo: 1200 }, // 3rd
        { id: 4, elo: 1200 }, // 4th
        { id: 5, elo: 1200 }, // 5th
        { id: 6, elo: 1200 }, // 6th
        { id: 7, elo: 1200 }, // 7th
        { id: 8, elo: 1200 }, // 8th
      ];

      const results = calculateEloChanges(players);

      expect(results).toHaveLength(8);

      // Verify strict ordering
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].delta).toBeGreaterThan(results[i + 1].delta);
      }

      // Top finishers should gain ELO
      expect(results[0].delta).toBeGreaterThan(0); // 1st
      expect(results[1].delta).toBeGreaterThan(0); // 2nd
      
      // Bottom finishers should lose ELO
      expect(results[6].delta).toBeLessThan(0); // 7th
      expect(results[7].delta).toBeLessThan(0); // 8th
    });

    it('should scale K-factor based on player count', () => {
      // 2 players: K = 32 / log2(3) ≈ 20.16
      // 4 players: K = 32 / log2(5) ≈ 13.87
      // 8 players: K = 32 / log2(9) ≈ 10.09
      
      const players2: PlayerForElo[] = [
        { id: 1, elo: 1200 },
        { id: 2, elo: 1200 },
      ];
      
      const players4: PlayerForElo[] = [
        { id: 1, elo: 1200 },
        { id: 2, elo: 1200 },
        { id: 3, elo: 1200 },
        { id: 4, elo: 1200 },
      ];

      const results2 = calculateEloChanges(players2);
      const results4 = calculateEloChanges(players4);

      // With equal ELOs, deltas should be proportional to K-factor
      // More players = smaller K-factor = smaller deltas
      expect(Math.abs(results2[0].delta)).toBeGreaterThan(Math.abs(results4[0].delta));
    });

    it('should handle players with different ELO ratings', () => {
      const players: PlayerForElo[] = [
        { id: 1, elo: 1500 }, // High-rated player wins
        { id: 2, elo: 1200 }, // Lower-rated player
        { id: 3, elo: 1000 }, // Much lower-rated player
        { id: 4, elo: 1100 }, // Lower-rated player
      ];

      const results = calculateEloChanges(players);

      expect(results).toHaveLength(4);

      // High-rated player (1500) winning: should gain less ELO than if a low-rated player won
      // Low-rated player (1000) losing: should lose less ELO than if a high-rated player lost
      
      // Verify 1st place gains some ELO (or at least doesn't lose)
      expect(results[0].delta).toBeGreaterThanOrEqual(0);
      
      // Verify ordering is maintained (allow for rounding in edge cases)
      expect(results[0].delta).toBeGreaterThanOrEqual(results[1].delta);
      expect(results[1].delta).toBeGreaterThanOrEqual(results[2].delta);
      expect(results[2].delta).toBeGreaterThanOrEqual(results[3].delta);
      
      // Ensure at least some difference exists (winner should have better delta than loser)
      expect(results[0].delta).toBeGreaterThan(results[3].delta);
    });

    it('should handle underdog victory (low ELO wins)', () => {
      const players: PlayerForElo[] = [
        { id: 1, elo: 1000 }, // Low-rated player wins
        { id: 2, elo: 1500 }, // High-rated player loses
      ];

      const results = calculateEloChanges(players);

      // Underdog should gain significant ELO
      expect(results[0].delta).toBeGreaterThan(15); // Should be a large gain
      
      // High-rated player losing should lose significant ELO
      expect(results[1].delta).toBeLessThan(-15); // Should be a large loss
      
      // Absolute values should be similar (opposite signs)
      expect(Math.abs(results[0].delta) - Math.abs(results[1].delta)).toBeLessThan(2);
    });

    it('should return empty array for invalid input', () => {
      expect(calculateEloChanges([])).toEqual([]);
      expect(calculateEloChanges([{ id: 1, elo: 1200 }])).toEqual([]);
    });
  });

  describe('calculateMultiplayerElo (wrapper function)', () => {
    it('should correctly sort players by finish position', () => {
      const players: PlayerResult[] = [
        { userId: 3, finishPosition: 3, elo: 1200 }, // 3rd place
        { userId: 1, finishPosition: 1, elo: 1200 }, // 1st place
        { userId: 4, finishPosition: 4, elo: 1200 }, // 4th place
        { userId: 2, finishPosition: 2, elo: 1200 }, // 2nd place
      ];

      const results = calculateMultiplayerElo(players);

      expect(results).toHaveLength(4);
      
      // Results should be ordered by finish position
      expect(results[0].userId).toBe(1); // 1st place
      expect(results[1].userId).toBe(2); // 2nd place
      expect(results[2].userId).toBe(3); // 3rd place
      expect(results[3].userId).toBe(4); // 4th place

      // Verify ELO ordering: 1st gets highest delta
      expect(results[0].delta).toBeGreaterThan(results[1].delta);
      expect(results[1].delta).toBeGreaterThan(results[2].delta);
      expect(results[2].delta).toBeGreaterThan(results[3].delta);
    });

    it('should handle 4-player race with mixed ELO ratings', () => {
      const players: PlayerResult[] = [
        { userId: 1, finishPosition: 1, elo: 1400 }, // High-rated winner
        { userId: 2, finishPosition: 2, elo: 1200 },
        { userId: 3, finishPosition: 3, elo: 1100 },
        { userId: 4, finishPosition: 4, elo: 1000 }, // Low-rated last
      ];

      const results = calculateMultiplayerElo(players);

      expect(results).toHaveLength(4);
      
      // Winner should gain ELO, but less than if they were low-rated
      expect(results[0].delta).toBeGreaterThan(0);
      
      // Last place should lose ELO
      expect(results[3].delta).toBeLessThan(0);
      
      // Verify strict ordering
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].delta).toBeGreaterThan(results[i + 1].delta);
      }
    });

    it('should return empty array for invalid input', () => {
      expect(calculateMultiplayerElo([])).toEqual([]);
      expect(calculateMultiplayerElo([{ userId: 1, finishPosition: 1, elo: 1200 }])).toEqual([]);
    });
  });

  describe('Edge cases', () => {
    it('should handle players with same finish position (tie)', () => {
      const players: PlayerForElo[] = [
        { id: 1, elo: 1200 },
        { id: 2, elo: 1200 },
        { id: 3, elo: 1200 },
      ];

      // All players are treated as ordered (no explicit tie handling)
      // In practice, ties should be rare, but if they occur, position determines ELO
      const results = calculateEloChanges(players);
      
      expect(results).toHaveLength(3);
      // Even with same ELO, position matters
      expect(results[0].delta).toBeGreaterThanOrEqual(results[1].delta);
    });

    it('should handle very large ELO differences', () => {
      const players: PlayerForElo[] = [
        { id: 1, elo: 2000 }, // Very high-rated
        { id: 2, elo: 500 },  // Very low-rated
      ];

      const results = calculateEloChanges(players);

      // High-rated player winning should gain minimal or zero ELO (after rounding)
      // With such a large ELO difference and scaled K-factor, delta might round to 0
      expect(results[0].delta).toBeGreaterThanOrEqual(0);
      expect(results[0].delta).toBeLessThanOrEqual(5); // Small gain or zero expected

      // Low-rated player losing should lose minimal ELO
      expect(results[1].delta).toBeLessThanOrEqual(0);
      expect(Math.abs(results[1].delta)).toBeLessThanOrEqual(5); // Small loss or zero expected
    });
  });
});

