-- DropForeignKey
ALTER TABLE "Ballot" DROP CONSTRAINT "Ballot_userId_fkey";

-- DropForeignKey
ALTER TABLE "Ballot" DROP CONSTRAINT "Ballot_voteId_fkey";

-- DropForeignKey
ALTER TABLE "banner_images" DROP CONSTRAINT "banner_images_projectId_fkey";

-- DropForeignKey
ALTER TABLE "extra_links" DROP CONSTRAINT "extra_links_projectId_fkey";

-- DropForeignKey
ALTER TABLE "logo_images" DROP CONSTRAINT "logo_images_projectId_fkey";

-- DropForeignKey
ALTER TABLE "team_invites" DROP CONSTRAINT "team_invites_projectId_fkey";

-- DropForeignKey
ALTER TABLE "team_invites" DROP CONSTRAINT "team_invites_userId_fkey";

-- AddForeignKey
ALTER TABLE "Ballot" ADD CONSTRAINT "Ballot_voteId_fkey" FOREIGN KEY ("voteId") REFERENCES "Vote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ballot" ADD CONSTRAINT "Ballot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logo_images" ADD CONSTRAINT "logo_images_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banner_images" ADD CONSTRAINT "banner_images_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extra_links" ADD CONSTRAINT "extra_links_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_invites" ADD CONSTRAINT "team_invites_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_invites" ADD CONSTRAINT "team_invites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
