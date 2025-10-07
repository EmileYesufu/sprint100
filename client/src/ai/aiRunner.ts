/**
 * AI Runner - Deterministic AI opponent simulation
 * Simulates realistic tap patterns based on difficulty and personality
 */

import { SeededRandom } from "@/utils/seededRandom";
import type { AIConfig, AIDifficulty, AIPersonality, AIState } from "@/types";

// Tunable AI parameters - adjust these to change AI behavior
const AI_PARAMS = {
  Easy: {
    avgStepInterval: 350, // milliseconds between steps
    variance: 0.3, // 30% variance
    skipProbability: 0.08, // 8% chance to skip a step
    sprintReduction: 0.12, // 12% faster in last 10%
    reactionTimeMin: 200,
    reactionTimeMax: 400,
  },
  Medium: {
    avgStepInterval: 300,
    variance: 0.2, // 20% variance
    skipProbability: 0.04,
    sprintReduction: 0.16, // 16% faster in last 10%
    reactionTimeMin: 150,
    reactionTimeMax: 300,
  },
  Hard: {
    avgStepInterval: 250,
    variance: 0.1, // 10% variance
    skipProbability: 0.01,
    sprintReduction: 0.20, // 20% faster in last 10%
    reactionTimeMin: 100,
    reactionTimeMax: 200,
  },
};

const PERSONALITY_MODIFIERS = {
  Consistent: {
    varianceMultiplier: 0.5, // Reduce variance
    skipMultiplier: 0.5, // Reduce skip chance
  },
  Erratic: {
    varianceMultiplier: 1.5, // Increase variance
    skipMultiplier: 1.5, // Increase skip chance
  },
  Aggressive: {
    varianceMultiplier: 0.8,
    skipMultiplier: 0.7,
    sprintBonus: 0.05, // Extra 5% speed in sprint
  },
};

// Same mapping as online mode: 1 step = 0.6 meters
const METERS_PER_STEP = 0.6;
const FINISH_LINE_METERS = 100;
const SPRINT_THRESHOLD = FINISH_LINE_METERS * 0.9; // Last 10%

export class AIRunner {
  private rng: SeededRandom;
  private config: AIConfig;
  private state: AIState;
  private params: typeof AI_PARAMS.Easy;
  private personalityMod: typeof PERSONALITY_MODIFIERS.Consistent;
  private reactionTime: number;
  private isRunning: boolean = false;
  private startTime: number = 0;

  constructor(id: string, name: string, config: AIConfig) {
    this.config = config;
    this.rng = new SeededRandom(config.seed + config.seedOffset);
    this.params = AI_PARAMS[config.difficulty];
    this.personalityMod = PERSONALITY_MODIFIERS[config.personality];

    // Calculate reaction time (delay before first step)
    this.reactionTime = this.rng.nextFloat(
      this.params.reactionTimeMin,
      this.params.reactionTimeMax
    );

    this.state = {
      id,
      name,
      config,
      steps: 0,
      meters: 0,
      finished: false,
      nextStepTime: this.reactionTime,
      lastSide: null,
    };
  }

  /**
   * Get current state
   */
  getState(): AIState {
    return { ...this.state };
  }

  /**
   * Calculate next step interval based on current progress
   */
  private calculateStepInterval(): number {
    const baseInterval = this.params.avgStepInterval;
    const variance = this.params.variance * this.personalityMod.varianceMultiplier;

    // Apply random variance
    const randomFactor = this.rng.nextFloat(1 - variance, 1 + variance);
    let interval = baseInterval * randomFactor;

    // Apply sprint reduction in last 10% of race
    if (this.state.meters >= SPRINT_THRESHOLD) {
      const sprintReduction = this.params.sprintReduction + 
        (this.config.personality === "Aggressive" ? PERSONALITY_MODIFIERS.Aggressive.sprintBonus || 0 : 0);
      interval *= (1 - sprintReduction);
    }

    return interval;
  }

  /**
   * Check if AI should skip this step
   */
  private shouldSkipStep(): boolean {
    const skipChance = this.params.skipProbability * this.personalityMod.skipMultiplier;
    return this.rng.next() < skipChance;
  }

  /**
   * Calculate steps and meters for AI at given elapsed time
   * Returns array of step events that occurred since last update
   */
  update(elapsedMs: number): Array<{ side: "left" | "right"; timestamp: number }> {
    if (this.state.finished || elapsedMs < this.reactionTime) {
      return [];
    }

    const steps: Array<{ side: "left" | "right"; timestamp: number }> = [];

    // Process all steps that should have occurred by this time
    while (this.state.nextStepTime <= elapsedMs && !this.state.finished) {
      // Check if we should skip this step
      if (!this.shouldSkipStep()) {
        // Alternate sides (left/right pattern)
        const side: "left" | "right" = this.state.lastSide === "left" ? "right" : "left";
        this.state.lastSide = side;
        this.state.steps += 1;
        this.state.meters = this.state.steps * METERS_PER_STEP;

        steps.push({
          side,
          timestamp: this.state.nextStepTime,
        });

        // Check if finished
        if (this.state.meters >= FINISH_LINE_METERS) {
          this.state.finished = true;
          break;
        }
      }

      // Calculate next step time
      const nextInterval = this.calculateStepInterval();
      this.state.nextStepTime += nextInterval;
    }

    return steps;
  }

  /**
   * Reset AI to initial state with same config
   */
  reset() {
    this.rng.reset(this.config.seed + this.config.seedOffset);
    this.reactionTime = this.rng.nextFloat(
      this.params.reactionTimeMin,
      this.params.reactionTimeMax
    );
    this.state = {
      ...this.state,
      steps: 0,
      meters: 0,
      finished: false,
      nextStepTime: this.reactionTime,
      lastSide: null,
    };
  }

  /**
   * Get finish time if finished
   */
  getFinishTime(): number | undefined {
    return this.state.finished ? this.state.nextStepTime : undefined;
  }
}

/**
 * Create multiple AI runners
 */
export function createAIRunners(
  count: number,
  difficulty: AIDifficulty,
  personality: AIPersonality,
  baseSeed: number
): AIRunner[] {
  const runners: AIRunner[] = [];
  const aiNames = ["Alpha", "Bravo", "Charlie", "Delta", "Echo", "Foxtrot", "Golf"];

  for (let i = 0; i < count; i++) {
    const config: AIConfig = {
      difficulty,
      personality,
      seed: baseSeed,
      seedOffset: i + 1, // Each AI gets unique offset
    };
    runners.push(new AIRunner(`ai-${i}`, aiNames[i], config));
  }

  return runners;
}

