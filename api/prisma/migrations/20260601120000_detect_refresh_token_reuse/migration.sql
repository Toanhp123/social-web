ALTER TABLE "Session"
ADD COLUMN "refreshTokenRotatedAt" TIMESTAMP(3);

CREATE TABLE "RotatedRefreshToken" (
  "refreshTokenHash" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "rotatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "RotatedRefreshToken_pkey" PRIMARY KEY ("refreshTokenHash")
);

CREATE INDEX "RotatedRefreshToken_sessionId_idx"
ON "RotatedRefreshToken"("sessionId");

CREATE INDEX "RotatedRefreshToken_expiresAt_idx"
ON "RotatedRefreshToken"("expiresAt");

ALTER TABLE "RotatedRefreshToken"
ADD CONSTRAINT "RotatedRefreshToken_sessionId_fkey"
FOREIGN KEY ("sessionId") REFERENCES "Session"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
