import styles from "./StatsGrid.module.css";

interface StatItem {
  icon: string;
  value: string | number;
  label: string;
}

interface StatsGridProps {
  stats: StatItem[];
  loading?: boolean;
}

export default function StatsGrid({ stats, loading = false }: StatsGridProps) {
  return (
    <div className={styles.statsGrid}>
      {stats.map((stat, index) => (
        <div key={index} className={styles.statCard}>
          <div className={styles.statIcon}>{stat.icon}</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>
              {loading ? "..." : stat.value}
            </div>
            <div className={styles.statLabel}>{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
} 