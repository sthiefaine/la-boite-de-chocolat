"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  searchMovies,
  createFilmFromTMDB,
  createFilmManually,
  getSagas,
  getMovieCollection,
  checkFilmExists,
} from "@/app/actions/film";
import { getUploadServerUrl } from "@/helpers/imageConfig";
import { AGE_RATINGS } from "@/helpers/helpers";
import styles from "./AddFilmForm.module.css";

interface AddFilmFormProps {
  episodeId: string;
  podcastName?: string;
  onFilmCreated: (filmId: string) => void;
  onCancel: () => void;
  onFilmLinked?: (filmId: string) => void;
}

type Step =
  | "search"
  | "select"
  | "verify"
  | "saga"
  | "age"
  | "image"
  | "manual"
  | "loading";

export default function AddFilmForm({
  podcastName,
  onFilmCreated,
  onCancel,
  onFilmLinked,
}: AddFilmFormProps) {
  const [step, setStep] = useState<Step>("search");
  const [searchQuery, setSearchQuery] = useState(podcastName || "");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [manualData, setManualData] = useState({ title: "", year: "", age: "" });
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [selectedSaga, setSelectedSaga] = useState<string>("");
  const [selectedAge, setSelectedAge] = useState<string>("");
  const [sagas, setSagas] = useState<any[]>([]);
  const [detectedSaga, setDetectedSaga] = useState<any>(null);
  const [sagaSearchQuery, setSagaSearchQuery] = useState("");
  const [showSagaSearch, setShowSagaSearch] = useState(false);
  const [filmExists, setFilmExists] = useState<any>(null);
  const [verificationLoading, setVerificationLoading] = useState(false);

  // Charger les sagas au montage du composant
  useEffect(() => {
    getSagas().then((result) => {
      console.log("Sagas loaded:", result);
      if (result.success && result.sagas) {
        setSagas(result.sagas);
      }
    });
  }, []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError("");

    const result = await searchMovies(searchQuery);

    if (result.success && result.movies) {
      setSearchResults(result.movies);
      setStep("select");
    } else {
      setError(result.error || "Erreur de recherche");
    }

    setLoading(false);
  };

  const handleSelectMovie = async (movie: any) => {
    setSelectedMovie(movie);
    setStep("verify");
    setVerificationLoading(true);

    // Vérifier si le film existe déjà en base
    try {
      const checkResult = await checkFilmExists(movie.id);
      if (checkResult.success) {
        setFilmExists(checkResult);
      } else {
        setError(checkResult.error || "Erreur de vérification");
        setStep("select");
      }
    } catch (error) {
      console.error("Erreur vérification film:", error);
      setError("Erreur lors de la vérification du film");
      setStep("select");
    }

    // Détecter automatiquement la saga depuis TMDB
    try {
      setDetectedSaga("");
      const result = await getMovieCollection(movie.id);
      if (result.success && result.collection) {
        setDetectedSaga(result.collection);
        // On ne met pas l'ID TMDB, on laissera la création automatique
        setSelectedSaga("");
      }
    } catch (error) {
      console.error("Erreur détection saga:", error);
    }

    setVerificationLoading(false);
  };

  const handleSagaSelection = (sagaId: string) => {
    console.log("Saga selected:", sagaId);
    setSelectedSaga(sagaId);
    setStep("age");
  };

  const handleDetectedSagaSelect = () => {
    setSelectedSaga("detected");
    setStep("age");
  };

  const handleNoSagaSelect = () => {
    setSelectedSaga("");
    setStep("age");
  };

  const filteredSagas = sagas.filter((saga) =>
    saga.name.toLowerCase().includes(sagaSearchQuery.toLowerCase())
  );

  const handleImageSelection = (file: File | null) => {
    setPosterFile(file);
    setStep("loading");

    let finalSagaId: string | undefined = selectedSaga;
    let detectedSagaName: string | undefined = undefined;
    let detectedSagaTmdbId: number | undefined = undefined;

    if (selectedSaga === "detected" && detectedSaga) {
      detectedSagaName = detectedSaga.name;
      detectedSagaTmdbId = detectedSaga.id;
      finalSagaId = undefined;
    }

    createFilmFromTMDB(selectedMovie.id, finalSagaId, detectedSagaName, selectedAge, detectedSagaTmdbId).then(
      (result) => {
        if (result.success && result.film) {
          onFilmCreated(result.film.id);
        } else {
          setError(result.error || "Erreur de création");
          setStep("image");
        }
      }
    );
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualData.title.trim()) return;

    setLoading(true);
    setError("");

    const result = await createFilmManually({
      title: manualData.title,
      year: manualData.year ? parseInt(manualData.year) : undefined,
      age: manualData.age || undefined,
      posterFile: posterFile || undefined,
    });

    if (result.success && result.film) {
      onFilmCreated(result.film.id);
    } else {
      setError(result.error || "Erreur de création");
      setLoading(false);
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Ajouter un nouveau film</h3>
          <button onClick={onCancel} className={styles.closeButton}>
            ×
          </button>
        </div>

        <div className={styles.autoLinkNotice}>
          <p>
            💡 Le film sera automatiquement lié à cet épisode une fois créé.
          </p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {step === "search" && (
          <div className={styles.step}>
            <h4>Étape 1 : Rechercher le film</h4>
            <p className={styles.stepDescription}>
              Recherchez le film sur The Movie Database pour récupérer
              automatiquement les informations.
            </p>

            <div className={styles.searchForm}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nom du film..."
                className={styles.searchInput}
                onKeyUp={(e) => e.key === "Enter" && handleSearch()}
              />
              <button
                onClick={handleSearch}
                disabled={loading || !searchQuery.trim()}
                className={styles.searchButton}
              >
                {loading ? "Recherche..." : "Rechercher"}
              </button>
            </div>

            <div className={styles.alternative}>
              <p>Ou</p>
              <button
                onClick={() => setStep("manual")}
                className={styles.manualButton}
              >
                Ajouter manuellement
              </button>
            </div>
          </div>
        )}

        {step === "select" && (
          <div className={styles.step}>
            <h4>Étape 2 : Sélectionner le film</h4>
            <p className={styles.stepDescription}>
              Choisissez le bon film parmi les résultats de recherche.
            </p>

            <div className={styles.resultsList}>
              {searchResults.map((movie) => (
                <div key={movie.id} className={styles.movieCard}>
                  <div className={styles.moviePoster}>
                    {movie.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                        alt={movie.title}
                        width={60}
                        height={90}
                        className={styles.poster}
                        sizes="60px"
                      />
                    ) : (
                      <div className={styles.noPoster}>Aucune image</div>
                    )}
                  </div>
                  <div className={styles.movieInfo}>
                    <h5 className={styles.movieTitle}>{movie.title}</h5>
                    <p className={styles.movieYear}>
                      {movie.release_date
                        ? new Date(movie.release_date).getFullYear()
                        : "Année inconnue"}
                    </p>
                    <p className={styles.movieOverview}>
                      {movie.overview
                        ? movie.overview.substring(0, 100) + "..."
                        : "Aucune description"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleSelectMovie(movie)}
                    className={styles.selectButton}
                  >
                    Sélectionner
                  </button>
                </div>
              ))}
            </div>

            <div className={styles.stepActions}>
              <button
                onClick={() => setStep("search")}
                className={styles.backButton}
              >
                ← Retour à la recherche
              </button>
            </div>
          </div>
        )}

        {step === "verify" && (
          <div className={styles.step}>
            <h4>Étape 3 : Vérification</h4>
            <p className={styles.stepDescription}>
              Vérification de l'existence du film dans la base de données.
            </p>

            {verificationLoading ? (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Vérification en cours...</p>
              </div>
            ) : filmExists ? (
              <div className={styles.verificationResult}>
                {filmExists.exists ? (
                  <div className={styles.existingFilm}>
                    <div className={styles.existingFilmHeader}>
                      <h5>⚠️ Film déjà existant</h5>
                      <p className={styles.existingFilmMessage}>
                        {filmExists.message}
                      </p>
                    </div>

                    <div className={styles.existingFilmDetails}>
                      <div className={styles.existingFilmCard}>
                        {filmExists.film.imgFileName && (
                          <div className={styles.existingFilmPoster}>
                            <Image
                              src={getUploadServerUrl(
                                filmExists.film.imgFileName
                              )}
                              alt={filmExists.film.title}
                              width={60}
                              height={90}
                              className={styles.poster}
                              sizes="60px"
                            />
                          </div>
                        )}
                        <div className={styles.existingFilmInfo}>
                          <div className={styles.existingFilmMeta}>
                            <span className={styles.existingFilmTitle}>
                              {filmExists.film.title}
                            </span>
                            {filmExists.film.year && (
                              <span className={styles.existingFilmYear}>
                                ({filmExists.film.year})
                              </span>
                            )}
                          </div>
                          <div className={styles.existingFilmDetails}>
                            {filmExists.film.director && (
                              <span className={styles.existingFilmDetail}>
                                Réalisé par {filmExists.film.director}
                              </span>
                            )}
                            {filmExists.film.saga && (
                              <span className={styles.existingFilmDetail}>
                                Saga : {filmExists.film.saga.name}
                              </span>
                            )}
                            {filmExists.film.links &&
                              filmExists.film.links.length > 0 && (
                                <span className={styles.existingFilmDetail}>
                                  Lié à {filmExists.film.links.length}{" "}
                                  épisode(s)
                                </span>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.existingFilmActions}>
                      <button
                        onClick={() => {
                          if (onFilmLinked) {
                            onFilmLinked(filmExists.film.id);
                          } else {
                            onFilmCreated(filmExists.film.id);
                          }
                        }}
                        className={styles.useExistingButton}
                      >
                        Utiliser ce film existant
                      </button>
                      <button
                        onClick={() => setStep("select")}
                        className={styles.backButton}
                      >
                        Choisir un autre film
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.newFilm}>
                    <div className={styles.newFilmHeader}>
                      <h5>✅ Film disponible</h5>
                      <p className={styles.newFilmMessage}>
                        {filmExists.message}
                      </p>
                    </div>

                    <div className={styles.newFilmDetails}>
                      <div className={styles.movieCard}>
                        <div className={styles.moviePoster}>
                          {selectedMovie.poster_path ? (
                            <Image
                              src={`https://image.tmdb.org/t/p/w342${selectedMovie.poster_path}`}
                              alt={selectedMovie.title}
                              width={60}
                              height={90}
                              className={styles.poster}
                              sizes="60px"
                            />
                          ) : (
                            <div className={styles.noPoster}>Aucune image</div>
                          )}
                        </div>
                        <div className={styles.movieInfo}>
                          <h5 className={styles.movieTitle}>
                            {selectedMovie.title}
                          </h5>
                          <p className={styles.movieYear}>
                            {selectedMovie.release_date
                              ? new Date(
                                  selectedMovie.release_date
                                ).getFullYear()
                              : "Année inconnue"}
                          </p>
                          <p className={styles.movieOverview}>
                            {selectedMovie.overview
                              ? selectedMovie.overview.substring(0, 100) + "..."
                              : "Aucune description"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className={styles.newFilmActions}>
                      <button
                        onClick={() => setStep("select")}
                        className={styles.backButton}
                      >
                        ← Choisir un autre film
                      </button>
                      <button
                        onClick={() => setStep("saga")}
                        className={styles.nextButton}
                      >
                        Continuer vers la saga →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.verificationResult}>
                <p>Aucun film trouvé pour cette recherche.</p>
              </div>
            )}

            <div className={styles.stepActions}>
              <button
                onClick={() => setStep("select")}
                className={styles.backButton}
              >
                ← Retour à la sélection
              </button>
            </div>
          </div>
        )}

        {step === "saga" && (
          <div className={styles.step}>
            <h4>Étape 4 : Choisir une saga (optionnel)</h4>
            <p className={styles.stepDescription}>
              Sélectionnez une saga pour ce film ou laissez vide si aucune saga
              n'est nécessaire.
            </p>

            {/* Option 1: Saga détectée automatiquement */}
            {detectedSaga && (
              <div className={styles.sagaOption}>
                <button
                  onClick={handleDetectedSagaSelect}
                  className={`${styles.sagaButton} ${
                    selectedSaga === "detected" ? styles.sagaButtonSelected : ""
                  }`}
                >
                  <div className={styles.sagaButtonContent}>
                    <div className={styles.sagaButtonInfo}>
                      <span className={styles.sagaButtonTitle}>
                        Utiliser la saga détectée
                      </span>
                      <span className={styles.sagaButtonName}>
                        {detectedSaga.name}
                      </span>
                      {detectedSaga.overview && (
                        <p className={styles.sagaButtonOverview}>
                          {detectedSaga.overview.substring(0, 100)}...
                        </p>
                      )}
                    </div>
                    {detectedSaga.poster_path && (
                      <Image
                        src={`https://image.tmdb.org/t/p/w342${detectedSaga.poster_path}`}
                        alt={detectedSaga.name}
                        width={60}
                        height={90}
                        className={styles.sagaButtonPoster}
                        sizes="60px"
                      />
                    )}
                  </div>
                </button>
              </div>
            )}

            {/* Option 2: Aucune saga */}
            <div className={styles.sagaOption}>
              <button
                onClick={handleNoSagaSelect}
                className={`${styles.sagaButton} ${
                  selectedSaga === "" ? styles.sagaButtonSelected : ""
                }`}
              >
                <div className={styles.sagaButtonContent}>
                  <div className={styles.sagaButtonInfo}>
                    <span className={styles.sagaButtonTitle}>Aucune saga</span>
                    <span className={styles.sagaButtonName}>
                      Ce film n'appartient à aucune saga
                    </span>
                  </div>
                </div>
              </button>
            </div>

            {/* Option 3: Rechercher dans les sagas existantes */}
            <div className={styles.sagaOption}>
              <button
                onClick={() => setShowSagaSearch(!showSagaSearch)}
                className={`${styles.sagaButton} ${
                  showSagaSearch ? styles.sagaButtonSelected : ""
                }`}
              >
                <div className={styles.sagaButtonContent}>
                  <div className={styles.sagaButtonInfo}>
                    <span className={styles.sagaButtonTitle}>
                      Choisir une saga existante
                    </span>
                    <span className={styles.sagaButtonName}>
                      {showSagaSearch
                        ? "Masquer la recherche"
                        : "Parcourir les sagas disponibles"}
                    </span>
                  </div>
                </div>
              </button>
            </div>

            {/* Recherche de sagas */}
            {showSagaSearch && (
              <div className={styles.sagaSearch}>
                <div className={styles.searchForm}>
                  <input
                    type="text"
                    value={sagaSearchQuery}
                    onChange={(e) => setSagaSearchQuery(e.target.value)}
                    placeholder="Rechercher une saga..."
                    className={styles.searchInput}
                  />
                </div>

                <div className={styles.sagaSearchResults}>
                  {filteredSagas.length > 0 ? (
                    filteredSagas.map((saga) => (
                      <button
                        key={saga.id}
                        onClick={() => handleSagaSelection(saga.id)}
                        className={`${styles.sagaButton} ${
                          selectedSaga === saga.id
                            ? styles.sagaButtonSelected
                            : ""
                        }`}
                      >
                        <div className={styles.sagaButtonContent}>
                          <div className={styles.sagaButtonInfo}>
                            <span className={styles.sagaButtonTitle}>
                              {saga.name}
                            </span>
                            <span className={styles.sagaButtonName}>
                              Saga existante
                            </span>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className={styles.noResults}>
                      {sagaSearchQuery
                        ? "Aucune saga trouvée"
                        : "Aucune saga disponible"}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className={styles.stepActions}>
              <button
                onClick={() => setStep("select")}
                className={styles.backButton}
              >
                ← Retour à la sélection
              </button>
              <button
                onClick={() => setStep("image")}
                disabled={!selectedSaga && selectedSaga !== ""}
                className={styles.nextButton}
              >
                Continuer →
              </button>
            </div>
          </div>
        )}

        {step === "age" && (
          <div className={styles.step}>
            <h4>Étape 5 : Âge recommandé</h4>
            <p className={styles.stepDescription}>
              Sélectionnez l'âge recommandé pour ce film.
            </p>

            <div className={styles.ageSelection}>
              <select
                value={selectedAge}
                onChange={(e) => setSelectedAge(e.target.value)}
                className={styles.input}
              >
                <option value="">Sélectionner un âge</option>
                {Object.values(AGE_RATINGS).map((age) => (
                  <option key={age} value={age}>
                    {age}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.stepActions}>
              <button
                onClick={() => setStep("saga")}
                className={styles.backButton}
              >
                ← Retour à la saga
              </button>
              <button
                onClick={() => setStep("image")}
                className={styles.nextButton}
              >
                Continuer →
              </button>
            </div>
          </div>
        )}

        {step === "image" && (
          <div className={styles.step}>
            <h4>Étape 6 : Poster du film</h4>
            <p className={styles.stepDescription}>
              Le poster sera automatiquement récupéré depuis TMDB, mais vous
              pouvez aussi en choisir un autre.
            </p>

            <div className={styles.imagePreview}>
              {selectedMovie.poster_path && (
                <div className={styles.tmdbPoster}>
                  <Image
                    src={`https://image.tmdb.org/t/p/w780${selectedMovie.poster_path}`}
                    alt={selectedMovie.title}
                    width={150}
                    height={225}
                    className={styles.previewImage}
                    sizes="150px"
                  />
                  <p className={styles.posterLabel}>Poster TMDB</p>
                </div>
              )}

              <div className={styles.customPoster}>
                <input
                  type="file"
                  id="custom-poster"
                  accept="image/*"
                  onChange={(e) =>
                    handleImageSelection(e.target.files?.[0] || null)
                  }
                  className={styles.fileInput}
                />
                <label htmlFor="custom-poster" className={styles.fileLabel}>
                  Choisir un autre poster
                </label>
              </div>
            </div>

            <div className={styles.stepActions}>
              <button
                onClick={() => setStep("age")}
                className={styles.backButton}
              >
                ← Retour à l'âge
              </button>
              <button
                onClick={() => handleImageSelection(null)}
                className={styles.nextButton}
              >
                Utiliser le poster TMDB →
              </button>
            </div>
          </div>
        )}

        {step === "manual" && (
          <div className={styles.step}>
            <h4>Ajout manuel</h4>
            <p className={styles.stepDescription}>
              Ajoutez les informations du film manuellement.
            </p>

            <form onSubmit={handleManualSubmit} className={styles.manualForm}>
              <div className={styles.formGroup}>
                <label htmlFor="title" className={styles.label}>
                  Titre du film *
                </label>
                <input
                  type="text"
                  id="title"
                  value={manualData.title}
                  onChange={(e) =>
                    setManualData({ ...manualData, title: e.target.value })
                  }
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="year" className={styles.label}>
                  Année
                </label>
                <input
                  type="number"
                  id="year"
                  value={manualData.year}
                  onChange={(e) =>
                    setManualData({ ...manualData, year: e.target.value })
                  }
                  className={styles.input}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="age" className={styles.label}>
                  Âge recommandé
                </label>
                <select
                  id="age"
                  value={manualData.age}
                  onChange={(e) =>
                    setManualData({ ...manualData, age: e.target.value })
                  }
                  className={styles.input}
                >
                  <option value="">Sélectionner un âge</option>
                  {Object.entries(AGE_RATINGS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="poster" className={styles.label}>
                  Poster (optionnel)
                </label>
                <input
                  type="file"
                  id="poster"
                  accept="image/*"
                  onChange={(e) => setPosterFile(e.target.files?.[0] || null)}
                  className={styles.fileInput}
                />
                {posterFile && (
                  <p className={styles.fileInfo}>
                    Fichier sélectionné : {posterFile.name}
                  </p>
                )}
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => setStep("search")}
                  className={styles.backButton}
                >
                  ← Retour
                </button>
                <button
                  type="submit"
                  disabled={loading || !manualData.title.trim()}
                  className={styles.submitButton}
                >
                  {loading ? "Création..." : "Créer le film"}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === "loading" && (
          <div className={styles.step}>
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Création du film en cours...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
