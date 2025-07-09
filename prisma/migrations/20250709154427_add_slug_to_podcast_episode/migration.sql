/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `PodcastEpisode` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PodcastEpisode" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PodcastEpisode_slug_key" ON "PodcastEpisode"("slug");
