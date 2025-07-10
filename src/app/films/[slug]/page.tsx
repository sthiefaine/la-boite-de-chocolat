import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getFilmBySlug } from "@/app/actions/film";
import { IMAGE_CONFIG, getVercelBlobUrl } from "@/lib/imageConfig";
import styles from "./FilmPage.module.css";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function FilmPage({ params }: PageProps) {
  const slugParts = (await params).slug.split("-");
  const slug = slugParts.slice(0, -1).join("-");

  const result = await getFilmBySlug(slug);

  if (!result.success || !result.film) {
    notFound();
  }

  const film = result.film;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <Link href="/" className={styles.backLink}>
            ← Retour à l'accueil
          </Link>
        </div>

        <div className={styles.filmDetails}>
          <div className={styles.posterSection}>
            {film.imgFileName ? (
              <div className={styles.posterContainer}>
                <Image
                  src={getVercelBlobUrl(film.imgFileName)}
                  alt={`Poster de ${film.title}`}
                  width={300}
                  height={450}
                  className={styles.poster}
                  priority
                  placeholder="blur"
                  blurDataURL={IMAGE_CONFIG.defaultBlurDataURL}
                  quality={IMAGE_CONFIG.defaultQuality}
                />
              </div>
            ) : (
              <div className={styles.noPoster}>
                <span>🎬</span>
                <p>Aucune image disponible</p>
              </div>
            )}
          </div>

          <div className={styles.infoSection}>
            <h1 className={styles.title}>{film.title}</h1>

            <div className={styles.metadata}>
              {film.year && <span className={styles.year}>{film.year}</span>}
              {film.director && (
                <span className={styles.director}>
                  Réalisé par {film.director}
                </span>
              )}
              {film.saga && (
                <div className={styles.saga}>
                  <span className={styles.sagaLabel}>Saga :</span>
                  <span className={styles.sagaName}>{film.saga.name}</span>
                </div>
              )}
            </div>

            {film.links && film.links.length > 0 && (
              <div className={styles.episodesSection}>
                <h2 className={styles.episodesTitle}>Épisodes liés</h2>
                <div className={styles.episodesList}>
                  {film.links.map((link) => (
                    <div key={link.id} className={styles.episodeCard}>
                      <div className={styles.episodeInfo}>
                        <h3 className={styles.episodeTitle}>
                          {link.podcast.title}
                        </h3>
                        <p className={styles.episodeDate}>
                          {new Date(link.podcast.pubDate).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </p>
                        {link.podcast.duration && (
                          <p className={styles.episodeDuration}>
                            Durée : {Math.floor(link.podcast.duration / 60)}:
                            {(link.podcast.duration % 60)
                              .toString()
                              .padStart(2, "0")}
                          </p>
                        )}
                      </div>
                      <a
                        href={link.podcast.audioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.listenButton}
                      >
                        Écouter
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
