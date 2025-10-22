// Finish Threshold Logic Tests
import { computeFinishThreshold, hasReachedThreshold } from './finishThreshold';

describe('Finish Threshold Logic', () => {
  describe('computeFinishThreshold', () => {
    it('should return 3 for 4 racers', () => {
      expect(computeFinishThreshold(4)).toBe(3);
    });

    it('should return 4 for 8 racers', () => {
      expect(computeFinishThreshold(8)).toBe(4);
    });

    it('should return 2 for 2 racers (default: all must finish)', () => {
      expect(computeFinishThreshold(2)).toBe(2);
    });

    it('should return 6 for 6 racers (default: all must finish)', () => {
      expect(computeFinishThreshold(6)).toBe(6);
    });

    it('should return 1 for 1 racer', () => {
      expect(computeFinishThreshold(1)).toBe(1);
    });
  });

  describe('hasReachedThreshold', () => {
    it('should return true when threshold is reached', () => {
      expect(hasReachedThreshold(3, 4)).toBe(true);
      expect(hasReachedThreshold(4, 8)).toBe(true);
      expect(hasReachedThreshold(2, 2)).toBe(true);
      expect(hasReachedThreshold(4, 4)).toBe(true);
      expect(hasReachedThreshold(5, 4)).toBe(true); // overflow
    });

    it('should return false when threshold is not reached', () => {
      expect(hasReachedThreshold(2, 4)).toBe(false);
      expect(hasReachedThreshold(3, 8)).toBe(false);
      expect(hasReachedThreshold(1, 2)).toBe(false);
      expect(hasReachedThreshold(0, 4)).toBe(false);
    });
  });
});

