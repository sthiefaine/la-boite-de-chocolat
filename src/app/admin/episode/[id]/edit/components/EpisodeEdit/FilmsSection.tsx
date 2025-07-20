"use client";

import Image from "next/image";
import styles from "./FilmsSection.module.css";
import { getUploadServerUrl } from "@/helpers/imageConfig";

interface Film {
  id: string;
  title: string;
  year: number | null;
  director: string | null;
  imgFileName: string | null;
  saga?: {
    name: string;
  } | null;
}

interface EpisodeLink {
  id: string;
  film: Film;
}

interface FilmsSectionProps {
  episodeLinks: EpisodeLink[];
  onLinkFilm: () => void;
  onCreateFilm: () => void;
  onDeleteLink: (linkId: string) => void;
}

export default function FilmsSection({
  episodeLinks,
  onLinkFilm,
  onCreateFilm,
  onDeleteLink,
}: FilmsSectionProps) {
  return (
    <div className={styles.filmsSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Films associés</h2>
        <div className={styles.buttonGroup}>
          <button onClick={onLinkFilm} className={styles.linkFilmButton}>
            🔗 Lier un film
          </button>
          <button onClick={onCreateFilm} className={styles.createFilmButton}>
            ➕ Créer un film
          </button>
        </div>
      </div>

      {episodeLinks.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Aucun film associé à cet épisode.</p>
                      <div className={styles.emptyStateButtons}>
              <button onClick={onLinkFilm} className={styles.linkFilmButton}>
                🔗 Lier un film existant
              </button>
              <button onClick={onCreateFilm} className={styles.createFilmButton}>
                ➕ Créer un nouveau film
              </button>
            </div>
        </div>
      ) : (
        <div className={styles.filmsGrid}>
          {episodeLinks.map((link) => (
            <div key={link.id} className={styles.filmCard}>
              <div className={styles.filmImage}>
                {link.film.imgFileName ? (
                  <Image
                    src={getUploadServerUrl(link.film.imgFileName, "films")}
                    alt={link.film.title}
                    width={80}
                    height={120}
                    className={styles.poster}
                  />
                ) : (
                  <div className={styles.noPoster}>
                    <span>🎬</span>
                  </div>
                )}
              </div>

              <div className={styles.filmInfo}>
                <h3 className={styles.filmTitle}>{link.film.title}</h3>
                <p className={styles.filmYear}>{link.film.year}</p>
                {link.film.director && (
                  <p className={styles.filmDirector}>
                    Réalisé par {link.film.director}
                  </p>
                )}
                {link.film.saga && (
                  <p className={styles.filmSaga}>
                    Saga : {link.film.saga.name}
                  </p>
                )}
              </div>

              <button
                onClick={() => onDeleteLink(link.id)}
                className={styles.deleteButton}
                title="Supprimer ce lien"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
