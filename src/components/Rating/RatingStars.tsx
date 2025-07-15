"use client";

import { useState, useEffect, useOptimistic, useTransition } from "react";
import {
  rateEpisode,
  getEpisodeRatingStats,
  deleteUserRating,
  getUserRating,
} from "@/app/actions/rating";
import { useSession } from "@/lib/auth/auth-client";
import styles from "./RatingStars.module.css";

interface RatingStarsProps {
  episodeId: string;
  episodeSlug: string;
  userRating?: number | null;
  stats?: {
    averageRating: number;
    totalRatings: number;
    ratingDistribution: { [key: number]: number };
  } | null;
}

export default function RatingStars({
  episodeId,
  episodeSlug,
  userRating: initialUserRating,
  stats: initialStats,
}: RatingStarsProps) {
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const [userRating, setUserRating] = useState<number | null>(
    initialUserRating || null
  );
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [stats, setStats] = useState<{
    averageRating: number;
    totalRatings: number;
    ratingDistribution: { [key: number]: number };
  } | null>(initialStats || null);

  const [optimisticRating, addOptimisticRating] = useOptimistic(
    userRating,
    (state, newRating: number | null) => newRating
  );

  useEffect(() => {
    const loadUserRating = async () => {
      if (session?.user && !initialUserRating) {
        try {
          const rating = await getUserRating(episodeId, session.user.id);
          setUserRating(rating);
        } catch (error) {
          console.error(
            "Erreur lors du chargement de la note utilisateur:",
            error
          );
        }
      }
    };

    loadUserRating();
  }, [session?.user, episodeId, initialUserRating]);

  const handleStarClick = async (rating: number) => {
    if (isPending) return;

    startTransition(async () => {
      addOptimisticRating(rating);

      try {
        const result = await rateEpisode(episodeId, rating, session?.user?.id);

        if (result.success) {
          setUserRating(rating);
          const newStats = await getEpisodeRatingStats(episodeId);
          setStats(newStats);
        } else {
          addOptimisticRating(userRating);
        }
      } catch (error) {
        addOptimisticRating(userRating);
      }
    });
  };

  const handleStarHover = (rating: number) => {
    setHoverRating(rating);
  };

  const handleStarLeave = () => {
    setHoverRating(null);
  };

  const handleRemoveRating = async () => {
    if (isPending) return;

    startTransition(async () => {
      // Optimistic update inside transition
      addOptimisticRating(null);

      try {
        const result = await deleteUserRating(episodeId, session?.user?.id);

        if (result.success) {
          setUserRating(null);
          const newStats = await getEpisodeRatingStats(episodeId);
          setStats(newStats);
        } else {
          addOptimisticRating(userRating);
        }
      } catch (error) {
        addOptimisticRating(userRating);
      }
    });
  };

  const getStarClass = (starNumber: number) => {
    const currentRating = hoverRating || optimisticRating;

    if (currentRating && starNumber <= currentRating) {
      return `${styles.starButton} ${styles.filled}`;
    }

    return `${styles.starButton} ${styles.empty}`;
  };

  const getRatingText = (rating: number) => {
    const texts = {
      1: "Très mauvais",
      2: "Mauvais",
      3: "Moyen",
      4: "Bon",
      5: "Excellent",
    };
    return texts[rating as keyof typeof texts] || "";
  };

  return (
    <div className={styles.ratingContainer}>
      <div className={styles.ratingHeader}>
        <h3 className={styles.ratingTitle}>Note de l'épisode</h3>
        {stats && (
          <div className={styles.ratingStats}>
            <div className={styles.totalRatings}>
              ({stats.totalRatings} note
              {stats.totalRatings === 0
                ? ""
                : stats.totalRatings > 1
                ? "s"
                : ""}
              )
            </div>
          </div>
        )}
      </div>

      <div className={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            className={getStarClass(star)}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleStarHover(star)}
            onMouseLeave={handleStarLeave}
            disabled={isPending || !session?.user}
            title={
              session?.user
                ? `${star} étoile${star > 1 ? "s" : ""} - ${getRatingText(
                    star
                  )}`
                : "Connectez-vous pour noter"
            }
            aria-label={
              session?.user
                ? `Noter ${star} étoile${star > 1 ? "s" : ""}`
                : "Connectez-vous pour noter"
            }
          >
            ★
          </button>
        ))}
      </div>

      <div className={styles.ratingInfo}>
        {!session?.user ? (
          <span className={styles.infoText}>Connectez-vous pour noter</span>
        ) : optimisticRating ? (
          <span className={styles.infoText}>
            Vous avez mis {optimisticRating}/5
            <button
              onClick={handleRemoveRating}
              disabled={isPending}
              className={styles.removeButtonInline}
              title="Supprimer votre note"
              aria-label="Supprimer votre note"
            >
              × supprimer
            </button>
          </span>
        ) : (
          <span className={styles.infoText}>Notez l'épisode</span>
        )}
      </div>
    </div>
  );
}
