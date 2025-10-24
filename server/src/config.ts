// server/src/config.ts
import dotenv from "dotenv";
import path from "path";

const envFile = (process.env.NODE_ENV === "test" || process.env.NODE_ENV === "testing") ? ".env.test" : ".env";
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

function parseList(raw?: string): string[] {
  if (!raw) return [];
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

export const HOST = process.env.HOST || "0.0.0.0";
export const PORT = Number(process.env.PORT || 4000);
export const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
export const ALLOWED_ORIGINS = parseList(process.env.ALLOWED_ORIGINS).length > 0 
  ? parseList(process.env.ALLOWED_ORIGINS) 
  : ["*"];
export const DATABASE_URL = process.env.DATABASE_URL || "file:./prisma/dev.db";
export const NODE_ENV = process.env.NODE_ENV || "development";
export const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
// Environment-based rate limiting
// Testing environment gets much higher limits to avoid blocking automated tests
const maxRequests = process.env.NODE_ENV === 'testing' ? 5000 : 100;
export const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX || maxRequests);
export const ENABLE_REQUEST_LOGGING = process.env.ENABLE_REQUEST_LOGGING === "true" || NODE_ENV !== "production";

// Validate critical config
const requiredEnvVars = {
  JWT_SECRET: JWT_SECRET,
  DATABASE_URL: DATABASE_URL,
  HOST: HOST,
  PORT: PORT
};

const missingVars: string[] = [];
const invalidVars: string[] = [];

// Check for missing required variables
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value || value === "") {
    missingVars.push(key);
  }
});

// Check for invalid values
if (!JWT_SECRET || JWT_SECRET === "dev_secret_change_me" || JWT_SECRET === "your_jwt_secret_change_this_in_production") {
  invalidVars.push("JWT_SECRET (using default/placeholder value)");
}

if (NODE_ENV === "production" && ALLOWED_ORIGINS.includes("*")) {
  invalidVars.push("ALLOWED_ORIGINS (allows all origins in production)");
}

if (NODE_ENV === "production" && DATABASE_URL.includes("file:")) {
  invalidVars.push("DATABASE_URL (using SQLite file in production)");
}

// Log warnings and errors
if (missingVars.length > 0) {
  console.error("❌ Missing required environment variables:");
  missingVars.forEach(varName => console.error(`   - ${varName}`));
}

if (invalidVars.length > 0) {
  console.error("❌ Invalid environment variable values:");
  invalidVars.forEach(varName => console.error(`   - ${varName}`));
}

// Exit with error code in production if critical issues
if (NODE_ENV === "production" && (missingVars.length > 0 || invalidVars.length > 0)) {
  console.error("🚨 Production environment validation failed. Exiting...");
  process.exit(1);
}

// Log warnings for development
if (NODE_ENV !== "production") {
  if (!JWT_SECRET || JWT_SECRET === "dev_secret_change_me") {
    console.warn("⚠️  WARNING: Using default JWT_SECRET. Set JWT_SECRET env var for production!");
  }
  
  if (ALLOWED_ORIGINS.includes("*")) {
    console.warn("⚠️  WARNING: CORS allows all origins (*). Set ALLOWED_ORIGINS for production!");
  }
}

console.log("📋 Server Configuration:");
console.log(`   NODE_ENV: ${NODE_ENV}`);
console.log(`   HOST: ${HOST}`);
console.log(`   PORT: ${PORT}`);
console.log(`   ALLOWED_ORIGINS: ${ALLOWED_ORIGINS.join(", ")}`);
console.log(`   DATABASE_URL: ${DATABASE_URL.includes("file:") ? "SQLite (dev)" : "External DB"}`);
console.log(`   RATE_LIMIT: ${RATE_LIMIT_MAX} requests per ${RATE_LIMIT_WINDOW_MS / 60000} minutes`);
console.log(`   REQUEST_LOGGING: ${ENABLE_REQUEST_LOGGING ? "enabled" : "disabled"}`);

