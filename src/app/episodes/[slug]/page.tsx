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
import { getFilmCredits } from "@/app/actions/film";
import { getSession } from "@/lib/auth/auth-server";
import { isAdminRole } from "@/lib/auth/auth-helpers";
import { PodcastJsonLd } from "./json-ld";
import { BreadcrumbJsonLd } from "./breadcrumb-json-ld";
import { SITE_URL } from "@/helpers/config";
import EpisodeHeader from "@/components/Episode/EpisodeHeader/EpisodeHeader";
import EpisodeNavigation from "@/components/Episode/EpisodeNavigation/EpisodeNavigation";
import EpisodeSaga from "@/components/Episode/EpisodeSaga/EpisodeSaga";
import Breadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
import RecommendationsSection from "@/components/Recommendations/RecommendationsSection";
import PeopleSection from "@/components/People/PeopleSection";

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

  // Fetch credits for main film
  const [filmCredits, session] = await Promise.all([
    mainFilm?.tmdbId ? getFilmCredits(mainFilm.tmdbId) : null,
    getSession(),
  ]);
  const isAdmin = isAdminRole(session?.user?.role);

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
        canonicalUrl={`${SITE_URL}/episodes/${episode.slug}`}
      />
      <BreadcrumbJsonLd
        episodeTitle={episode.title}
        episodeSlug={episode.slug || ""}
        filmTitle={mainFilm?.title}
      />
      <div className={styles.container}>
        <Breadcrumbs
          variant="light"
          items={[
            { label: "Accueil", href: "/" },
            { label: "Épisodes", href: "/episodes" },
            { label: mainFilm?.title || episode.title },
          ]}
        />
        <EpisodeHeader
          episode={episode}
          mainFilmImageUrl={mainFilmImageUrl}
          isAdultContent={isAdultContent}
          userRating={userRating}
          ratingStats={ratingStats}
          isAdmin={isAdmin}
        />

        <EpisodeNavigation
          previousEpisode={previousEpisode || null}
          nextEpisode={nextEpisode || null}
        />

        {saga && sagaResult && (
          <EpisodeSaga saga={saga} sagaResult={sagaResult} />
        )}

        <RecommendationsSection episodeId={episode.id} />

        {filmCredits && (
          <PeopleSection credits={filmCredits} filmTitle={mainFilm?.title} />
        )}
      </div>
    </>
  );
}
