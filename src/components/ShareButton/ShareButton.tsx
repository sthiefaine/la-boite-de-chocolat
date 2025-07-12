"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import styles from "./ShareButton.module.css";

interface ShareButtonProps {
  title: string;
  url: string;
  className?: string;
}

export function ShareButton({ title, url, className = "" }: ShareButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: `La Boîte de Chocolat - ${title}`,
      text: `Écoutez l'épisode "${title}" sur La Boîte de Chocolat`,
      url: url,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Erreur lors du partage:", error);
          fallbackShare();
        }
      }
    } else {
      fallbackShare();
    }
  };

  const fallbackShare = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Erreur lors de la copie:", error);
      // Fallback pour les navigateurs plus anciens
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`${styles.shareButton} ${className}`}
      aria-label="Partager cet épisode"
    >
      <span className={styles.buttonIcon}>
        {isCopied ? <Check size={16} /> : <Share2 size={16} />}
      </span>
      {isCopied ? "Lien copié !" : "Partager"}
    </button>
  );
}