/**
 * UI Helper Utilities
 * Common utilities for formatting and displaying UI elements
 */

/**
 * Get position suffix (1st, 2nd, 3rd, 4th, etc.)
 */
export function getPositionSuffix(position: number): string {
  if (position % 100 >= 11 && position % 100 <= 13) {
    return "th";
  }
  switch (position % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

/**
 * Get medal emoji for finish position (top 3 only)
 */
export function getMedalForPosition(position: number | undefined | null): string | null {
  if (position === undefined || position === null) return null;
  if (position === 1) return "🥇";
  if (position === 2) return "🥈";
  if (position === 3) return "🥉";
  return null;
}

/**
 * Get position text with suffix (e.g., "1st Place", "2nd Place")
 */
export function getPositionText(position: number | undefined | null): string {
  if (position === undefined || position === null) return "N/A";
  return `${position}${getPositionSuffix(position)} Place`;
}

/**
 * Generate avatar initials from username or email
 */
export function getAvatarInitials(name: string): string {
  if (!name) return "U";
  const parts = name.trim().split(/[\s._-]/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

/**
 * Generate a simple color hash from a string (for consistent avatar colors)
 */
export function getColorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate a color in the blue-green range (for dark theme)
  const hue = (hash % 60) + 180; // 180-240 range (blue-green)
  const saturation = 70 + (hash % 20); // 70-90%
  const lightness = 50 + (hash % 10); // 50-60%
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
