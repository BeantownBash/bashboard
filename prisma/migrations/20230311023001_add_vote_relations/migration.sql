/*
  Warnings:

  - You are about to drop the `_ProjectToVote` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ProjectToVote" DROP CONSTRAINT "_ProjectToVote_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProjectToVote" DROP CONSTRAINT "_ProjectToVote_B_fkey";

-- AlterTable
ALTER TABLE "Vote" ALTER COLUMN "description" DROP NOT NULL;

-- DropTable
DROP TABLE "_ProjectToVote";

-- CreateTable
CREATE TABLE "_CanVote" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_VoteFor" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CanVote_AB_unique" ON "_CanVote"("A", "B");

-- CreateIndex
CREATE INDEX "_CanVote_B_index" ON "_CanVote"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_VoteFor_AB_unique" ON "_VoteFor"("A", "B");

-- CreateIndex
CREATE INDEX "_VoteFor_B_index" ON "_VoteFor"("B");

-- AddForeignKey
ALTER TABLE "_CanVote" ADD CONSTRAINT "_CanVote_A_fkey" FOREIGN KEY ("A") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CanVote" ADD CONSTRAINT "_CanVote_B_fkey" FOREIGN KEY ("B") REFERENCES "Vote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VoteFor" ADD CONSTRAINT "_VoteFor_A_fkey" FOREIGN KEY ("A") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VoteFor" ADD CONSTRAINT "_VoteFor_B_fkey" FOREIGN KEY ("B") REFERENCES "Vote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
