"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getUploadServerUrl } from "@/helpers/imageConfig";
import { getAllFilms } from "@/app/actions/film";
import { linkEpisodeToFilm } from "@/app/actions/episode";
import styles from "./LinkFilmForm.module.css";

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

interface LinkFilmFormProps {
  episodeId: string;
  onClose: () => void;
  onFilmAdded: (newLink?: EpisodeLink) => void;
}

export default function LinkFilmForm({
  episodeId,
  onClose,
  onFilmAdded,
}: LinkFilmFormProps) {
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);
  const [addingFilm, setAddingFilm] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setSearchTerm("");
    }
  };

  useEffect(() => {
    fetchFilms();
  }, []);

  const fetchFilms = async () => {
    try {
      const result = await getAllFilms();
      if (result.success && result.films) {
        setFilms(result.films as Film[]);
      } else {
        console.error("Erreur lors du chargement des films:", result.error);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des films:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFilm = async () => {
    if (!selectedFilm) return;

    setAddingFilm(true);
    try {
      const result = await linkEpisodeToFilm(episodeId, selectedFilm.id);

      if (result.success && result.link) {
        onFilmAdded(result.link as EpisodeLink);
        onClose();
      } else if (result.success) {
        onFilmAdded();
        onClose();
      } else {
        console.error("Erreur lors de l'ajout du film:", result.error);
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du film:", error);
    } finally {
      setAddingFilm(false);
    }
  };

  const filteredFilms = films.filter(
    (film) =>
      film.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (film.director &&
        film.director.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (film.year && film.year.toString().includes(searchTerm)) ||
      (film.saga && film.saga.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modal}>
          <div className={styles.loading}>Chargement des films...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Ajouter un film à l'épisode</h2>
          <button onClick={onClose} className={styles.closeButton}>
            ✕
          </button>
        </div>

        <div className={styles.searchSection}>
          <div className={styles.searchContainer}>
            <input
              type="search"
              placeholder="Rechercher un film par titre, réalisateur, année ou saga..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className={styles.searchInput}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className={styles.clearButton}
                aria-label="Effacer la recherche"
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className={styles.filmsList}>
          <div className={styles.resultsInfo}>
            <span className={styles.resultsCount}>
              {filteredFilms.length} film{filteredFilms.length > 1 ? 's' : ''} trouvé{filteredFilms.length > 1 ? 's' : ''}
              {searchTerm && ` pour "${searchTerm}"`}
            </span>
          </div>
          
          {filteredFilms.length === 0 ? (
            <div className={styles.noResults}>
              {searchTerm
                ? "Aucun film trouvé pour cette recherche."
                : "Aucun film disponible."}
            </div>
          ) : (
            filteredFilms.map((film) => (
              <div
                key={film.id}
                className={`${styles.filmItem} ${
                  selectedFilm?.id === film.id ? styles.selected : ""
                }`}
                onClick={() => setSelectedFilm(film)}
              >
                <div className={styles.filmImage}>
                  {film.imgFileName ? (
                    <Image
                      src={getUploadServerUrl(film.imgFileName, "films")}
                      alt={film.title}
                      width={60}
                      height={90}
                      className={styles.poster}
                    />
                  ) : (
                    <div className={styles.noPoster}>
                      <span>🎬</span>
                    </div>
                  )}
                </div>

                <div className={styles.filmInfo}>
                  <h3 className={styles.filmTitle}>{film.title}</h3>
                  <p className={styles.filmYear}>{film.year}</p>
                  {film.director && (
                    <p className={styles.filmDirector}>
                      Réalisé par {film.director}
                    </p>
                  )}
                  {film.saga && (
                    <p className={styles.filmSaga}>Saga : {film.saga.name}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.modalActions}>
          <button onClick={onClose} className={styles.cancelButton}>
            Annuler
          </button>
          <button
            onClick={handleAddFilm}
            disabled={!selectedFilm || addingFilm}
            className={styles.addButton}
          >
            {addingFilm ? "Ajout en cours..." : "Ajouter le film"}
          </button>
        </div>
      </div>
    </div>
  );
}
