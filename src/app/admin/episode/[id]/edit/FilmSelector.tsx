'use client';

import { useState, useEffect } from 'react';
import { linkEpisodeToFilm } from '@/app/actions/episode';
import AddFilmForm from './AddFilmForm';
import styles from './EpisodeEdit.module.css';

interface Film {
  id: string;
  title: string;
  year: number | null;
  saga: {
    name: string;
  } | null;
}

interface FilmSelectorProps {
  episodeId: string;
  existingFilms: Film[];
  podcastName?: string;
}

export default function FilmSelector({ episodeId, existingFilms, podcastName }: FilmSelectorProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFilms, setFilteredFilms] = useState<Film[]>(existingFilms);
  const [showResults, setShowResults] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [selectedFilmId, setSelectedFilmId] = useState('');
  const [searchMode, setSearchMode] = useState<'search' | 'select'>('search');
  const [searchSelectedFilmId, setSearchSelectedFilmId] = useState('');

  // Filtrer les films en fonction de la recherche
  useEffect(() => {
    const filtered = existingFilms.filter(film =>
      film.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (film.year && film.year.toString().includes(searchQuery)) ||
      (film.saga && film.saga.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredFilms(filtered);
  }, [searchQuery, existingFilms]);

  const handleFilmSelect = (filmId: string) => {
    setSearchSelectedFilmId(filmId);
    setShowResults(false);
  };

  const handleSearchSubmit = async () => {
    if (!searchSelectedFilmId) return;
    
    setIsLinking(true);
    try {
      await linkEpisodeToFilm(episodeId, searchSelectedFilmId);
      setSearchQuery('');
      setSearchSelectedFilmId('');
      setShowResults(false);
      // Recharger la page pour afficher le nouveau lien
      window.location.reload();
    } catch (error) {
      console.error('Erreur lors du lien:', error);
    } finally {
      setIsLinking(false);
    }
  };

  const handleSelectSubmit = async (formData: FormData) => {
    const filmId = formData.get('filmId') as string;
    if (!filmId) return;

    setIsLinking(true);
    try {
      await linkEpisodeToFilm(episodeId, filmId);
      setSelectedFilmId('');
      // Recharger la page pour afficher le nouveau lien
      window.location.reload();
    } catch (error) {
      console.error('Erreur lors du lien:', error);
    } finally {
      setIsLinking(false);
    }
  };

  const handleFilmCreated = async (filmId: string) => {
    setShowAddForm(false);
    
    // Lier automatiquement le film à l'épisode
    try {
      await linkEpisodeToFilm(episodeId, filmId);
      // Recharger la page pour afficher le nouveau lien
      window.location.reload();
    } catch (error) {
      console.error('Erreur lors de la liaison automatique:', error);
      // En cas d'erreur, recharger quand même pour afficher le film
      window.location.reload();
    }
  };

  return (
    <div className={styles.filmSelector}>
      <div className={styles.orDivider}>
        <span>ou</span>
      </div>

      <button 
        onClick={() => setShowAddForm(true)}
        className={styles.addNewFilmButton}
      >
        + Ajouter un nouveau film (sera automatiquement lié)
      </button>

      {showAddForm && (
        <AddFilmForm
          episodeId={episodeId}
          podcastName={podcastName}
          onFilmCreated={handleFilmCreated}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className={styles.modeSelector}>
        <button
          type="button"
          onClick={() => setSearchMode('search')}
          className={`${styles.modeButton} ${searchMode === 'search' ? styles.modeButtonActive : ''}`}
        >
          🔍 Recherche
        </button>
        <button
          type="button"
          onClick={() => setSearchMode('select')}
          className={`${styles.modeButton} ${searchMode === 'select' ? styles.modeButtonActive : ''}`}
        >
          📋 Liste
        </button>
      </div>

      {searchMode === 'search' && (
        <div className={styles.searchSection}>
          <div className={styles.formGroup}>
            <label htmlFor="filmSearch" className={styles.label}>
              Rechercher un film existant
            </label>
            <div className={styles.searchContainer}>
              <input
                id="filmSearch"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(e.target.value.length > 0);
                  setSearchSelectedFilmId(''); // Reset selection when searching
                }}
                onFocus={() => setShowResults(searchQuery.length > 0)}
                placeholder="Tapez le nom du film, l'année ou la saga..."
                className={styles.searchInput}
              />
            </div>
            
            {showResults && (
              <div className={styles.searchResults}>
                {filteredFilms.length > 0 ? (
                  filteredFilms.map((film) => (
                    <button
                      key={film.id}
                      onClick={() => handleFilmSelect(film.id)}
                      className={`${styles.filmResult} ${searchSelectedFilmId === film.id ? styles.filmResultSelected : ''}`}
                      disabled={isLinking}
                    >
                      <div className={styles.filmResultInfo}>
                        <span className={styles.filmResultTitle}>
                          {film.title} {film.year && `(${film.year})`}
                        </span>
                        {film.saga && (
                          <span className={styles.filmResultSaga}>
                            Saga : {film.saga.name}
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className={styles.noResults}>
                    Aucun film trouvé pour "{searchQuery}"
                  </div>
                )}
              </div>
            )}

            {searchSelectedFilmId && (
              <div className={styles.selectedFilm}>
                <div className={styles.selectedFilmInfo}>
                  <span className={styles.selectedFilmLabel}>Film sélectionné :</span>
                  <span className={styles.selectedFilmTitle}>
                    {filteredFilms.find(f => f.id === searchSelectedFilmId)?.title}
                    {filteredFilms.find(f => f.id === searchSelectedFilmId)?.year && 
                      ` (${filteredFilms.find(f => f.id === searchSelectedFilmId)?.year})`
                    }
                  </span>
                </div>
                <button
                  onClick={handleSearchSubmit}
                  disabled={isLinking}
                  className={styles.validateButton}
                >
                  {isLinking ? 'Liaison...' : 'Valider et lier'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {searchMode === 'select' && (
        <form action={handleSelectSubmit} className={styles.selectForm}>
          <div className={styles.formGroup}>
            <label htmlFor="filmId" className={styles.label}>
              Sélectionner un film existant
            </label>
            <select
              id="filmId"
              name="filmId"
              value={selectedFilmId}
              onChange={(e) => setSelectedFilmId(e.target.value)}
              className={styles.select}
              required
            >
              <option value="">Choisir un film...</option>
              {existingFilms.map((film) => (
                <option key={film.id} value={film.id}>
                  {film.title} {film.year && `(${film.year})`}
                  {film.saga && ` - ${film.saga.name}`}
                </option>
              ))}
            </select>
          </div>
          <button 
            type="submit" 
            className={styles.linkButton}
            disabled={isLinking || !selectedFilmId}
          >
            {isLinking ? 'Liaison...' : 'Lier le film'}
          </button>
        </form>
      )}
    </div>
  );
} 