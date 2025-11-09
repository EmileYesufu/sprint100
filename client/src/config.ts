/**
 * App configuration constants
 * 
 * IMPORTANT: For device testing (not simulator), replace "localhost" with your machine's local IP address.
 * Example: "http://192.168.1.100:4000" (find your IP with `ipconfig getifaddr en0` on macOS)
 * 
 * For external testers: Set EXPO_PUBLIC_API_URL in .env or expo.extra.API_URL in app.json
 * 
 * ⚠️ WARNING: "localhost" will NOT work on real devices - use your machine's IP or ngrok URL
 */

import Constants from "expo-constants";

let runtimeOverride: string | null = null;
let hasWarned = false;

export function setRuntimeServerUrl(url: string | null) {
  runtimeOverride = url;
}

/**
 * Get server URL based on environment configuration
 * Priority order:
 * 1. Constants.expoConfig?.extra?.API_URL (from app.json for easy sharing)
 * 2. EXPO_PUBLIC_API_URL (from .env file)
 * 3. TEST_SERVER_URL (if APP_ENV=test)
 * 4. SERVER_URL (from .env)
 * 5. DEFAULT_SERVER_URL (your local IP fallback)
 * 
 * For remote testers: Set EXPO_PUBLIC_API_URL=https://your-ngrok-url.ngrok.io in .env
 */
export function getServerUrl(): string {
  if (runtimeOverride) {
    return runtimeOverride;
  }

  const expoApiUrl = Constants.expoConfig?.extra?.API_URL;
  if (expoApiUrl) {
    return expoApiUrl;
  }

  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (process.env.APP_ENV === "test" && process.env.TEST_SERVER_URL) {
    return process.env.TEST_SERVER_URL;
  }

  if (process.env.SERVER_URL) {
    return process.env.SERVER_URL;
  }

  if (!hasWarned) {
    console.warn("⚠️  WARNING: No API URL configured. Set EXPO_PUBLIC_API_URL for production builds.");
    hasWarned = true;
  }

  return "http://localhost:4000";
}

// Export the resolved server URL for backward compatibility
export const SERVER_URL = getServerUrl();

// Log the final URL on startup
console.log(`\n🔗 Sprint100 will connect to: ${SERVER_URL}\n`);

