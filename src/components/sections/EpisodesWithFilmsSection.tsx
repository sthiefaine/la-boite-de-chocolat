"use client";

import { useEffect, useState } from "react";
import { getEpisodesWithFilms } from "@/app/actions/episode";
import FilmsGrid from "../FilmsGrid/FilmsGrid";
import styles from "./EpisodesWithFilmsSection.module.css";

interface Episode {
  id: string;
  title: string;
  description: string;
  pubDate: Date;
  audioUrl: string;
  duration?: number | null;
  slug: string | null;
  links: Array<{
    film: {
      id: string;
      title: string;
      slug: string;
      year: number | null;
      imgFileName: string | null;
      saga: {
        name: string;
        id: string;
      } | null;
    };
  }>;
}

export default function EpisodesWithFilmsSection() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEpisodes() {
      try {
        const result = await getEpisodesWithFilms();
        if (result.success && result.data) {
          setEpisodes(result.data);
        } else {
          setError(result.error || "Erreur lors du chargement des épisodes");
        }
      } catch (err) {
        setError("Erreur lors du chargement des épisodes");
      } finally {
        setLoading(false);
      }
    }

    fetchEpisodes();
  }, []);

  if (loading) {
    return (
      <section className={styles.section}>
        <h2 className={styles.title}>Épisodes avec films</h2>
        <div className={styles.loading}>Chargement...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.section}>
        <h2 className={styles.title}>Épisodes avec films</h2>
        <div className={styles.error}>{error}</div>
      </section>
    );
  }

  if (episodes.length === 0) {
    return (
      <section className={styles.section}>
        <h2 className={styles.title}>Épisodes avec films</h2>
        <div className={styles.empty}>
          Aucun épisode lié à des films pour le moment.
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section} id="episodes">
      <h2 className={styles.title}>Les Podcasts</h2>
      <FilmsGrid episodes={episodes} />
    </section>
  );
}
