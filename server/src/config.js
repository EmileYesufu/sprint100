"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENABLE_REQUEST_LOGGING = exports.RATE_LIMIT_MAX = exports.RATE_LIMIT_WINDOW_MS = exports.NODE_ENV = exports.DATABASE_URL = exports.ALLOWED_ORIGINS = exports.JWT_SECRET = exports.PORT = exports.HOST = void 0;
// server/src/config.ts
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), envFile) });
function parseList(raw) {
    if (!raw)
        return [];
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
}
exports.HOST = process.env.HOST || "0.0.0.0";
exports.PORT = Number(process.env.PORT || 4000);
exports.JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
exports.ALLOWED_ORIGINS = parseList(process.env.ALLOWED_ORIGINS).length > 0
    ? parseList(process.env.ALLOWED_ORIGINS)
    : ["*"];
exports.DATABASE_URL = process.env.DATABASE_URL || "file:./prisma/dev.db";
exports.NODE_ENV = process.env.NODE_ENV || "development";
exports.RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
exports.RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX || 200);
exports.ENABLE_REQUEST_LOGGING = process.env.ENABLE_REQUEST_LOGGING === "true" || exports.NODE_ENV !== "production";
// Validate critical config
const requiredEnvVars = {
    JWT_SECRET: exports.JWT_SECRET,
    DATABASE_URL: exports.DATABASE_URL,
    HOST: exports.HOST,
    PORT: exports.PORT
};
const missingVars = [];
const invalidVars = [];
// Check for missing required variables
Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (!value || value === "") {
        missingVars.push(key);
    }
});
// Check for invalid values
if (!exports.JWT_SECRET || exports.JWT_SECRET === "dev_secret_change_me" || exports.JWT_SECRET === "your_jwt_secret_change_this_in_production") {
    invalidVars.push("JWT_SECRET (using default/placeholder value)");
}
if (exports.NODE_ENV === "production" && exports.ALLOWED_ORIGINS.includes("*")) {
    invalidVars.push("ALLOWED_ORIGINS (allows all origins in production)");
}
if (exports.NODE_ENV === "production" && exports.DATABASE_URL.includes("file:")) {
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
if (exports.NODE_ENV === "production" && (missingVars.length > 0 || invalidVars.length > 0)) {
    console.error("🚨 Production environment validation failed. Exiting...");
    process.exit(1);
}
// Log warnings for development
if (exports.NODE_ENV !== "production") {
    if (!exports.JWT_SECRET || exports.JWT_SECRET === "dev_secret_change_me") {
        console.warn("⚠️  WARNING: Using default JWT_SECRET. Set JWT_SECRET env var for production!");
    }
    if (exports.ALLOWED_ORIGINS.includes("*")) {
        console.warn("⚠️  WARNING: CORS allows all origins (*). Set ALLOWED_ORIGINS for production!");
    }
}
console.log("📋 Server Configuration:");
console.log(`   NODE_ENV: ${exports.NODE_ENV}`);
console.log(`   HOST: ${exports.HOST}`);
console.log(`   PORT: ${exports.PORT}`);
console.log(`   ALLOWED_ORIGINS: ${exports.ALLOWED_ORIGINS.join(", ")}`);
console.log(`   DATABASE_URL: ${exports.DATABASE_URL.includes("file:") ? "SQLite (dev)" : "External DB"}`);
console.log(`   RATE_LIMIT: ${exports.RATE_LIMIT_MAX} requests per ${exports.RATE_LIMIT_WINDOW_MS / 60000} minutes`);
console.log(`   REQUEST_LOGGING: ${exports.ENABLE_REQUEST_LOGGING ? "enabled" : "disabled"}`);
//# sourceMappingURL=config.js.map