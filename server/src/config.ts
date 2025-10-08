// server/src/config.ts
import dotenv from "dotenv";
import path from "path";

const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";
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
export const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX || 200);
export const ENABLE_REQUEST_LOGGING = process.env.ENABLE_REQUEST_LOGGING === "true" || NODE_ENV !== "production";

// Validate critical config
if (!JWT_SECRET || JWT_SECRET === "dev_secret_change_me") {
  console.warn("⚠️  WARNING: Using default JWT_SECRET. Set JWT_SECRET env var for production!");
}

if (NODE_ENV === "production" && ALLOWED_ORIGINS.includes("*")) {
  console.warn("⚠️  WARNING: CORS allows all origins (*). Set ALLOWED_ORIGINS for production!");
}

console.log("📋 Server Configuration:");
console.log(`   NODE_ENV: ${NODE_ENV}`);
console.log(`   HOST: ${HOST}`);
console.log(`   PORT: ${PORT}`);
console.log(`   ALLOWED_ORIGINS: ${ALLOWED_ORIGINS.join(", ")}`);
console.log(`   DATABASE_URL: ${DATABASE_URL.includes("file:") ? "SQLite (dev)" : "External DB"}`);
console.log(`   RATE_LIMIT: ${RATE_LIMIT_MAX} requests per ${RATE_LIMIT_WINDOW_MS / 60000} minutes`);
console.log(`   REQUEST_LOGGING: ${ENABLE_REQUEST_LOGGING ? "enabled" : "disabled"}`);

