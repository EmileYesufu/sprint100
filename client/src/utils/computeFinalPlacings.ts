/**
 * Compute Final Race Placings
 * 
 * When a race ends (early or full), this determines the final ranking for ALL racers:
 * - Finished racers: ranked by finish time (1st, 2nd, 3rd, etc.)
 * - Unfinished racers: ranked by current progress/distance (furthest ahead gets next rank)
 * 
 * Used for both training mode and client-side online race visualization.
 * Server remains authoritative for online matches (this is client display only).
 */

export type RacerProgress = {
  id: string;
  distance: number;      // Current meters along 100m track
  hasFinished: boolean;  // True if crossed finish line
  finishTime?: number;   // Time in ms when finished (if hasFinished)
};

/**
 * Compute final placings for all racers when race ends
 * 
 * @param racers - Array of all racers with current progress
 * @param totalRacers - Total number of racers (for validation)
 * @param threshold - Finish threshold (e.g., 3 for 4-racer, 4 for 8-racer)
 * @returns Array of racer IDs in final placement order (1st, 2nd, 3rd, ...)
 */
export function computeFinalPlacings(
  racers: RacerProgress[],
  totalRacers: number,
  threshold: number
): string[] {
  // 1. Get all finished racers ordered by finish time (ascending = earliest first)
  const finished = racers
    .filter(r => r.hasFinished)
    .sort((a, b) => {
      const timeA = a.finishTime ?? Infinity;
      const timeB = b.finishTime ?? Infinity;
      return timeA - timeB;
    });

  // 2. Get all unfinished racers ordered by distance (descending = furthest first)
  const unfinished = racers
    .filter(r => !r.hasFinished)
    .sort((a, b) => b.distance - a.distance);

  // 3. Combine: finished racers first (in finish order), then unfinished (by progress)
  const finalOrder = [
    ...finished.map(r => r.id),
    ...unfinished.map(r => r.id)
  ];

  // 4. Safety check: deduplicate (prefer finished state if racer appears twice)
  const seen = new Set<string>();
  const deduplicated = finalOrder.filter(id => {
    if (seen.has(id)) {
      if (__DEV__) {
        console.warn(`[computeFinalPlacings] Duplicate racer ID found: ${id} - keeping first occurrence`);
      }
      return false;
    }
    seen.add(id);
    return true;
  });

  // 5. Trim to totalRacers length for safety
  const result = deduplicated.slice(0, totalRacers);

  // Debug logging in dev mode
  if (__DEV__) {
    console.log('[computeFinalPlacings] Race ended:');
    console.log(`  - Total racers: ${totalRacers}`);
    console.log(`  - Threshold: ${threshold}`);
    console.log(`  - Finished: ${finished.length}`);
    console.log(`  - Unfinished: ${unfinished.length}`);
    console.log(`  - Final order:`, result);
  }

  return result;
}

/**
 * Assign position numbers to racers based on final placement order
 * 
 * @param placementOrder - Array of racer IDs in final order
 * @returns Map of racer ID -> position number (1-based)
 */
export function assignPositions(placementOrder: string[]): Map<string, number> {
  const positions = new Map<string, number>();
  placementOrder.forEach((id, index) => {
    positions.set(id, index + 1); // 1-based positions
  });
  return positions;
}

