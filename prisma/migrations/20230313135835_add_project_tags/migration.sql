-- CreateEnum
CREATE TYPE "Tag" AS ENUM ('RefryRehash', 'NewConnect', 'SmallData', 'Other');

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "tags" "Tag"[];
