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

// Get the machine's IP address for development
function getMachineIP(): string {
  // This will be replaced with actual IP detection in production
  // For now, use a placeholder that developers should replace
  return "http://192.168.1.218:4000"; // ← REPLACE WITH YOUR MACHINE'S IP (run: ipconfig getifaddr en0)
}

export const DEFAULT_SERVER_URL = getMachineIP();

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
  // 1. Check expo config extra (app.json)
  const expoApiUrl = Constants.expoConfig?.extra?.API_URL;
  if (expoApiUrl) {
    console.log(`📡 Using API URL from app.json: ${expoApiUrl}`);
    return expoApiUrl;
  }

  // 2. Check EXPO_PUBLIC_API_URL environment variable
  if (process.env.EXPO_PUBLIC_API_URL) {
    console.log(`📡 Using API URL from .env: ${process.env.EXPO_PUBLIC_API_URL}`);
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 3. Check if we're in test mode
  if (process.env.APP_ENV === 'test') {
    const testUrl =
      process.env.TEST_SERVER_URL || process.env.SERVER_URL || DEFAULT_SERVER_URL;
    console.log(`📡 Using test API URL: ${testUrl}`);
    return testUrl;
  }

  // 4. Try SERVER_URL from .env
  if (process.env.SERVER_URL) {
    console.log(`📡 Using API URL from SERVER_URL: ${process.env.SERVER_URL}`);
    return process.env.SERVER_URL;
  }

  // 5. Fallback to default
  console.log(`📡 Using default API URL: ${DEFAULT_SERVER_URL}`);
  console.warn(
    '⚠️  WARNING: Using default IP. For remote testing, set EXPO_PUBLIC_API_URL in .env'
  );

  return DEFAULT_SERVER_URL;
}

// Export the resolved server URL for backward compatibility
export const SERVER_URL = getServerUrl();

// Log the final URL on startup
console.log(`\n🔗 Sprint100 will connect to: ${SERVER_URL}\n`);

