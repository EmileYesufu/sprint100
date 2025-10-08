/**
 * App configuration constants
 * 
 * IMPORTANT: For device testing (not simulator), replace "localhost" with your machine's local IP address.
 * Example: "http://192.168.1.100:4000" (find your IP with `ipconfig getifaddr en0` on macOS)
 * 
 * For external testers: Set APP_ENV=test or use .env.test file to use TEST_SERVER_URL
 */

export const DEFAULT_SERVER_URL = "http://localhost:4000";

/**
 * Get server URL based on environment configuration
 * - If APP_ENV=test, use TEST_SERVER_URL or fallback to SERVER_URL
 * - Otherwise use SERVER_URL or fallback to DEFAULT_SERVER_URL
 * 
 * Testers should set APP_ENV=test or use the .env.test file
 */
export function getServerUrl(): string {
  // Check if we're in test mode
  if (process.env.APP_ENV === "test") {
    return process.env.TEST_SERVER_URL || process.env.SERVER_URL || DEFAULT_SERVER_URL;
  }
  
  // Default development mode
  return process.env.SERVER_URL || DEFAULT_SERVER_URL;
}

// Export the resolved server URL for backward compatibility
export const SERVER_URL = getServerUrl();

