"use client";

import { useState, useMemo, useCallback, useDeferredValue } from "react";
import SearchBar from "@/components/SearchBar/SearchBar";
import styles from "./EpisodeGrid.module.css";
import { PreserveScroll } from "@/hooks/preservScroll";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import EpisodeCard from "@/components/Cards/EpisodeCard/EpisodeCard";

// Composant pour les suggestions d'amélioration
const NoResultsSuggestions = ({
  searchQuery,
  yearFilter,
  genreFilter,
  marvelFilter,
}: {
  searchQuery: string;
  yearFilter: string;
  genreFilter: string;
  marvelFilter: boolean;
}) => {
  const suggestions = [];

  if (searchQuery.trim()) {
    suggestions.push("Vérifiez l'orthographe de votre recherche");
    suggestions.push("Essayez des mots-clés plus généraux");
  }

  if (yearFilter || genreFilter || marvelFilter) {
    suggestions.push("Essayez de retirer certains filtres");
  }

  if (suggestions.length === 0) {
    suggestions.push("Aucun épisode ne correspond à vos critères");
  }

  return (
    <div className={styles.noResultsCard}>
      <div className={styles.noResultsImage}>
        <span style={{ fontSize: "3rem" }}>🔍</span>
      </div>
      <div className={styles.noResultsContent}>
        <h3 className={styles.noResultsTitle}>Aucun épisode trouvé</h3>
        <p className={styles.noResultsText}>{suggestions.join(" • ")}</p>
      </div>
    </div>
  );
};

interface Film {
  id: string;
  title: string;
  slug: string;
  year: number | null;
  imgFileName: string | null;
  age: string | null;
  saga: {
    name: string;
    id: string;
  } | null;
}

interface Episode {
  id: string;
  title: string;
  description: string;
  pubDate: Date;
  audioUrl: string;
  duration?: number | null;
  slug: string | null;
  genre?: string | null;
  hasTranscription?: boolean;
  parentSaga?: {
    id: string;
    name: string;
    icon: string;
    color: string;
  } | null;
  links: Array<{
    film: Film;
  }>;
}

interface EpisodeGridProps {
  episodes: Episode[];
  title?: string;
  subtitle?: string;
  headingLevel?: "h1" | "h2";
}

