/**
 * Seeded Random Number Generator
 * Simple Linear Congruential Generator (LCG) for deterministic randomness
 */

export class SeededRandom {
  private seed: number;
  private readonly a = 1664525;
  private readonly c = 1013904223;
  private readonly m = Math.pow(2, 32);

  constructor(seed: number) {
    this.seed = seed >>> 0; // Ensure 32-bit unsigned integer
  }

  /**
   * Get next random number between 0 and 1
   */
  next(): number {
    this.seed = (this.a * this.seed + this.c) % this.m;
    return this.seed / this.m;
  }

  /**
   * Get random integer between min (inclusive) and max (inclusive)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Get random float between min and max
   */
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  /**
   * Reset to original seed
   */
  reset(newSeed: number) {
    this.seed = newSeed >>> 0;
  }
}

/**
 * Helper function to get random value between min and max using a seed
 */
export function randomBetween(seed: number, min: number, max: number): number {
  const rng = new SeededRandom(seed);
  return rng.nextFloat(min, max);
}

/**
 * Generate a random seed
 */
export function generateSeed(): number {
  return Math.floor(Math.random() * 0xffffffff);
}

