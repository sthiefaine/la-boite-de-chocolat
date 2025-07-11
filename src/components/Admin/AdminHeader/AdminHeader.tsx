import Link from "next/link";
import styles from "./AdminHeader.module.css";

interface AdminHeaderProps {
  title: string;
  subtitle: string;
  backHref?: string;
  backText?: string;
  actions?: React.ReactNode;
}

export default function AdminHeader({
  title,
  subtitle,
  backHref = "/",
  backText = "Retour au site",
  actions
}: AdminHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.headerContent}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
      <div className={styles.headerActions}>
        {actions}
        <Link href={backHref} className={styles.backButton}>
          <span className={styles.backIcon}>←</span>
          {backText}
        </Link>
      </div>
    </div>
  );
} 