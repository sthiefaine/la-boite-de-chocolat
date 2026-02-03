"use client";

import { usePlayerStore } from "@/lib/store/player";
import { useShallow } from "zustand/react/shallow";
import Image from "next/image";
import styles from "./ContinueListeningSection.module.css";

export default function ContinueListeningSection() {
  const { episode, currentPlayTime, totalDuration, setIsPlaying, setIsMinimized } =
    usePlayerStore(
      useShallow((state) => ({
        episode: state.episode,
        currentPlayTime: state.currentPlayTime,
        totalDuration: state.totalDuration,
        setIsPlaying: state.setIsPlaying,
        setIsMinimized: state.setIsMinimized,
      }))
    );

  if (!episode || currentPlayTime <= 0 || totalDuration <= 0) {
    return null;
  }

  const progress = Math.min((currentPlayTime / totalDuration) * 100, 100);
  const remaining = totalDuration - currentPlayTime;
  const remainingMin = Math.floor(remaining / 60);

  const handleResume = () => {
    setIsPlaying(true);
    setIsMinimized(false);
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>Reprendre l&apos;écoute</h2>
        <button className={styles.card} onClick={handleResume} type="button">
          <div className={styles.poster}>
            {episode.img ? (
              <Image
                src={episode.img}
                alt={episode.title}
                width={80}
                height={60}
                className={styles.posterImage}
              />
            ) : (
              <div className={styles.posterPlaceholder}>🎧</div>
            )}
          </div>
          <div className={styles.info}>
            <span className={styles.episodeTitle}>{episode.title}</span>
            <span className={styles.episodeArtist}>{episode.artist}</span>
            <div className={styles.progressContainer}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className={styles.remaining}>
                {remainingMin > 0 ? `${remainingMin} min restantes` : "< 1 min"}
              </span>
            </div>
          </div>
          <div className={styles.playButton}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </button>
      </div>
    </section>
  );
}
