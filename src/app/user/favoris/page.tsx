import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/auth-server";
import { getUserFavorites } from "@/app/actions/favorite";
import EpisodeCard from "@/components/Cards/EpisodeCard/EpisodeCard";
import styles from "./FavorisPage.module.css";

export const metadata = {
  title: "Mes Favoris - La Boîte de Chocolat",
  description: "Vos épisodes favoris de La Boîte de Chocolat",
};

export default async function FavorisPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/signin");
  }

  const favorites = await getUserFavorites(session.user.id);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Mes Favoris</h1>
            <p className={styles.subtitle}>
              {favorites.length} épisode{favorites.length !== 1 ? "s" : ""} en
              favori
            </p>
          </div>
          <div className={styles.headerActions}>
            <Link href="/user/profile" className={styles.backLink}>
              ← Mon Profil
            </Link>
          </div>
        </div>

        {favorites.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>&#9734;</div>
            <h2 className={styles.emptyTitle}>Aucun favori</h2>
            <p className={styles.emptyDescription}>
              Ajoutez des épisodes en favoris en cliquant sur l&apos;étoile sur
              les cartes d&apos;épisodes ou sur la page d&apos;un épisode.
            </p>
            <Link href="/episodes" className={styles.browseLink}>
              Parcourir les épisodes
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {favorites.map((fav) => {
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
        )}
      </div>
    </div>
  );
}
