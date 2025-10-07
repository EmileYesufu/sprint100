/**
 * Utility functions for formatting and calculations
 */

/**
 * Converts meters (0-100) to percentage (0-100)
 * @param meters - The distance in meters
 * @returns Clamped percentage value
 */
export function metersToPct(meters: number): number {
  return Math.max(0, Math.min(100, meters));
}

/**
 * Format Elo rating for display
 */
export function formatElo(elo: number): string {
  return Math.round(elo).toString();
}

/**
 * Format date string to readable format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
}

