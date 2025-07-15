"use server";

import SagaCard from "@/components/Cards/SagaCard/SagaCard";
import FilmCard from "@/components/Cards/FilmCard/FilmCard";
import styles from "./EpisodeSaga.module.css";

interface Film {
  id: string;
  title: string;
  slug: string;
  year: number | null;
  imgFileName: string | null;
  age: string | null;
  director: string | null;
}

interface Saga {
  id: string;
  name: string;
  films: (Film | undefined)[];
  slug: string;
}

interface EpisodeSagaProps {
  saga: Saga;
  sagaResult: {
    saga: Saga;
    filmToEpisodeMap: Map<string, any>;
  };
}

export default async function EpisodeSaga({ saga, sagaResult }: EpisodeSagaProps) {
  // Filtrer les films undefined et ceux sans année
  const validFilms = sagaResult.saga.films.filter(
    (film): film is Film => film !== undefined && film.year !== null
  );

  return (
    <div className={styles.sagaSection}>
      <div className={styles.sagaContainer}>
        <span className={styles.sagaLabel}>Saga du film</span>
        <div className={styles.sagaFilmsGrid}>
          <div className={styles.sagaCardWrapper}>
            <SagaCard
              saga={{
                ...saga,
                films: validFilms,
              }}
              variant="compact"
            />
          </div>
          {validFilms.map((film) => {
            const episode = sagaResult.filmToEpisodeMap.get(film.id);

            return (
              <div key={film.id} className={styles.sagaFilmCard}>
                  <FilmCard
                    film={{
                      id: film.id,
                      title: film.title,
                      slug: film.slug,
                      year: film.year || null,
                      imgFileName: film.imgFileName,
                      age: film.age,
                      director: film.director || null,
                      saga: {
                        id: saga.id,
                        name: saga.name,
                      },
                    }}
                    episode={episode}
                    variant="compact"
                    imageConfig={{
                      lazy: true,
                      priority: false,
                    }}
                  />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
