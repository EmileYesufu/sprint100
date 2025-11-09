CREATE TABLE "PasswordResetToken" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumed" BOOLEAN NOT NULL DEFAULT FALSE,
  "consumedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "PasswordResetToken_tokenHash_key" UNIQUE("tokenHash")
);

CREATE INDEX "PasswordResetToken_userId_consumed_expiresAt_idx"
  ON "PasswordResetToken" ("userId", "consumed", "expiresAt");
