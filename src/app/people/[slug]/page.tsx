import { notFound } from "next/navigation";
import Image from "next/image";
import styles from "./PersonPage.module.css";
import { getAllPersonSlugs, getPersonBySlug } from "@/app/actions/person";
import { getUploadServerUrl, IMAGE_CONFIG } from "@/helpers/imageConfig";
import { generateMetadata } from "./metadata";
import Breadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
import FilmCard from "@/components/Cards/FilmCard/FilmCard";
import { PersonJsonLd } from "./json-ld";

interface PersonPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export { generateMetadata };

export async function generateStaticParams() {
  const result = await getAllPersonSlugs();

  if (!result.success || !result.data) {
    return [];
  }

  return result.data.map((person) => ({
    slug: person.slug,
  }));
}

export default async function PersonPage({ params }: PersonPageProps) {
  const { slug } = await params;
  const result = await getPersonBySlug(slug);

  if (!result.success || !result.person) {
    notFound();
  }

  const { person } = result;

  return (
    <div className={styles.container}>
      <PersonJsonLd person={person} />
      <Breadcrumbs
        variant="light"
        items={[
          { label: "Accueil", href: "/" },
          { label: "Personnes", href: "/people" },
          { label: person.name },
        ]}
      />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          {person.photoFileName && (
            <div className={styles.profileImage}>
              <Image
                src={getUploadServerUrl(person.photoFileName, "people")}
                alt={person.name}
                width={200}
                height={200}
                className={styles.avatar}
                quality={IMAGE_CONFIG.defaultQuality}
                priority
              />
            </div>
          )}
          <div className={styles.heroInfo}>
            <h1 className={styles.name}>{person.name}</h1>
            <div className={styles.stats}>
              {person.directedFilms.length > 0 && (
                <span className={styles.stat}>
                  🎬 {person.directedFilms.length} film
                  {person.directedFilms.length > 1 ? "s" : ""} réalisé
                  {person.directedFilms.length > 1 ? "s" : ""}
                </span>
              )}
              {person.actedFilms.length > 0 && (
                <span className={styles.stat}>
                  🎭 {person.actedFilms.length} film
                  {person.actedFilms.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Films as Director */}
      {person.directedFilms.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.icon}>🎬</span>
            Réalisation ({person.directedFilms.length})
          </h2>
          <div className={styles.filmsGrid}>
            {person.directedFilms.map((film) => (
              <div key={film.id} className={styles.filmCardWrapper}>
                <FilmCard
                  film={{
                    id: film.id,
                    title: film.title,
                    slug: film.slug,
                    year: film.year || null,
                    imgFileName: film.imgFileName,
                    age: film.age,
                    director: film.director || null,
                  }}
                  episode={film.links?.[0]?.podcast}
                  variant="compact"
                  imageConfig={{ lazy: true, priority: false }}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Films as Actor */}
      {person.actedFilms.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.icon}>🎭</span>
            Distribution ({person.actedFilms.length})
          </h2>
          <div className={styles.filmsGrid}>
            {person.actedFilms.map((film) => {
              const character = film.character;
              return (
                <div key={film.id} className={styles.filmCardWrapper}>
                  <FilmCard
                    film={{
                      id: film.id,
                      title: film.title,
                      slug: film.slug,
                      year: film.year || null,
                      imgFileName: film.imgFileName,
                      age: film.age,
                      director: film.director || null,
                    }}
                    episode={film.links?.[0]?.podcast}
                    variant="compact"
                    imageConfig={{ lazy: true, priority: false }}
                  />
                  {character && <span className={styles.characterLabel}>{character}</span>}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
