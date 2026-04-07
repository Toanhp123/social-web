-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'MODERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('DELETE_POST', 'REVIEW_REPORT', 'BAN_USER', 'FEATURE_POST', 'MANAGE_STORIES');

-- AlterEnum
ALTER TYPE "ConversationRole" ADD VALUE 'MODERATOR';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "RolePermission" (
    "role" "UserRole" NOT NULL,
    "permission" "Permission" NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("role","permission")
);

-- CreateTable
CREATE TABLE "UserPermission" (
    "userId" TEXT NOT NULL,
    "permission" "Permission" NOT NULL,

    CONSTRAINT "UserPermission_pkey" PRIMARY KEY ("userId","permission")
);

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