export default function EpisodeGrid({
  episodes,
  title = "Tous nos épisodes",
  subtitle,
  headingLevel = "h2",
}: EpisodeGridProps) {
  const Heading = headingLevel;
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [marvelFilter, setMarvelFilter] = useState(false);
  const [transcriptionFilter, setTranscriptionFilter] = useState(false);
  const [sortBy, setSortBy] = useState("latest");

  const deferredSearchQuery = useDeferredValue(searchQuery);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    episodes.forEach((episode) => {
      if (episode.pubDate) {
        const year = new Date(episode.pubDate).getFullYear();
        years.add(year);
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [episodes]);

  const availableGenres = useMemo(() => {
    const genres = new Set<string>();
    episodes.forEach((episode) => {
      if (episode.genre) {
        genres.add(episode.genre);
      }
    });

    const hasEpisodesWithFilms = episodes.some(
      (episode) => episode.links.length > 0
    );
    if (hasEpisodesWithFilms) {
      genres.add("Film");
    }

    return Array.from(genres).sort();
  }, [episodes]);

  const filteredEpisodes = useMemo(() => {
    let filtered = episodes;

    if (deferredSearchQuery.trim()) {
      const query = deferredSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (episode) =>
          episode.title.toLowerCase().includes(query) ||
          (episode.parentSaga &&
            episode.parentSaga.name.toLowerCase().includes(query)) ||
          episode.links.some(
            (link) =>
              link.film.title.toLowerCase().includes(query) ||
              (link.film.year && link.film.year.toString().includes(query)) ||
              (link.film.saga &&
                link.film.saga.name.toLowerCase().includes(query))
          )
      );
    }

    if (yearFilter) {
      filtered = filtered.filter(
        (episode) =>
          episode.pubDate &&
          new Date(episode.pubDate).getFullYear().toString() === yearFilter
      );
    }

    if (genreFilter) {
      if (genreFilter === "Film") {
        filtered = filtered.filter((episode) => episode.links.length > 0);
      } else {
        filtered = filtered.filter((episode) => episode.genre === genreFilter);
      }
    }

    if (marvelFilter) {
      filtered = filtered.filter((episode) =>
        episode.links.some(
          (link) =>
            link.film.saga?.name.toLowerCase().includes("marvel") ||
            episode.parentSaga?.name.toLowerCase().includes("marvel")
        )
      );
    }

    if (transcriptionFilter) {
      filtered = filtered.filter((episode) => episode.hasTranscription);
    }

    // Tri
    const sorted = [...filtered];
    switch (sortBy) {
      case "oldest":
        sorted.sort((a, b) => new Date(a.pubDate).getTime() - new Date(b.pubDate).getTime());
        break;
      case "shortest":
        sorted.sort((a, b) => (a.duration || 0) - (b.duration || 0));
        break;
      case "longest":
        sorted.sort((a, b) => (b.duration || 0) - (a.duration || 0));
        break;
      case "title":
        sorted.sort((a, b) => a.title.localeCompare(b.title, "fr"));
        break;
      case "latest":
      default:
        sorted.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
        break;
    }

    return sorted;
  }, [episodes, deferredSearchQuery, yearFilter, genreFilter, marvelFilter, transcriptionFilter, sortBy]);

  const hasActiveFilters = useMemo(() => {
    return !!(
      deferredSearchQuery.trim() ||
      yearFilter ||
      genreFilter ||
      marvelFilter ||
      transcriptionFilter
    );
  }, [deferredSearchQuery, yearFilter, genreFilter, marvelFilter, transcriptionFilter]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleYearChange = useCallback((value: string) => {
    setYearFilter(value);
  }, []);

  const handleGenreChange = useCallback((value: string) => {
    setGenreFilter(value);
  }, []);

  const handleMarvelClick = useCallback(() => {
    setMarvelFilter(!marvelFilter);
  }, [marvelFilter]);

  const handleTranscriptionClick = useCallback(() => {
    setTranscriptionFilter(!transcriptionFilter);
  }, [transcriptionFilter]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setYearFilter("");
    setGenreFilter("");
    setMarvelFilter(false);
    setTranscriptionFilter(false);
  }, []);

  const handleRemoveFilter = useCallback((filterType: string) => {
    switch (filterType) {
      case "search":
        setSearchQuery("");
        break;
      case "year":
        setYearFilter("");
        break;
      case "genre":
        setGenreFilter("");
        break;
      case "marvel":
        setMarvelFilter(false);
        break;
      case "transcription":
        setTranscriptionFilter(false);
        break;
    }
  }, []);

  const {
    displayedItems: displayedEpisodes,
    hasMore,
    observerRef,
  } = useInfiniteScroll({
    items: filteredEpisodes,
    itemsPerPage: 12,
    rootMargin: "300px",
    resetDependencies: [
      deferredSearchQuery,
      yearFilter,
      genreFilter,
      marvelFilter,
      transcriptionFilter,
      sortBy,
    ],
  });

  // Générer les badges de filtres actifs
  const activeFilters = useMemo(() => {
    const filters = [];

    if (deferredSearchQuery.trim()) {
      filters.push({
        type: "search",
        label: `"${deferredSearchQuery}"`,
        icon: "🔍",
      });
    }

    if (yearFilter) {
      filters.push({
        type: "year",
        label: `Année ${yearFilter}`,
        icon: "📅",
      });
    }

    if (genreFilter) {
      filters.push({
        type: "genre",
        label: genreFilter,
        icon: genreFilter === "Film" ? "🎬" : "🏷️",
      });
    }

    if (marvelFilter) {
      filters.push({
        type: "marvel",
        label: "Marvel",
      });
    }

    if (transcriptionFilter) {
      filters.push({
        type: "transcription",
        label: "Transcription",
        icon: "📝",
      });
    }

    return filters;
  }, [deferredSearchQuery, yearFilter, genreFilter, marvelFilter, transcriptionFilter]);

  return (
    <div className={styles.container}>
      {/* Section Header */}
      <div className={styles.sectionHeader}>
        <div className={styles.titleSection}>
          <Heading className={styles.sectionTitle}>
            {title}
            <span className={styles.episodeCount}>
              {" "}
              {filteredEpisodes.length === 1
                ? "1 épisode"
                : `${filteredEpisodes.length} épisodes`}
            </span>
          </Heading>
          {subtitle && <p className={styles.sectionSubtitle}>{subtitle}</p>}
        </div>

        <div className={styles.searchSection}>
          <SearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Rechercher un épisode, un film, une saga..."
            yearFilter={{
              value: yearFilter,
              onChange: handleYearChange,
              years: availableYears,
            }}
            genreFilter={{
              value: genreFilter,
              onChange: handleGenreChange,
              genres: availableGenres,
            }}
            sortFilter={{
              value: sortBy,
              onChange: setSortBy,
            }}
            marvelButton={{
              onClick: handleMarvelClick,
              label: marvelFilter ? "Tous" : "Marvel",
            }}
            transcriptionButton={{
              onClick: handleTranscriptionClick,
              active: transcriptionFilter,
            }}
            clearFilters={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        {/* Indicateurs de filtres actifs */}
        <div className={styles.activeFiltersContainer}>
          {activeFilters.length > 0 ? (
            activeFilters.map((filter) => (
              <div
                key={filter.type}
                className={styles.activeFilterBadge}
                onClick={() => handleRemoveFilter(filter.type)}
                title={`Retirer le filtre ${filter.label}`}
              >
                <span>{filter.icon}</span>
                <span>{filter.label}</span>
                <span className={styles.removeIcon}>×</span>
              </div>
            ))
          ) : (
            <div style={{ visibility: "hidden", height: "2rem" }}></div>
          )}
        </div>
      </div>

      <div className={styles.episodesGrid}>
        {displayedEpisodes.length === 0 ? (
          <NoResultsSuggestions
            searchQuery={searchQuery}
            yearFilter={yearFilter}
            genreFilter={genreFilter}
            marvelFilter={marvelFilter}
          />
        ) : (
          <>
            {displayedEpisodes.map((episode, index) => {
              const episodeProps = {
                episodeId: episode.id,
                episodeTitle: episode.title,
                episodeDate: episode.pubDate,
                episodeDuration: episode.duration,
                episodeSlug: episode.slug,
                episodeGenre: episode.genre,
              };
              const isMarvel =
                episode.links[0]?.film?.saga?.name
                  .toLowerCase()
                  .includes("marvel") ||
                episode.parentSaga?.name.toLowerCase().includes("marvel");
              const isFirst = index === 0;
              const effect = isMarvel ? "prism" : isFirst ? "glow" : "none";

              if (episode.links.length > 0) {
                const firstFilm = episode.links[0].film;

                return (
                  <EpisodeCard
                    key={episode.id}
                    {...episodeProps}
                    film={firstFilm}
                    effect={effect}
                  />
                );
              } else {
                return <EpisodeCard key={episode.id} {...episodeProps} />;
              }
            })}
            {/* Observer pour l'infinite scroll */}
            {hasMore && (
              <div ref={observerRef} className={styles.loadingObserver}>
                <div className={styles.loadingText}>
                  <span>Plus d'épisodes...</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
