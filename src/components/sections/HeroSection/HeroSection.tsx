import Link from "next/link";
import ChocolateBox from "../../ChocolateBox/ChocolateBox";
import NumberFlow from "../../NumberFlow/NumberFlow";
import { IMAGE_CONFIG, getVercelBlobUrl } from "@/lib/imageConfig";
import styles from "./HeroSection.module.css";

interface Episode {
  id: string;
  title: string;
  description: string;
  pubDate: Date;
  audioUrl: string;
  duration?: number | null;
  slug: string | null;
  links: Array<{
    film: {
      id: string;
      title: string;
      slug: string;
      year: number | null;
      imgFileName: string | null;
      saga: {
        name: string;
        id: string;
      } | null;
    };
  }>;
}

interface HeroSectionProps {
  episodes: Episode[];
}

export default function HeroSection({ episodes }: HeroSectionProps) {

  const episodesNumber = episodes.length;

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
                <p>
                  Voir les{" "}
                  <span className={styles.animatedNumber}>
                    <NumberFlow value={episodesNumber} duration={2500} />
                  </span>{" "}
                  épisodes
                </p>
              </Link>
            </div>
          </div>
        </div>

        <ChocolateBox episodes={episodes} />
      </div>
    </section>
  );
}
