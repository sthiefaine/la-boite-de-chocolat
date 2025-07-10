"use client";
import { Podcast, useQueueStore } from "@/lib/store/queue";
import { usePlayerStore } from "@/lib/store/player";
import { ChevronDown, ChevronUp, Play, Trash2, X } from "lucide-react";
import { useState } from "react";
import styles from "./Queue.module.css";
import { useShallow } from "zustand/shallow";
import Image from "next/image";

export const Queue = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const {
    queue,
    currentIndex,
    removeFromQueue,
    clearQueue,
    moveInQueue,
    setCurrentIndex,
  } = useQueueStore();

  const { setPodcast, setIsPlaying } = usePlayerStore(
    useShallow((state) => ({
      setPodcast: state.setPodcast,
      setIsPlaying: state.setIsPlaying,
    }))
  );

  const handlePlayPodcast = (podcast: Podcast, index: number) => {
    setPodcast(podcast);
    setCurrentIndex(index);
    setIsPlaying(true);
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      moveInQueue(index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < queue.length - 1) {
      moveInQueue(index, index + 1);
    }
  };

  if (queue.length === 0) {
    return null;
  }

  return (
    <div className={`${styles.queueContainer} ${isOpen ? styles.open : ""}`}>
      <div className={styles.queueHeader}>
        <button
          className={styles.toggleButton}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>Queue ({queue.length})</span>
          <ChevronDown
            className={`${styles.chevron} ${isOpen ? styles.rotated : ""}`}
          />
        </button>
        {isOpen && (
          <div className={styles.headerActions}>
            <button
              className={styles.minimizeButton}
              onClick={() => setIsMinimized(!isMinimized)}
              title={isMinimized ? "Agrandir" : "Réduire"}
            >
              {isMinimized ? <ChevronUp /> : <ChevronDown />}
            </button>
            <button
              className={styles.clearButton}
              onClick={clearQueue}
              title="Vider la queue"
            >
              <Trash2 size={16} />
            </button>
            <button
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
              title="Fermer"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {isOpen && !isMinimized && (
        <div className={styles.queueContent}>
          {queue.length === 0 ? (
            <div className={styles.emptyQueue}>
              <p>Aucun podcast en queue</p>
            </div>
          ) : (
            <ul className={styles.queueList}>
              {queue.map((podcast, index) => (
                <li
                  key={`${podcast.id}-${index}`}
                  className={`${styles.queueItem} ${
                    index === currentIndex ? styles.current : ""
                  }`}
                >
                  <div className={styles.podcastInfo}>
                    <Image
                      src={podcast.img}
                      alt={podcast.title}
                      className={styles.podcastImage}
                      width={40}
                      height={40}
                    />
                    <div className={styles.podcastDetails}>
                      <h4 className={styles.podcastTitle}>{podcast.title}</h4>
                      <p className={styles.podcastArtist}>{podcast.artist}</p>
                    </div>
                  </div>

                  <div className={styles.itemActions}>
                    <button
                      className={styles.playButton}
                      onClick={() => handlePlayPodcast(podcast, index)}
                      title="Lire"
                    >
                      <Play size={16} />
                    </button>
                    <button
                      className={styles.moveButton}
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      title="Monter"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      className={styles.moveButton}
                      onClick={() => handleMoveDown(index)}
                      disabled={index === queue.length - 1}
                      title="Descendre"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <button
                      className={styles.removeButton}
                      onClick={() => removeFromQueue(index)}
                      title="Retirer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}; 