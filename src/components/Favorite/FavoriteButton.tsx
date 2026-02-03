"use client";

import { useState, useOptimistic, useTransition, useEffect } from "react";
import { toggleFavorite, isEpisodeFavorited } from "@/app/actions/favorite";
import { useSession } from "@/lib/auth/auth-client";
import styles from "./FavoriteButton.module.css";

interface FavoriteButtonProps {
  episodeId: string;
  initialFavorited?: boolean;
  variant?: "default" | "overlay";
  className?: string;
  children?: React.ReactNode;
}

export default function FavoriteButton({
  episodeId,
  initialFavorited = false,
  variant = "default",
  className,
  children,
}: FavoriteButtonProps) {
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const [isFavorited, setIsFavorited] = useState(initialFavorited);

  const [optimisticFavorited, addOptimisticFavorited] = useOptimistic(
    isFavorited,
    (_state, newValue: boolean) => newValue
  );

  // Charger l'état initial si l'utilisateur est connecté
  useEffect(() => {
    const loadFavoriteState = async () => {
      if (session?.user && !initialFavorited) {
        try {
          const favorited = await isEpisodeFavorited(
            episodeId,
            session.user.id
          );
          setIsFavorited(favorited);
        } catch {
          // Silently fail
        }
      }
    };

    loadFavoriteState();
  }, [session?.user, episodeId, initialFavorited]);

  const handleToggle = () => {
    if (!session?.user || isPending) return;

    startTransition(async () => {
      const newValue = !optimisticFavorited;
      addOptimisticFavorited(newValue);

      try {
        const result = await toggleFavorite(episodeId, session.user.id);

        if (result.success) {
          setIsFavorited(result.favorited!);
        } else {
          addOptimisticFavorited(!newValue);
        }
      } catch {
        addOptimisticFavorited(!newValue);
      }
    });
  };

  const isActive = optimisticFavorited;

  return (
    <button
      className={`${className ?? styles.favoriteButton} ${
        variant === "overlay" ? styles.overlay : ""
      } ${isActive ? styles.active : ""}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleToggle();
      }}
      disabled={isPending}
      title={
        !session?.user
          ? "Connectez-vous pour ajouter aux favoris"
          : isActive
          ? "Retirer des favoris"
          : "Ajouter aux favoris"
      }
      aria-label={isActive ? "Retirer des favoris" : "Ajouter aux favoris"}
      aria-pressed={isActive}
    >
      <svg
        className={styles.starIcon}
        viewBox="0 0 24 24"
        fill={isActive ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={isActive ? 0 : 2}
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      {children}
    </button>
  );
}
