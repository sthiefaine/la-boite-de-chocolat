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
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Rechercher...",
  className = "",
  yearFilter,
}: SearchBarProps) {
  return (
    <div className={`${styles.searchContainer} ${className}`}>
      <div className={styles.searchRow}>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={styles.searchInput}
          autoComplete="off"
        />
        
        {yearFilter && (
          <select
            value={yearFilter.value}
            onChange={(e) => yearFilter.onChange(e.target.value)}
            className={styles.yearFilter}
          >
            <option value="">Tous les épisodes</option>
            {yearFilter.years.map((year) => (
              <option key={year} value={year.toString()}>
                {year}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
