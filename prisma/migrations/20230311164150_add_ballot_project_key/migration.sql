/*
  Warnings:

  - Added the required column `projectId` to the `Ballot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ballot" ADD COLUMN     "projectId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Ballot" ADD CONSTRAINT "Ballot_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
