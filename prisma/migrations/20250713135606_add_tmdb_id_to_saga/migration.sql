/*
  Warnings:

  - A unique constraint covering the columns `[tmdbId]` on the table `Saga` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Saga" ADD COLUMN     "tmdbId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Saga_tmdbId_key" ON "Saga"("tmdbId");
