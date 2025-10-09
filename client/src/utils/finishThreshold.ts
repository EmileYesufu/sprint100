/**
 * Race Finish Threshold Configuration
 * 
 * Determines when a race should be considered locally ended based on total racer count.
 * This implements an "early finish" behavior where races end when the top N finishers cross.
 * 
 * Client-local early end threshold logic — does not replace server authoritative end.
 * For online matches we show a local early finish overlay but wait for server.match_end to reconcile.
 * 
 * THRESHOLD MAPPING:
 * - 4 total racers → race ends when top 3 finish
 * - 8 total racers → race ends when top 4 finish
 * - All other counts → race ends when ALL finish (default behavior)
 * 
 * To adjust thresholds in the future, modify the mapping below.
 */

export function computeFinishThreshold(totalRacers: number): number {
  // Threshold mapping: totalRacers → finishersNeeded
  const thresholdMap: Record<number, number> = {
    4: 3,  // 4-racer races end when 3 finish
    8: 4,  // 8-racer races end when 4 finish
  };

  // Return mapped threshold or default to all racers
  return thresholdMap[totalRacers] ?? totalRacers;
}

/**
 * Check if race has reached local end threshold
 */
export function hasReachedThreshold(finishedCount: number, totalRacers: number): boolean {
  const threshold = computeFinishThreshold(totalRacers);
  return finishedCount >= threshold;
}

