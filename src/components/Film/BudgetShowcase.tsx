"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import BudgetCard from "./BudgetCard";
import styles from "./BudgetShowcase.module.css";

type BudgetItem = {
  filmId: string;
  episodeSlug: string | null;
  filmTitle: string;
  year: number | null;
  imgFileName: string | null;
  budget: number;
  revenue: number | null;
};

type FilterKey = "all" | "top" | "low" | "flops" | "success";

const FILTERS: { key: FilterKey; label: string; icon: string }[] = [
  { key: "all", label: "Tous", icon: "🎬" },
  { key: "top", label: "Gros budgets", icon: "💰" },
  { key: "low", label: "Petits budgets", icon: "🪙" },
  { key: "flops", label: "Flops", icon: "📉" },
  { key: "success", label: "Succès", icon: "🚀" },
];

function computeCategories(items: BudgetItem[]) {
  const topBudgets = [...items]
    .sort((a, b) => b.budget - a.budget)
    .slice(0, 12);

  const lowBudgets = [...items]
    .sort((a, b) => a.budget - b.budget)
    .slice(0, 12);

  const withRoi = items
    .filter((i) => i.revenue && i.revenue > 0)
    .map((i) => ({
      ...i,
      roi: ((i.revenue! - i.budget) / i.budget) * 100,
    }));

  const flops = withRoi
    .filter((i) => i.roi < 0)
    .sort((a, b) => a.roi - b.roi)
    .slice(0, 12);

  const successes = withRoi
    .filter((i) => i.roi > 100)
    .sort((a, b) => b.roi - a.roi)
    .slice(0, 12);

  // "All" = curated mix
  const seen = new Set<string>();
  const all: BudgetItem[] = [];
  for (const item of [...topBudgets, ...successes, ...flops]) {
    if (!seen.has(item.filmId) && all.length < 12) {
      seen.add(item.filmId);
      all.push(item);
    }
  }

  return { all, top: topBudgets, low: lowBudgets, flops, success: successes };
}

function getVariant(
  key: FilterKey
): "default" | "flop" | "success" {
  if (key === "flops") return "flop";
  if (key === "success") return "success";
  return "default";
}

export default function BudgetShowcase({ items }: { items: BudgetItem[] }) {
  const [active, setActive] = useState<FilterKey>("all");
  const carouselRef = useRef<HTMLDivElement>(null);
  const categories = computeCategories(items);

  function handleFilter(key: FilterKey) {
    if (key === active) return;

    // Use View Transitions API for smooth morphing
    // @ts-ignore - View Transitions API not yet in TypeScript types
    if (document.startViewTransition) {
      // @ts-ignore
      document.startViewTransition(() => {
        setActive(key);
      });
    } else {
      // Fallback for browsers without View Transitions support
      setActive(key);
    }
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <svg
            className={styles.headerIcon}
            viewBox="0 0 24 24"
            fill="none"
            width="28"
            height="28"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"
              fill="currentColor"
            />
          </svg>
          <h2 className={styles.title}>Budget & Box-office</h2>
        </div>
        <Link href="/episodes/budget" className={styles.viewAll}>
          Voir tout →
        </Link>
      </div>

      <div className={styles.filters}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`${styles.filterChip} ${active === f.key ? styles.filterChipActive : ""}`}
            onClick={() => handleFilter(f.key)}
          >
            <span className={styles.filterIcon}>{f.icon}</span>
            {f.label}
            <span className={styles.filterCount}>
              {categories[f.key].length}
            </span>
          </button>
        ))}
      </div>

      <div className={styles.carouselContainer}>
        {FILTERS.map((filter) => {
          const isActive = active === filter.key;
          const categoryItems = categories[filter.key];

          return (
            <div
              key={filter.key}
              ref={isActive ? carouselRef : null}
              className={`${styles.carousel} ${isActive ? styles.carouselVisible : styles.carouselHidden}`}
              aria-hidden={!isActive}
            >
              {categoryItems.map((item, index) => (
                <div
                  key={item.filmId}
                  className={styles.cardWrapper}
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <BudgetCard
                    rank={index + 1}
                    item={item}
                    variant={getVariant(filter.key)}
                  />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}
