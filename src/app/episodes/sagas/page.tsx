import { getAllSagasWithStats } from "@/app/actions/saga";
import SagaCard from "@/components/Saga/SagaCard";
import { Metadata } from "next";
import styles from "./SagasPage.module.css";

export const metadata: Metadata = {
  title: "Sagas Cinéma - Films par Saga",
  description:
    "Retrouvez toutes les sagas de films analysées dans notre podcast : Marvel, Star Wars, Harry Potter et bien d'autres. Critiques et épisodes pour chaque saga.",
};

export default async function SagasPage() {
  const result = await getAllSagasWithStats();

  if (!result.success || !result.data) {
    return (
      <div className={styles.empty}>
        <p>Impossible de charger les sagas.</p>
      </div>
    );
  }

  const sagas = result.data.filter((s) => s.episodeCount > 0);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Sagas</h1>
        <p className={styles.subtitle}>
          {sagas.length} saga{sagas.length > 1 ? "s" : ""} chroniquée
          {sagas.length > 1 ? "s" : ""}
        </p>
      </header>

      <div className={styles.grid}>
        {sagas.map((saga) => (
          <SagaCard key={saga.id} saga={saga} variant="grid" />
        ))}
      </div>
    </div>
  );
}
