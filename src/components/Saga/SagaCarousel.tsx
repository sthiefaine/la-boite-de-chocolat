import Link from "next/link";
import { getAllSagasWithStats } from "@/app/actions/saga";
import SagaCard from "./SagaCard";
import styles from "./SagaCarousel.module.css";

export default async function SagaCarousel() {
  const result = await getAllSagasWithStats();

  if (!result.success || !result.data || result.data.length === 0) {
    return null;
  }

  const sagas = result.data.filter((s) => s.episodeCount > 0);

  if (sagas.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Sagas</h2>
        <Link href="/episodes/sagas" className={styles.viewAll}>
          Voir tout →
        </Link>
      </div>
      <div className={styles.carousel}>
        {sagas.map((saga) => (
          <SagaCard key={saga.id} saga={saga} variant="carousel" />
        ))}
      </div>
    </section>
  );
}
