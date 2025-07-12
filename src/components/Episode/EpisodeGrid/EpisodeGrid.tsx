"use client";

import { useState, useMemo, useCallback, useDeferredValue, memo } from "react";
import SearchBar from "@/components/SearchBar/SearchBar";
import styles from "./EpisodeGrid.module.css";
import { PreserveScroll } from "@/hooks/preservScroll";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import EpisodeCard from "@/components/Episode/EpisodeCard/EpisodeCard";

const MemoizedEpisodeCard = memo(EpisodeCard);

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
}

export default function PodcastGrid({
  episodes,
  title = "Tous nos épisodes",
  subtitle,
}: EpisodeGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState("");

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

  const filteredEpisodes = useMemo(() => {
    let filtered = episodes;

    if (deferredSearchQuery.trim()) {
      const query = deferredSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (episode) =>
          episode.title.toLowerCase().includes(query) ||
          episode.description.toLowerCase().includes(query) ||
          (episode.parentSaga &&
            episode.parentSaga.name.toLowerCase().includes(query)) ||
          episode.links.some((link) =>
            link.film.title.toLowerCase().includes(query) ||
            (link.film.year && link.film.year.toString().includes(query)) ||
            (link.film.saga && link.film.saga.name.toLowerCase().includes(query))
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

    return filtered;
  }, [episodes, deferredSearchQuery, yearFilter]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleYearChange = useCallback((value: string) => {
    setYearFilter(value);
  }, []);

  const {
    displayedItems: displayedEpisodes,
    hasMore,
    observerRef,
  } = useInfiniteScroll({
    items: filteredEpisodes,
    itemsPerPage: 12,
    rootMargin: "300px",
    resetDependencies: [deferredSearchQuery, yearFilter],
  });

  return (
    <div className={styles.container}>
      <PreserveScroll />

      {/* Section Header */}
      <div className={styles.sectionHeader}>
        <div className={styles.titleSection}>
          <h2 className={styles.sectionTitle}>{title}</h2>
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
          />
        </div>
      </div>

      <div className={styles.podcastGrid}>
        {displayedEpisodes.length === 0 ? (
          <MemoizedEpisodeCard isNoResults={true} />
        ) : (
          <>
            {displayedEpisodes.map((episode) => {
              // Si l'épisode a des films, afficher le premier film
              if (episode.links.length > 0) {
                const firstFilm = episode.links[0].film;
                return (
                  <MemoizedEpisodeCard
                    key={episode.id}
                    film={firstFilm}
                    episodeTitle={episode.title}
                    episodeDate={episode.pubDate}
                    episodeDuration={episode.duration}
                    episodeSlug={episode.slug}
                  />
                );
              } else {
                return (
                  <MemoizedEpisodeCard
                    key={episode.id}
                    film={{
                      id: episode.id,
                      title: episode.title,
                      slug: episode.slug || "",
                      year: null,
                      imgFileName: null,
                      age: null,
                      saga: null,
                    }}
                    episodeTitle={episode.title}
                    episodeDate={episode.pubDate}
                    episodeDuration={episode.duration}
                    episodeSlug={episode.slug}
                  />
                );
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
