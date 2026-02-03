import Link from "next/link";
import styles from "./Breadcrumbs.module.css";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  variant?: "default" | "light";
}

export default function Breadcrumbs({ items, variant = "default" }: BreadcrumbsProps) {
  return (
    <nav aria-label="Fil d'Ariane" className={`${styles.breadcrumbs} ${variant === "light" ? styles.light : ""}`}>
      <ol className={styles.list}>
        {items.map((item, index) => (
          <li key={index} className={styles.item}>
            {index > 0 && <span className={styles.separator}>/</span>}
            {item.href ? (
              <Link href={item.href} className={styles.link}>
                {item.label}
              </Link>
            ) : (
              <span className={styles.current}>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
