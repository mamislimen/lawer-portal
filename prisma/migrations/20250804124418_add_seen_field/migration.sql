/*
  Warnings:

  - Added the required column `user1Id` to the `Conversation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user2Id` to the `Conversation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Conversation" ADD COLUMN     "user1Id" TEXT NOT NULL,
ADD COLUMN     "user2Id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Message" ADD COLUMN     "seen" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Conversation_user1Id_idx" ON "public"."Conversation"("user1Id");

-- CreateIndex
CREATE INDEX "Conversation_user2Id_idx" ON "public"."Conversation"("user2Id");

-- AddForeignKey
ALTER TABLE "public"."Conversation" ADD CONSTRAINT "Conversation_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Conversation" ADD CONSTRAINT "Conversation_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
