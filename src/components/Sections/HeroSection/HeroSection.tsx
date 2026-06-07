import Link from "next/link";
import ChocolateBox from "../../ChocolateBox/ChocolateBox";
import NumberFlow from "../../NumberFlow/NumberFlow";
import PodcastBackground from "./PodcastBackground";
import styles from "./HeroSection.module.css";
import { Episode } from "@/app/page";
import { PODCAST_URLS } from "@/helpers/config";

const LISTEN_LINKS = [
  { label: "Spotify", href: PODCAST_URLS.spotify, icon: "🎵" },
  { label: "Apple Podcasts", href: PODCAST_URLS.apple, icon: "🍎" },
  { label: "Deezer", href: PODCAST_URLS.deezer, icon: "🎶" },
] as const;

interface HeroSectionProps {
  episodes: Episode[];
}

export default function HeroSection({ episodes }: HeroSectionProps) {
  const episodesNumber = episodes.length;

  return (
    <section className={styles.hero}>
      <PodcastBackground />
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
                <p>
                  Voir les{" "}
                  <span className={styles.animatedNumber}>
                    <NumberFlow value={episodesNumber} duration={2000} />
                  </span>{" "}
                  épisodes
                </p>
              </Link>
            </div>

            <div className={styles.listenOn}>
              <span className={styles.listenLabel}>Écouter sur</span>
              <div className={styles.listenLinks}>
                {LISTEN_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.listenLink}
                    aria-label={`Écouter La Boîte de Chocolat sur ${link.label} (nouvel onglet)`}
                  >
                    <span className={styles.listenIcon} aria-hidden="true">
                      {link.icon}
                    </span>
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <ChocolateBox episodes={episodes} />
      </div>
    </section>
  );
}
