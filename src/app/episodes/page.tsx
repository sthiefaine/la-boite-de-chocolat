import { getEpisodesWithFilms } from "@/app/actions/episode";
import EpisodeGrid from "@/components/Episode/EpisodeGrid/EpisodeGrid";
import { Metadata } from "next";
import { SITE_URL, PODCAST_URLS } from "@/helpers/config";

export const metadata: Metadata = {
  title: "Tous les Épisodes du Podcast Cinéma",
  description:
    "Parcourez nos épisodes de critiques cinéma : blockbusters, films Marvel, thrillers, classiques et films d'auteur. Filtrez par genre, année ou saga. Écoute gratuite.",
  keywords: [
    "épisodes podcast cinéma",
    "critique film podcast",
    "podcast films Marvel",
    "podcast films d'horreur",
    "podcast films cultes",
    "analyse film",
  ],
  alternates: {
    canonical: `${SITE_URL}/episodes`,
  },
  openGraph: {
    title: "Tous les Épisodes | La Boîte de Chocolat",
    description:
      "Parcourez nos épisodes de critiques cinéma. Filtrez par genre, année ou saga.",
    type: "website",
    url: `${SITE_URL}/episodes`,
  },
};

const getEpisodes = async () => {
  const result = await getEpisodesWithFilms();
  return result.data || [];
};

export default async function PodcastsPage() {
  const result = await getEpisodes();
  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Erreur lors du chargement
          </h1>
          <p className="text-gray-600">{"Une erreur est survenue"}</p>
        </div>
      </div>
    );
  }

  const episodes = result || [];

  const podcastSeriesJsonLd = {
    "@context": "https://schema.org",
    "@type": "PodcastSeries",
    name: "La Boîte de Chocolat",
    description:
      "Le podcast cinéma français qui analyse vos films préférés avec mauvaise foi.",
    url: `${SITE_URL}/episodes`,
    webFeed: PODCAST_URLS.rss,
    author: {
      "@type": "Organization",
      name: "La Boîte de Chocolat",
      url: SITE_URL,
    },
    genre: ["Film", "Cinéma", "Entertainment", "Critique"],
    inLanguage: "fr-FR",
    numberOfEpisodes: episodes.length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--chocolate-cream)] to-white pb-24 pt-[60px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(podcastSeriesJsonLd),
        }}
      />
      <EpisodeGrid
        episodes={episodes}
        title="Tous nos épisodes de podcast cinéma"
        subtitle={`Découvrez nos ${episodes.length} épisode${
          episodes.length > 1 ? "s" : ""
        } de critiques de films`}
        headingLevel="h1"
      />
    </div>
  );
}
