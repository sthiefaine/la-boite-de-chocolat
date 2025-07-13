"use client";
import { useQueueStore } from "@/lib/store/queue";
import { Plus } from "lucide-react";
import { useState } from "react";
import styles from "./AddToQueueButton.module.css";

interface AddToQueueButtonProps {
  podcast: {
    id: string;
    title: string;
    artist: string;
    url: string;
    img: string;
    slug: string;
    age: string;
    movieAge: string;
  };
  className?: string;
}

export const AddToQueueButton = ({
  podcast,
  className,
}: AddToQueueButtonProps) => {
  const { addToQueue, queue } = useQueueStore();
  const [isAdded, setIsAdded] = useState(false);

  const isInQueue = queue.some((item) => item.id === podcast.id);

  const handleAddToQueue = () => {
    if (!isInQueue) {
      addToQueue(podcast);
      setIsAdded(true);

      // Reset l'état après 2 secondes
      setTimeout(() => {
        setIsAdded(false);
      }, 2000);
    }
  };

  if (isInQueue) {
    return (
      <button
        className={className || `${styles.addToQueueButton} ${styles.inQueue}`}
        disabled
        title="Déjà en file d'attente"
      >
        <span>✓ En file d'attente</span>
      </button>
    );
  }

  return (
    <button
      className={className || `${styles.addToQueueButton} ${isAdded ? styles.added : ""}`}
      onClick={handleAddToQueue}
      title="Ajouter à la file d'attente"
    >
      <Plus size={16} />
      <span>{isAdded ? "Ajouté !" : "File d'attente"}</span>
    </button>
  );
};
