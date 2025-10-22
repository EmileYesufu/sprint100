// Client AI Runner Tests
import { AIRunner, createAIRunners } from '../src/ai/aiRunner';
import { SeededRandom } from '../src/utils/seededRandom';

describe('AI Runner Tests', () => {
  describe('AIRunner', () => {
    it('should create AI runner with correct difficulty', () => {
      const runner = new AIRunner('easy', 'consistent');
      expect(runner.difficulty).toBe('easy');
      expect(runner.personality).toBe('consistent');
    });

    it('should generate consistent behavior with same seed', () => {
      const runner1 = new AIRunner('medium', 'aggressive');
      const runner2 = new AIRunner('medium', 'aggressive');
      
      // Set same seed for both runners
      runner1.setSeed(12345);
      runner2.setSeed(12345);
      
      // Both should generate same initial behavior
      const behavior1 = runner1.getInitialBehavior();
      const behavior2 = runner2.getInitialBehavior();
      
      expect(behavior1).toEqual(behavior2);
    });

    it('should generate different behavior with different seeds', () => {
      const runner1 = new AIRunner('medium', 'aggressive');
      const runner2 = new AIRunner('medium', 'aggressive');
      
      runner1.setSeed(12345);
      runner2.setSeed(54321);
      
      const behavior1 = runner1.getInitialBehavior();
      const behavior2 = runner2.getInitialBehavior();
      
      expect(behavior1).not.toEqual(behavior2);
    });

    it('should update behavior based on race progress', () => {
      const runner = new AIRunner('hard', 'adaptive');
      runner.setSeed(12345);
      
      const initialBehavior = runner.getInitialBehavior();
      runner.updateBehavior(0.5, 0.3); // 50% progress, 30% time elapsed
      
      const updatedBehavior = runner.getCurrentBehavior();
      expect(updatedBehavior).toBeDefined();
      expect(typeof updatedBehavior).toBe('object');
    });

    it('should handle different difficulty levels', () => {
      const easyRunner = new AIRunner('easy', 'consistent');
      const hardRunner = new AIRunner('hard', 'consistent');
      
      easyRunner.setSeed(12345);
      hardRunner.setSeed(12345);
      
      const easyBehavior = easyRunner.getInitialBehavior();
      const hardBehavior = hardRunner.getInitialBehavior();
      
      // Hard difficulty should generally be more challenging
      expect(easyBehavior).toBeDefined();
      expect(hardBehavior).toBeDefined();
    });
  });

  describe('createAIRunners', () => {
    it('should create correct number of AI runners', () => {
      const runners = createAIRunners(3, 'medium', 'mixed');
      expect(runners).toHaveLength(3);
    });

    it('should create runners with different personalities when mixed', () => {
      const runners = createAIRunners(4, 'medium', 'mixed');
      const personalities = runners.map(r => r.personality);
      
      // Should have different personalities
      const uniquePersonalities = new Set(personalities);
      expect(uniquePersonalities.size).toBeGreaterThan(1);
    });

    it('should create runners with same personality when not mixed', () => {
      const runners = createAIRunners(3, 'medium', 'consistent');
      const personalities = runners.map(r => r.personality);
      
      // All should have same personality
      const uniquePersonalities = new Set(personalities);
      expect(uniquePersonalities.size).toBe(1);
    });
  });

  describe('SeededRandom', () => {
    it('should generate consistent random numbers with same seed', () => {
      const random1 = new SeededRandom(12345);
      const random2 = new SeededRandom(12345);
      
      const values1 = [random1.next(), random1.next(), random1.next()];
      const values2 = [random2.next(), random2.next(), random2.next()];
      
      expect(values1).toEqual(values2);
    });

    it('should generate different random numbers with different seeds', () => {
      const random1 = new SeededRandom(12345);
      const random2 = new SeededRandom(54321);
      
      const values1 = [random1.next(), random1.next(), random1.next()];
      const values2 = [random2.next(), random2.next(), random2.next()];
      
      expect(values1).not.toEqual(values2);
    });

    it('should generate numbers in correct range', () => {
      const random = new SeededRandom(12345);
      
      for (let i = 0; i < 100; i++) {
        const value = random.next();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });
  });
});
