"use client";

import Link from "next/link";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>🍫</span>
          <span className={styles.logoText}>La Boîte de Chocolat</span>
        </Link>

        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>
            Accueil
          </Link>
          <Link href="/admin" className={styles.navLink}>
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
