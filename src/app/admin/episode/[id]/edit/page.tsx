import { prisma } from "@/lib/prisma";
import Link from "next/link";
import styles from "./EpisodeEdit.module.css";
import EpisodeEditClient from "./components/EpisodeEdit/EpisodeEditClient";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getEpisode(id: string) {
  const episode = await prisma.podcastEpisode.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      duration: true,
      pubDate: true,
      audioUrl: true,
      slug: true,
      season: true,
      episode: true,
      genre: true,
      imgFileName: true,
      age: true,
      rssFeed: {
        select: {
          id: true,
          name: true,
          url: true,
        },
      },
      links: {
        select: {
          id: true,
          film: {
            select: {
              id: true,
              title: true,
              year: true,
              director: true,
              imgFileName: true,
              saga: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });
  return episode;
}

async function getFilms() {
  const films = await prisma.film.findMany({
    orderBy: { title: "asc" },
    select: {
      id: true,
      title: true,
      year: true,
      director: true,
      imgFileName: true,
      saga: {
        select: {
          name: true,
        },
      },
    },
  });
  return films;
}

export default async function EpisodeEditPage({ params }: PageProps) {
  const { id } = await params;
  const episode = await getEpisode(id);
  const films = await getFilms();

  if (!episode) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.errorState}>
            <div className={styles.errorIcon}>❌</div>
            <h1 className={styles.errorTitle}>Épisode non trouvé</h1>
            <p className={styles.errorDescription}>
              L&apos;épisode que vous recherchez n&apos;existe pas.
            </p>
            <Link href="/admin" className={styles.errorBackButton}>
              ← Retour à l&apos;administration
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <EpisodeEditClient 
          episode={episode as any}
          episodeLinks={episode.links as any}
        />
      </div>
    </div>
  );
}
