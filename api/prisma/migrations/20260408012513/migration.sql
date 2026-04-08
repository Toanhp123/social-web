/*
  Warnings:

  - You are about to drop the `UserPermission` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserPermission" DROP CONSTRAINT "UserPermission_userId_fkey";

-- DropTable
DROP TABLE "UserPermission";

-- CreateTable
CREATE TABLE "ConversationPermission" (
    "conversationRole" "ConversationRole" NOT NULL,
    "permission" "Permission" NOT NULL,

    CONSTRAINT "ConversationPermission_pkey" PRIMARY KEY ("conversationRole","permission")
);
