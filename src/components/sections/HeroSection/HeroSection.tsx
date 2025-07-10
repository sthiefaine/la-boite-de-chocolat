"use client";

import Link from "next/link";
import ChocolateBox from "../../ChocolateBox/ChocolateBox";
import styles from "./HeroSection.module.css";

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>
            La Boîte de Chocolat
            <span className={styles.heroSubtitle}>
              le podcast qui te fait aimer le cinoche (et la mauvaise foi)
            </span>
          </h1>

          <div className={styles.ctaContainer}>
            <div className={styles.primaryButtons}>
              <Link href="#latest-episode" className={styles.ctaButton}>
                <span className={styles.ctaIcon}>🎧</span>
                Écoute le dernier épisode
              </Link>

              <Link href="#episodes" className={styles.secondaryButton}>
                <span className={styles.secondaryIcon}>📋</span>
                Voir tous les épisodes
              </Link>
            </div>
          </div>
        </div>

        <ChocolateBox />
      </div>
    </section>
  );
}
