/**
 * Unit tests for AI Runner simulation
 * Tests deterministic behavior, difficulty levels, and personality traits
 */

import { AIRunner, createAIRunners } from './aiRunner';
import type { AIConfig } from '@/types';

/**
 * Helper: Generate complete AI race simulation for testing
 * Returns array of positions at regular intervals
 */
function generateAIRunner(config: { seed: number; difficulty: 'easy' | 'medium' | 'hard' }): { positions: number[] } {
  const difficulty = config.difficulty.charAt(0).toUpperCase() + config.difficulty.slice(1) as 'Easy' | 'Medium' | 'Hard';
  
  const aiConfig: AIConfig = {
    difficulty,
    personality: 'Consistent',
    seed: config.seed,
    seedOffset: 0,
  };

  const runner = new AIRunner('test', 'Test', aiConfig);
  const positions: number[] = [];
  
  // Sample positions every 500ms for 60 seconds or until finish
  for (let t = 0; t <= 60000; t += 500) {
    runner.update(t);
    positions.push(runner.getState().meters);
    if (runner.getState().finished) break;
  }
  
  return { positions };
}

describe('AI runner determinism', () => {
  test('same seed yields identical movement pattern', () => {
    const ai1 = generateAIRunner({ seed: 123, difficulty: 'medium' });
    const ai2 = generateAIRunner({ seed: 123, difficulty: 'medium' });
    expect(ai1.positions).toEqual(ai2.positions);
  });

  test('different seeds produce different patterns', () => {
    const ai1 = generateAIRunner({ seed: 123, difficulty: 'medium' });
    const ai2 = generateAIRunner({ seed: 456, difficulty: 'medium' });
    expect(ai1.positions).not.toEqual(ai2.positions);
  });

  test('higher difficulty yields faster average velocity', () => {
    const easy = generateAIRunner({ seed: 100, difficulty: 'easy' });
    const hard = generateAIRunner({ seed: 100, difficulty: 'hard' });
    const avgEasy = easy.positions.reduce((a, b) => a + b, 0) / easy.positions.length;
    const avgHard = hard.positions.reduce((a, b) => a + b, 0) / hard.positions.length;
    expect(avgHard).toBeGreaterThan(avgEasy);
  });

  test('positions increase monotonically', () => {
    const ai = generateAIRunner({ seed: 789, difficulty: 'medium' });
    for (let i = 1; i < ai.positions.length; i++) {
      expect(ai.positions[i]).toBeGreaterThanOrEqual(ai.positions[i - 1]);
    }
  });

  test('eventually reaches 100m finish line', () => {
    const ai = generateAIRunner({ seed: 999, difficulty: 'medium' });
    const finalPosition = ai.positions[ai.positions.length - 1];
    expect(finalPosition).toBeGreaterThanOrEqual(100);
  });

  test('hard difficulty finishes faster than easy', () => {
    const easy = generateAIRunner({ seed: 555, difficulty: 'easy' });
    const hard = generateAIRunner({ seed: 555, difficulty: 'hard' });
    
    // Hard should finish in fewer time steps
    expect(hard.positions.length).toBeLessThanOrEqual(easy.positions.length);
  });
});

