import { prisma } from "@/lib/prisma";
import Link from "next/link";
import styles from "./EpisodeEdit.module.css";
import {
  linkEpisodeToFilm,
  unlinkEpisodeFromFilm,
} from "@/app/actions/episode";
import FilmSelector from "./FilmSelector";
import FilmPoster from "@/components/FilmPoster";
import FormattedDescription from "@/components/PodcastDescription";
import TabNavigation from "./TabNavigation";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getEpisode(id: string) {
  const episode = await prisma.podcastEpisode.findUnique({
    where: { id },
    include: {
      rssFeed: true,
      links: {
        include: {
          film: {
            select: {
              id: true,
              title: true,
              year: true,
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
            <h1 className={styles.errorTitle}>Épisode non trouvé</h1>
            <p className={styles.errorDescription}>
              L&apos;épisode que vous recherchez n&apos;existe pas.
            </p>
            <Link href="/admin" className={styles.backButton}>
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
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div>
              <h1 className={styles.title}>Éditer l&apos;épisode</h1>
              <p className={styles.subtitle}>{episode.title}</p>
            </div>
            <div className={styles.actions}>
              <Link
                href={`/admin/list/podcast/${episode.rssFeed.nameId}`}
                className={styles.backButton}
              >
                ← Retour à la liste
              </Link>
            </div>
          </div>
        </div>

        <TabNavigation>
          {/* Tabs */}
          <div className={styles.tabsContainer}>
            <div className={styles.tabs}>
              <button className={`${styles.tab} ${styles.tabActive}`} data-tab="info">
                📋 Informations
              </button>
              <button className={styles.tab} data-tab="films">
                🎬 Films liés
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className={styles.tabContent}>
          {/* Info Tab */}
          <div className={`${styles.tabPanel} ${styles.tabPanelActive}`} data-tab="info">
            <div className={styles.episodeInfo}>
              <div className={styles.infoCard}>
                <h3 className={styles.infoTitle}>Informations</h3>
                <div className={styles.infoContent}>
                  <p>
                    <strong>Titre :</strong> {episode.title}
                  </p>
                  <p>
                    <strong>Date :</strong>{" "}
                    {new Date(episode.pubDate).toLocaleDateString("fr-FR")}
                  </p>
                  <p>
                    <strong>Description :</strong>
                  </p>
                  <div className={styles.descriptionContainer}>
                    <div className={styles.descriptionSection}>
                      <h4 className={styles.descriptionTitle}>Description brute</h4>
                      <p className={styles.description}>{episode.description}</p>
                    </div>
                    <div className={styles.descriptionSection}>
                      <h4 className={styles.descriptionTitle}>Aperçu formaté</h4>
                      <div className={styles.formattedDescription}>
                        <FormattedDescription description={episode.description} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.infoCard}>
                <h3 className={styles.infoTitle}>Audio</h3>
                <div className={styles.infoContent}>
                  <a
                    href={episode.audioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.audioLink}
                  >
                    Écouter l&apos;épisode →
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Films Tab */}
          <div className={styles.tabPanel} data-tab="films">
            <div className={styles.filmsSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Films liés</h2>
                <p className={styles.sectionDescription}>
                  Gérez les liens entre cet épisode et les films
                </p>
              </div>

              {/* Current Links */}
              <div className={styles.currentLinks}>
                <h3 className={styles.subsectionTitle}>Films actuellement liés</h3>
                {episode.links.length > 0 ? (
                  <div className={styles.linksList}>
                    {episode.links.map((link) => (
                      <div key={link.id} className={styles.linkItem}>
                        <div className={styles.filmInfo}>
                          <div className={styles.filmPoster}>
                            <FilmPoster 
                              imgFileName={link.film.imgFileName} 
                              title={link.film.title}
                              size="small"
                            />
                          </div>
                          <div className={styles.filmDetails}>
                            <span className={styles.filmTitle}>
                              {link.film.title}
                              {link.film.year && ` (${link.film.year})`}
                            </span>
                            {link.film.saga && (
                              <span className={styles.filmSaga}>
                                Saga : {link.film.saga.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <form
                          action={async () => {
                            "use server";
                            await unlinkEpisodeFromFilm(episode.id, link.film.id);
                          }}
                        >
                          <button type="submit" className={styles.unlinkButton}>
                            Retirer le lien
                          </button>
                        </form>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.noLinks}>Aucun film lié pour le moment.</p>
                )}
              </div>

              {/* Add New Link */}
              <div className={styles.addLink}>
                <h3 className={styles.subsectionTitle}>
                  Ajouter un lien vers un film
                </h3>
                <FilmSelector
                  episodeId={episode.id}
                  existingFilms={films}
                  podcastName={episode.title}
                />
              </div>
            </div>
          </div>
          </div>
        </TabNavigation>
      </div>
    </div>
  );
}
