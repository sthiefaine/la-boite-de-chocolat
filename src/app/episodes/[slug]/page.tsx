"use server";

import { notFound } from "next/navigation";
import styles from "./PodcastPage.module.css";
import { generateMetadata } from "./metadata";
import {
  getEpisodeNavigation,
  getAllEpisodeSlugs,
  getEpisodeBySlugCached,
} from "@/app/actions/episode";
import { getSagaWithFilmsAndEpisodes } from "@/app/actions/saga";
import { getEpisodeRatingStats } from "@/app/actions/rating";
import { PodcastJsonLd } from "./json-ld";
import { SITE_URL } from "@/helpers/config";
import EpisodeHeader from "@/components/Episode/EpisodeHeader/EpisodeHeader";
import EpisodeNavigation from "@/components/Episode/EpisodeNavigation/EpisodeNavigation";
import EpisodeSaga from "@/components/Episode/EpisodeSaga/EpisodeSaga";

interface EpisodePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export { generateMetadata };

export async function generateStaticParams() {
  const result = await getAllEpisodeSlugs();

  if (!result.success || !result.data) {
    return [];
  }

  return result.data.map((episode) => ({
    slug: episode.slug,
  }));
}

export default async function EpisodePage({ params }: EpisodePageProps) {
  const { slug } = await params;

  const [episodeResult, finalNavigationResult] = await Promise.all([
    getEpisodeBySlugCached(slug),
    getEpisodeNavigation(slug),
  ]);

  if (!episodeResult) {
    notFound();
  }

  const episode = episodeResult.episode;
  const mainFilm = episode.links[0]?.film;
  const saga = mainFilm?.saga || null;
  const isAdultContent = mainFilm?.age === "18+" || mainFilm?.age === "adult";

  const ratingStats = await getEpisodeRatingStats(episode.id);
  const userRating = null;

  const sagaResult = saga ? await getSagaWithFilmsAndEpisodes(saga.id) : null;

  const previousEpisode = finalNavigationResult.success
    ? finalNavigationResult?.data?.previousEpisode
    : null;
  const nextEpisode = finalNavigationResult.success
    ? finalNavigationResult?.data?.nextEpisode
    : null;

  const mainFilmImageUrl = decodeURIComponent(episodeResult.mainFilmImageUrl);

  return (
    <>
      <PodcastJsonLd
        episode={episode}
        canonicalUrl={`${SITE_URL}/podcast/${episode.slug}`}
      />
      <div className={styles.container}>
        <EpisodeHeader
          episode={episode}
          mainFilmImageUrl={mainFilmImageUrl}
          isAdultContent={isAdultContent}
          userRating={userRating}
          ratingStats={ratingStats}
        />
        <EpisodeNavigation
          previousEpisode={previousEpisode || null}
          nextEpisode={nextEpisode || null}
        />

        {saga && sagaResult && (
          <EpisodeSaga saga={saga} sagaResult={sagaResult} />
        )}
      </div>
    </>
  );
}
