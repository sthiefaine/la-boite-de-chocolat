import type { Metadata } from "next";
import { getEpisodesWithFilms } from "@/app/actions/episode";
import { getAllFilms } from "@/app/actions/film";
import { getAllSagasWithStats } from "@/app/actions/saga";
import { getAllPeople } from "@/app/actions/person";
import { SITE_URL } from "@/helpers/config";
import styles from "./PlanDuSite.module.css";

// Page régénérée 1x/jour (ISR). Sert de "plan du site" HTML entièrement
// crawlable : chaque épisode/film/saga/personne reçoit ainsi un lien interne
// (une "page d'origine"), ce qui manquait au site pour l'indexation.
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Plan du site",
  description:
    "Plan du site de La Boîte de Chocolat : accédez à tous nos épisodes, films, sagas et personnalités du cinéma.",
  alternates: {
    canonical: `${SITE_URL}/plan-du-site`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

const isAdult = (age?: string | null) => age === "18+" || age === "adult";

export default async function PlanDuSitePage() {
  const [epRes, filmRes, sagaRes, peopleRes] = await Promise.all([
    getEpisodesWithFilms(),
    getAllFilms(),
    getAllSagasWithStats(),
    getAllPeople(),
  ]);

  const episodes = (epRes?.data ?? []).filter(
    (ep) => ep.slug && !isAdult(ep.age) && !isAdult(ep.links?.[0]?.film?.age)
  );

  const films = (filmRes?.success && filmRes.films ? filmRes.films : []).filter(
    (f) => f.slug && !isAdult(f.age)
  );

  const sagas = sagaRes?.success && sagaRes.data ? sagaRes.data : [];
  const people = peopleRes?.success && peopleRes.data ? peopleRes.data : [];

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Plan du site</h1>
      <p className={styles.intro}>
        Retrouvez l&apos;ensemble des contenus de La Boîte de Chocolat : tous nos
        épisodes de podcast cinéma, les films analysés, les sagas et les
        personnalités.
      </p>

      <nav aria-label="Sections principales" className={styles.section}>
        <ul className={styles.list}>
          <li><a className={styles.link} href="/">Accueil</a></li>
          <li><a className={styles.link} href="/episodes">Tous les épisodes</a></li>
          <li><a className={styles.link} href="/films">Tous les films</a></li>
          <li><a className={styles.link} href="/sagas">Toutes les sagas</a></li>
          <li><a className={styles.link} href="/people">Toutes les personnalités</a></li>
          <li><a className={styles.link} href="/episodes/top">Top épisodes</a></li>
          <li><a className={styles.link} href="/about">À propos</a></li>
        </ul>
      </nav>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Épisodes ({episodes.length})</h2>
        <ul className={styles.list}>
          {episodes.map((ep) => (
            <li key={ep.slug}>
              <a className={styles.link} href={`/episodes/${ep.slug}`}>
                {ep.title}
              </a>
            </li>
          ))}
        </ul>
      </section>

      {films.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Films ({films.length})</h2>
          <ul className={styles.list}>
            {films.map((f) => (
              <li key={f.slug}>
                <a className={styles.link} href={`/films/${f.slug}`}>
                  {f.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {sagas.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Sagas ({sagas.length})</h2>
          <ul className={styles.list}>
            {sagas.map((s) => (
              <li key={s.slug}>
                <a className={styles.link} href={`/sagas/${s.slug}`}>
                  {s.name}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {people.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Personnalités ({people.length})</h2>
          <ul className={styles.list}>
            {people.map((p) => (
              <li key={p.slug}>
                <a className={styles.link} href={`/people/${p.slug}`}>
                  {p.name}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
