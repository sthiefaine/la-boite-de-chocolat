import { PODCAST_URLS, SOCIAL_URLS, CONTACT_URLS } from "@/helpers/config";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.row}>
          <span className={styles.label}>Écouter sur</span>
          <nav aria-label="Plateformes de podcast" className={styles.links}>
            <a
              href={PODCAST_URLS.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Spotify
            </a>
            <a
              href={PODCAST_URLS.apple}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Apple Podcasts
            </a>
            <a
              href={PODCAST_URLS.deezer}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Deezer
            </a>
          </nav>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Nous suivre</span>
          <nav aria-label="Réseaux sociaux et contact" className={styles.links}>
            <a
              href={`${SOCIAL_URLS.instagramBase}${SOCIAL_URLS.instagram1}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              @{SOCIAL_URLS.instagram1}
            </a>
            <a
              href={`${SOCIAL_URLS.instagramBase}${SOCIAL_URLS.instagram2}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              @{SOCIAL_URLS.instagram2}
            </a>
            <a
              href={CONTACT_URLS.email}
              className={styles.link}
            >
              Contact
            </a>
          </nav>
        </div>

        <div className={styles.credits}>
          <p className={styles.text}>
            Les images de films sont fournies par{" "}
            <a
              href="https://www.themoviedb.org"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              TMDb
            </a>
          </p>
          <span className={styles.separator} aria-hidden="true">·</span>
          <p className={styles.text}>© 2023-2026 La Boîte de Chocolat</p>
        </div>
      </div>
    </footer>
  );
}
