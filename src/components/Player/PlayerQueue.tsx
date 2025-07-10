"use client";
import { useQueueStore } from "@/lib/store/queue";
import { usePlayerStore } from "@/lib/store/player";
import {
  Trash2,
  ChevronUp,
  ChevronDown,
  Play,
  ExternalLink,
  CircleX,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useShallow } from "zustand/shallow";
import { IMAGE_CONFIG, getVercelBlobUrl } from "@/lib/imageConfig";
import styles from "./PlayerBar.module.css";

interface PlayerQueueProps {
  showQueue: boolean;
}

export const PlayerQueue = ({ showQueue }: PlayerQueueProps) => {
  const {
    queue,
    currentIndex,
    removeFromQueue,
    clearQueue,
    moveInQueue,
  } = useQueueStore(
    useShallow((state) => ({
      queue: state.queue,
      currentIndex: state.currentIndex,
      removeFromQueue: state.removeFromQueue,
      clearQueue: state.clearQueue,
      moveInQueue: state.moveInQueue,
    }))
  );

  const { setPodcast, setIsPlaying } = usePlayerStore(
    useShallow((state) => ({
      setPodcast: state.setPodcast,
      setIsPlaying: state.setIsPlaying,
    }))
  );

  const handlePlayQueueItem = (item: any, index: number) => {
    setPodcast(item);
    setIsPlaying(true);
    removeFromQueue(index);
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

  const handleRemoveFromQueue = (index: number) => {
    removeFromQueue(index);
  };

  if (!showQueue || queue.length === 0) {
    return null;
  }

  return (
    <div className={styles.queueSection}>
      <div className={styles.queueHeader}>
        <span>File d'attente ({queue.length})</span>
        <button
          className={styles.clearQueueButton}
          onClick={clearQueue}
          title="Vider la file d'attente"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div className={styles.queueList}>
        {queue.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className={`${styles.queueItem} ${
              index === currentIndex ? styles.currentItem : ""
            }`}
          >
            <Image
              src={item.img.startsWith("http")
                ? item.img
                : item.img
                ? getVercelBlobUrl(item.img)
                : "/images/navet.png"}
              width={40}
              height={40}
              alt={item.title}
              className={styles.queueItemImage}
              loading="lazy"
              placeholder="blur"
              blurDataURL={IMAGE_CONFIG.defaultBlurDataURL}
              quality={IMAGE_CONFIG.defaultQuality}
            />
            <div className={styles.queueItemInfo}>
              <span className={styles.queueItemTitle}>{item.title}</span>
              <span className={styles.queueItemArtist}>{item.artist}</span>
            </div>
            <div className={styles.queueItemActions}>
              <button
                className={`${styles.queueActionButton} ${styles.playButton}`}
                onClick={() => handlePlayQueueItem(item, index)}
                title="Lire"
              >
                <Play size={12} />
              </button>
              <button
                className={`${styles.queueActionButton} ${styles.moveButton}`}
                onClick={() => handleMoveUp(index)}
                disabled={index === 0}
                title="Monter"
              >
                <ChevronUp size={12} />
              </button>
              <button
                className={`${styles.queueActionButton} ${styles.moveButton}`}
                onClick={() => handleMoveDown(index)}
                disabled={index === queue.length - 1}
                title="Descendre"
              >
                <ChevronDown size={12} />
              </button>
              <Link
                href={`/podcasts/${item.slug}`}
                className={`${styles.queueActionButton} ${styles.externalButton}`}
                title="Ouvrir la page"
              >
                <ExternalLink size={12} />
              </Link>
              <button
                className={`${styles.queueActionButton} ${styles.removeButton}`}
                onClick={() => handleRemoveFromQueue(index)}
                title="Retirer"
              >
                <CircleX size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 