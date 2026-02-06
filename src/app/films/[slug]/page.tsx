import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getFilmBySlug } from "@/app/actions/film";
import { IMAGE_CONFIG } from "@/helpers/imageConfig";
import EpisodeCard from "@/components/Cards/EpisodeCard/EpisodeCard";
import Breadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
import { SITE_URL } from "@/helpers/config";
import { FilmJsonLd } from "./json-ld";
import styles from "./FilmPage.module.css";

interface FilmPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: FilmPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getFilmBySlug(slug);

  if (!result.success || !result.film) {
    return { title: "Film non trouvé", robots: { index: false } };
  }

  const film = result.film;
  const description = film.director
    ? `${film.title} (${film.year || "?"}) réalisé par ${film.director}. Écoutez les épisodes du podcast La Boîte de Chocolat qui parlent de ce film.`
    : `${film.title} (${film.year || "?"}). Écoutez les épisodes du podcast La Boîte de Chocolat qui parlent de ce film.`;

  return {
    title: `${film.title} ${film.year ? `(${film.year})` : ""} | La Boîte de Chocolat`,
    description,
    alternates: { canonical: `${SITE_URL}/films/${slug}` },
    openGraph: {
      title: `${film.title} | La Boîte de Chocolat`,
      description,
      type: "website",
      url: `${SITE_URL}/films/${slug}`,
    },
  };
}

function formatBudget(value: bigint | null): string | null {
  if (!value) return null;
  const num = Number(value);
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M $`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}k $`;
  return `${num} $`;
}

export default async function FilmPage({ params }: FilmPageProps) {
  const { slug } = await params;
  const result = await getFilmBySlug(slug);

  if (!result.success || !result.film) {
    notFound();
  }

  const film = result.film;
  const isAdult = film.age === "18+" || film.age === "adult";
  const imageUrl = film.imgFileName
    ? isAdult
      ? `/api/image/masked/${film.imgFileName}`
      : `${IMAGE_CONFIG.domains.uploadReadServer}/films/${film.imgFileName}`
    : null;

  const budget = formatBudget(film.budget);
  const revenue = formatBudget(film.revenue);

  const episodes = film.links.map((link: { podcast: { id: string; title: string; slug: string | null; pubDate: Date; duration: number | null; genre: string | null } }) => link.podcast);

  return (
    <>
      <FilmJsonLd film={film} />
      <main className={styles.main}>
        <div className={styles.container}>
          <Breadcrumbs
            items={[
              { label: "Accueil", href: "/" },
              { label: "Films", href: "/films" },
              { label: film.title },
            ]}
          />

          <div className={styles.filmHeader}>
            <div className={styles.posterContainer}>
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={`Poster de ${film.title}`}
                  width={300}
                  height={450}
                  className={`${styles.poster} ${isAdult ? styles.blurred : ""}`}
                  priority
                />
              ) : (
                <div className={styles.noPoster}>
                  <span>🎬</span>
                </div>
              )}
              {isAdult && (
                <div className={styles.ageBadge}>+18</div>
              )}
            </div>

            <div className={styles.filmInfo}>
              <h1 className={styles.filmTitle}>
                {film.title}
                {film.year && (
                  <span className={styles.filmYear}> ({film.year})</span>
                )}
              </h1>

              {film.director && (
                <p className={styles.director}>
                  Réalisé par <strong>{film.director}</strong>
                </p>
              )}

              {film.age && !isAdult && (
                <span className={styles.ageTag}>{film.age}</span>
              )}

              <div className={styles.metaGrid}>
                {budget && (
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Budget</span>
                    <span className={styles.metaValue}>{budget}</span>
                  </div>
                )}
                {revenue && (
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Recettes</span>
                    <span className={styles.metaValue}>{revenue}</span>
                  </div>
                )}
              </div>

              {film.saga && (
                <div className={styles.sagaInfo}>
                  <span className={styles.sagaLabel}>Saga :</span>
                  <Link href={`/sagas/${film.saga.slug}`} className={styles.sagaLink}>
                    {film.saga.name}
                  </Link>
                </div>
              )}

              {film.tmdbId && (
                <a
                  href={`https://www.themoviedb.org/movie/${film.tmdbId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.tmdbLink}
                >
                  Voir sur TMDB
                </a>
              )}
            </div>
          </div>

          {/* Épisodes liés */}
          {episodes.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                Épisode{episodes.length > 1 ? "s" : ""} lié{episodes.length > 1 ? "s" : ""}
              </h2>
              <div className={styles.episodesGrid}>
                {episodes.map((ep: { id: string; title: string; slug: string | null; pubDate: Date; duration: number | null; genre: string | null }) => (
                  <EpisodeCard
                    key={ep.id}
                    episodeId={ep.id}
                    episodeTitle={ep.title}
                    episodeDate={ep.pubDate}
                    episodeDuration={ep.duration}
                    episodeSlug={ep.slug}
                    episodeGenre={ep.genre}
                    film={{
                      id: film.id,
                      title: film.title,
                      slug: film.slug,
                      year: film.year,
                      imgFileName: film.imgFileName,
                      age: film.age,
                      saga: film.saga,
                    }}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
