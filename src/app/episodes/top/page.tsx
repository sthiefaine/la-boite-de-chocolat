import { Metadata } from "next";
import {
  getTopRatedEpisodes,
  getMostListenedEpisodes,
  getMostFavoritedEpisodes,
} from "@/app/actions/top-episodes";
import EpisodeCard from "@/components/Cards/EpisodeCard/EpisodeCard";
import RatingIcon from "@/components/Rating/RatingIcon";
import Breadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
import { SITE_URL } from "@/helpers/config";
import styles from "./TopEpisodesPage.module.css";

export const metadata: Metadata = {
  title: "Top Épisodes | La Boîte de Chocolat",
  description:
    "Découvrez les épisodes les mieux notés, les plus écoutés et les plus mis en favoris du podcast La Boîte de Chocolat.",
  alternates: {
    canonical: `${SITE_URL}/episodes/top`,
  },
};

function getMedalEmoji(rank: number): string {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `${rank}`;
}

function getRatingVariant(
  position: number,
  rating: number
): "empty" | "filled" | "golden" | "caramel" {
  if (position > rating) return "empty";
  if (rating === 1 && position === 1) return "caramel";
  if (rating === 5 && position === 5) return "golden";
  return "filled";
}

export default async function TopEpisodesPage() {
  const [topRated, mostListened, mostFavorited] = await Promise.all([
    getTopRatedEpisodes(10),
    getMostListenedEpisodes(10),
    getMostFavoritedEpisodes(10),
  ]);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <Breadcrumbs
          items={[
            { label: "Accueil", href: "/" },
            { label: "Épisodes", href: "/episodes" },
            { label: "Top" },
          ]}
        />

        <div className={styles.header}>
          <h1 className={styles.title}>Top Épisodes</h1>
          <p className={styles.subtitle}>
            Les classements de la communauté
          </p>
        </div>

        {/* Mieux notés */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Mieux notés</h2>
          {topRated.length > 0 ? (
            <div className={styles.grid}>
              {topRated.map((item, index) => {
                const film = item.episode.links[0]?.film || undefined;
                return (
                  <div key={item.episode.id} className={styles.rankedCard}>
                    <div className={styles.rank}>
                      <span className={styles.rankBadge}>
                        {getMedalEmoji(index + 1)}
                      </span>
                    </div>
                    <EpisodeCard
                      episodeId={item.episode.id}
                      episodeTitle={item.episode.title}
                      episodeDate={item.episode.pubDate}
                      episodeDuration={item.episode.duration}
                      episodeSlug={item.episode.slug}
                      episodeGenre={item.episode.genre}
                      film={
                        film
                          ? {
                              id: film.id,
                              title: film.title,
                              slug: film.slug,
                              year: film.year,
                              imgFileName: film.imgFileName,
                              age: film.age,
                              saga: film.saga,
                            }
                          : undefined
                      }
                    />
                    <div className={styles.ratingRow}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <span key={n} className={styles.ratingChocolate}>
                          <RatingIcon
                            variant={getRatingVariant(
                              n,
                              Math.round(item.avgRating)
                            )}
                          />
                        </span>
                      ))}
                      <span className={styles.ratingText}>
                        {item.avgRating}/5 ({item.ratingCount})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className={styles.emptyText}>Pas encore assez de notes.</p>
          )}
        </section>

        {/* Plus écoutés */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Plus écoutés</h2>
          {mostListened.length > 0 ? (
            <div className={styles.grid}>
              {mostListened.map((item, index) => {
                const film = item.episode.links[0]?.film || undefined;
                return (
                  <div key={item.episode.id} className={styles.rankedCard}>
                    <div className={styles.rank}>
                      <span className={styles.rankBadge}>
                        {getMedalEmoji(index + 1)}
                      </span>
                    </div>
                    <EpisodeCard
                      episodeId={item.episode.id}
                      episodeTitle={item.episode.title}
                      episodeDate={item.episode.pubDate}
                      episodeDuration={item.episode.duration}
                      episodeSlug={item.episode.slug}
                      episodeGenre={item.episode.genre}
                      film={
                        film
                          ? {
                              id: film.id,
                              title: film.title,
                              slug: film.slug,
                              year: film.year,
                              imgFileName: film.imgFileName,
                              age: film.age,
                              saga: film.saga,
                            }
                          : undefined
                      }
                    />
                    <div className={styles.statRow}>
                      <span className={styles.statText}>
                        {item.listenedCount} écoute{item.listenedCount > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className={styles.emptyText}>Aucune écoute enregistrée.</p>
          )}
        </section>

        {/* Plus en favoris */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Plus en favoris</h2>
          {mostFavorited.length > 0 ? (
            <div className={styles.grid}>
              {mostFavorited.map((item, index) => {
                const film = item.episode.links[0]?.film || undefined;
                return (
                  <div key={item.episode.id} className={styles.rankedCard}>
                    <div className={styles.rank}>
                      <span className={styles.rankBadge}>
                        {getMedalEmoji(index + 1)}
                      </span>
                    </div>
                    <EpisodeCard
                      episodeId={item.episode.id}
                      episodeTitle={item.episode.title}
                      episodeDate={item.episode.pubDate}
                      episodeDuration={item.episode.duration}
                      episodeSlug={item.episode.slug}
                      episodeGenre={item.episode.genre}
                      film={
                        film
                          ? {
                              id: film.id,
                              title: film.title,
                              slug: film.slug,
                              year: film.year,
                              imgFileName: film.imgFileName,
                              age: film.age,
                              saga: film.saga,
                            }
                          : undefined
                      }
                    />
                    <div className={styles.statRow}>
                      <span className={styles.statText}>
                        {item.favoriteCount} favori{item.favoriteCount > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className={styles.emptyText}>Aucun favori enregistré.</p>
          )}
        </section>
      </div>
    </main>
  );
}
