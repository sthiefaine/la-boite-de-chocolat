"use client";
import { usePlayerStore } from "@/lib/store/player";
import { Play, Pause } from "lucide-react";
import { useShallow } from "zustand/shallow";

interface EpisodePlayerButtonProps {
  title: string;
  audioUrl: string;
  imageUrl?: string;
  artist?: string;
  slug?: string;
  age?: string | null;
  className?: string;
  children?: React.ReactNode;
}

export const EpisodePlayerButton = ({
  title,
  audioUrl,
  imageUrl,
  artist = "La Boîte de Chocolat",
  slug,
  age,
  className = "",
  children,
}: EpisodePlayerButtonProps) => {
  const { episode, setEpisode, isPlaying, setIsPlaying, setClearPlayerStore } =
    usePlayerStore(
      useShallow((state) => ({
        episode: state.episode,
        setEpisode: state.setEpisode,
        isPlaying: state.isPlaying,
        setIsPlaying: state.setIsPlaying,
        setClearPlayerStore: state.setClearPlayerStore,
      }))
    );

  const handleListen = () => {
    if (episode?.url !== audioUrl) {
      setClearPlayerStore();
      setEpisode({
        title,
        artist,
        img: imageUrl || "/images/boite-de-chocolat-404.png",
        url: audioUrl,
        slug: slug || "",
        id: "",
        age: age || null,
      });
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  if (isPlaying && episode?.url === audioUrl) {
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
