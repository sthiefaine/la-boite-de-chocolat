"use client";

import Link from "next/link";
import {
  PODCAST_URLS,
  SOCIAL_URLS,
  CONTACT_URLS,
  INTERNAL_URLS,
} from "../../lib/config";
import styles from "./ChocolateBox.module.css";

interface ChocolateBoxProps {
  className?: string;
}

export default function ChocolateBox({ className }: ChocolateBoxProps) {
  return (
    <div className={`${styles.chocolateBox} ${className || ""}`}>
      <div className={styles.coffret}>
        <div className={styles.box3D}>
        <div className={styles.hole}>
            <a
              href={PODCAST_URLS.apple}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.choco} ${styles.apple}`}
              data-platform="apple"
            >
              <span className={styles.chocoIcon}>🍎</span>
              <span className={styles.chocoLabel}>Apple</span>
            </a>
          </div>
          <div className={styles.hole}>
            <a
              href={PODCAST_URLS.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.choco} ${styles.spotify}`}
              data-platform="spotify"
            >
              <span className={styles.chocoIcon}>🎵</span>
              <span className={styles.chocoLabel}>Spotify</span>
            </a>
          </div>
          <div className={styles.hole}>
            <a
              href={PODCAST_URLS.deezer}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.choco} ${styles.deezer}`}
              data-platform="deezer"
            >
              <span className={styles.chocoIcon}>🎧</span>
              <span className={styles.chocoLabel}>Deezer</span>
            </a>
          </div>
          <div className={styles.hole}>
            <a
              href={CONTACT_URLS.email}
              className={`${styles.choco} ${styles.email}`}
              data-platform="email"
            >
              <span className={styles.chocoIcon}>✉️</span>
              <span className={styles.chocoLabel}>Mail</span>
            </a>
          </div>
          <div className={styles.hole}>
            <a
              href={SOCIAL_URLS.instagram1}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.choco} ${styles.instagram1}`}
              data-platform="instagram1"
            >
              <span className={styles.chocoIcon}>📸</span>
              <span className={styles.chocoLabel}>@laboite2</span>
            </a>
          </div>
          <div className={styles.hole}>
            <a
              href={SOCIAL_URLS.instagram2}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.choco} ${styles.instagram2}`}
              data-platform="instagram2"
            >
              <span className={styles.chocoIcon}>📱</span>
              <span className={styles.chocoLabel}>@la_boite</span>
            </a>
          </div>
          <div className={styles.hole}>
            <a
              href={PODCAST_URLS.rss}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.choco} ${styles.rss}`}
              data-platform="rss"
            >
              <span className={styles.chocoIcon}>📡</span>
              <span className={styles.chocoLabel}>RSS</span>
            </a>
          </div>
          <div className={styles.hole}>
          </div>
          <div className={styles.hole}>
            <Link
              href={INTERNAL_URLS.bonus}
              className={`${styles.choco} ${styles.bonus}`}
              data-platform="bonus"
            >
              <span className={styles.chocoIcon}>🎁</span>
              <span className={styles.chocoLabel}>Bonus</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
