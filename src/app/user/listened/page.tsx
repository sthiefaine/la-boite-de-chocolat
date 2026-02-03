import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/auth-server";
import { getUserListenedEpisodes } from "@/app/actions/listened";
import EpisodeCard from "@/components/Cards/EpisodeCard/EpisodeCard";
import styles from "./ListenedPage.module.css";

export const metadata = {
  title: "Mes Épisodes Écoutés",
  description: "Vos épisodes écoutés de La Boîte de Chocolat",
};

export default async function ListenedPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/signin");
  }

  const listened = await getUserListenedEpisodes(session.user.id);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Mes Épisodes Écoutés</h1>
            <p className={styles.subtitle}>
              {listened.length} épisode{listened.length !== 1 ? "s" : ""} écouté
              {listened.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className={styles.headerActions}>
            <Link href="/user/profile" className={styles.backLink}>
              ← Mon Profil
            </Link>
          </div>
        </div>

        {listened.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>&#10003;</div>
            <h2 className={styles.emptyTitle}>Aucun épisode écouté</h2>
            <p className={styles.emptyDescription}>
              Les épisodes que vous marquez comme écoutés ou que vous écoutez à
              plus de 85% apparaîtront ici.
            </p>
            <Link href="/episodes" className={styles.browseLink}>
              Parcourir les épisodes
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {listened.map((item) => {
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
        )}
      </div>
    </div>
  );
}