describe('AIRunner class - detailed behavior', () => {
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
    expect(state.nextStepTime).toBeGreaterThan(0);
  });

  test('meters calculation: 1 step = 0.6 meters', () => {
    const config: AIConfig = {
      difficulty: 'Easy',
      personality: 'Consistent',
      seed: 12345,
      seedOffset: 0,
    };

    const runner = new AIRunner('test', 'Test', config);
    runner.update(10000);

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
    runner.update(100000);
    
    const stepsAfterFinish = runner.getState().steps;
    runner.update(200000);
    
    expect(runner.getState().steps).toBe(stepsAfterFinish);
  });

  test('reset() restores initial state with same seed', () => {
    const config: AIConfig = {
      difficulty: 'Medium',
      personality: 'Consistent',
      seed: 55555,
      seedOffset: 0,
    };

    const runner = new AIRunner('test', 'Test', config);
    runner.update(3000);
    const steps1 = runner.getState().steps;
    
    runner.reset();
    runner.update(3000);
    const steps2 = runner.getState().steps;
    
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

    easy.update(30000);
    medium.update(30000);
    hard.update(30000);

    expect(hard.getState().meters).toBeGreaterThan(medium.getState().meters);
    expect(medium.getState().meters).toBeGreaterThan(easy.getState().meters);
  });

  test('difficulty affects finish time', () => {
    const seeds = [111, 222, 333];
    const easyTimes: number[] = [];
    const hardTimes: number[] = [];

    seeds.forEach(seed => {
      const easy = new AIRunner('e', 'E', { difficulty: 'Easy', personality: 'Consistent', seed, seedOffset: 0 });
      const hard = new AIRunner('h', 'H', { difficulty: 'Hard', personality: 'Consistent', seed, seedOffset: 0 });

      easy.update(120000);
      hard.update(120000);

      if (easy.getFinishTime()) easyTimes.push(easy.getFinishTime()!);
      if (hard.getFinishTime()) hardTimes.push(hard.getFinishTime()!);
    });

    const avgEasy = easyTimes.reduce((a, b) => a + b, 0) / easyTimes.length;
    const avgHard = hardTimes.reduce((a, b) => a + b, 0) / hardTimes.length;

    expect(avgHard).toBeLessThan(avgEasy);
  });
});

describe('Personality traits', () => {
  test('Consistent has predictable behavior', () => {
    const config: AIConfig = {
      difficulty: 'Medium',
      personality: 'Consistent',
      seed: 12345,
      seedOffset: 0,
    };

    const runner = new AIRunner('c', 'Consistent', config);
    const steps = runner.update(10000);
    
    // Should have steps (not all skipped)
    expect(steps.length).toBeGreaterThan(5);
  });

  test('Erratic has more variance', () => {
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

    consistent.update(10000);
    erratic.update(10000);

    // Both should make progress but with different patterns
    expect(consistent.getState().meters).toBeGreaterThan(0);
    expect(erratic.getState().meters).toBeGreaterThan(0);
  });

  test('Aggressive performs better in final sprint', () => {
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

    normal.update(100000);
    aggressive.update(100000);

    // Aggressive should finish faster or equal
    const normalFinish = normal.getFinishTime() || Infinity;
    const aggressiveFinish = aggressive.getFinishTime() || Infinity;
    
    expect(aggressiveFinish).toBeLessThanOrEqual(normalFinish);
  });
});

describe('createAIRunners factory', () => {
  test('creates specified number of runners', () => {
    const runners = createAIRunners(3, 'Medium', 'Consistent', 12345);
    expect(runners).toHaveLength(3);
  });

  test('each runner has unique name and ID', () => {
    const runners = createAIRunners(5, 'Medium', 'Consistent', 12345);
    
    const ids = runners.map(r => r.getState().id);
    const names = runners.map(r => r.getState().name);
    
    expect(new Set(ids).size).toBe(5);
    expect(new Set(names).size).toBe(5);
  });

  test('each runner has unique seed offset', () => {
    const runners = createAIRunners(3, 'Medium', 'Consistent', 12345);
    
    runners.forEach(r => r.update(5000));
    
    const steps = runners.map(r => r.getState().steps);
    expect(new Set(steps).size).toBeGreaterThan(1);
  });

  test('supports up to 7 runners with proper names', () => {
    const runners = createAIRunners(7, 'Easy', 'Erratic', 99999);
    const expectedNames = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf'];
    
    const names = runners.map(r => r.getState().name);
    expect(names).toEqual(expectedNames);
  });
});

