import { getRecommendations } from "@/app/actions/recommendations";
import EpisodeCard from "@/components/Cards/EpisodeCard/EpisodeCard";
import styles from "./RecommendationsSection.module.css";

interface RecommendationsSectionProps {
  episodeId: string;
}

export default async function RecommendationsSection({
  episodeId,
}: RecommendationsSectionProps) {
  const recommendations = await getRecommendations(episodeId, 6);

  if (recommendations.length === 0) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Vous aimerez aussi</h2>
      <div className={styles.scrollContainer}>
        <div className={styles.grid}>
          {recommendations.map((ep) => {
            const film = ep.links[0]?.film || undefined;
            return (
              <div key={ep.id} className={styles.card}>
                <EpisodeCard
                  episodeId={ep.id}
                  episodeTitle={ep.title}
                  episodeDate={ep.pubDate}
                  episodeDuration={ep.duration}
                  episodeSlug={ep.slug}
                  episodeGenre={ep.genre}
                  variant="compact"
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
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
