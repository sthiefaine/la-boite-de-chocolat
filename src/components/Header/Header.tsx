"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import styles from "./Header.module.css";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    console.log("Toggle menu clicked, current state:", isMenuOpen);
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>
            <Image
              src="/images/icon.png"
              alt="Logo"
              width={32}
              height={32}
              className={styles.logoIcon}
            />
          </span>
          <span className={styles.logoText}>La Boîte de Chocolat</span>
        </Link>

        <div className={styles.menuButtonContainer}>
          <button
            className={styles.menuButton}
            onClick={(e) => {
              console.log("Button clicked!");
              e.preventDefault();
              e.stopPropagation();
              toggleMenu();
            }}
            aria-label="Menu"
            type="button"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>
            Accueil
          </Link>
          <Link href="/podcasts" className={styles.navLink}>
            Podcasts
          </Link>
          <Link href="/options" className={styles.navLink}>
            Options
          </Link>
          <Link href="/admin" className={styles.navLink}>
            Admin
          </Link>
        </nav>

        <nav
          className={`${styles.mobileNav} ${
            isMenuOpen ? styles.mobileNavOpen : ""
          }`}
        >
          <Link href="/" className={styles.mobileNavLink} onClick={closeMenu}>
            Accueil
          </Link>
          <Link
            href="/podcasts"
            className={styles.mobileNavLink}
            onClick={closeMenu}
          >
            Podcasts
          </Link>
          <Link
            href="/options"
            className={styles.mobileNavLink}
            onClick={closeMenu}
          >
            Options
          </Link>
          <Link
            href="/admin"
            className={styles.mobileNavLink}
            onClick={closeMenu}
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
