import Image from "next/image";
import Link from "next/link";
import { getUploadServerUrl } from "@/helpers/imageConfig";
import {
  formatBudgetShort,
  convertUsdToEur,
} from "@/helpers/budgetHelpers";
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

  return (
    <Link
      href={`/episodes/${item.episodeSlug || ""}`}
      className={`${styles.card} ${detailed ? styles.cardDetailed : ""} ${variant === "flop" ? styles.cardFlop : variant === "success" ? styles.cardSuccess : ""}`}
    >
      {rank !== undefined && (
        <div className={styles.rank}>#{rank}</div>
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
            <span className={styles.value}>
              {formatBudgetShort(item.budget, "USD")}
              {detailed && (
                <span className={styles.eur}>
                  {" · "}{formatBudgetShort(convertUsdToEur(item.budget), "EUR")}
                </span>
              )}
            </span>
          </div>

          <div className={styles.budgetRow}>
            <span className={styles.label}>Box-office</span>
            <span className={styles.value}>
              {item.revenue !== null && item.revenue > 0 ? (
                <>
                  {formatBudgetShort(item.revenue, "USD")}
                  {detailed && (
                    <span className={styles.eur}>
                      {" · "}{formatBudgetShort(convertUsdToEur(item.revenue), "EUR")}
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
        </div>
      </div>
    </Link>
  );
}
