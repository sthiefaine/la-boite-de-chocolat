import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  parseTranscription,
  getTranscriptionUrl,
} from "@/helpers/transcriptionHelpers";
import { countWords, wordHash, type WordCount } from "@/helpers/wordStats";
import { SITE_URL } from "@/helpers/config";
import styles from "./TranscriptionStats.module.css";

// Page lourde (téléchargement + parsing de toutes les transcriptions) :
// régénérée au plus une fois par jour.
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Les mots du podcast — Statistiques des transcriptions",
  description:
    "La carte des mots les plus prononcés dans La Boîte de Chocolat, calculée à partir des transcriptions de nos épisodes.",
  alternates: {
    canonical: `${SITE_URL}/transcription/stats`,
  },
};

const isAdult = (age?: string | null) => age === "18+" || age === "adult";

const CLOUD_COLORS = [
  "var(--chocolate-primary, #6b3e26)",
  "var(--chocolate-secondary, #a67c52)",
  "var(--accent-gold, #d4af37)",
  "var(--accent-red, #8b2635)",
  "var(--chocolate-dark, #3d2b1f)",
];

type Stats = {
  words: WordCount[];
  episodeCount: number;
  totalWords: number;
};

async function getWordStats(): Promise<Stats | null> {
  try {
    const transcriptions = await prisma.transcription.findMany({
      include: {
        episode: {
          select: {
            age: true,
            links: { select: { film: { select: { age: true } } } },
          },
        },
      },
    });

    const publicTranscriptions = transcriptions.filter(
      (t) =>
        !isAdult(t.episode.age) && !isAdult(t.episode.links[0]?.film?.age)
    );

    if (publicTranscriptions.length === 0) return null;

    const texts = await Promise.allSettled(
      publicTranscriptions.map(async (t) => {
        const res = await fetch(getTranscriptionUrl(t.fileName));
        if (!res.ok) throw new Error(`fetch ${t.fileName}: ${res.status}`);
        const entries = parseTranscription(await res.text());
        return entries.map((e) => e.text).join(" ");
      })
    );

    const fetched = texts
      .filter(
        (r): r is PromiseFulfilledResult<string> => r.status === "fulfilled"
      )
      .map((r) => r.value);

    if (fetched.length === 0) return null;

    const allText = fetched.join(" ");
    const words = countWords(allText, 120);
    const totalWords = words.reduce((sum, w) => sum + w.count, 0);

    return { words, episodeCount: fetched.length, totalWords };
  } catch (error) {
    console.error("Erreur calcul stats transcriptions:", error);
    return null;
  }
}

// Échelle de taille : racine carrée du ratio pour lisser l'écart
// entre le mot le plus fréquent et la traîne.
function fontSize(count: number, max: number): string {
  const ratio = Math.sqrt(count / max);
  const rem = 0.85 + ratio * 2.4;
  return `${rem.toFixed(2)}rem`;
}

export default async function TranscriptionStatsPage() {
  const stats = await getWordStats();

  if (!stats) {
    return (
      <main className={styles.main}>
        <h1 className={styles.title}>Les mots du podcast</h1>
        <p className={styles.empty}>
          Les statistiques ne sont pas disponibles pour le moment. Revenez un
          peu plus tard.
        </p>
      </main>
    );
  }

  const maxCount = stats.words[0]?.count ?? 1;
  // Ordre d'affichage pseudo-aléatoire mais déterministe (stable au rendu
  // serveur) : trié par hash du mot plutôt que par fréquence.
  const cloudWords = [...stats.words].sort(
    (a, b) => wordHash(a.word) - wordHash(b.word)
  );
  const topWords = stats.words.slice(0, 20);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>Les mots du podcast</h1>
        <p className={styles.subtitle}>
          Les mots les plus prononcés dans nos épisodes, calculés à partir de{" "}
          {stats.episodeCount} transcription
          {stats.episodeCount > 1 ? "s" : ""}. Les mots outils (articles,
          pronoms, tics de langage) sont filtrés.
        </p>
      </header>

      <section className={styles.cloud} aria-label="Nuage des mots les plus utilisés">
        {cloudWords.map((w) => (
          <span
            key={w.word}
            className={styles.cloudWord}
            style={{
              fontSize: fontSize(w.count, maxCount),
              color: CLOUD_COLORS[wordHash(w.word) % CLOUD_COLORS.length],
            }}
            title={`${w.word} : ${w.count} occurrences`}
          >
            {w.word}
          </span>
        ))}
      </section>

      <section className={styles.topSection}>
        <h2 className={styles.topTitle}>Top 20</h2>
        <ol className={styles.topList}>
          {topWords.map((w, i) => (
            <li key={w.word} className={styles.topItem}>
              <span className={styles.topRank}>{i + 1}</span>
              <span className={styles.topWord}>{w.word}</span>
              <span
                className={styles.topBar}
                style={{ width: `${Math.round((w.count / maxCount) * 100)}%` }}
                aria-hidden="true"
              />
              <span className={styles.topCount}>{w.count}</span>
            </li>
          ))}
        </ol>
      </section>

      <footer className={styles.footer}>
        <p>
          Envie de lire les transcriptions complètes ? Retrouvez-les sur les{" "}
          <Link href="/episodes" className={styles.link}>
            pages des épisodes
          </Link>
          .
        </p>
      </footer>
    </main>
  );
}
