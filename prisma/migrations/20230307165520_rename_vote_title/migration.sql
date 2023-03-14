/*
  Warnings:

  - You are about to drop the column `name` on the `Vote` table. All the data in the column will be lost.
  - Added the required column `title` to the `Vote` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Vote" DROP COLUMN "name",
ADD COLUMN     "title" TEXT NOT NULL;
