"use server";

import { getAllSagasWithStats } from "../actions/saga";
import SagaCard from "@/components/Cards/SagaCard/SagaCard";
import styles from "./SagasPage.module.css";

export default async function SagasPage() {
  const sagasResult = await getAllSagasWithStats();

  if (!sagasResult.success || !sagasResult.data) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>Univers des Sagas</h1>
            <p className={styles.subtitle}>
              Impossible de charger les sagas.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.titleRow}>
              <div className={styles.titleSection}>
                <h1 className={styles.title}>Univers des Sagas</h1>
                <p className={styles.subtitle}>
                  Explorez les sagas cinématographiques à travers nos épisodes
                </p>
              </div>
              <div className={styles.statsCompact}>
                <div className={styles.statCompact}>
                  <span className={styles.statValue}>{sagasResult.data.length}</span>
                  <span className={styles.statLabel}>Sagas</span>
                </div>
                <div className={styles.statDivider}></div>
                <div className={styles.statCompact}>
                  <span className={styles.statValue}>
                    {sagasResult.data.reduce((total, saga) => total + saga.films.length, 0)}
                  </span>
                  <span className={styles.statLabel}>Films</span>
                </div>
                <div className={styles.statDivider}></div>
                <div className={styles.statCompact}>
                  <span className={styles.statValue}>
                    {sagasResult.data.reduce((total, saga) => total + saga.episodeCount, 0)}
                  </span>
                  <span className={styles.statLabel}>Épisodes</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.sagasGrid}>
          {sagasResult.data.map((saga, index) => (
            <div 
              key={saga.id} 
              className={styles.sagaCardWrapper}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <SagaCard saga={saga} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
} 