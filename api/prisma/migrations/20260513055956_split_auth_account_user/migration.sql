-- Split authentication data from user profile data while preserving existing rows.
-- Old shape:
--   User(id, email, password, role, ...)
--   Session(userId, ...)
-- New shape:
--   AuthAccount(id, email, passwordHash, role, ...)
--   User(id, ...)
--   Session(authAccountId, ...)

-- CreateTable
CREATE TABLE "AuthAccount" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "emailVerifiedAt" TIMESTAMP(3),
    "passwordChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disabledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthAccount_pkey" PRIMARY KEY ("id")
);

-- Backfill AuthAccount from existing User rows before User gets the new FK.
INSERT INTO "AuthAccount" (
    "id",
    "email",
    "passwordHash",
    "role",
    "createdAt",
    "updatedAt"
)
SELECT
    "id",
    "email",
    "password",
    "role",
    "createdAt",
    "updatedAt"
FROM "User";

-- Add nullable column first so existing Session rows can be backfilled.
ALTER TABLE "Session" ADD COLUMN "authAccountId" TEXT;

UPDATE "Session"
SET "authAccountId" = "userId";

ALTER TABLE "Session" ALTER COLUMN "authAccountId" SET NOT NULL;

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropIndex
DROP INDEX "Session_userId_createdAt_idx";

-- DropIndex
DROP INDEX "Session_userId_idx";

-- DropIndex
DROP INDEX "Session_userId_isRevoked_idx";

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email",
DROP COLUMN "password",
DROP COLUMN "role";

-- CreateIndex
CREATE UNIQUE INDEX "AuthAccount_email_key" ON "AuthAccount"("email");

-- CreateIndex
CREATE INDEX "AuthAccount_role_idx" ON "AuthAccount"("role");

-- CreateIndex
CREATE INDEX "AuthAccount_createdAt_idx" ON "AuthAccount"("createdAt");

-- CreateIndex
CREATE INDEX "AuthAccount_emailVerifiedAt_idx" ON "AuthAccount"("emailVerifiedAt");

-- CreateIndex
CREATE INDEX "AuthAccount_disabledAt_idx" ON "AuthAccount"("disabledAt");

-- CreateIndex
CREATE INDEX "Session_authAccountId_idx" ON "Session"("authAccountId");

-- CreateIndex
CREATE INDEX "Session_authAccountId_createdAt_idx" ON "Session"("authAccountId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Session_authAccountId_isRevoked_idx" ON "Session"("authAccountId", "isRevoked");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_id_fkey" FOREIGN KEY ("id") REFERENCES "AuthAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_authAccountId_fkey" FOREIGN KEY ("authAccountId") REFERENCES "AuthAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