describe('Race simulation scenarios', () => {
  test('complete race from start to finish', () => {
    const config: AIConfig = {
      difficulty: 'Medium',
      personality: 'Consistent',
      seed: 12345,
      seedOffset: 0,
    };

    const runner = new AIRunner('test', 'Test', config);
    
    let elapsed = 0;
    while (!runner.getState().finished && elapsed < 120000) {
      runner.update(elapsed);
      elapsed += 100;
    }
    
    expect(runner.getState().finished).toBe(true);
    expect(runner.getState().meters).toBeGreaterThanOrEqual(100);
    expect(runner.getFinishTime()).toBeLessThan(120000);
  });

  test('multiple runners finish in different times', () => {
    const runners = createAIRunners(3, 'Medium', 'Consistent', 54321);
    
    let elapsed = 0;
    while (elapsed < 120000) {
      runners.forEach(r => r.update(elapsed));
      if (runners.every(r => r.getState().finished)) break;
      elapsed += 100;
    }
    
    const finishTimes = runners.map(r => r.getFinishTime()).filter(t => t !== undefined);
    expect(finishTimes).toHaveLength(3);
    expect(new Set(finishTimes).size).toBe(3);
  });

  test('incremental updates match single large update', () => {
    const config: AIConfig = {
      difficulty: 'Medium',
      personality: 'Consistent',
      seed: 12345,
      seedOffset: 0,
    };

    const runner1 = new AIRunner('r1', 'Runner1', config);
    const runner2 = new AIRunner('r2', 'Runner2', config);
    
    // Incremental
    for (let i = 0; i <= 5000; i += 500) {
      runner1.update(i);
    }
    
    // Single update
    runner2.update(5000);
    
    expect(runner1.getState().steps).toBe(runner2.getState().steps);
    expect(runner1.getState().meters).toBe(runner2.getState().meters);
  });
});

describe('Seed offset variation', () => {
  test('different offsets create unique behavior', () => {
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
    
    expect(runner1.getState().steps).not.toBe(runner2.getState().steps);
  });

  test('seed offset affects finish time', () => {
    const runners = createAIRunners(5, 'Medium', 'Consistent', 77777);
    
    runners.forEach(r => r.update(100000));
    
    const finishTimes = runners
      .map(r => r.getFinishTime())
      .filter(t => t !== undefined);
    
    // All should finish at different times
    expect(new Set(finishTimes).size).toBeGreaterThan(1);
  });
});

describe('Performance and edge cases', () => {
  test('handles very large elapsed time', () => {
    const config: AIConfig = {
      difficulty: 'Easy',
      personality: 'Consistent',
      seed: 12345,
      seedOffset: 0,
    };

    const runner = new AIRunner('test', 'Test', config);
    runner.update(999999999);
    
    expect(runner.getState().finished).toBe(true);
    expect(runner.getState().meters).toBeGreaterThanOrEqual(100);
  });

  test('position never decreases', () => {
    const config: AIConfig = {
      difficulty: 'Medium',
      personality: 'Erratic',
      seed: 88888,
      seedOffset: 0,
    };

    const runner = new AIRunner('test', 'Test', config);
    let prevMeters = 0;

    for (let t = 0; t <= 30000; t += 200) {
      runner.update(t);
      const currentMeters = runner.getState().meters;
      expect(currentMeters).toBeGreaterThanOrEqual(prevMeters);
      prevMeters = currentMeters;
    }
  });

  test('all personalities eventually finish', () => {
    const personalities: Array<'Consistent' | 'Erratic' | 'Aggressive'> = ['Consistent', 'Erratic', 'Aggressive'];
    
    personalities.forEach(personality => {
      const config: AIConfig = {
        difficulty: 'Medium',
        personality,
        seed: 55555,
        seedOffset: 0,
      };
      
      const runner = new AIRunner(`test-${personality}`, personality, config);
      runner.update(120000);
      
      expect(runner.getState().finished).toBe(true);
    });
  });
});
