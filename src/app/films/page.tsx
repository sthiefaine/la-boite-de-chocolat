import { Metadata } from "next";
import { getAllFilms } from "@/app/actions/film";
import FilmCard from "@/components/Cards/FilmCard/FilmCard";
import Breadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
import { SITE_URL } from "@/helpers/config";
import styles from "./FilmsPage.module.css";

export const metadata: Metadata = {
  title: "Tous les Films | La Boîte de Chocolat",
  description:
    "Retrouvez tous les films analysés dans le podcast La Boîte de Chocolat. Critiques, avis et discussions sur le cinéma.",
  alternates: {
    canonical: `${SITE_URL}/films`,
  },
};

export default async function FilmsPage() {
  const result = await getAllFilms();
  const films = result.success && result.films ? result.films : [];

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <Breadcrumbs
          items={[
            { label: "Accueil", href: "/" },
            { label: "Films" },
          ]}
        />

        <div className={styles.header}>
          <h1 className={styles.title}>Tous les Films</h1>
          <p className={styles.subtitle}>
            {films.length} film{films.length > 1 ? "s" : ""} analysé{films.length > 1 ? "s" : ""} dans le podcast
          </p>
        </div>

        <div className={styles.grid}>
          {films.map((film) => (
            <FilmCard
              key={film.id}
              film={{
                id: film.id,
                title: film.title,
                slug: film.slug,
                year: film.year,
                imgFileName: film.imgFileName,
                age: film.age,
                director: film.director,
                saga: film.saga ? { id: film.saga.id, name: film.saga.name } : null,
              }}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
