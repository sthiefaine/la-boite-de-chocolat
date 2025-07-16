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
import RatingIcon from "./RatingIcon";

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

  const handleRatingClick = async (rating: number) => {
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

  const handleRatingHover = (rating: number) => {
    setHoverRating(rating);
  };

  const handleRatingLeave = () => {
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

  const getRatingVariant = (ratingNumber: number) => {
    const currentRating =
      hoverRating ||
      stats?.averageRating ||
      optimisticRating ||
      userRating ||
      0;

    if (currentRating && ratingNumber <= currentRating) {
      // Note maximale (5) = chocolat doré
      if (ratingNumber === 5 && currentRating === 5) {
        return "golden";
      }
      // Note minimale (1) = caramel
      if (ratingNumber === 1 && currentRating === 1) {
        return "caramel";
      }
      return "filled";
    }

    return "empty";
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

      <div
        className={styles.ratingButtonsContainer}
        onMouseLeave={handleRatingLeave}
      >
        {[1, 2, 3, 4, 5].map((rating) => {
          return (
            <button
              key={rating}
              className={styles.ratingButton}
              onClick={() => session?.user && handleRatingClick(rating)}
              onMouseEnter={() => handleRatingHover(rating)}
              disabled={isPending}
              title={
                session?.user
                  ? `${rating} ${rating === 1 ? "caramel" : "chocolat"}${
                      rating > 1 ? "s" : ""
                    } - ${getRatingText(rating)}`
                  : "Connectez-vous pour noter"
              }
              aria-label={
                session?.user
                  ? `Noter ${rating} chocolat${rating > 1 ? "s" : ""}`
                  : "Connectez-vous pour noter"
              }
            >
              <RatingIcon variant={getRatingVariant(rating)} />
            </button>
          );
        })}
      </div>

      <div className={styles.ratingInfo}>
        {!session?.user ? (
          <span className={styles.infoText}>
            Connectez-vous pour noter l'épisode
          </span>
        ) : optimisticRating ? (
          <span className={styles.infoText}>
            {optimisticRating === 1 && "Vous avez mis 1 caramel."}
            {optimisticRating > 1 &&
              `Vous avez mis ${optimisticRating} chocolats.`}
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
