"use client";

import Link from "next/link";
import styles from "./HeroSection.module.css";

const spotifyUrl =
  "https://open.spotify.com/show/3hoWsMUvUJTlkFKwRLcwFr?si=5e97902c65664eeb";
const applePodcastsUrl =
  "https://podcasts.apple.com/fr/podcast/la-boite-de-chocolat/id1690184934";
const rssUrl =
  "https://feeds.acast.com/public/shows/la-boite-de-chocolat-la-bdc";
const deezerUrl = "https://link.deezer.com/s/30qw2jgIFviyoWlZ0ATvr"
const instaBaseUrl = "https://www.instagram.com/";
const instagram = "laboite2chocolat";
const instagram2 = "la_boitedechocolat";
const mail = "laboitedechocolatmail@gmail.com";

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

            {/* Chocolate Box Container - Flat & Minimalist */}
            <div className={styles.chocolateBoxFlat}>
              <div className={styles.chocolateGridFlat}>
                <a
                  href={spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.chocolateFlat} ${styles.spotify}`}
                  aria-label="Écouter sur Spotify"
                >
                  <span className={styles.chocolateIconFlat}>🎵</span>
                  <span className={styles.chocolateLabel}>Spotify</span>
                </a>
                <a
                  href={applePodcastsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.chocolateFlat} ${styles.apple}`}
                  aria-label="Écouter sur Apple Podcasts"
                >
                  <span className={styles.chocolateIconFlat}>🍎</span>
                  <span className={styles.chocolateLabel}>Apple</span>
                </a>
                <a
                  href={rssUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.chocolateFlat}
                  aria-label="Flux RSS"
                >
                  <span className={styles.chocolateIconFlat}>📡</span>
                  <span className={styles.chocolateLabel}>RSS</span>
                </a>
                <a
                  href={deezerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.chocolateFlat}
                  aria-label="Écouter sur Deezer"
                >
                  <span className={styles.chocolateIconFlat}>🎧</span>
                  <span className={styles.chocolateLabel}>Deezer</span>
                </a>
                <a
                  href={`${instaBaseUrl}${instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.chocolateFlat} ${styles.instagram}`}
                  aria-label="Instagram @laboite2chocolat"
                >
                  <span className={styles.chocolateIconFlat}>📸</span>
                  <span className={styles.chocolateLabel}>@laboite2chocolat</span>
                </a>
                <a
                  href={`${instaBaseUrl}${instagram2}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.chocolateFlat} ${styles.instagram}`}
                  aria-label="Instagram @la_boitedechocolat"
                >
                  <span className={styles.chocolateIconFlat}>📸</span>
                  <span className={styles.chocolateLabel}>@la_boitedechocolat</span>
                </a>
                <a
                  href={`mailto:${mail}`}
                  className={styles.chocolateFlat}
                  aria-label="Contact par email"
                >
                  <span className={styles.chocolateIconFlat}>✉️</span>
                  <span className={styles.chocolateLabel}>Contact</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
