import styles from "./RatingStarsSkeleton.module.css";

export default function RatingStarsSkeleton() {
  return (
    <div className={styles.ratingSkeleton}>
      <div className={styles.headerSkeleton}>
        <div className={styles.titleSkeleton}></div>
        <div className={styles.statsSkeleton}>
          <div className={styles.averageSkeleton}></div>
          <div className={styles.totalSkeleton}></div>
        </div>
      </div>

      <div className={styles.starsSkeleton}>
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star} className={styles.starSkeleton}></div>
        ))}
      </div>

      <div className={styles.infoSkeleton}></div>
    </div>
  );
}
