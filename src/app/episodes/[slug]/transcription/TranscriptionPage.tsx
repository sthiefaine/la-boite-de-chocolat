"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { countWords, type WordCount } from "@/helpers/wordStats";
import {
  srtTimeToSeconds,
  extractTimeAndText,
  getSpeakerColor,
  getSpeakerLabel,
  formatMinutesSeconds,
} from "@/helpers/transcriptionHelpers";
import type { SpeakerSegment } from "@/helpers/transcriptionHelpers";
import styles from "./TranscriptionPage.module.css";
import {
  Link as LinkIcon,
  Pause as PauseIcon,
  Play,
  ArrowLeft,
  Unlink,
  Search,
  X,
} from "lucide-react";
import { usePlayerStore } from "@/lib/store/player";
import { useShallow } from "zustand/shallow";

interface SubtitleEntry {
  id: number;
  startTime: string;
  endTime: string;
  text: string;
  speaker_id?: string;
}

interface Episode {
  id: string;
  title: string;
  slug: string | null;
  audioUrl: string;
  links: Array<{
    film?: {
      title: string;
      year?: number | null;
      director?: string | null;
    } | null;
  }>;
}

interface Section {
  id: number | string;
  timeMarker: string;
  content: string;
  startSeconds: number;
  endSeconds?: number;
  showTimeMarker?: boolean;
  isSectionHeader?: boolean;
  speaker_id?: string;
}

interface TranscriptionPageProps {
  episode: Episode;
  content: string;
  entries: SubtitleEntry[];
  timeMarkedSections?: Section[] | null;
  mainFilmImageUrl: string;
  topWords?: WordCount[];
}

