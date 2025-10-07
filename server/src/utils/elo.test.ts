/**
 * Unit tests for ELO rating system
 * Tests the calculateEloChange function with various scenarios
 */

import { calculateEloChange } from './elo';

describe('ELO Rating System', () => {
  describe('calculateEloChange', () => {
    test('equal ratings: winner gains ~16 points, loser loses ~16', () => {
      const ratingA = 1200;
      const ratingB = 1200;
      
      // Player A wins
      const deltaAWin = calculateEloChange(ratingA, ratingB, 1);
      expect(deltaAWin).toBe(16);
      
      // Player A loses
      const deltaALose = calculateEloChange(ratingA, ratingB, 0);
      expect(deltaALose).toBe(-16);
    });

    test('higher rated player (1400) vs lower (1200): win/loss deltas are asymmetric', () => {
      const higherRating = 1400;
      const lowerRating = 1200;
      
      // Higher rated wins (expected outcome)
      const deltaHigherWin = calculateEloChange(higherRating, lowerRating, 1);
      expect(deltaHigherWin).toBeLessThan(16); // Gains less than 16
      expect(deltaHigherWin).toBeGreaterThan(0);
      
      // Higher rated loses (upset)
      const deltaHigherLose = calculateEloChange(higherRating, lowerRating, 0);
      expect(deltaHigherLose).toBeLessThan(0);
      expect(Math.abs(deltaHigherLose)).toBeGreaterThan(16); // Loses more than 16
    });

    test('lower rated player (1200) vs higher (1400): upset win gains significant points', () => {
      const lowerRating = 1200;
      const higherRating = 1400;
      
      // Lower rated wins (upset)
      const deltaLowerWin = calculateEloChange(lowerRating, higherRating, 1);
      expect(deltaLowerWin).toBeGreaterThan(16); // Gains more than 16
      expect(deltaLowerWin).toBeLessThan(32); // But not the full K factor
      
      // Lower rated loses (expected outcome)
      const deltaLowerLose = calculateEloChange(lowerRating, higherRating, 0);
      expect(deltaLowerLose).toBeLessThan(0);
      expect(Math.abs(deltaLowerLose)).toBeLessThan(16); // Loses less than 16
    });

    test('draw (score = 0.5) results in smaller adjustments', () => {
      const ratingA = 1200;
      const ratingB = 1200;
      
      // Equal ratings draw
      const deltaDraw = calculateEloChange(ratingA, ratingB, 0.5);
      expect(deltaDraw).toBe(0); // No change for equal ratings draw
      
      // Higher rated draws against lower
      const deltaHigherDraw = calculateEloChange(1400, 1200, 0.5);
      expect(deltaHigherDraw).toBeLessThan(0); // Loses points
      
      // Lower rated draws against higher
      const deltaLowerDraw = calculateEloChange(1200, 1400, 0.5);
      expect(deltaLowerDraw).toBeGreaterThan(0); // Gains points
    });

    test('extreme rating differences', () => {
      const lowRating = 1000;
      const highRating = 2000;
      
      // Low rated beats high rated (massive upset)
      const deltaLowWin = calculateEloChange(lowRating, highRating, 1);
      expect(deltaLowWin).toBeGreaterThan(28); // Gains almost full K factor
      expect(deltaLowWin).toBeLessThanOrEqual(32);
      
      // High rated beats low rated (expected)
      const deltaHighWin = calculateEloChange(highRating, lowRating, 1);
      expect(deltaHighWin).toBeLessThan(4); // Gains very little
      expect(deltaHighWin).toBeGreaterThanOrEqual(0);
    });

    test('rating changes are symmetric (zero-sum)', () => {
      const ratingA = 1300;
      const ratingB = 1250;
      
      const deltaAWin = calculateEloChange(ratingA, ratingB, 1);
      const deltaBLose = calculateEloChange(ratingB, ratingA, 0);
      
      // The sum of changes should be close to zero (within rounding)
      expect(Math.abs(deltaAWin + deltaBLose)).toBeLessThanOrEqual(1);
    });

    test('returns integer values (rounded)', () => {
      const ratingA = 1234;
      const ratingB = 1567;
      
      const delta = calculateEloChange(ratingA, ratingB, 1);
      expect(delta).toBe(Math.round(delta)); // Is an integer
    });

    test('K-factor of 32 is applied correctly', () => {
      // With equal ratings, expected score = 0.5
      // Delta = K * (actual - expected) = 32 * (1 - 0.5) = 16
      const delta = calculateEloChange(1500, 1500, 1);
      expect(delta).toBe(16);
    });

    test('edge case: extremely low ratings', () => {
      const delta = calculateEloChange(100, 150, 1);
      expect(typeof delta).toBe('number');
      expect(delta).toBeGreaterThan(0);
      expect(delta).toBeLessThanOrEqual(32);
    });

    test('edge case: extremely high ratings', () => {
      const delta = calculateEloChange(3000, 2950, 1);
      expect(typeof delta).toBe('number');
      expect(delta).toBeGreaterThan(0);
      expect(delta).toBeLessThanOrEqual(32);
    });
  });

  describe('ELO formula verification', () => {
    test('expected score calculation is correct', () => {
      // For equal ratings (1200 vs 1200):
      // Expected = 1 / (1 + 10^((1200-1200)/400)) = 1 / (1 + 1) = 0.5
      const delta = calculateEloChange(1200, 1200, 1);
      expect(delta).toBe(Math.round(32 * (1 - 0.5))); // 16
    });

    test('400-point difference means ~90% expected win rate', () => {
      const lowerRating = 1200;
      const higherRating = 1600;
      
      // Higher rated player expected to win ~90% of the time
      // Win delta should be small (low surprise)
      const deltaHighWin = calculateEloChange(higherRating, lowerRating, 1);
      expect(deltaHighWin).toBeLessThan(6);
      
      // Loss delta should be large (high surprise)
      const deltaHighLose = calculateEloChange(higherRating, lowerRating, 0);
      expect(Math.abs(deltaHighLose)).toBeGreaterThan(26);
    });
  });

  describe('Real-world scenarios', () => {
    test('new player (1200) beats experienced (1600)', () => {
      const newPlayer = 1200;
      const experienced = 1600;
      
      const newPlayerDelta = calculateEloChange(newPlayer, experienced, 1);
      expect(newPlayerDelta).toBeGreaterThan(25); // Significant gain
      
      const experiencedDelta = calculateEloChange(experienced, newPlayer, 0);
      expect(experiencedDelta).toBeLessThan(-25); // Significant loss
    });

    test('closely matched players (1450 vs 1470)', () => {
      const playerA = 1450;
      const playerB = 1470;
      
      const deltaAWin = calculateEloChange(playerA, playerB, 1);
      expect(deltaAWin).toBeGreaterThanOrEqual(15);
      expect(deltaAWin).toBeLessThanOrEqual(18);
      
      const deltaBWin = calculateEloChange(playerB, playerA, 1);
      expect(deltaBWin).toBeGreaterThanOrEqual(14);
      expect(deltaBWin).toBeLessThanOrEqual(17);
    });
  });
});

