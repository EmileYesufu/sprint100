/**
 * Unit tests for ELO rating system
 * Tests the calculateElo function with various scenarios
 */

import { calculateElo } from './elo';

describe('ELO Rating System', () => {
  describe('calculateElo - new API', () => {
    test('winner gains, loser loses, total change ≈ 0', () => {
      const { winnerNew, loserNew } = calculateElo(1200, 1200, true);
      expect(winnerNew).toBeGreaterThan(1200);
      expect(loserNew).toBeLessThan(1200);
      expect(Math.abs((winnerNew! - 1200) + (loserNew! - 1200))).toBeLessThan(1);
    });

    test('stronger player gains less for easy win', () => {
      const { winnerNew } = calculateElo(1400, 1000, true);
      expect(winnerNew! - 1400).toBeLessThan(10);
    });

    test('stronger player loses more for upset loss', () => {
      const { loserNew } = calculateElo(1400, 1000, false);
      expect(1400 - loserNew!).toBeGreaterThan(20);
    });

    test('draw changes ratings slightly toward each other', () => {
      const { p1New, p2New } = calculateElo(1200, 1300, null);
      expect(p1New).toBeGreaterThan(1200);
      expect(p2New).toBeLessThan(1300);
    });

    test('equal ratings: player 1 wins gains ~16 points', () => {
      const { p1New, p2New } = calculateElo(1200, 1200, true);
      expect(p1New - 1200).toBe(16);
      expect(1200 - p2New).toBe(16);
    });

    test('equal ratings: player 2 wins gains ~16 points', () => {
      const { p1New, p2New } = calculateElo(1200, 1200, false);
      expect(1200 - p1New).toBe(16);
      expect(p2New - 1200).toBe(16);
    });

    test('higher rated player (1400) vs lower (1200): win/loss deltas are asymmetric', () => {
      // Higher rated wins (expected outcome)
      const winResult = calculateElo(1400, 1200, true);
      const p1Gain = winResult.p1New - 1400;
      expect(p1Gain).toBeLessThan(16);
      expect(p1Gain).toBeGreaterThan(0);
      
      // Higher rated loses (upset)
      const loseResult = calculateElo(1400, 1200, false);
      const p1Loss = 1400 - loseResult.p1New;
      expect(p1Loss).toBeGreaterThan(16);
    });

    test('lower rated player (1200) vs higher (1400): upset win gains significant points', () => {
      // Lower rated wins (upset)
      const { p1New } = calculateElo(1200, 1400, true);
      const gain = p1New - 1200;
      expect(gain).toBeGreaterThan(16);
      expect(gain).toBeLessThan(32);
      
      // Lower rated loses (expected outcome)
      const { p1New: p1NewLoss } = calculateElo(1200, 1400, false);
      const loss = 1200 - p1NewLoss;
      expect(loss).toBeLessThan(16);
    });

    test('draw (result = null) results in smaller adjustments', () => {
      // Equal ratings draw
      const { p1New, p2New } = calculateElo(1200, 1200, null);
      expect(p1New).toBe(1200); // No change for equal ratings draw
      expect(p2New).toBe(1200);
      
      // Higher rated draws against lower
      const higherDraw = calculateElo(1400, 1200, null);
      expect(higherDraw.p1New).toBeLessThan(1400); // Loses points
      
      // Lower rated draws against higher
      const lowerDraw = calculateElo(1200, 1400, null);
      expect(lowerDraw.p1New).toBeGreaterThan(1200); // Gains points
    });

    test('extreme rating differences (1000 vs 2000)', () => {
      // Low rated beats high rated (massive upset)
      const upsetWin = calculateElo(1000, 2000, true);
      const lowGain = upsetWin.p1New - 1000;
      expect(lowGain).toBeGreaterThan(28);
      expect(lowGain).toBeLessThanOrEqual(32);
      
      // High rated beats low rated (expected)
      const expectedWin = calculateElo(2000, 1000, true);
      const highGain = expectedWin.p1New - 2000;
      expect(highGain).toBeLessThan(4);
      expect(highGain).toBeGreaterThanOrEqual(0);
    });

    test('rating changes are symmetric (zero-sum)', () => {
      const { p1New, p2New } = calculateElo(1300, 1250, true);
      
      const p1Delta = p1New - 1300;
      const p2Delta = p2New - 1250;
      
      // The sum of changes should be close to zero (within rounding)
      expect(Math.abs(p1Delta + p2Delta)).toBeLessThanOrEqual(1);
    });

    test('returns integer values (rounded)', () => {
      const { p1New, p2New } = calculateElo(1234, 1567, true);
      expect(p1New).toBe(Math.round(p1New));
      expect(p2New).toBe(Math.round(p2New));
    });

    test('K-factor of 32 is applied correctly', () => {
      // With equal ratings, expected score = 0.5
      // Delta = K * (actual - expected) = 32 * (1 - 0.5) = 16
      const { p1New } = calculateElo(1500, 1500, true);
      expect(p1New - 1500).toBe(16);
    });

    test('edge case: extremely low ratings', () => {
      const { p1New } = calculateElo(100, 150, true);
      expect(p1New).toBeGreaterThan(100);
      expect(p1New - 100).toBeLessThanOrEqual(32);
    });

    test('edge case: extremely high ratings', () => {
      const { p1New } = calculateElo(3000, 2950, true);
      expect(p1New).toBeGreaterThan(3000);
      expect(p1New - 3000).toBeLessThanOrEqual(32);
    });

    test('provides winnerNew/loserNew convenience properties', () => {
      // Player 1 wins
      const p1Win = calculateElo(1200, 1250, true);
      expect(p1Win.winnerNew).toBe(p1Win.p1New);
      expect(p1Win.loserNew).toBe(p1Win.p2New);
      
      // Player 2 wins
      const p2Win = calculateElo(1200, 1250, false);
      expect(p2Win.winnerNew).toBe(p2Win.p2New);
      expect(p2Win.loserNew).toBe(p2Win.p1New);
      
      // Draw (no winner/loser)
      const draw = calculateElo(1200, 1250, null);
      expect(draw.winnerNew).toBeUndefined();
      expect(draw.loserNew).toBeUndefined();
    });
  });

  describe('ELO formula verification', () => {
    test('expected score calculation is correct', () => {
      // For equal ratings (1200 vs 1200):
      // Expected = 1 / (1 + 10^((1200-1200)/400)) = 1 / (1 + 1) = 0.5
      const { p1New } = calculateElo(1200, 1200, true);
      expect(p1New - 1200).toBe(Math.round(32 * (1 - 0.5)));
    });

    test('400-point difference means ~90% expected win rate', () => {
      const lowerRating = 1200;
      const higherRating = 1600;
      
      // Higher rated player expected to win ~90% of the time
      // Win delta should be small (low surprise)
      const { p1New: highWin } = calculateElo(higherRating, lowerRating, true);
      expect(highWin - higherRating).toBeLessThan(6);
      
      // Loss delta should be large (high surprise)
      const { p1New: highLose } = calculateElo(higherRating, lowerRating, false);
      expect(higherRating - highLose).toBeGreaterThan(26);
    });
  });

  describe('Real-world scenarios', () => {
    test('new player (1200) beats experienced (1600)', () => {
      const { p1New, p2New } = calculateElo(1200, 1600, true);
      
      const newPlayerGain = p1New - 1200;
      expect(newPlayerGain).toBeGreaterThan(25); // Significant gain
      
      const experiencedLoss = 1600 - p2New;
      expect(experiencedLoss).toBeGreaterThan(25); // Significant loss
    });

    test('closely matched players (1450 vs 1470)', () => {
      const { p1New: p1WinNew } = calculateElo(1450, 1470, true);
      const p1WinGain = p1WinNew - 1450;
      expect(p1WinGain).toBeGreaterThanOrEqual(15);
      expect(p1WinGain).toBeLessThanOrEqual(18);
      
      const { p1New: p2WinNew } = calculateElo(1470, 1450, true);
      const p2WinGain = p2WinNew - 1470;
      expect(p2WinGain).toBeGreaterThanOrEqual(14);
      expect(p2WinGain).toBeLessThanOrEqual(17);
    });

    test('series of matches affects ratings progressively', () => {
      let rating1 = 1200;
      let rating2 = 1200;
      
      // Player 1 wins 3 in a row
      for (let i = 0; i < 3; i++) {
        const result = calculateElo(rating1, rating2, true);
        rating1 = result.p1New;
        rating2 = result.p2New;
      }
      
      expect(rating1).toBeGreaterThan(1200 + 40); // Won multiple games
      expect(rating2).toBeLessThan(1200 - 40); // Lost multiple games
      
      // Rating difference should now affect future match deltas
      const nextMatch = calculateElo(rating1, rating2, true);
      const smallerGain = nextMatch.p1New - rating1;
      expect(smallerGain).toBeLessThan(16); // Gains less against weaker opponent
    });
  });

  describe('Boundary conditions', () => {
    test('handles rating of 0', () => {
      const { p1New, p2New } = calculateElo(0, 1200, true);
      expect(p1New).toBeGreaterThan(0);
      expect(p2New).toBeLessThan(1200);
    });

    test('handles very large rating', () => {
      const { p1New, p2New } = calculateElo(10000, 1200, false);
      expect(p1New).toBeLessThan(10000);
      expect(p2New).toBeGreaterThan(1200);
    });

    test('same rating 100 times still produces valid results', () => {
      for (let i = 0; i < 100; i++) {
        const { p1New, p2New } = calculateElo(1500, 1500, true);
        expect(p1New).toBe(1516);
        expect(p2New).toBe(1484);
      }
    });
  });
});