// --- Single line component ---
function TranscriptionLine({
  section,
  episodeId,
  syncWithPlayer,
  episode,
  mainFilmImageUrl,
  showSpeakerBadge,
}: {
  section: Section;
  episodeId: string;
  syncWithPlayer: boolean;
  episode: Episode;
  mainFilmImageUrl: string;
  showSpeakerBadge: boolean;
}) {
  const lineRef = useRef<HTMLParagraphElement>(null);

  const { episode: playerEpisode, currentPlayTime } = usePlayerStore(
    useShallow((state) => ({
      episode: state.episode,
      currentPlayTime: state.currentPlayTime,
    }))
  );

  const isCurrentEpisode = playerEpisode?.id === episodeId;
  const timeEnd = section.endSeconds || section.startSeconds + 5;
  const isActive =
    isCurrentEpisode &&
    currentPlayTime >= section.startSeconds &&
    currentPlayTime < timeEnd + 0.15;

  useEffect(() => {
    if (isActive && syncWithPlayer && lineRef.current) {
      lineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [isActive, syncWithPlayer]);

  const handleSeek = () => {
    const playerStore = usePlayerStore.getState();

    if (playerStore.episode?.id !== episodeId) {
      playerStore.setClearPlayerStore();
      playerStore.setEpisode({
        id: episodeId,
        title: episode.title,
        artist: "La Boîte de Chocolat",
        img: mainFilmImageUrl,
        url: episode.audioUrl,
        slug: episode.slug || "",
        age: null,
      });
    }

    const audioElement = document.getElementById("audio") as HTMLAudioElement;
    if (audioElement) {
      audioElement.currentTime = section.startSeconds;
    }

    setTimeout(() => {
      playerStore.setCurrentPlayTime(section.startSeconds);
    }, 0);
  };

  const speakerColor = section.speaker_id
    ? getSpeakerColor(section.speaker_id)
    : undefined;

  return (
    <>
      {showSpeakerBadge && section.speaker_id && (
        <div className={styles.speakerBadge}>
          <span
            className={styles.speakerDot}
            style={{ backgroundColor: speakerColor }}
          />
          <span className={styles.speakerLabel}>
            {getSpeakerLabel(section.speaker_id)}
          </span>
        </div>
      )}
      <p
        ref={lineRef}
        className={`${styles.line} ${isActive ? styles.lineActive : ""}`}
        style={
          speakerColor
            ? ({ "--speaker-color": speakerColor } as React.CSSProperties)
            : undefined
        }
        onClick={handleSeek}
      >
        {section.content}
        <span className={styles.lineTime}>
          {formatMinutesSeconds(section.startSeconds)}
        </span>
      </p>
    </>
  );
}

// --- TimeDivider component ---
function TimeDivider({ seconds }: { seconds: number }) {
  return (
    <div className={styles.timeDivider}>
      <div className={styles.timeDividerLine} />
      <span className={styles.timeDividerLabel}>
        {formatMinutesSeconds(seconds)}
      </span>
      <div className={styles.timeDividerLine} />
    </div>
  );
}

// --- Main component ---
export default function TranscriptionPage({
  episode,
  content,
  entries,
  timeMarkedSections,
  mainFilmImageUrl,
  topWords,
}: TranscriptionPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [syncWithPlayer, setSyncWithPlayer] = useState(true);
  const [speakerFilter, setSpeakerFilter] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { isPlaying } = usePlayerStore(
    useShallow((state) => ({
      isPlaying: state.isPlaying,
    }))
  );

  // Build sections from entries if not provided
  const allSections = useMemo(() => {
    if (timeMarkedSections) return timeMarkedSections;

    const entriesWithTimestamps =
      entries.length > 0 ? entries : createEntriesFromContent(content);

    return entriesWithTimestamps.map((entry, index) => ({
      id: index + 1,
      timeMarker: "",
      content: entry.text,
      startSeconds: srtTimeToSeconds(entry.startTime),
      endSeconds: srtTimeToSeconds(entry.endTime),
      showTimeMarker: false,
      isSectionHeader: false,
      speaker_id: entry.speaker_id,
    }));
  }, [timeMarkedSections, entries, content]);

  // Content sections only (no headers)
  const contentSections = useMemo(
    () => allSections.filter((s) => !s.isSectionHeader && s.content),
    [allSections]
  );

  // Filter by search + speaker
  const filteredSections = useMemo(() => {
    let sections = contentSections;
    if (speakerFilter) {
      sections = sections.filter((s) => s.speaker_id === speakerFilter);
    }
    if (searchQuery.trim()) {
      const lower = searchQuery.toLowerCase();
      sections = sections.filter((s) =>
        s.content.toLowerCase().includes(lower)
      );
    }
    return sections;
  }, [contentSections, searchQuery, speakerFilter]);

  // Intervenants distincts (ordre numérique) pour la légende/le filtre
  const speakers = useMemo(() => {
    const ids = new Set<string>();
    for (const s of contentSections) {
      if (s.speaker_id) ids.add(s.speaker_id);
    }
    return [...ids].sort((a, b) => {
      const na = parseInt(a.match(/(\d+)/)?.[1] ?? "0", 10);
      const nb = parseInt(b.match(/(\d+)/)?.[1] ?? "0", 10);
      return na - nb;
    });
  }, [contentSections]);

  const mainFilm = episode.links[0]?.film ?? null;

  // Mots affichés dans l'intro : ceux de l'épisode (calculés côté serveur),
  // ou ceux de l'intervenant sélectionné (calculés à la volée).
  const displayedWords = useMemo(() => {
    if (!speakerFilter) return topWords ?? [];
    const text = contentSections
      .filter((s) => s.speaker_id === speakerFilter)
      .map((s) => s.content)
      .join(" ");
    return countWords(text, 14);
  }, [speakerFilter, topWords, contentSections]);

  // Stats de l'épisode pour le bloc d'intro
  const introStats = useMemo(() => {
    if (contentSections.length === 0) return null;
    const last = contentSections[contentSections.length - 1];
    const totalSeconds = last.endSeconds || last.startSeconds;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.round((totalSeconds % 3600) / 60);
    const duration =
      hours > 0
        ? `${hours} h ${minutes.toString().padStart(2, "0")}`
        : `${minutes} min`;
    return { lines: contentSections.length, duration };
  }, [contentSections]);

  // Compute time markers (every 10 min)
  const timeMarkers = useMemo(() => {
    if (contentSections.length === 0) return [];
    const maxSeconds =
      contentSections[contentSections.length - 1].endSeconds ||
      contentSections[contentSections.length - 1].startSeconds;
    const markers: number[] = [];
    const interval = 600; // 10 minutes
    for (let s = interval; s < maxSeconds; s += interval) {
      markers.push(s);
    }
    return markers;
  }, [contentSections]);

  // Push speaker segments to the player store, tagués avec l'id de
  // l'épisode : le player ne les applique que si c'est bien cet épisode
  // qui joue. Nettoyés au démontage (sans écraser ceux d'une autre page).
  useEffect(() => {
    const hasSpeakers = entries.some((e) => e.speaker_id);
    if (!hasSpeakers) return;

    const segments: SpeakerSegment[] = entries
      .filter((e) => e.speaker_id)
      .map((e) => ({
        start: srtTimeToSeconds(e.startTime),
        end: srtTimeToSeconds(e.endTime),
        speakerId: e.speaker_id!,
      }));

    usePlayerStore.getState().setSpeakerSegments({
      episodeId: episode.id,
      segments,
    });

    return () => {
      const store = usePlayerStore.getState();
      if (store.speakerSegments?.episodeId === episode.id) {
        store.setSpeakerSegments(null);
      }
    };
  }, [entries, episode.id]);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  function createEntriesFromContent(rawContent: string): SubtitleEntry[] {
    const lines = rawContent.split("\n").filter((line) => line.trim());
    const result: SubtitleEntry[] = [];
    let currentTime = 0;
    const timePerLine = 5;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const { text } = extractTimeAndText(line);

      if (text.trim()) {
        const startTime = formatSrtTime(currentTime);
        const endTime = formatSrtTime(currentTime + timePerLine);

        result.push({
          id: i + 1,
          startTime,
          endTime,
          text: text.trim(),
        });

        currentTime += timePerLine;
      }
    }

    return result;
  }

  function formatSrtTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")},${ms
      .toString()
      .padStart(3, "0")}`;
  }

  // Build render list: interleave time dividers with lines
  const renderItems = useMemo(() => {
    const isSearching = searchQuery.trim().length > 0;

    if (isSearching) {
      return filteredSections.map((section, i) => ({
        type: "line" as const,
        section,
        key: `line-${section.id}`,
        showSpeakerBadge:
          i === 0 ||
          section.speaker_id !== filteredSections[i - 1]?.speaker_id,
      }));
    }

    const items: Array<
      | {
          type: "line";
          section: Section;
          key: string;
          showSpeakerBadge: boolean;
        }
      | { type: "divider"; seconds: number; key: string }
    > = [];

    let markerIndex = 0;

    for (let i = 0; i < filteredSections.length; i++) {
      const section = filteredSections[i];

      // Insert time dividers that fall before this line
      while (
        markerIndex < timeMarkers.length &&
        timeMarkers[markerIndex] <= section.startSeconds
      ) {
        items.push({
          type: "divider",
          seconds: timeMarkers[markerIndex],
          key: `divider-${timeMarkers[markerIndex]}`,
        });
        markerIndex++;
      }

      const showSpeakerBadge =
        !!section.speaker_id &&
        (i === 0 ||
          section.speaker_id !== filteredSections[i - 1]?.speaker_id);

      items.push({
        type: "line",
        section,
        key: `line-${section.id}`,
        showSpeakerBadge,
      });
    }

    return items;
  }, [filteredSections, timeMarkers, searchQuery]);

  const handleTogglePlay = () => {
    const playerStore = usePlayerStore.getState();
    if (
      playerStore.isPlaying &&
      playerStore.episode?.url === episode.audioUrl
    ) {
      playerStore.setIsPlaying(false);
    } else {
      if (playerStore.episode?.url !== episode.audioUrl) {
        playerStore.setClearPlayerStore();
        playerStore.setEpisode({
          id: episode.id,
          title: episode.title,
          artist: "La Boîte de Chocolat",
          img: mainFilmImageUrl,
          url: episode.audioUrl,
          slug: episode.slug || "",
          age: null,
        });
      }
      playerStore.setIsPlaying(true);
    }
  };

  return (
    <div className={styles.container}>
      {/* Compact header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link
            href={`/episodes/${episode.slug}`}
            className={styles.backLink}
          >
            <ArrowLeft size={18} strokeWidth={2.2} />
            <span className={styles.backLinkText}>Épisode</span>
          </Link>

          <div className={styles.episodeTitle}>{episode.title}</div>

          <div className={styles.headerActions}>
            <button
              className={`${styles.iconButton} ${styles.iconButtonPlay}`}
              type="button"
              onClick={handleTogglePlay}
              title={isPlaying ? "Pause" : "Écouter"}
            >
              {isPlaying ? (
                <PauseIcon size={18} strokeWidth={2.2} />
              ) : (
                <Play size={18} strokeWidth={2.2} />
              )}
              <span className={styles.buttonText}>
                {isPlaying ? "Pause" : "Écouter"}
              </span>
            </button>

            <button
              className={`${styles.iconButton} ${styles.iconButtonSync} ${syncWithPlayer ? styles.active : styles.inactive}`}
              type="button"
              onClick={() => setSyncWithPlayer((v) => !v)}
              aria-pressed={syncWithPlayer}
              title={`Sync ${syncWithPlayer ? "ON" : "OFF"}`}
            >
              {syncWithPlayer ? (
                <LinkIcon size={16} strokeWidth={2.2} />
              ) : (
                <Unlink size={16} strokeWidth={2.2} />
              )}
              <span className={styles.buttonText}>
                Sync {syncWithPlayer ? "ON" : "OFF"}
              </span>
            </button>

            <button
              className={`${styles.iconButton} ${styles.iconButtonSearch} ${searchOpen ? styles.active : ""}`}
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              title="Rechercher"
            >
              {searchOpen ? (
                <X size={18} strokeWidth={2.2} />
              ) : (
                <Search size={18} strokeWidth={2.2} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Search overlay */}
      <div
        className={`${styles.searchOverlay} ${searchOpen ? styles.open : ""}`}
      >
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Rechercher dans la transcription..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Conversation - phrase by phrase */}
      <div className={styles.conversationScroller}>
        {/* Bloc d'intro : contexte épisode, intervenants, mots-clés */}
        <section className={styles.intro}>
          <div className={styles.introHeader}>
            {mainFilmImageUrl && (
              <Image
                src={mainFilmImageUrl}
                alt={mainFilm ? `Poster de ${mainFilm.title}` : episode.title}
                width={72}
                height={108}
                className={styles.introPoster}
                unoptimized
              />
            )}
            <div className={styles.introMeta}>
              {mainFilm && (
                <p className={styles.introFilm}>
                  {mainFilm.title}
                  {mainFilm.year ? ` (${mainFilm.year})` : ""}
                </p>
              )}
              {introStats && (
                <p className={styles.introStats}>
                  {introStats.lines} répliques
                  {speakers.length > 0 &&
                    ` · ${speakers.length} intervenant${speakers.length > 1 ? "s" : ""}`}
                  {` · ${introStats.duration}`}
                </p>
              )}
              <Link href="/transcription/stats" className={styles.introStatsLink}>
                Voir les mots de tout le podcast
              </Link>
            </div>
          </div>

          {speakers.length > 1 && (
            <div className={styles.introRow}>
              <span className={styles.introLabel}>Intervenants</span>
              <div className={styles.chipList}>
                {speakers.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() =>
                      setSpeakerFilter((prev) => (prev === id ? null : id))
                    }
                    className={`${styles.speakerChip} ${
                      speakerFilter === id ? styles.speakerChipActive : ""
                    }`}
                    aria-pressed={speakerFilter === id}
                  >
                    <span
                      className={styles.speakerChipDot}
                      style={{ backgroundColor: getSpeakerColor(id) }}
                      aria-hidden="true"
                    />
                    {getSpeakerLabel(id)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {displayedWords.length > 0 && (
            <div className={styles.introRow}>
              <span className={styles.introLabel}>
                {speakerFilter
                  ? `Les mots de ${getSpeakerLabel(speakerFilter)}`
                  : "Les mots de cet épisode"}
              </span>
              <div className={styles.chipList}>
                {displayedWords.map((w) => (
                  <button
                    key={w.word}
                    type="button"
                    onClick={() => {
                      if (searchQuery === w.word) {
                        setSearchQuery("");
                        setSearchOpen(false);
                      } else {
                        setSearchQuery(w.word);
                        setSearchOpen(true);
                      }
                    }}
                    className={`${styles.wordChip} ${
                      searchQuery === w.word ? styles.wordChipActive : ""
                    }`}
                    aria-pressed={searchQuery === w.word}
                    title={`${w.count} occurrences — cliquer pour rechercher`}
                  >
                    {w.word}
                    <span className={styles.wordChipCount}>{w.count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {renderItems.length > 0 ? (
          renderItems.map((item) =>
            item.type === "divider" ? (
              <TimeDivider key={item.key} seconds={item.seconds} />
            ) : (
              <TranscriptionLine
                key={item.key}
                section={item.section}
                episodeId={episode.id}
                syncWithPlayer={syncWithPlayer}
                episode={episode}
                mainFilmImageUrl={mainFilmImageUrl}
                showSpeakerBadge={item.showSpeakerBadge}
              />
            )
          )
        ) : (
          <div className={styles.noResults}>
            <div>Aucun résultat trouvé</div>
            <div>Essayez avec un autre mot-clé</div>
          </div>
        )}

      </div>
    </div>
  );
}
