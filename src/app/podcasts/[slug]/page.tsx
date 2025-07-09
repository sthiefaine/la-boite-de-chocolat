import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import styles from "./PodcastPage.module.css";
import { Metadata } from "next";

interface PodcastPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const episodes = await prisma.podcastEpisode.findMany({
    where: {
      rssFeed: {
        nameId: 'la-boite-de-chocolat'
      }
    },
    select: {
      slug: true,
    },
  });

  return episodes.map((episode) => ({
    slug: episode.slug,
  }));
}

export async function generateMetadata({ params }: PodcastPageProps): Promise<Metadata> {
  const { slug } = await params;
  const episode = await prisma.podcastEpisode.findUnique({
    where: { slug },
    include: {
      links: {
        include: {
          film: true,
        },
      },
    },
  });

  if (!episode) {
    return {
      title: 'Épisode non trouvé',
    };
  }

  const mainFilm = episode.links[0]?.film;
  const title = mainFilm?.title || episode.title;

  return {
    title: `${title} - La Boîte de Chocolat`,
    description: episode.description?.substring(0, 160) || `Écoutez l'épisode sur ${title}`,
    openGraph: {
      title: `${title} - La Boîte de Chocolat`,
      description: episode.description?.substring(0, 160) || `Écoutez l'épisode sur ${title}`,
      type: 'article',
      publishedTime: episode.pubDate.toISOString(),
      images: mainFilm?.imgFileName ? [
        {
          url: `https://cz2cmm85bs9kxtd7.public.blob.vercel-storage.com/${mainFilm.imgFileName}`,
          width: 500,
          height: 750,
          alt: `Poster de ${mainFilm.title}`,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} - La Boîte de Chocolat`,
      description: episode.description?.substring(0, 160) || `Écoutez l'épisode sur ${title}`,
      images: mainFilm?.imgFileName ? [
        `https://cz2cmm85bs9kxtd7.public.blob.vercel-storage.com/${mainFilm.imgFileName}`
      ] : [],
    },
  };
}

export default async function PodcastPage({ params }: PodcastPageProps) {
  const { slug } = await params;
  const episode = await prisma.podcastEpisode.findUnique({
    where: { slug },
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
