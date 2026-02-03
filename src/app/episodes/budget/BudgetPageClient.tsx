"use client";

import { useState, useEffect, useRef } from "react";
import BudgetCard from "@/components/Film/BudgetCard";
import BudgetChart from "@/components/Film/BudgetChart";
import {
  formatBudgetShort,
  convertUsdToEur,
} from "@/helpers/budgetHelpers";
import styles from "./BudgetPage.module.css";

type BudgetItem = {
  filmId: string;
  episodeSlug: string | null;
  filmTitle: string;
  year: number | null;
  imgFileName: string | null;
  budget: number;
  revenue: number | null;
};

type TabKey = "top" | "low" | "flops" | "success";

const CURRENT_YEAR = new Date().getFullYear();

const TABS: { key: TabKey; label: string; icon: string; color: string }[] = [
  { key: "top", label: "Gros budgets", icon: "💰", color: "#c9a030" },
  { key: "low", label: "Petits budgets", icon: "🪙", color: "#8b7355" },
  { key: "flops", label: "Flops", icon: "📉", color: "#c62828" },
  { key: "success", label: "Succès", icon: "🚀", color: "#2e7d32" },
];

function computeAll(items: BudgetItem[]) {
  const top = [...items].sort((a, b) => b.budget - a.budget);
  const low = [...items].sort((a, b) => a.budget - b.budget);

  const withRoi = items
    .filter((i) => i.revenue && i.revenue > 0)
    .map((i) => ({
      ...i,
      roi: ((i.revenue! - i.budget) / i.budget) * 100,
    }));

  const flops = withRoi
    .filter((i) => i.roi < 0)
    .sort((a, b) => a.roi - b.roi);

  const success = withRoi
    .filter((i) => i.roi > 200)
    .sort((a, b) => b.roi - a.roi);

  return { top, low, flops, success };
}

function getVariant(key: TabKey): "default" | "flop" | "success" {
  if (key === "flops") return "flop";
  if (key === "success") return "success";
  return "default";
}

function getChartMode(key: TabKey): "budget" | "roi" {
  if (key === "flops" || key === "success") return "roi";
  return "budget";
}

function AnimatedCount({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const end = value;
    const duration = 600;
    const startTime = performance.now();

    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }, [value]);

  return <span ref={ref}>{display}</span>;
}

export default function BudgetPageClient({
  items,
}: {
  items: BudgetItem[];
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("top");
  const [visible, setVisible] = useState(true);
  const categories = computeAll(items);
  const current = categories[activeTab];

  function switchTab(key: TabKey) {
    if (key === activeTab) return;
    setVisible(false);
    setTimeout(() => {
      setActiveTab(key);
      setVisible(true);
    }, 200);
  }

  const totalBudget = items.reduce((s, i) => s + i.budget, 0);
  const totalRevenue = items
    .filter((i) => i.revenue && i.revenue > 0)
    .reduce((s, i) => s + i.revenue!, 0);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>Budget & Box-office</h1>
        <p className={styles.pageSubtitle}>
          Valeurs ajustées à l&apos;inflation {CURRENT_YEAR} — $ et €
        </p>

        <div className={styles.statsRow}>
          <div className={styles.statBox}>
            <span className={styles.statValue}>
              <AnimatedCount value={items.length} />
            </span>
            <span className={styles.statLabel}>films</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statBox}>
            <span className={styles.statValue}>
              {formatBudgetShort(totalBudget, "USD")}
            </span>
            <span className={styles.statSecondary}>
              {formatBudgetShort(convertUsdToEur(totalBudget), "EUR")}
            </span>
            <span className={styles.statLabel}>budget total</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statBox}>
            <span className={styles.statValue}>
              {formatBudgetShort(totalRevenue, "USD")}
            </span>
            <span className={styles.statSecondary}>
              {formatBudgetShort(convertUsdToEur(totalRevenue), "EUR")}
            </span>
            <span className={styles.statLabel}>box-office total</span>
          </div>
        </div>
      </header>

      <nav className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ""}`}
            onClick={() => switchTab(tab.key)}
            style={
              activeTab === tab.key
                ? ({ "--tab-color": tab.color } as React.CSSProperties)
                : undefined
            }
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            <span className={styles.tabLabel}>{tab.label}</span>
            <span className={styles.tabCount}>
              {categories[tab.key].length}
            </span>
          </button>
        ))}
      </nav>

      <div className={styles.tabDescription}>
        {activeTab === "top" && "Les plus gros budgets de production"}
        {activeTab === "low" && "Les plus petits budgets de production"}
        {activeTab === "flops" &&
          "Les films qui ont perdu de l'argent au box-office"}
        {activeTab === "success" && "Les films avec un ROI supérieur à 200%"}
        <span className={styles.tabResultCount}>
          {" "}— {current.length} film{current.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Chart */}
      <div
        className={`${styles.chartArea} ${visible ? styles.chartIn : styles.chartOut}`}
      >
        <BudgetChart
          items={current}
          maxItems={10}
          mode={getChartMode(activeTab)}
        />
      </div>

      {/* Card grid */}
      <div
        className={`${styles.grid} ${visible ? styles.gridIn : styles.gridOut}`}
      >
        {current.map((item, index) => (
          <div
            key={item.filmId}
            className={styles.gridCard}
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <BudgetCard
              rank={index + 1}
              item={item}
              variant={getVariant(activeTab)}
              detailed
            />
          </div>
        ))}
      </div>

      {current.length === 0 && (
        <div className={styles.emptyTab}>
          <p>Aucun film dans cette catégorie.</p>
        </div>
      )}
    </div>
  );
}
