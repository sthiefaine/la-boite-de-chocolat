"use client";

import { useState, useMemo, useCallback, useDeferredValue } from "react";
import FilmCard from "../FilmCard/FilmCard";
import SearchBar from "../SearchBar/SearchBar";
import styles from "./FilmsGrid.module.css";

interface Film {
  id: string;
  title: string;
  slug: string;
  year: number | null;
  imgFileName: string | null;
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
  links: Array<{
    film: Film;
  }>;
}

interface FilmsGridProps {
  episodes: Episode[];
}

export default function FilmsGrid({ episodes }: FilmsGridProps) {
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
          (film.episodeTitle && film.episodeTitle.toLowerCase().includes(query))
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

  return (
    <div className={styles.container}>
      <SearchBar
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Rechercher un film, une saga, une année..."
        yearFilter={{
          value: yearFilter,
          onChange: handleYearChange,
          years: availableYears,
        }}
      />

      <div className={styles.filmsGrid}>
        {filteredFilms.length === 0 ? (
          <FilmCard isNoResults={true} />
        ) : (
          filteredFilms.map((film) => (
            <FilmCard
              key={film.id}
              film={film}
              episodeTitle={film.episodeTitle}
              episodeDate={film.episodeDate}
              episodeDuration={film.episodeDuration}
              episodeSlug={film.episodeSlug}
            />
          ))
        )}
      </div>
    </div>
  );
}
