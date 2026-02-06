import { Metadata } from "next";
import { getSagaBySlug, getAllSagaSlugs } from "../../actions/saga";
import { getSagaWithFilmsAndEpisodes } from "../../actions/saga";
import { notFound } from "next/navigation";
import FilmCard from "@/components/Cards/FilmCard/FilmCard";
import Image from "next/image";
import { getUploadServerUrl } from "@/helpers/imageConfig";
import { SITE_URL } from "@/helpers/config";
import Breadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
import { SagaJsonLd } from "./json-ld";
import styles from "./SagaDetailPage.module.css";

interface SagaDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const result = await getAllSagaSlugs();

  if (!result.success || !result.data) {
    return [];
  }

  return result.data.map((saga) => ({
    slug: saga.slug,
  }));
}

export async function generateMetadata({
  params,
}: SagaDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const sagaResult = await getSagaBySlug(slug);

  if (!sagaResult.success || !sagaResult.data) {
    return {
      title: "Saga non trouvée",
      robots: { index: false },
    };
  }

  const saga = sagaResult.data;
  const filmCount = saga.films.length;
  const description = saga.description
    ? saga.description.slice(0, 155)
    : `Découvrez les ${filmCount} films de la saga ${saga.name} analysés dans notre podcast cinéma. Critiques et avis sur chaque film.`;

  return {
    title: `${saga.name} - Saga Cinéma`,
    description,
    alternates: {
      canonical: `${SITE_URL}/sagas/${slug}`,
    },
    openGraph: {
      title: `Saga ${saga.name} | La Boîte de Chocolat`,
      description,
      type: "website",
      url: `${SITE_URL}/sagas/${slug}`,
    },
  };
}

export default async function SagaDetailPage({ params }: SagaDetailPageProps) {
  const { slug } = await params;
  const sagaResult = await getSagaBySlug(slug);

  if (!sagaResult.success || !sagaResult.data) {
    notFound();
  }

  const saga = sagaResult.data;

  const sagaWithEpisodes = await getSagaWithFilmsAndEpisodes(saga.id);

  if (!sagaWithEpisodes) {
    notFound();
  }

  const validFilms = saga.films.filter(
    (film) => film !== undefined && film.year !== null
  );

  return (
    <main className={styles.main}>
      <SagaJsonLd saga={saga} />
      <div className={styles.container}>
        <Breadcrumbs
          items={[
            { label: "Accueil", href: "/" },
            { label: "Sagas", href: "/episodes/sagas" },
            { label: saga.name },
          ]}
        />
        <div className={styles.header}>
          <div className={styles.headerImageContainer}>
            {saga.imgFileName && (
              <Image
                src={getUploadServerUrl(saga.imgFileName, "sagas")}
                alt={`${saga.name} - Saga`}
                width={120}
                height={180}
                className={styles.headerImage}
                priority
              />
            )}
          </div>
          <div className={styles.headerContent}>
            <div className={styles.headerTop}>
              <h1 className={styles.title}>{saga.name}</h1>
              <div className={styles.headerTopRight}>
                {validFilms.length > 0 && (
                  <div className={styles.yearRange}>
                    {Math.min(...validFilms.map((f) => f.year!))} -{" "}
                    {Math.max(...validFilms.map((f) => f.year!))}
                  </div>
                )}
                {saga.tmdbId && (
                  <a
                    href={`https://www.themoviedb.org/collection/${saga.tmdbId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.tmdbLink}
                  >
                    <span className={styles.tmdbIcon}>🎬</span>
                    <span className={styles.tmdbText}>TMDB</span>
                  </a>
                )}
              </div>
            </div>
            {saga.description && (
              <p className={styles.description}>{saga.description}</p>
            )}
            <div className={styles.stats}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>🎭</div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{validFilms.length}</div>
                  <div className={styles.statLabel}>
                    Film{validFilms.length > 1 ? "s" : ""}
                  </div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>🎧</div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{saga.episodeCount}</div>
                  <div className={styles.statLabel}>
                    Épisode{saga.episodeCount > 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.sagaSection}>
          <div className={styles.sagaContainer}>
            <div className={styles.sagaFilmsGrid}>
              {validFilms.map((film) => {
                const episode = sagaWithEpisodes.filmToEpisodeMap.get(film.id);

                return (
                  <div key={film.id} className={styles.sagaFilmCard}>
                    <FilmCard
                      film={{
                        id: film.id,
                        title: film.title,
                        slug: film.slug,
                        year: film.year || null,
                        imgFileName: film.imgFileName,
                        age: film.age,
                        director: film.director || null,
                        saga: {
                          id: saga.id,
                          name: saga.name,
                        },
                      }}
                      episode={episode}
                      variant="compact"
                      imageConfig={{
                        lazy: true,
                        priority: false,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
