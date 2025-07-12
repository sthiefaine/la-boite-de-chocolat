/*
  Warnings:

  - Added the required column `updatedAt` to the `PodcastEpisode` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PodcastEpisode" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "genre" TEXT,
ADD COLUMN     "imgFileName" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Mettre à jour les enregistrements existants avec la date de création basée sur pubDate
UPDATE "PodcastEpisode" SET "createdAt" = "pubDate", "updatedAt" = "pubDate" WHERE "createdAt" IS NULL OR "updatedAt" IS NULL;
