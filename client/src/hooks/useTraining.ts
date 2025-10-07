/**
 * Training Mode Hook
 * Manages local training race lifecycle without server interaction
 */

import { useState, useEffect, useRef, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AIRunner, createAIRunners } from "@/ai/aiRunner";
import type {
  TrainingConfig,
  TrainingRaceState,
  TrainingResult,
  RunnerState,
  RunnerStep,
  TrainingRecord,
} from "@/types";

// Same mapping as online mode
const METERS_PER_STEP = 0.6;
const FINISH_LINE_METERS = 100;

const STORAGE_KEY_RECORDS = "@sprint100_training_records";
const STORAGE_KEY_REPLAY = "@sprint100_training_replay";

interface UseTrainingReturn {
  raceState: TrainingRaceState;
  start: (config: TrainingConfig) => void;
  tap: (side: "left" | "right") => void;
  pause: () => void;
  resume: () => void;
  abort: () => void;
  replay: () => void;
  result: TrainingResult | null;
  isReplayMode: boolean;
}

export function useTraining(): UseTrainingReturn {
  const [raceState, setRaceState] = useState<TrainingRaceState>({
    status: "setup",
    elapsedMs: 0,
    runners: [],
    stepHistory: [],
  });
  const [result, setResult] = useState<TrainingResult | null>(null);
  const [isReplayMode, setIsReplayMode] = useState(false);

  const aiRunners = useRef<AIRunner[]>([]);
  const config = useRef<TrainingConfig | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  const pausedDuration = useRef<number>(0);
  const playerState = useRef({ steps: 0, meters: 0, lastSide: null as "left" | "right" | null, finished: false });
  const replayIndex = useRef<number>(0);

  /**
   * Animation loop for AI updates
   */
  const updateLoop = useCallback(() => {
    if (raceState.status !== "racing" || isReplayMode) {
      return;
    }

    const now = Date.now();
    const elapsed = now - startTimeRef.current - pausedDuration.current;

    // Update all AI runners
    const newSteps: RunnerStep[] = [];
    let anyFinished = false;

    aiRunners.current.forEach((ai) => {
      const aiSteps = ai.update(elapsed);
      aiSteps.forEach((step) => {
        const aiState = ai.getState();
        newSteps.push({
          runnerId: aiState.id,
          timestamp: elapsed,
          side: step.side,
          totalSteps: aiState.steps,
          meters: aiState.meters,
        });
      });

      if (ai.getState().finished) {
        anyFinished = true;
      }
    });

    // Update runner states
    const updatedRunners: RunnerState[] = [
      {
        id: "player",
        name: "You",
        isPlayer: true,
        steps: playerState.current.steps,
        meters: playerState.current.meters,
        finished: playerState.current.finished,
        finishTime: playerState.current.finished ? elapsed : undefined,
        color: "#34C759",
      },
      ...aiRunners.current.map((ai) => {
        const state = ai.getState();
        return {
          id: state.id,
          name: state.name,
          isPlayer: false,
          steps: state.steps,
          meters: state.meters,
          finished: state.finished,
          finishTime: ai.getFinishTime(),
          color: "#FF3B30",
        };
      }),
    ];

    setRaceState((prev) => ({
      ...prev,
      elapsedMs: elapsed,
      runners: updatedRunners,
      stepHistory: [...prev.stepHistory, ...newSteps],
    }));

    // Check if race is finished (any runner crossed finish line)
    if (anyFinished || playerState.current.finished) {
      finishRace(updatedRunners, elapsed);
      return;
    }

    animationFrameId.current = requestAnimationFrame(updateLoop);
  }, [raceState.status, isReplayMode]);

  /**
   * Start training race
   */
  const start = useCallback((trainingConfig: TrainingConfig) => {
    config.current = trainingConfig;
    setIsReplayMode(false);
    setResult(null);

    // Create AI runners
    aiRunners.current = createAIRunners(
      trainingConfig.aiCount,
      trainingConfig.difficulty,
      trainingConfig.personality,
      trainingConfig.seed
    );

    // Reset player state
    playerState.current = { steps: 0, meters: 0, lastSide: null, finished: false };

    // Initialize runners
    const initialRunners: RunnerState[] = [
      {
        id: "player",
        name: "You",
        isPlayer: true,
        steps: 0,
        meters: 0,
        finished: false,
        color: "#34C759",
      },
      ...aiRunners.current.map((ai) => ({
        id: ai.getState().id,
        name: ai.getState().name,
        isPlayer: false,
        steps: 0,
        meters: 0,
        finished: false,
        color: "#FF3B30",
      })),
    ];

    setRaceState({
      status: "countdown",
      elapsedMs: 0,
      runners: initialRunners,
      stepHistory: [],
    });

    // Countdown then start
    setTimeout(() => {
      startTimeRef.current = Date.now();
      pausedDuration.current = 0;
      setRaceState((prev) => ({ ...prev, status: "racing", startTime: Date.now() }));
    }, 3000); // 3 second countdown
  }, []);

  /**
   * Handle player tap
   */
  const tap = useCallback((side: "left" | "right") => {
    if (raceState.status !== "racing" || playerState.current.finished || isReplayMode) {
      return;
    }

    // Enforce alternating sides (optional - can be removed for any-tap mode)
    if (playerState.current.lastSide === side) {
      return; // Must alternate
    }

    playerState.current.lastSide = side;
    playerState.current.steps += 1;
    playerState.current.meters = playerState.current.steps * METERS_PER_STEP;

    const now = Date.now();
    const elapsed = now - startTimeRef.current - pausedDuration.current;

    // Add to step history
    const step: RunnerStep = {
      runnerId: "player",
      timestamp: elapsed,
      side,
      totalSteps: playerState.current.steps,
      meters: playerState.current.meters,
    };

    setRaceState((prev) => ({
      ...prev,
      stepHistory: [...prev.stepHistory, step],
    }));

    // Check if player finished
    if (playerState.current.meters >= FINISH_LINE_METERS) {
      playerState.current.finished = true;
    }
  }, [raceState.status, isReplayMode]);

  /**
   * Pause race
   */
  const pause = useCallback(() => {
    if (raceState.status === "racing" && !isReplayMode) {
      pauseTimeRef.current = Date.now();
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    }
  }, [raceState.status, isReplayMode]);

  /**
   * Resume race
   */
  const resume = useCallback(() => {
    if (pauseTimeRef.current > 0 && !isReplayMode) {
      pausedDuration.current += Date.now() - pauseTimeRef.current;
      pauseTimeRef.current = 0;
      animationFrameId.current = requestAnimationFrame(updateLoop);
    }
  }, [updateLoop, isReplayMode]);

  /**
   * Abort race
   */
  const abort = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    setRaceState({ status: "setup", elapsedMs: 0, runners: [], stepHistory: [] });
    setResult(null);
    setIsReplayMode(false);
    aiRunners.current = [];
    config.current = null;
  }, []);

  /**
   * Finish race and compute results
   */
  const finishRace = useCallback(async (runners: RunnerState[], finalTime: number) => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }

    // Sort by finish time (or meters if not finished)
    const sorted = [...runners].sort((a, b) => {
      if (a.finished && b.finished) {
        return (a.finishTime || 0) - (b.finishTime || 0);
      }
      if (a.finished) return -1;
      if (b.finished) return 1;
      return b.meters - a.meters;
    });

    const resultData: TrainingResult = {
      config: config.current!,
      runners: sorted.map((r, idx) => ({
        id: r.id,
        name: r.name,
        isPlayer: r.isPlayer,
        position: idx + 1,
        finalMeters: r.meters,
        finishTime: r.finishTime || finalTime,
        steps: r.steps,
      })),
      seed: config.current!.seed,
      completedAt: new Date().toISOString(),
    };

    setResult(resultData);
    setRaceState((prev) => ({ ...prev, status: "finished", runners: sorted }));

    // Save replay data
    await AsyncStorage.setItem(STORAGE_KEY_REPLAY, JSON.stringify(raceState.stepHistory));

    // Update records if player finished and this is their best
    const playerResult = resultData.runners.find((r) => r.isPlayer);
    if (playerResult && playerResult.finishTime) {
      await updateRecords(config.current!, playerResult.position, playerResult.finishTime);
    }
  }, [raceState.stepHistory]);

  /**
   * Update local records
   */
  const updateRecords = async (cfg: TrainingConfig, position: number, time: number) => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY_RECORDS);
      const records: TrainingRecord[] = stored ? JSON.parse(stored) : [];

      const key = `${cfg.difficulty}-${cfg.aiCount}`;
      const existing = records.find((r) => `${r.difficulty}-${r.aiCount}` === key);

      if (!existing || position < existing.bestPosition || 
          (position === existing.bestPosition && time < existing.bestTime)) {
        const newRecord: TrainingRecord = {
          difficulty: cfg.difficulty,
          aiCount: cfg.aiCount,
          bestPosition: position,
          bestTime: time,
          date: new Date().toISOString(),
        };

        const updated = records.filter((r) => `${r.difficulty}-${r.aiCount}` !== key);
        updated.push(newRecord);
        await AsyncStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(updated));
      }
    } catch (error) {
      console.error("Error saving training records:", error);
    }
  };

  /**
   * Replay race from stored step history
   */
  const replay = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY_REPLAY);
      if (!stored) return;

      const steps: RunnerStep[] = JSON.parse(stored);
      if (steps.length === 0) return;

      setIsReplayMode(true);
      replayIndex.current = 0;

      // Reset state
      const initialRunners: RunnerState[] = raceState.runners.map((r) => ({
        ...r,
        steps: 0,
        meters: 0,
        finished: false,
        finishTime: undefined,
      }));

      setRaceState({
        status: "racing",
        elapsedMs: 0,
        runners: initialRunners,
        stepHistory: steps,
      });

      // Replay animation
      const replayStart = Date.now();
      const replayLoop = () => {
        const elapsed = Date.now() - replayStart;
        const currentSteps = steps.filter((s) => s.timestamp <= elapsed);

        // Update runner states from steps
        const runnerMap = new Map<string, { steps: number; meters: number }>();
        currentSteps.forEach((s) => {
          runnerMap.set(s.runnerId, { steps: s.totalSteps, meters: s.meters });
        });

        const updatedRunners = initialRunners.map((r) => {
          const stepData = runnerMap.get(r.id) || { steps: 0, meters: 0 };
          return {
            ...r,
            steps: stepData.steps,
            meters: stepData.meters,
            finished: stepData.meters >= FINISH_LINE_METERS,
          };
        });

        setRaceState((prev) => ({
          ...prev,
          elapsedMs: elapsed,
          runners: updatedRunners,
        }));

        if (elapsed < steps[steps.length - 1].timestamp + 1000) {
          requestAnimationFrame(replayLoop);
        } else {
          setRaceState((prev) => ({ ...prev, status: "finished" }));
        }
      };

      replayLoop();
    } catch (error) {
      console.error("Error replaying race:", error);
    }
  }, [raceState.runners]);

  // Start animation loop when racing
  useEffect(() => {
    if (raceState.status === "racing" && !isReplayMode) {
      animationFrameId.current = requestAnimationFrame(updateLoop);
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [raceState.status, updateLoop, isReplayMode]);

  return {
    raceState,
    start,
    tap,
    pause,
    resume,
    abort,
    replay,
    result,
    isReplayMode,
  };
}

