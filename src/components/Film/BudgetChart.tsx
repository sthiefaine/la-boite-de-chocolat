"use client";

import { useEffect, useState } from "react";
import { formatBudgetShort } from "@/helpers/budgetHelpers";
import styles from "./BudgetChart.module.css";

type ChartItem = {
  filmTitle: string;
  budget: number;
  revenue: number | null;
  year: number | null;
};

interface BudgetChartProps {
  items: ChartItem[];
  maxItems?: number;
  mode: "budget" | "roi";
}

export default function BudgetChart({
  items,
  maxItems = 8,
  mode,
}: BudgetChartProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setAnimated(false);
    const t = requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimated(true));
    });
    return () => cancelAnimationFrame(t);
  }, [items]);

  const data = items.slice(0, maxItems);
  if (data.length === 0) return null;

  // Compute max for scaling
  const allValues = data.flatMap((d) => {
    const vals = [d.budget];
    if (d.revenue && d.revenue > 0) vals.push(d.revenue);
    return vals;
  });
  const maxBudgetRevenue = Math.max(...allValues, 1);

  const maxRoi = Math.max(
    ...data.map((d) =>
      d.revenue && d.budget > 0
        ? Math.abs(((d.revenue - d.budget) / d.budget) * 100)
        : 0
    ),
    1
  );

  return (
    <div className={styles.container}>
      {mode !== "roi" && (
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={styles.dot} style={{ background: "var(--bar-budget)" }} />
            Budget
          </span>
          <span className={styles.legendItem}>
            <span className={styles.dot} style={{ background: "var(--bar-revenue)" }} />
            Box-office
          </span>
        </div>
      )}

      <div className={styles.rows}>
        {data.map((item, i) => {
          const roi =
            item.revenue && item.budget > 0
              ? ((item.revenue - item.budget) / item.budget) * 100
              : null;
          const isPositive = roi !== null && roi >= 0;

          const budgetPct = (item.budget / maxBudgetRevenue) * 100;
          const revenuePct =
            item.revenue && item.revenue > 0
              ? (item.revenue / maxBudgetRevenue) * 100
              : 0;
          const roiPct = roi !== null ? (Math.abs(roi) / maxRoi) * 100 : 0;

          return (
            <div
              key={i}
              className={styles.row}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className={styles.rowHeader}>
                <span className={styles.rank}>{i + 1}</span>
                <span className={styles.filmName}>
                  {item.filmTitle}
                  {item.year ? (
                    <span className={styles.filmYear}> ({item.year})</span>
                  ) : null}
                </span>
                <span className={styles.rowValue}>
                  {mode === "roi"
                    ? roi !== null
                      ? `${roi >= 0 ? "+" : ""}${roi.toFixed(0)}%`
                      : "—"
                    : formatBudgetShort(item.budget, "USD")}
                </span>
              </div>

              <div className={styles.bars}>
                {mode === "roi" ? (
                  <div
                    className={`${styles.bar} ${isPositive ? styles.barPositive : styles.barNegative}`}
                    style={{
                      width: animated ? `${Math.max(roiPct, 2)}%` : "0%",
                      transitionDelay: `${i * 60}ms`,
                    }}
                  />
                ) : (
                  <>
                    <div
                      className={`${styles.bar} ${styles.barBudget}`}
                      style={{
                        width: animated ? `${Math.max(budgetPct, 2)}%` : "0%",
                        transitionDelay: `${i * 60}ms`,
                      }}
                    />
                    {revenuePct > 0 && (
                      <div
                        className={`${styles.bar} ${revenuePct >= budgetPct ? styles.barRevenue : styles.barRevenueFlop}`}
                        style={{
                          width: animated
                            ? `${Math.max(revenuePct, 2)}%`
                            : "0%",
                          transitionDelay: `${i * 60 + 30}ms`,
                        }}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
