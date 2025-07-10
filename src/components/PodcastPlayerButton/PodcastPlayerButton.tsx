"use client";
import { usePlayerStore } from "@/lib/store/player";
import { Play, Pause } from "lucide-react";
import { useShallow } from "zustand/shallow";

interface PodcastPlayerButtonProps {
  title: string;
  audioUrl: string;
  imageUrl?: string;
  artist?: string;
  slug?: string;
  className?: string;
  children?: React.ReactNode;
}

export const PodcastPlayerButton = ({
  title,
  audioUrl,
  imageUrl,
  artist = "La Boîte de Chocolat",
  slug,
  className = "",
  children,
}: PodcastPlayerButtonProps) => {
  const [podcast, setPodcast, isPlaying, setIsPlaying, setClearPlayerStore] =
    usePlayerStore(
      useShallow((state) => [
        state.podcast,
        state.setPodcast,
        state.isPlaying,
        state.setIsPlaying,
        state.setClearPlayerStore,
      ])
    );

  const handleListen = () => {
    if (podcast?.url !== audioUrl) {
      setClearPlayerStore();
      setPodcast({
        title,
        artist,
        img: imageUrl || "/images/boite-de-chocolat-404.png",
        url: audioUrl,
        slug: slug || "",
        id: "",
      });
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  // Si c'est le podcast actuel et qu'il est en cours de lecture, afficher le bouton pause
  if (isPlaying && podcast?.url === audioUrl) {
    return (
      <button
        onClick={handlePause}
        className={className}
        title={`Mettre en pause ${title}`}
      >
        <Pause />
        Pause
      </button>
    );
  }

  // Sinon afficher le bouton play
  return (
    <button
      onClick={handleListen}
      className={className}
      title={`Écouter ${title}`}
    >
      {children || (
        <>
          <Play />
          Écouter
        </>
      )}
    </button>
  );
};
