import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import styles from "./PodcastPage.module.css";

interface PodcastPageProps {
  params: {
    slug: string;
  };
}

export default async function PodcastPage({ params }: PodcastPageProps) {
  const episode = await prisma.podcastEpisode.findUnique({
    where: { slug: params.slug },
    include: {
      links: {
        include: {
          film: {
            include: {
              saga: true,
            },
          },
        },
      },
      rssFeed: true,
    },
  });

  if (!episode) {
    notFound();
  }

  const mainFilm = episode.links[0]?.film;

  return (
    <div className={styles.container}>
      {/* Header avec poster en background */}
      <div className={styles.header}>
        {mainFilm?.imgFileName && (
          <div className={styles.backgroundPoster}>
            <Image
              src={`https://cz2cmm85bs9kxtd7.public.blob.vercel-storage.com/${mainFilm.imgFileName}`}
              alt={`Poster de ${mainFilm.title}`}
              fill
              className={styles.backgroundImage}
              sizes="100vw"
              priority
            />
            <div className={styles.backgroundOverlay}></div>
          </div>
        )}

        <div className={styles.headerContent}>
          <div className={styles.headerInfo}>
            <div className={styles.titleSection}>
              <h1 className={styles.title}>
                {mainFilm?.title || episode.title}
              </h1>
              {mainFilm?.year && (
                <span className={styles.year}>({mainFilm.year})</span>
              )}
            </div>

            {mainFilm?.director && (
              <div className={styles.director}>de {mainFilm.director}</div>
            )}

            <div className={styles.buttons}>
              <a
                href={episode.audioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.button}
              >
                <span className={styles.buttonIcon}>🎧</span>
                Écouter
              </a>
              <a href={episode.audioUrl} download className={styles.button}>
                <span className={styles.buttonIcon}>⬇️</span>
                Télécharger
              </a>
              {mainFilm?.tmdbId && (
                <a
                  href={`https://www.themoviedb.org/movie/${mainFilm.tmdbId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.button}
                >
                  <span className={styles.buttonIcon}>🎬</span>
                  TMDB
                </a>
              )}
            </div>

            <div className={styles.publicationDate}>
              Publié le{" "}
              {new Date(episode.pubDate).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
