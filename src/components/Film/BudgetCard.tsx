"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getUploadServerUrl } from "@/helpers/imageConfig";
import {
  formatBudgetShort,
  convertUsdToEur,
} from "@/helpers/budgetHelpers";
import { useCountAnimation } from "@/hooks/useCountAnimation";
import styles from "./BudgetCard.module.css";

interface BudgetCardProps {
  rank?: number;
  item: {
    episodeSlug: string | null;
    filmTitle: string;
    year: number | null;
    imgFileName: string | null;
    budget: number;
    revenue: number | null;
  };
  variant?: "default" | "flop" | "success";
  detailed?: boolean;
}

export default function BudgetCard({
  rank,
  item,
  variant = "default",
  detailed = false,
}: BudgetCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  const imageUrl = item.imgFileName
    ? getUploadServerUrl(item.imgFileName)
    : null;

  const roi =
    item.revenue && item.budget > 0
      ? ((item.revenue - item.budget) / item.budget) * 100
      : null;

  const roiLabel =
    roi !== null
      ? `${roi >= 0 ? "+" : ""}${roi.toFixed(0)}%`
      : null;

  const isPositive = roi !== null && roi >= 0;

  // Animation des chiffres
  const animatedBudget = useCountAnimation(item.budget, 1200, isVisible);
  const animatedRevenue = useCountAnimation(
    item.revenue || 0,
    1200,
    isVisible && item.revenue !== null
  );

  // Badge de performance
  const getPerformanceBadge = () => {
    if (roi === null) return null;
    if (roi < -50) return { label: "FLOP", class: styles.badgeFlop };
    if (roi < 0) return { label: "PERTE", class: styles.badgeLoss };
    if (roi < 100) return { label: "HIT", class: styles.badgeHit };
    if (roi < 300) return { label: "SUCCESS", class: styles.badgeSuccess };
    return { label: "BLOCKBUSTER", class: styles.badgeBlockbuster };
  };

  const performanceBadge = getPerformanceBadge();

  // Déclencher l'animation au montage
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Link
      href={`/episodes/${item.episodeSlug || ""}`}
      className={`${styles.card} ${detailed ? styles.cardDetailed : ""} ${variant === "flop" ? styles.cardFlop : variant === "success" ? styles.cardSuccess : ""}`}
    >
      {rank !== undefined && (
        <div className={styles.rank}>#{rank}</div>
      )}

      {performanceBadge && (
        <div className={`${styles.performanceBadge} ${performanceBadge.class}`}>
          {performanceBadge.label}
        </div>
      )}

      <div className={styles.poster}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={item.filmTitle}
            fill
            sizes={detailed ? "200px" : "180px"}
            className={styles.posterImage}
          />
        ) : (
          <div className={styles.posterFallback}>🎬</div>
        )}
      </div>

      <div className={styles.info}>
        <h3 className={styles.title}>
          {item.filmTitle}
          {item.year && <span className={styles.year}> ({item.year})</span>}
        </h3>

        <div className={styles.rows}>
          <div className={styles.budgetRow}>
            <span className={styles.label}>Budget</span>
            <span className={`${styles.value} ${styles.animatedValue}`}>
              {formatBudgetShort(animatedBudget, "USD")}
              {detailed && (
                <span className={styles.eur}>
                  {" · "}{formatBudgetShort(convertUsdToEur(animatedBudget), "EUR")}
                </span>
              )}
            </span>
          </div>

          <div className={styles.budgetRow}>
            <span className={styles.label}>Box-office</span>
            <span className={`${styles.value} ${styles.animatedValue}`}>
              {item.revenue !== null && item.revenue > 0 ? (
                <>
                  {formatBudgetShort(animatedRevenue, "USD")}
                  {detailed && (
                    <span className={styles.eur}>
                      {" · "}{formatBudgetShort(convertUsdToEur(animatedRevenue), "EUR")}
                    </span>
                  )}
                </>
              ) : (
                "—"
              )}
            </span>
          </div>

          <div className={styles.budgetRow}>
            <span className={styles.label}>ROI</span>
            <span
              className={`${styles.roiValue} ${roiLabel ? (isPositive ? styles.roiPositive : styles.roiNegative) : ""}`}
            >
              {roiLabel || "—"}
            </span>
          </div>

          {roi !== null && (
            <div className={styles.roiBarContainer}>
              <div
                className={`${styles.roiBar} ${isPositive ? styles.roiBarPositive : styles.roiBarNegative}`}
                style={{
                  width: `${Math.min(Math.abs(roi), 300) / 3}%`,
                  animationDelay: "200ms",
                }}
              />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
