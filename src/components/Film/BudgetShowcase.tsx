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
  const [animating, setAnimating] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const categories = computeCategories(items);
  const current = categories[active];

  function handleFilter(key: FilterKey) {
    if (key === active) return;
    setAnimating(true);
    setTimeout(() => {
      setActive(key);
      setAnimating(false);
      carouselRef.current?.scrollTo({ left: 0, behavior: "smooth" });
    }, 200);
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
            <circle cx="12" cy="12" r="10" fill="url(#coinGrad)" />
            <text
              x="12"
              y="16"
              textAnchor="middle"
              fontSize="11"
              fontWeight="bold"
              fill="#7c5a2a"
            >
              $
            </text>
            <defs>
              <linearGradient id="coinGrad" x1="0" y1="0" x2="24" y2="24">
                <stop offset="0%" stopColor="#f0d060" />
                <stop offset="100%" stopColor="#c9a030" />
              </linearGradient>
            </defs>
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

      <div
        ref={carouselRef}
        className={`${styles.carousel} ${animating ? styles.carouselOut : styles.carouselIn}`}
      >
        {current.map((item, index) => (
          <div
            key={item.filmId}
            className={styles.cardWrapper}
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <BudgetCard
              rank={index + 1}
              item={item}
              variant={getVariant(active)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
