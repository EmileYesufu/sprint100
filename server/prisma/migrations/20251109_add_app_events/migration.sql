CREATE TABLE "AppEvent" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "eventName" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  CONSTRAINT "AppEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX "AppEvent_userId_createdAt_idx" ON "AppEvent" ("userId", "createdAt");
CREATE INDEX "AppEvent_eventName_createdAt_idx" ON "AppEvent" ("eventName", "createdAt");
