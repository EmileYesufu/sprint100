/**
 * App configuration constants
 * 
 * IMPORTANT: For device testing (not simulator), replace "localhost" with your machine's local IP address.
 * Example: "http://192.168.1.100:4000" (find your IP with `ipconfig getifaddr en0` on macOS)
 * 
 * For external testers: Set APP_ENV=test or use .env.test file to use TEST_SERVER_URL
 * For Expo Go testing: Use EXPO_PUBLIC_API_URL environment variable
 */

export const DEFAULT_SERVER_URL = "http://localhost:4000";

/**
 * Get server URL based on environment configuration
 * Priority order:
 * 1. EXPO_PUBLIC_API_URL (for Expo Go testing with local IP)
 * 2. If APP_ENV=test, use TEST_SERVER_URL
 * 3. SERVER_URL from .env
 * 4. DEFAULT_SERVER_URL (localhost fallback)
 * 
 * Testers should set APP_ENV=test or use the .env.test file
 */
export function getServerUrl(): string {
  // First check for Expo public API URL (for Expo Go testing)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // Check if we're in test mode
  if (process.env.APP_ENV === "test") {
    return process.env.TEST_SERVER_URL || process.env.SERVER_URL || DEFAULT_SERVER_URL;
  }
  
  // Default development mode
  return process.env.SERVER_URL || DEFAULT_SERVER_URL;
}

// Export the resolved server URL for backward compatibility
export const SERVER_URL = getServerUrl();

