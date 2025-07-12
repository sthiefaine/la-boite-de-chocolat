import styles from "./EpisodesSection.module.css";

export default function EpisodesSectionSkeleton() {
  return (
    <section className={styles.section} id="episodes">
      <h2 className={styles.title}>Les Podcasts</h2>
      <div className={styles.skeletonGrid}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className={styles.skeletonCard}>
            <div className={styles.skeletonImage} />
            <div className={styles.skeletonContent}>
              <div className={styles.skeletonTitle} />
              <div className={styles.skeletonText} />
              <div className={styles.skeletonText} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
