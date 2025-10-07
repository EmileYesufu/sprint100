/**
 * Unit tests for AI Runner simulation
 * Tests deterministic behavior, difficulty levels, and personality traits
 */

import { AIRunner, createAIRunners } from './aiRunner';
import type { AIConfig } from '@/types';

describe('AI Runner', () => {
  describe('AIRunner class', () => {
    test('initializes with correct starting state', () => {
      const config: AIConfig = {
        difficulty: 'Medium',
        personality: 'Consistent',
        seed: 12345,
        seedOffset: 0,
      };

      const runner = new AIRunner('test-1', 'TestBot', config);
      const state = runner.getState();

      expect(state.id).toBe('test-1');
      expect(state.name).toBe('TestBot');
      expect(state.steps).toBe(0);
      expect(state.meters).toBe(0);
      expect(state.finished).toBe(false);
      expect(state.nextStepTime).toBeGreaterThan(0); // Has reaction time
    });

    test('deterministic: same seed produces same behavior', () => {
      const config: AIConfig = {
        difficulty: 'Medium',
        personality: 'Consistent',
        seed: 99999,
        seedOffset: 0,
      };

      const runner1 = new AIRunner('ai-1', 'Alpha', config);
      const runner2 = new AIRunner('ai-2', 'Bravo', config);

      // Simulate same elapsed time
      const steps1 = runner1.update(5000);
      const steps2 = runner2.update(5000);

      // Should produce identical step counts and timing
      expect(steps1.length).toBe(steps2.length);
      expect(runner1.getState().steps).toBe(runner2.getState().steps);
      expect(runner1.getState().meters).toBe(runner2.getState().meters);
    });

    test('different seeds produce different behavior', () => {
      const config1: AIConfig = {
        difficulty: 'Medium',
        personality: 'Consistent',
        seed: 11111,
        seedOffset: 0,
      };
      const config2: AIConfig = {
        difficulty: 'Medium',
        personality: 'Consistent',
        seed: 22222,
        seedOffset: 0,
      };

      const runner1 = new AIRunner('ai-1', 'Alpha', config1);
      const runner2 = new AIRunner('ai-2', 'Bravo', config2);

      runner1.update(5000);
      runner2.update(5000);

      // Different seeds should produce different results
      expect(runner1.getState().steps).not.toBe(runner2.getState().steps);
    });

    test('meters calculation: 1 step = 0.6 meters', () => {
      const config: AIConfig = {
        difficulty: 'Easy',
        personality: 'Consistent',
        seed: 12345,
        seedOffset: 0,
      };

      const runner = new AIRunner('test', 'Test', config);
      runner.update(10000); // Long enough to take multiple steps

      const state = runner.getState();
      expect(state.meters).toBeCloseTo(state.steps * 0.6, 1);
    });

    test('finishes at 100 meters', () => {
      const config: AIConfig = {
        difficulty: 'Easy',
        personality: 'Consistent',
        seed: 12345,
        seedOffset: 0,
      };

      const runner = new AIRunner('test', 'Test', config);
      
      // Simulate long enough to finish
      runner.update(100000);
      
      const state = runner.getState();
      expect(state.finished).toBe(true);
      expect(state.meters).toBeGreaterThanOrEqual(100);
      expect(runner.getFinishTime()).toBeDefined();
    });

    test('does not update after finishing', () => {
      const config: AIConfig = {
        difficulty: 'Easy',
        personality: 'Consistent',
        seed: 12345,
        seedOffset: 0,
      };

      const runner = new AIRunner('test', 'Test', config);
      runner.update(100000); // Finish
      
      const stepsAfterFinish = runner.getState().steps;
      const metersAfterFinish = runner.getState().meters;
      
      runner.update(200000); // Try to update more
      
      expect(runner.getState().steps).toBe(stepsAfterFinish);
      expect(runner.getState().meters).toBe(metersAfterFinish);
    });

    test('reset() restores initial state with same seed', () => {
      const config: AIConfig = {
        difficulty: 'Medium',
        personality: 'Consistent',
        seed: 55555,
        seedOffset: 0,
      };

      const runner = new AIRunner('test', 'Test', config);
      const initialSteps1 = runner.update(3000);
      const steps1 = runner.getState().steps;
      
      runner.reset();
      
      const initialSteps2 = runner.update(3000);
      const steps2 = runner.getState().steps;
      
      // After reset, should produce same results
      expect(initialSteps1.length).toBe(initialSteps2.length);
      expect(steps1).toBe(steps2);
    });

    test('alternates left/right sides', () => {
      const config: AIConfig = {
        difficulty: 'Easy',
        personality: 'Consistent',
        seed: 12345,
        seedOffset: 0,
      };

      const runner = new AIRunner('test', 'Test', config);
      const steps = runner.update(5000);
      
      // Check that sides alternate
      for (let i = 1; i < steps.length; i++) {
        if (steps[i-1] && steps[i]) {
          expect(steps[i].side).not.toBe(steps[i-1].side);
        }
      }
    });

    test('returns empty array before reaction time', () => {
      const config: AIConfig = {
        difficulty: 'Medium',
        personality: 'Consistent',
        seed: 12345,
        seedOffset: 0,
      };

      const runner = new AIRunner('test', 'Test', config);
      
      // Very short elapsed time (before reaction delay)
      const steps = runner.update(10);
      expect(steps.length).toBe(0);
    });
  });

  describe('Difficulty levels', () => {
    test('Hard is faster than Medium, Medium faster than Easy', () => {
      const easyConfig: AIConfig = {
        difficulty: 'Easy',
        personality: 'Consistent',
        seed: 12345,
        seedOffset: 0,
      };
      const mediumConfig: AIConfig = {
        difficulty: 'Medium',
        personality: 'Consistent',
        seed: 12345,
        seedOffset: 0,
      };
      const hardConfig: AIConfig = {
        difficulty: 'Hard',
        personality: 'Consistent',
        seed: 12345,
        seedOffset: 0,
      };

      const easy = new AIRunner('easy', 'Easy', easyConfig);
      const medium = new AIRunner('medium', 'Medium', mediumConfig);
      const hard = new AIRunner('hard', 'Hard', hardConfig);

      const timeToFinish = 60000; // 60 seconds
      
      easy.update(timeToFinish);
      medium.update(timeToFinish);
      hard.update(timeToFinish);

      const easySteps = easy.getState().steps;
      const mediumSteps = medium.getState().steps;
      const hardSteps = hard.getState().steps;

      expect(hardSteps).toBeGreaterThan(mediumSteps);
      expect(mediumSteps).toBeGreaterThan(easySteps);
    });

    test('Easy has higher skip probability than Medium/Hard', () => {
      // This is probabilistic, so we run multiple trials
      const trials = 10;
      let easySkips = 0;
      let hardSkips = 0;

      for (let i = 0; i < trials; i++) {
        const easyConfig: AIConfig = {
          difficulty: 'Easy',
          personality: 'Consistent',
          seed: 12345 + i,
          seedOffset: 0,
        };
        const hardConfig: AIConfig = {
          difficulty: 'Hard',
          personality: 'Consistent',
          seed: 12345 + i,
          seedOffset: 0,
        };

        const easy = new AIRunner('easy', 'Easy', easyConfig);
        const hard = new AIRunner('hard', 'Hard', hardConfig);

        easy.update(10000);
        hard.update(10000);

        // Easy should skip more steps (lower step efficiency)
        // This is hard to measure directly, but we can infer from step count
        easySkips += easy.getState().steps;
        hardSkips += hard.getState().steps;
      }

      // Over many trials, hard should have more steps (fewer skips)
      expect(hardSkips).toBeGreaterThan(easySkips);
    });
  });

  describe('Personality traits', () => {
    test('Consistent has lower variance than Erratic', () => {
      const consistentConfig: AIConfig = {
        difficulty: 'Medium',
        personality: 'Consistent',
        seed: 12345,
        seedOffset: 0,
      };
      const erraticConfig: AIConfig = {
        difficulty: 'Medium',
        personality: 'Erratic',
        seed: 12345,
        seedOffset: 0,
      };

      const consistent = new AIRunner('c', 'Consistent', consistentConfig);
      const erratic = new AIRunner('e', 'Erratic', erraticConfig);

      // Get step timestamps
      const consistentSteps = consistent.update(10000);
      const erraticSteps = erratic.update(10000);

      // Calculate variance in step intervals
      const calcVariance = (steps: Array<{timestamp: number}>) => {
        const intervals = [];
        for (let i = 1; i < steps.length; i++) {
          intervals.push(steps[i].timestamp - steps[i-1].timestamp);
        }
        const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variance = intervals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intervals.length;
        return variance;
      };

      if (consistentSteps.length > 5 && erraticSteps.length > 5) {
        const consistentVar = calcVariance(consistentSteps);
        const erraticVar = calcVariance(erraticSteps);
        
        expect(erraticVar).toBeGreaterThan(consistentVar);
      }
    });

    test('Aggressive has sprint bonus in last 10%', () => {
      const normalConfig: AIConfig = {
        difficulty: 'Medium',
        personality: 'Consistent',
        seed: 12345,
        seedOffset: 0,
      };
      const aggressiveConfig: AIConfig = {
        difficulty: 'Medium',
        personality: 'Aggressive',
        seed: 12345,
        seedOffset: 0,
      };

      const normal = new AIRunner('n', 'Normal', normalConfig);
      const aggressive = new AIRunner('a', 'Aggressive', aggressiveConfig);

      // Update to near finish
      normal.update(100000);
      aggressive.update(100000);

      // Aggressive should finish faster or with more meters
      expect(aggressive.getState().meters).toBeGreaterThanOrEqual(normal.getState().meters);
    });
  });

  describe('createAIRunners factory function', () => {
    test('creates specified number of runners', () => {
      const runners = createAIRunners(3, 'Medium', 'Consistent', 12345);
      expect(runners).toHaveLength(3);
    });

    test('each runner has unique name and ID', () => {
      const runners = createAIRunners(5, 'Medium', 'Consistent', 12345);
      
      const ids = runners.map(r => r.getState().id);
      const names = runners.map(r => r.getState().name);
      
      expect(new Set(ids).size).toBe(5); // All unique IDs
      expect(new Set(names).size).toBe(5); // All unique names
    });

    test('each runner has unique seed offset', () => {
      const runners = createAIRunners(3, 'Medium', 'Consistent', 12345);
      
      // Update all to same time
      runners.forEach(r => r.update(5000));
      
      const steps = runners.map(r => r.getState().steps);
      
      // Each should have different step count due to different seed offset
      expect(new Set(steps).size).toBeGreaterThan(1);
    });

    test('supports up to 7 runners with proper names', () => {
      const runners = createAIRunners(7, 'Easy', 'Erratic', 99999);
      const expectedNames = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf'];
      
      const names = runners.map(r => r.getState().name);
      expect(names).toEqual(expectedNames);
    });
  });

  describe('Race simulation', () => {
    test('complete race simulation to 100m', () => {
      const config: AIConfig = {
        difficulty: 'Medium',
        personality: 'Consistent',
        seed: 12345,
        seedOffset: 0,
      };

      const runner = new AIRunner('test', 'Test', config);
      
      let elapsed = 0;
      const step = 100; // Update every 100ms
      
      while (!runner.getState().finished && elapsed < 120000) {
        runner.update(elapsed);
        elapsed += step;
      }
      
      expect(runner.getState().finished).toBe(true);
      expect(runner.getState().meters).toBeGreaterThanOrEqual(100);
      expect(runner.getFinishTime()).toBeLessThan(120000);
    });

    test('multiple runners finishing in different times', () => {
      const runners = createAIRunners(3, 'Medium', 'Consistent', 54321);
      
      // Simulate until all finish
      let elapsed = 0;
      while (elapsed < 120000) {
        runners.forEach(r => r.update(elapsed));
        if (runners.every(r => r.getState().finished)) break;
        elapsed += 100;
      }
      
      const finishTimes = runners.map(r => r.getFinishTime()).filter(t => t !== undefined);
      expect(finishTimes).toHaveLength(3);
      
      // All should be different (due to seed offset)
      expect(new Set(finishTimes).size).toBe(3);
    });
  });

  describe('Edge cases', () => {
    test('handles very large elapsed time', () => {
      const config: AIConfig = {
        difficulty: 'Easy',
        personality: 'Consistent',
        seed: 12345,
        seedOffset: 0,
      };

      const runner = new AIRunner('test', 'Test', config);
      
      // Jump to very large time
      runner.update(999999999);
      
      expect(runner.getState().finished).toBe(true);
      expect(runner.getState().meters).toBeGreaterThanOrEqual(100);
    });

    test('handles incremental updates correctly', () => {
      const config: AIConfig = {
        difficulty: 'Medium',
        personality: 'Consistent',
        seed: 12345,
        seedOffset: 0,
      };

      const runner1 = new AIRunner('r1', 'Runner1', config);
      const runner2 = new AIRunner('r2', 'Runner2', config);
      
      // One updates incrementally
      for (let i = 0; i <= 5000; i += 500) {
        runner1.update(i);
      }
      
      // Other updates all at once
      runner2.update(5000);
      
      // Should have same final state
      expect(runner1.getState().steps).toBe(runner2.getState().steps);
      expect(runner1.getState().meters).toBe(runner2.getState().meters);
    });

    test('seed offset creates variation', () => {
      const config1: AIConfig = {
        difficulty: 'Medium',
        personality: 'Consistent',
        seed: 12345,
        seedOffset: 0,
      };
      const config2: AIConfig = {
        difficulty: 'Medium',
        personality: 'Consistent',
        seed: 12345,
        seedOffset: 1,
      };

      const runner1 = new AIRunner('r1', 'R1', config1);
      const runner2 = new AIRunner('r2', 'R2', config2);
      
      runner1.update(5000);
      runner2.update(5000);
      
      // Same seed but different offset should produce different results
      expect(runner1.getState().steps).not.toBe(runner2.getState().steps);
    });
  });
});

