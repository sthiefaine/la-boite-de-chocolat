"use client";

import { useState, useMemo, useCallback, useDeferredValue, memo } from "react";
import SearchBar from "../SearchBar/SearchBar";
import styles from "./PodcastGrid.module.css";
import { PreserveScroll } from "@/hooks/preservScroll";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import PodcastCard from "../PodcastCard/PodcastCard";

const MemoizedPodcastCard = memo(PodcastCard);

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

interface PodcastGridProps {
  episodes: Episode[];
  title?: string;
  subtitle?: string;
}

export default function PodcastGrid({
  episodes,
  title = "Tous nos épisodes",
  subtitle,
}: PodcastGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  const deferredSearchQuery = useDeferredValue(searchQuery);

  const filmsWithEpisodeData = useMemo(
    () =>
      episodes.flatMap((episode) =>
        episode.links.map((link) => ({
          ...link.film,
          episodeTitle: episode.title,
          episodeDate: episode.pubDate,
          episodeDuration: episode.duration,
          episodeSlug: episode.slug,
          parentSaga: episode.parentSaga,
        }))
      ),
    [episodes]
  );

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    filmsWithEpisodeData.forEach((film) => {
      if (film.episodeDate) {
        const year = new Date(film.episodeDate).getFullYear();
        years.add(year);
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [filmsWithEpisodeData]);

  const filteredFilms = useMemo(() => {
    let filtered = filmsWithEpisodeData;

    if (deferredSearchQuery.trim()) {
      const query = deferredSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (film) =>
          film.title.toLowerCase().includes(query) ||
          (film.year && film.year.toString().includes(query)) ||
          (film.saga && film.saga.name.toLowerCase().includes(query)) ||
          (film.episodeTitle &&
            film.episodeTitle.toLowerCase().includes(query)) ||
          (film.parentSaga &&
            film.parentSaga.name.toLowerCase().includes(query))
      );
    }

    if (yearFilter) {
      filtered = filtered.filter(
        (film) =>
          film.episodeDate &&
          new Date(film.episodeDate).getFullYear().toString() === yearFilter
      );
    }

    return filtered;
  }, [filmsWithEpisodeData, deferredSearchQuery, yearFilter]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleYearChange = useCallback((value: string) => {
    setYearFilter(value);
  }, []);

  const {
    displayedItems: displayedFilms,
    hasMore,
    observerRef,
  } = useInfiniteScroll({
    items: filteredFilms,
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
            placeholder="Rechercher un film, une saga, Marvel, une année..."
            yearFilter={{
              value: yearFilter,
              onChange: handleYearChange,
              years: availableYears,
            }}
          />
        </div>
      </div>

      <div className={styles.podcastGrid}>
        {displayedFilms.length === 0 ? (
          <MemoizedPodcastCard isNoResults={true} />
        ) : (
          <>
            {displayedFilms.map((film) => (
              <MemoizedPodcastCard
                key={film.id}
                film={film}
                episodeTitle={film.episodeTitle}
                episodeDate={film.episodeDate}
                episodeDuration={film.episodeDuration}
                episodeSlug={film.episodeSlug}
              />
            ))}
            {/* Observer pour l'infinite scroll */}
            {hasMore && (
              <div ref={observerRef} className={styles.loadingObserver}>
                <div className={styles.loadingText}>
                  <span>Plus de films...</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
