import { getEpisodesWithFilms } from "@/app/actions/episode";
import EpisodeGrid from "@/components/Episode/EpisodeGrid/EpisodeGrid";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Épisodes - La Boîte de Chocolat",
  description: "Découvrez tous nos épisodes et les films associés",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--chocolate-cream)] to-white pb-24 pt-[60px]">
      <EpisodeGrid
        episodes={episodes}
        title="Tous nos épisodes"
        subtitle={`Découvrez nos ${episodes.length} épisode${
          episodes.length > 1 ? "s" : ""
        } et les films associés`}
      />
    </div>
  );
}
