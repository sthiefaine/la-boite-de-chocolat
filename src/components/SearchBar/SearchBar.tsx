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
  marvelButton?: {
    onClick: () => void;
    label?: string;
  };
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Rechercher...",
  className = "",
  yearFilter,
  marvelButton,
}: SearchBarProps) {
  return (
    <div className={`${styles.searchContainer} ${className}`}>
      <div className={styles.searchRow}>
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

        {yearFilter && (
          <select
            value={yearFilter.value}
            onChange={(e) => yearFilter.onChange(e.target.value)}
            className={styles.yearFilter}
          >
            <option value="">Saison</option>
            {yearFilter.years.map((year) => (
              <option key={year} value={year.toString()}>
                {year}
              </option>
            ))}
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
      </div>
    </div>
  );
}
