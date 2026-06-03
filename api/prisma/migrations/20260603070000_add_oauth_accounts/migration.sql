-- CreateEnum
CREATE TYPE "OAuthProvider" AS ENUM ('GOOGLE');

-- CreateTable
CREATE TABLE "OAuthAccount" (
  "id" TEXT NOT NULL,
  "authAccountId" TEXT NOT NULL,
  "provider" "OAuthProvider" NOT NULL,
  "providerId" TEXT NOT NULL,
  "email" TEXT,
  "name" TEXT,
  "avatarUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "OAuthAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OAuthAccount_provider_providerId_key" ON "OAuthAccount"("provider", "providerId");

-- CreateIndex
CREATE INDEX "OAuthAccount_authAccountId_idx" ON "OAuthAccount"("authAccountId");

-- AddForeignKey
ALTER TABLE "OAuthAccount" ADD CONSTRAINT "OAuthAccount_authAccountId_fkey" FOREIGN KEY ("authAccountId") REFERENCES "AuthAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
