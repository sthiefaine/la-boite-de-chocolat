"use client";

import { useState } from "react";
import { PODCAST_URLS, SOCIAL_URLS, CONTACT_URLS } from "../../lib/config";
import styles from "./ChocolateBox.module.css";
import { usePlayerStore } from "@/lib/store/player";
import { useShallow } from "zustand/shallow";

interface Episode {
  id: string;
  title: string;
  description: string;
  pubDate: Date;
  audioUrl: string;
  duration?: number | null;
  slug: string | null;
  links: Array<{
    film: {
      id: string;
      title: string;
      slug: string;
      year: number | null;
      imgFileName: string | null;
      age: string | null;
      saga: {
        name: string;
        id: string;
      } | null;
    };
  }>;
}

interface ChocolateBoxProps {
  className?: string;
  episodes?: Episode[];
}

export default function ChocolateBox({
  className,
  episodes = [],
}: ChocolateBoxProps) {
  const { setRandomEpisode } = usePlayerStore(
    useShallow((state) => ({ setRandomEpisode: state.setRandomEpisode }))
  );

  const [isLoading, setIsLoading] = useState(false);
  const [playedEpisodeIds, setPlayedEpisodeIds] = useState<Set<string>>(
    new Set()
  );

  const handleRandomEpisode = async () => {
    if (!episodes || episodes.length === 0) return;

    setIsLoading(true);

    const availableEpisodes = episodes.filter(
      (episode) => !playedEpisodeIds.has(episode.id)
    );

    let selectedEpisode: Episode;
    let newPlayedIds: Set<string>;
    if (availableEpisodes.length === 0) {
      const randomIndex = Math.floor(Math.random() * episodes.length);
      selectedEpisode = episodes[randomIndex];
      newPlayedIds = new Set([selectedEpisode.id]);
    } else {
      const randomIndex = Math.floor(
        Math.random() * availableEpisodes.length
      );
      selectedEpisode = availableEpisodes[randomIndex];
      newPlayedIds = new Set([...playedEpisodeIds, selectedEpisode.id]);
    }

    setPlayedEpisodeIds(newPlayedIds);

    const mainFilm = selectedEpisode.links[0]?.film;

    setRandomEpisode({
      id: selectedEpisode.id,
      title: selectedEpisode.title,
      url: selectedEpisode.audioUrl,
      img: mainFilm?.imgFileName ?? "",
      slug: selectedEpisode.slug ?? "",
      artist: "La Boîte de Chocolat",
      age: mainFilm?.age || null,
    });

    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className={`${styles.chocolateBox} ${className || ""}`}>
      <div className={styles.coffret}>
        <div className={styles.box3D}>
          <div className={styles.hole}>
            <a
              href={PODCAST_URLS.apple}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.choco} ${styles.apple}`}
              data-platform="apple"
            >
              <span className={styles.chocoIcon}>🍎</span>
              <span className={styles.chocoLabel}>Apple</span>
            </a>
          </div>
          <div className={styles.hole}>
            <a
              href={PODCAST_URLS.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.choco} ${styles.spotify}`}
              data-platform="spotify"
            >
              <span className={styles.chocoIcon}>🎵</span>
              <span className={styles.chocoLabel}>Spotify</span>
            </a>
          </div>
          <div className={styles.hole}>
            <a
              href={PODCAST_URLS.deezer}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.choco} ${styles.deezer}`}
              data-platform="deezer"
            >
              <span className={styles.chocoIcon}>🎧</span>
              <span className={styles.chocoLabel}>Deezer</span>
            </a>
          </div>
          <div className={`${styles.hole} ${styles.holeDouble}`}>
            <a
              href={`${SOCIAL_URLS.instagramBase}${SOCIAL_URLS.instagram1}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.choco} ${styles.instagram1}`}
              data-platform="instagram1"
            >
              <span className={styles.chocoIcon}>📸</span>
              <span className={styles.chocoLabel}>@{SOCIAL_URLS.instagram1}</span>
            </a>
          </div>
          <div className={styles.hole}>
            <a
              href={CONTACT_URLS.email}
              className={`${styles.choco} ${styles.email}`}
              data-platform="email"
            >
              <span className={styles.chocoIcon}>✉️</span>
              <span className={styles.chocoLabel}>Mail</span>
            </a>
          </div>
          <div className={styles.hole}>
            <a
              href={PODCAST_URLS.rss}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.choco} ${styles.rss}`}
              data-platform="rss"
            >
              <span className={styles.chocoIcon}>📡</span>
              <span className={styles.chocoLabel}>RSS</span>
            </a>
          </div>
          <div className={`${styles.hole} ${styles.holeDouble}`}>
            <button
              onClick={handleRandomEpisode}
              disabled={isLoading || !episodes || episodes.length === 0}
              className={`${styles.choco} ${styles.randomEpisode}`}
              title={
                !episodes || episodes.length === 0
                  ? "Aucun épisode disponible"
                  : "Sélectionner un épisode aléatoire"
              }
            >
              <span className={styles.chocoIcon}>{"🎲"}</span>
              <span className={styles.chocoLabel}>Écouter au hasard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
