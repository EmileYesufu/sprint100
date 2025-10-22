// Client Utility Functions Tests
import { computeFinalPlacings, assignPositions } from '../src/utils/computeFinalPlacings';
import { computeFinishThreshold, hasReachedThreshold } from '../src/utils/finishThreshold';
import { metersToPct, formatElo, formatDate } from '../src/utils/formatting';

describe('Utility Functions', () => {
  describe('computeFinalPlacings', () => {
    it('should rank finished racers by time', () => {
      const racers = [
        { id: 1, distance: 100, timeMs: 5000 },
        { id: 2, distance: 100, timeMs: 4500 },
        { id: 3, distance: 100, timeMs: 5500 }
      ];

      const result = computeFinalPlacings(racers);
      
      expect(result).toEqual([
        { id: 2, distance: 100, timeMs: 4500, position: 1 },
        { id: 1, distance: 100, timeMs: 5000, position: 2 },
        { id: 3, distance: 100, timeMs: 5500, position: 3 }
      ]);
    });

    it('should rank unfinished racers by distance', () => {
      const racers = [
        { id: 1, distance: 80, timeMs: null },
        { id: 2, distance: 90, timeMs: null },
        { id: 3, distance: 85, timeMs: null }
      ];

      const result = computeFinalPlacings(racers);
      
      expect(result).toEqual([
        { id: 2, distance: 90, timeMs: null, position: 1 },
        { id: 3, distance: 85, timeMs: null, position: 2 },
        { id: 1, distance: 80, timeMs: null, position: 3 }
      ]);
    });

    it('should handle mixed finished and unfinished racers', () => {
      const racers = [
        { id: 1, distance: 100, timeMs: 5000 }, // Finished
        { id: 2, distance: 90, timeMs: null },  // Unfinished
        { id: 3, distance: 100, timeMs: 4500 }  // Finished
      ];

      const result = computeFinalPlacings(racers);
      
      expect(result).toEqual([
        { id: 3, distance: 100, timeMs: 4500, position: 1 },
        { id: 1, distance: 100, timeMs: 5000, position: 2 },
        { id: 2, distance: 90, timeMs: null, position: 3 }
      ]);
    });
  });

  describe('assignPositions', () => {
    it('should assign positions correctly', () => {
      const racers = [
        { id: 1, distance: 100, timeMs: 5000 },
        { id: 2, distance: 100, timeMs: 4500 },
        { id: 3, distance: 100, timeMs: 5500 }
      ];

      const result = assignPositions(racers);
      
      expect(result[0].position).toBe(1);
      expect(result[1].position).toBe(2);
      expect(result[2].position).toBe(3);
    });
  });

  describe('computeFinishThreshold', () => {
    it('should return correct threshold for 4 racers', () => {
      expect(computeFinishThreshold(4)).toBe(3);
    });

    it('should return correct threshold for 8 racers', () => {
      expect(computeFinishThreshold(8)).toBe(4);
    });

    it('should return correct threshold for 2 racers', () => {
      expect(computeFinishThreshold(2)).toBe(2);
    });

    it('should handle edge cases', () => {
      expect(computeFinishThreshold(1)).toBe(1);
      expect(computeFinishThreshold(0)).toBe(0);
    });
  });

  describe('hasReachedThreshold', () => {
    it('should return true when threshold is reached', () => {
      const finishedCount = 3;
      const totalRacers = 4;
      const threshold = computeFinishThreshold(totalRacers);
      
      expect(hasReachedThreshold(finishedCount, threshold)).toBe(true);
    });

    it('should return false when threshold is not reached', () => {
      const finishedCount = 2;
      const totalRacers = 4;
      const threshold = computeFinishThreshold(totalRacers);
      
      expect(hasReachedThreshold(finishedCount, threshold)).toBe(false);
    });
  });

  describe('formatting utilities', () => {
    describe('metersToPct', () => {
      it('should convert meters to percentage', () => {
        expect(metersToPct(50, 100)).toBe(50);
        expect(metersToPct(25, 100)).toBe(25);
        expect(metersToPct(100, 100)).toBe(100);
      });

      it('should handle edge cases', () => {
        expect(metersToPct(0, 100)).toBe(0);
        expect(metersToPct(150, 100)).toBe(100);
      });
    });

    describe('formatElo', () => {
      it('should format ELO rating', () => {
        expect(formatElo(1200)).toBe('1200');
        expect(formatElo(1500)).toBe('1500');
        expect(formatElo(999)).toBe('999');
      });
    });

    describe('formatDate', () => {
      it('should format date string', () => {
        const date = new Date('2024-01-15T10:30:00Z');
        const formatted = formatDate(date.toISOString());
        
        expect(formatted).toBeDefined();
        expect(typeof formatted).toBe('string');
      });
    });
  });
});
