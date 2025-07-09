-- CreateTable
CREATE TABLE "RssFeed" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "nameId" TEXT NOT NULL DEFAULT 'la-boite-de-chocolat',

    CONSTRAINT "RssFeed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PodcastEpisode" (
    "id" TEXT NOT NULL,
    "rssFeedId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pubDate" TIMESTAMP(3) NOT NULL,
    "audioUrl" TEXT NOT NULL,

    CONSTRAINT "PodcastEpisode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Film" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "year" INTEGER,
    "imgFileName" TEXT,
    "sagaId" TEXT,

    CONSTRAINT "Film_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Saga" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Saga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PodcastFilmLink" (
    "id" TEXT NOT NULL,
    "podcastId" TEXT NOT NULL,
    "filmId" TEXT NOT NULL,

    CONSTRAINT "PodcastFilmLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RssFeed_url_key" ON "RssFeed"("url");

-- CreateIndex
CREATE UNIQUE INDEX "RssFeed_nameId_key" ON "RssFeed"("nameId");

-- CreateIndex
CREATE UNIQUE INDEX "PodcastEpisode_audioUrl_key" ON "PodcastEpisode"("audioUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Film_slug_key" ON "Film"("slug");

-- AddForeignKey
ALTER TABLE "PodcastEpisode" ADD CONSTRAINT "PodcastEpisode_rssFeedId_fkey" FOREIGN KEY ("rssFeedId") REFERENCES "RssFeed"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Film" ADD CONSTRAINT "Film_sagaId_fkey" FOREIGN KEY ("sagaId") REFERENCES "Saga"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PodcastFilmLink" ADD CONSTRAINT "PodcastFilmLink_filmId_fkey" FOREIGN KEY ("filmId") REFERENCES "Film"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PodcastFilmLink" ADD CONSTRAINT "PodcastFilmLink_podcastId_fkey" FOREIGN KEY ("podcastId") REFERENCES "PodcastEpisode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
