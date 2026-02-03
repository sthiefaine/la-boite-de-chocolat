import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/auth-server";
import { isAdminRole, ROLE_LABELS } from "@/lib/auth/auth-helpers";
import { getUserProfileStats } from "@/app/actions/user-stats";
import EpisodeCard from "@/components/Cards/EpisodeCard/EpisodeCard";
import RatingIcon from "@/components/Rating/RatingIcon";
import styles from "./ProfilePage.module.css";

function getChocolateVariant(
  position: number,
  rating: number
): "empty" | "filled" | "golden" | "caramel" {
  if (position > rating) return "empty";
  if (rating === 1 && position === 1) return "caramel";
  if (rating === 5 && position === 5) return "golden";
  return "filled";
}

export default async function ProfilePage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/signin");
  }

  const user = session.user;
  const stats = await getUserProfileStats(user.id);
  const { data } = stats;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Hero Header */}
        <div className={styles.hero}>
          <div className={styles.heroBackground} />
          <div className={styles.heroContent}>
            <div className={styles.avatar}>
              <span className={styles.avatarText}>
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className={styles.heroInfo}>
              <h1 className={styles.heroName}>{user.name}</h1>
              <p className={styles.heroEmail}>{user.email}</p>
              <div className={styles.heroBadges}>
                <span
                  className={`${styles.roleBadge} ${
                    styles[
                      `role${
                        (user.role || "user").charAt(0).toUpperCase() +
                        (user.role || "user").slice(1)
                      }`
                    ]
                  }`}
                >
                  {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] ||
                    "Utilisateur"}
                </span>
                <span className={styles.memberSince}>
                  Membre depuis{" "}
                  {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                  })}
                </span>
              </div>
              {user.banned && (
                <div className={styles.banNotice}>
                  Compte suspendu
                  {user.banReason && ` - ${user.banReason}`}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>&#9734;</div>
            <div className={styles.statValue}>{data.favoriteCount}</div>
            <div className={styles.statLabel}>
              Favori{data.favoriteCount !== 1 ? "s" : ""}
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>&#10003;</div>
            <div className={styles.statValue}>{data.listenedCount}</div>
            <div className={styles.statLabel}>
              Écouté{data.listenedCount !== 1 ? "s" : ""}
            </div>
          </div>
          <div className={styles.statCard}>
            {data.averageRating !== null ? (
              <div className={styles.statChocolates}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <span key={n} className={styles.statChocolate}>
                    <RatingIcon
                      variant={getChocolateVariant(
                        n,
                        Math.round(data.averageRating!)
                      )}
                    />
                  </span>
                ))}
              </div>
            ) : (
              <div className={styles.statIcon}>&#9733;</div>
            )}
            <div className={styles.statValue}>
              {data.averageRating !== null ? `${data.averageRating}/5` : "-"}
            </div>
            <div className={styles.statLabel}>
              Note moyenne ({data.ratingCount} vote
              {data.ratingCount !== 1 ? "s" : ""})
            </div>
          </div>
        </div>

        {/* Admin Section - en haut */}
        {isAdminRole(user.role || null) && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Administration</h2>
            </div>
            <div className={styles.adminCard}>
              <p className={styles.adminDescription}>
                Vous avez accès aux fonctionnalités d&apos;administration.
              </p>
              <Link href="/admin" className={styles.adminLink}>
                Accéder au panneau d&apos;administration
              </Link>
            </div>
          </section>
        )}

        {/* Recent Favorites */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Mes Favoris</h2>
            {data.favoriteCount > 0 && (
              <Link href="/user/favoris" className={styles.sectionLink}>
                Voir tout ({data.favoriteCount})
              </Link>
            )}
          </div>
          {data.recentFavorites.length > 0 ? (
            <div className={styles.previewGrid}>
              {data.recentFavorites.map((fav) => {
                const film = fav.episode.links[0]?.film || undefined;
                return (
                  <EpisodeCard
                    key={fav.id}
                    episodeId={fav.episode.id}
                    episodeTitle={fav.episode.title}
                    episodeDate={fav.episode.pubDate}
                    episodeDuration={fav.episode.duration}
                    episodeSlug={fav.episode.slug}
                    episodeGenre={fav.episode.genre}
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
                );
              })}
            </div>
          ) : (
            <div className={styles.emptySection}>
              <p>Aucun favori pour le moment.</p>
              <Link href="/episodes" className={styles.browseLink}>
                Parcourir les épisodes
              </Link>
            </div>
          )}
        </section>

        {/* Recent Listened */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Récemment Écoutés</h2>
            {data.listenedCount > 0 && (
              <Link href="/user/listened" className={styles.sectionLink}>
                Voir tout ({data.listenedCount})
              </Link>
            )}
          </div>
          {data.recentListened.length > 0 ? (
            <div className={styles.previewGrid}>
              {data.recentListened.map((item) => {
                const film = item.episode.links[0]?.film || undefined;
                return (
                  <EpisodeCard
                    key={item.id}
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
                );
              })}
            </div>
          ) : (
            <div className={styles.emptySection}>
              <p>Aucun épisode écouté pour le moment.</p>
              <Link href="/episodes" className={styles.browseLink}>
                Parcourir les épisodes
              </Link>
            </div>
          )}
        </section>

        {/* Recent Ratings */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Mes Notes</h2>
            {data.ratingCount > 0 && (
              <span className={styles.sectionMeta}>
                {data.ratingCount} note{data.ratingCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          {data.recentRatings.length > 0 ? (
            <div className={styles.previewGrid}>
              {data.recentRatings.map((item) => {
                const film = item.episode.links[0]?.film || undefined;
                return (
                  <div key={item.id} className={styles.ratedCard}>
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
                    <div className={styles.ratingBadge}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <span key={n} className={styles.ratingChocolate}>
                          <RatingIcon
                            variant={getChocolateVariant(n, item.rating)}
                          />
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptySection}>
              <p>Aucune note pour le moment.</p>
              <Link href="/episodes" className={styles.browseLink}>
                Parcourir les épisodes
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
