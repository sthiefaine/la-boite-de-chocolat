"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Mic, Clapperboard, Layers, User, type LucideIcon } from "lucide-react";
import styles from "./SearchCommand.module.css";

type IndexItem = { t: "e" | "f" | "s" | "p"; s: string; n: string };

const TYPE_META: Record<
  IndexItem["t"],
  { label: string; plural: string; Icon: LucideIcon; path: string }
> = {
  e: { label: "Épisode", plural: "Épisodes", Icon: Mic, path: "/episodes" },
  f: { label: "Film", plural: "Films", Icon: Clapperboard, path: "/films" },
  s: { label: "Saga", plural: "Sagas", Icon: Layers, path: "/sagas" },
  p: { label: "Personne", plural: "Personnes", Icon: User, path: "/people" },
};

// Normalise pour une recherche insensible aux accents et à la casse.
const normalize = (str: string) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

const MAX_RESULTS = 24;

// TTL côté client : au-delà de 5 min, on re-fetch l'index
// en gardant les items existants affichés (pas de flicker).
const INDEX_TTL_MS = 5 * 60_000;

export default function SearchCommand() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<IndexItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const lastFetchRef = useRef(0);

  // Charge l'index avec un TTL : re-fetch silencieux après expiration.
  const loadIndex = useCallback(async () => {
    if (loading) return;
    if (items && Date.now() - lastFetchRef.current < INDEX_TTL_MS) return;
    setLoading(true);
    try {
      const res = await fetch("/api/search-index", { cache: "no-store" });
      const data = await res.json();
      setItems(Array.isArray(data.items) ? data.items : []);
      lastFetchRef.current = Date.now();
    } catch {
      // En cas d'échec, on conserve les items existants s'il y en a.
      setItems((prev) => prev ?? []);
    } finally {
      setLoading(false);
    }
  }, [items, loading]);

  const openPalette = useCallback(() => {
    setOpen(true);
    loadIndex();
  }, [loadIndex]);

  const closePalette = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);

  // Raccourci global ⌘K / Ctrl+K.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => {
          if (!prev) loadIndex();
          return !prev;
        });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [loadIndex]);

  // Échap ferme la palette quel que soit l'élément focusé.
  useEffect(() => {
    if (!open) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closePalette();
      }
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [open, closePalette]);

  // Focus l'input à l'ouverture + bloque le scroll du body.
  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      document.body.style.overflow = "hidden";
      return () => {
        cancelAnimationFrame(id);
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  const results = useMemo(() => {
    if (!items) return [];
    const q = normalize(query.trim());
    if (!q) {
      // Sans requête : quelques épisodes récents en suggestion.
      return items.filter((i) => i.t === "e").slice(0, 8);
    }
    const terms = q.split(/\s+/);
    return items
      .filter((i) => {
        const n = normalize(i.n);
        return terms.every((term) => n.includes(term));
      })
      .slice(0, MAX_RESULTS);
  }, [items, query]);

  // Groupe les résultats par type pour l'affichage en sections,
  // en conservant l'index plat pour la navigation clavier.
  const sections = useMemo(() => {
    const out: Array<{ type: IndexItem["t"]; entries: Array<{ item: IndexItem; idx: number }> }> = [];
    results.forEach((item, idx) => {
      const last = out[out.length - 1];
      if (last && last.type === item.t) {
        last.entries.push({ item, idx });
      } else {
        out.push({ type: item.t, entries: [{ item, idx }] });
      }
    });
    return out;
  }, [results]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const go = useCallback(
    (item: IndexItem) => {
      closePalette();
      router.push(`${TYPE_META[item.t].path}/${item.s}`);
    },
    [router, closePalette]
  );

  const onInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = results[activeIndex];
      if (item) go(item);
    } else if (e.key === "Escape") {
      e.preventDefault();
      closePalette();
    }
  };

  // Garde l'élément actif visible.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        onClick={openPalette}
        aria-label="Rechercher sur le site"
      >
        <Search size={18} aria-hidden="true" />
        <span className={styles.triggerLabel}>Rechercher</span>
        <kbd className={styles.kbd}>⌘K</kbd>
      </button>

      {open && (
        <div
          className={styles.overlay}
          onClick={closePalette}
          role="dialog"
          aria-modal="true"
          aria-label="Recherche globale"
        >
          <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.inputRow}>
              <Search size={20} aria-hidden="true" className={styles.inputIcon} />
              <input
                ref={inputRef}
                type="text"
                className={styles.input}
                placeholder="Rechercher un épisode, un film, une saga, une personne…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKeyDown}
                aria-label="Champ de recherche"
                autoComplete="off"
              />
              <kbd className={styles.kbd}>Échap</kbd>
            </div>

            <ul ref={listRef} className={styles.results} role="listbox">
              {loading && !items && (
                <li className={styles.empty}>Chargement…</li>
              )}
              {items && results.length === 0 && (
                <li className={styles.empty}>
                  {query.trim() ? "Aucun résultat" : "Commence à taper…"}
                </li>
              )}
              {sections.map((section) => {
                const meta = TYPE_META[section.type];
                return (
                  <li key={section.type} className={styles.section}>
                    <div className={styles.sectionHeader} aria-hidden="true">
                      <span>{meta.plural}</span>
                      <span className={styles.sectionCount}>{section.entries.length}</span>
                    </div>
                    <ul className={styles.sectionList}>
                      {section.entries.map(({ item, idx }) => (
                        <li key={`${item.t}-${item.s}`}>
                          <button
                            type="button"
                            data-idx={idx}
                            className={`${styles.result} ${idx === activeIndex ? styles.resultActive : ""}`}
                            onMouseEnter={() => setActiveIndex(idx)}
                            onClick={() => go(item)}
                            role="option"
                            aria-selected={idx === activeIndex}
                          >
                            <meta.Icon size={16} className={styles.resultIcon} aria-hidden="true" />
                            <span className={styles.resultName}>{item.n}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
