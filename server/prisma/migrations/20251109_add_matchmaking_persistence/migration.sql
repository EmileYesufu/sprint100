-- Create enums
CREATE TYPE "QueueStatus" AS ENUM ('PENDING', 'MATCHED', 'CANCELLED');
CREATE TYPE "ChallengeStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED');
CREATE TYPE "MatchStatus" AS ENUM ('QUEUED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- Extend Match table
ALTER TABLE "Match"
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  ADD COLUMN "status" "MatchStatus" NOT NULL DEFAULT 'QUEUED';

-- Extend MatchPlayer table
ALTER TABLE "MatchPlayer"
  ADD COLUMN "socketId" TEXT;
ALTER TABLE "MatchPlayer"
  ADD CONSTRAINT "matchId_userId" UNIQUE ("matchId", "userId");

-- Create MatchQueue table
CREATE TABLE "MatchQueue" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "status" "QueueStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "matchId" INTEGER,
  CONSTRAINT "MatchQueue_userId_key" UNIQUE ("userId"),
  CONSTRAINT "MatchQueue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "MatchQueue_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE SET NULL
);

CREATE INDEX "MatchQueue_status_createdAt_idx" ON "MatchQueue" ("status", "createdAt");

-- Create Challenge table
CREATE TABLE "Challenge" (
  "id" SERIAL PRIMARY KEY,
  "challengerId" INTEGER NOT NULL,
  "opponentId" INTEGER NOT NULL,
  "status" "ChallengeStatus" NOT NULL DEFAULT 'PENDING',
  "matchId" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  CONSTRAINT "Challenge_challengerId_fkey" FOREIGN KEY ("challengerId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "Challenge_opponentId_fkey" FOREIGN KEY ("opponentId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "Challenge_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE SET NULL
);

CREATE UNIQUE INDEX "Challenge_unique_active_challenge" ON "Challenge" ("challengerId", "opponentId", "status");

CREATE INDEX "Challenge_status_createdAt_idx" ON "Challenge" ("status", "createdAt");
