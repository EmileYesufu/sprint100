/**
 * Training Mode Hook
 * Manages local training race lifecycle without server interaction
 * 
 * TEST: Start a training race, ensure a racer that crosses first keeps first position
 * in leaderboard and final results even after others finish. Repeat with player finishing
 * first and finishing last to verify immutable position assignment.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AIRunner, createAIRunners } from "@/ai/aiRunner";
import { computeFinishThreshold, hasReachedThreshold } from "@/utils/finishThreshold";
import { computeFinalPlacings, assignPositions, type RacerProgress } from "@/utils/computeFinalPlacings";
import type {
  TrainingConfig,
  TrainingRaceState,
  TrainingResult,
  RunnerState,
  RunnerStep,
  TrainingRecord,
  LocalEndResult,
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
  reset: () => void;
  rerace: () => void;
  replay: () => void;
  result: TrainingResult | null;
  isReplayMode: boolean;
  isRunning: boolean;
  // Local early finish threshold state
  isLocallyEnded: boolean;
  localEndResult: LocalEndResult | null;
  // Final placings (immutable ranking once race ends)
  finalPlacings: string[];
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
  // Client-local early end threshold logic — race ends when top N finish
  const [isLocallyEnded, setIsLocallyEnded] = useState(false);
  const [localEndResult, setLocalEndResult] = useState<LocalEndResult | null>(null);
  // Final placings: immutable ranking once race ends (finished + unfinished racers)
  const [finalPlacings, setFinalPlacings] = useState<string[]>([]);

  const aiRunners = useRef<AIRunner[]>([]);
  const config = useRef<TrainingConfig | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  const pausedDuration = useRef<number>(0);
  const playerState = useRef({ steps: 0, meters: 0, lastSide: null as "left" | "right" | null, finished: false });
  const replayIndex = useRef<number>(0);
  
  // Immutable finish order tracking - positions are assigned at moment of crossing
  const finishOrder = useRef<string[]>([]);
  const finishPositions = useRef<Map<string, { position: number; time: number }>>(new Map());

  /**
   * Mark a racer as finished and assign immutable position
   * Position is assigned at moment of crossing and never changes
   */
  const markRacerFinished = useCallback((runnerId: string, currentTime: number) => {
    // Check if already finished (prevent duplicate assignment)
    if (finishPositions.current.has(runnerId)) {
      return;
    }
    
    // Add to finish order and assign position
    finishOrder.current.push(runnerId);
    const position = finishOrder.current.length;
    
    finishPositions.current.set(runnerId, {
      position,
      time: currentTime,
    });
  }, []);

  /**
   * Mark race as locally ended when threshold is met
   * Client-local early end threshold logic — for training this is final
   * Disables input, preserves finish positions, records partial results
   * Computes final placings for ALL racers (finished + unfinished by progress)
   */
  const markLocalRaceEnded = useCallback((runners: RunnerState[], endTime: number, totalRacers: number, threshold: number) => {
    // Convert runners to RacerProgress format
    const racerProgress: RacerProgress[] = runners.map(r => ({
      id: r.id,
      distance: r.meters,
      hasFinished: r.finished,
      finishTime: r.finishTime,
    }));

    // Compute final placings: finished racers by time, unfinished by distance
    const placings = computeFinalPlacings(racerProgress, totalRacers, threshold);
    const positionMap = assignPositions(placings);

    // Store final placings (immutable from this point)
    setFinalPlacings(placings);

    // Update runners with final positions
    const runnersWithFinalPositions = runners.map(r => ({
      ...r,
      finishPosition: positionMap.get(r.id) || 999,
    }));

    setIsLocallyEnded(true);
    setLocalEndResult({
      endedAt: endTime,
      finishOrder: placings, // Use computed final order instead of just finished racers
      threshold,
      totalRacers,
      runners: runnersWithFinalPositions,
    });

    if (__DEV__) {
      console.log('[markLocalRaceEnded] Final placings computed:', placings);
      console.log('[markLocalRaceEnded] Position map:', Array.from(positionMap.entries()));
    }
  }, []);

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
    let allAIFinished = true;

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

      const aiState = ai.getState();
      
      // Mark AI as finished when they cross finish line (immutable position assignment)
      if (aiState.meters >= FINISH_LINE_METERS && !finishPositions.current.has(aiState.id)) {
        markRacerFinished(aiState.id, elapsed);
      }

      if (!aiState.finished) {
        allAIFinished = false;
      }
    });

    // Mark player as finished when they cross finish line (immutable position assignment)
    if (playerState.current.meters >= FINISH_LINE_METERS && !finishPositions.current.has("player")) {
      markRacerFinished("player", elapsed);
      playerState.current.finished = true;
    }

    // Update runner states with immutable finish positions
    const updatedRunners: RunnerState[] = [
      {
        id: "player",
        name: "You",
        isPlayer: true,
        steps: playerState.current.steps,
        meters: playerState.current.meters,
        finished: finishPositions.current.has("player"),
        finishTime: finishPositions.current.get("player")?.time,
        finishPosition: finishPositions.current.get("player")?.position,
        color: "#34C759",
      },
      ...aiRunners.current.map((ai) => {
        const state = ai.getState();
        const finishData = finishPositions.current.get(state.id);
        return {
          id: state.id,
          name: state.name,
          isPlayer: false,
          steps: state.steps,
          meters: state.meters,
          finished: finishPositions.current.has(state.id),
          finishTime: finishData?.time,
          finishPosition: finishData?.position,
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

    // Check if race threshold is reached (early finish logic)
    const totalRacers = 1 + aiRunners.current.length; // player + AIs
    const finishedCount = finishOrder.current.length;
    const threshold = computeFinishThreshold(totalRacers);
    
    // For training mode: local end is final — finish race when threshold is met
    if (hasReachedThreshold(finishedCount, totalRacers) && !isLocallyEnded) {
      markLocalRaceEnded(updatedRunners, elapsed, totalRacers, threshold);
      finishRace(updatedRunners, elapsed);
      return;
    }

    animationFrameId.current = requestAnimationFrame(updateLoop);
  }, [raceState.status, isReplayMode, markRacerFinished, isLocallyEnded]);

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
   * Disabled when race is locally ended (threshold reached)
   */
  const tap = useCallback((side: "left" | "right") => {
    if (raceState.status !== "racing" || playerState.current.finished || isReplayMode || isLocallyEnded) {
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

    // Check if player finished (mark with immutable position at moment of crossing)
    if (playerState.current.meters >= FINISH_LINE_METERS && !finishPositions.current.has("player")) {
      markRacerFinished("player", elapsed);
      playerState.current.finished = true;
    }
  }, [raceState.status, isReplayMode, isLocallyEnded, markRacerFinished]);

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
   * Reset race state but keep config for rerace
   */
  const reset = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    setRaceState({ status: "setup", elapsedMs: 0, runners: [], stepHistory: [] });
    setResult(null);
    setIsReplayMode(false);
    // Clear local end state
    setIsLocallyEnded(false);
    setLocalEndResult(null);
    setFinalPlacings([]); // Clear final placings
    aiRunners.current = [];
    playerState.current = { steps: 0, meters: 0, lastSide: null, finished: false };
    startTimeRef.current = 0;
    pauseTimeRef.current = 0;
    pausedDuration.current = 0;
    // Clear finish tracking for fresh race
    finishOrder.current = [];
    finishPositions.current.clear();
    // Keep config.current for rerace
  }, []);

  /**
   * Abort race and clear config
   */
  const abort = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    setRaceState({ status: "setup", elapsedMs: 0, runners: [], stepHistory: [] });
    setResult(null);
    setIsReplayMode(false);
    // Clear local end state
    setIsLocallyEnded(false);
    setLocalEndResult(null);
    setFinalPlacings([]); // Clear final placings
    aiRunners.current = [];
    config.current = null;
    playerState.current = { steps: 0, meters: 0, lastSide: null, finished: false };
    startTimeRef.current = 0;
    pauseTimeRef.current = 0;
    pausedDuration.current = 0;
    // Clear finish tracking
    finishOrder.current = [];
    finishPositions.current.clear();
  }, []);

  /**
   * Rerace with same config (preserves seed for deterministic behavior)
   * IMPORTANT: Uses exact same seed to produce identical AI behavior
   */
  const rerace = useCallback(() => {
    if (!config.current) {
      console.warn("No config available for rerace");
      return;
    }
    
    const savedConfig = { ...config.current }; // Preserve config including seed
    reset();
    
    // Small delay to ensure state is cleared
    setTimeout(() => {
      start(savedConfig);
    }, 100);
  }, [reset, start]);

  /**
   * Finish race and compute results
   * Uses finalPlacings (if set) or computes them to ensure all racers get correct positions
   */
  const finishRace = useCallback(async (runners: RunnerState[], finalTime: number) => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }

    // Use final placings if already computed (early end), otherwise compute now
    let placings = finalPlacings;
    let positionMap: Map<string, number>;

    if (placings.length === 0) {
      // Race ended normally (all finished) - compute final placings
      const totalRacers = runners.length;
      const threshold = totalRacers; // All finished
      
      const racerProgress: RacerProgress[] = runners.map(r => ({
        id: r.id,
        distance: r.meters,
        hasFinished: r.finished,
        finishTime: r.finishTime,
      }));

      placings = computeFinalPlacings(racerProgress, totalRacers, threshold);
      positionMap = assignPositions(placings);
      setFinalPlacings(placings);

      if (__DEV__) {
        console.log('[finishRace] Final placings computed (full finish):', placings);
      }
    } else {
      // Use pre-computed placings from early end
      positionMap = assignPositions(placings);
      
      if (__DEV__) {
        console.log('[finishRace] Using pre-computed placings (early end):', placings);
      }
    }

    // Update runners with correct final positions
    const runnersWithPositions = runners.map(r => ({
      ...r,
      finishPosition: positionMap.get(r.id) || 999,
    }));

    // Sort by final position for display
    const sorted = [...runnersWithPositions].sort((a, b) => {
      const posA = a.finishPosition || 999;
      const posB = b.finishPosition || 999;
      return posA - posB;
    });

    const resultData: TrainingResult = {
      config: config.current!,
      runners: sorted.map((r) => ({
        id: r.id,
        name: r.name,
        isPlayer: r.isPlayer,
        position: r.finishPosition || 999, // Use immutable finish position
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
  }, [finalPlacings]);

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

  const isRunning = raceState.status === "racing" || raceState.status === "countdown";

  return {
    raceState,
    start,
    tap,
    pause,
    resume,
    abort,
    reset,
    rerace,
    replay,
    result,
    isReplayMode,
    isRunning,
    // Local early finish threshold state
    isLocallyEnded,
    localEndResult,
    // Final placings (immutable ranking once race ends)
    finalPlacings,
  };
}

