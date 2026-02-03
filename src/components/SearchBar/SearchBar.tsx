"use client";

import styles from "./SearchBar.module.css";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  yearFilter?: {
    value: string;
    onChange: (value: string) => void;
    years: number[];
  };
  genreFilter?: {
    value: string;
    onChange: (value: string) => void;
    genres: string[];
  };
  marvelButton?: {
    onClick: () => void;
    label?: string;
  };
  sortFilter?: {
    value: string;
    onChange: (value: string) => void;
  };
  clearFilters?: () => void;
  hasActiveFilters?: boolean;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Rechercher...",
  className = "",
  yearFilter,
  genreFilter,
  sortFilter,
  marvelButton,
  clearFilters,
  hasActiveFilters = false,
}: SearchBarProps) {
  return (
    <div className={`${styles.searchContainer} ${className}`}>
      <div className={styles.searchRow}>
        <div className={styles.searchInputGroup}>
          <input
            type="search"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={styles.searchInput}
            autoComplete="off"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                onChange("");
              }
            }}
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className={styles.clearButton}
              aria-label="Effacer la recherche"
            >
              ✕
            </button>
          )}
        </div>

        <div className={styles.filtersGroup}>
          {yearFilter && (
            <select
              value={yearFilter.value}
              onChange={(e) => yearFilter.onChange(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">Toutes les années</option>
              {yearFilter.years.map((year) => (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              ))}
            </select>
          )}

          {genreFilter && (
            <select
              value={genreFilter.value}
              onChange={(e) => genreFilter.onChange(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">Tous les genres</option>
              {genreFilter.genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          )}
          
          {sortFilter && (
            <select
              value={sortFilter.value}
              onChange={(e) => sortFilter.onChange(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="latest">Plus récents</option>
              <option value="oldest">Plus anciens</option>
              <option value="shortest">Plus courts</option>
              <option value="longest">Plus longs</option>
              <option value="title">A → Z</option>
            </select>
          )}

          {marvelButton && (
            <button
              type="button"
              onClick={marvelButton.onClick}
              className={styles.marvelButton}
            >
              {marvelButton.label || "Marvel"}
            </button>
          )}

          {hasActiveFilters && clearFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className={styles.clearFiltersButton}
              aria-label="Effacer tous les filtres"
            >
              Effacer les filtres
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
