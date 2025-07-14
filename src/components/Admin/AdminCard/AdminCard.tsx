import Link from "next/link";
import styles from "./AdminCard.module.css";

interface AdminCardProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: "chocolate" | "blue" | "green" | "purple" | "red";
  href?: string;
  onClick?: () => void;
  loading?: boolean;
  buttonText?: string;
  stats?: {
    label: string;
    value: string;
  };
}

export default function AdminCard({
  id,
  title,
  description,
  icon,
  color,
  href,
  onClick,
  loading = false,
  buttonText = "Accéder",
  stats,
}: AdminCardProps) {
  return (
    <div className={`${styles.card} ${styles[color]}`}>
      <div className={styles.cardHeader}>
        <div className={styles.cardIcon}>{icon}</div>
        <div className={styles.cardTitle}>{title}</div>
      </div>

      <p className={styles.cardDescription}>{description}</p>

      {stats && (
        <div className={styles.cardStats}>
          <span className={styles.cardStatValue}>{stats.value}</span>
          <span className={styles.cardStatLabel}>{stats.label}</span>
        </div>
      )}

      <div className={styles.cardActions}>
        {href ? (
          <Link href={href} className={styles.cardButton}>
            {buttonText}
            <span className={styles.buttonArrow}>→</span>
          </Link>
        ) : (
          <button
            onClick={onClick}
            disabled={loading}
            className={styles.cardButton}
          >
            {loading ? "Chargement..." : buttonText}
            {!loading && <span className={styles.buttonArrow}>→</span>}
          </button>
        )}
      </div>
    </div>
  );
}
