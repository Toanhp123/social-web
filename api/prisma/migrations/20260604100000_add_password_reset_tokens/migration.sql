CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "authAccountId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");
CREATE INDEX "PasswordResetToken_authAccountId_idx" ON "PasswordResetToken"("authAccountId");
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");
CREATE INDEX "PasswordResetToken_usedAt_idx" ON "PasswordResetToken"("usedAt");

ALTER TABLE "PasswordResetToken"
ADD CONSTRAINT "PasswordResetToken_authAccountId_fkey"
FOREIGN KEY ("authAccountId") REFERENCES "AuthAccount"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
