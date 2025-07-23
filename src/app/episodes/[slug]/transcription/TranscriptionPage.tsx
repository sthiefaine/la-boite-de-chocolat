"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { srtTimeToSeconds, extractTimeAndText } from "@/helpers/transcriptionHelpers";
import styles from "./TranscriptionPage.module.css";
import {
  Link as LinkIcon,
  Pause as PauseIcon,
  Play,
  ArrowLeft,
} from "lucide-react";
import { usePlayerStore } from "@/lib/store/player";
import { useShallow } from "zustand/shallow";

interface SubtitleEntry {
  id: number;
  startTime: string;
  endTime: string;
  text: string;
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

interface TranscriptionPageProps {
  episode: Episode;
  content: string;
  entries: SubtitleEntry[];
  timeMarkedSections?: Array<{
    id: number | string;
    timeMarker: string;
    content: string;
    startSeconds: number;
    endSeconds?: number;
    showTimeMarker?: boolean;
    isSectionHeader?: boolean;
  }> | null;
  mainFilmImageUrl: string;
}

function LyricLine({
  text,
  timeMarker,
  timeSeconds,
  timeEnd,
  episodeId,
  syncWithPlayer,
  episode,
  mainFilmImageUrl,
}: {
  text: string;
  timeMarker: string;
  timeSeconds: number;
  timeEnd: number;
  episodeId: string;
  syncWithPlayer: boolean;
  episode: Episode;
  mainFilmImageUrl: string;
}) {
  const [showTime, setShowTime] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const lineRef = useRef<HTMLParagraphElement>(null);

  const {
    episode: playerEpisode,
    currentPlayTime,
    isPlaying,
  } = usePlayerStore(
    useShallow((state) => ({
      episode: state.episode,
      currentPlayTime: state.currentPlayTime,
      isPlaying: state.isPlaying,
    }))
  );

  const isActive =
    syncWithPlayer &&
    playerEpisode?.id === episodeId &&
    currentPlayTime >= timeSeconds &&
    currentPlayTime < timeEnd;

  useEffect(() => {
    if (isActive && lineRef.current) {
      const scrollerElement = document.querySelector(`.${styles.lyricsScroller}`);
      if (scrollerElement) {
        const lineRect = lineRef.current.getBoundingClientRect();
        const scrollerRect = scrollerElement.getBoundingClientRect();
        
        const lineTop = lineRect.top;
        const scrollerTop = scrollerRect.top;
        const scrollerHeight = scrollerRect.height;
        
        const lineCenter = lineTop + lineRect.height / 2;
        const scrollerCenter = scrollerTop + scrollerHeight / 2;
        
        const scrollOffset = lineCenter - scrollerCenter;
        
        scrollerElement.scrollBy({
          top: scrollOffset,
          behavior: "smooth",
        });
      }
    }
  }, [isActive]);

  const handleSeek = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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
      audioElement.currentTime = timeSeconds;
    }

    setTimeout(() => {
      playerStore.setCurrentPlayTime(timeSeconds);
    }, 0);
  };

  const handleMouseEnter = () => {
    const t = setTimeout(() => setShowTime(true), 800);
    setTimer(t);
  };

  const handleMouseLeave = () => {
    if (timer) clearTimeout(timer);
    setShowTime(false);
  };

  useEffect(
    () => () => {
      if (timer) clearTimeout(timer);
    },
    [timer]
  );

  return (
    <p
      ref={lineRef}
      className={styles.lyricLine + (isActive ? " " + styles.lyricActive : "")}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleSeek}
      style={{ cursor: "pointer" }}
    >
      {text}
      {showTime && <i className={styles.lyricTime}>{timeMarker}</i>}
    </p>
  );
}

export default function TranscriptionPage({
  episode,
  content,
  entries,
  timeMarkedSections,
  mainFilmImageUrl,
}: TranscriptionPageProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const entriesWithTimestamps =
    entries.length > 0 ? entries : createEntriesFromContent(content);

  const sectionsFromEntries = (() => {
    const sections: Array<{
      id: number | string;
      timeMarker: string;
      content: string;
      startSeconds: number;
      endSeconds: number;
      showTimeMarker: boolean;
      isSectionHeader: boolean;
    }> = [];

    const maxSeconds =
      entriesWithTimestamps.length > 0
        ? Math.max(
            ...entriesWithTimestamps.map((entry) =>
              srtTimeToSeconds(entry.endTime)
            )
          )
        : 0;

    const totalMinutes = Math.floor(maxSeconds / 60);
    const sectionInterval =
      totalMinutes > 30 ? Math.ceil(totalMinutes / 10) : 5;
    const sectionIntervalSeconds = sectionInterval * 60;

    const sectionMarkers: string[] = [];
    for (
      let seconds = 0;
      seconds <= maxSeconds;
      seconds += sectionIntervalSeconds
    ) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      sectionMarkers.push(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:00`
      );
    }

    sectionMarkers.forEach((timeMarker, index) => {
      const seconds = index * sectionIntervalSeconds;
      sections.push({
        id: `section-${index}`,
        timeMarker,
        content: "",
        startSeconds: seconds,
        endSeconds: seconds,
        showTimeMarker: true,
        isSectionHeader: true,
      });
    });

    entriesWithTimestamps.forEach((entry, index) => {
      const startSeconds = srtTimeToSeconds(entry.startTime);
      const endSeconds = srtTimeToSeconds(entry.endTime);

      sections.push({
        id: `entry-${index}`,
        timeMarker: "",
        content: entry.text,
        startSeconds,
        endSeconds,
        showTimeMarker: false,
        isSectionHeader: false,
      });
    });

    const sortedSections = sections.sort(
      (a, b) => a.startSeconds - b.startSeconds
    );

    return sortedSections;
  })();

  const [filteredSections, setFilteredSections] = useState(
    timeMarkedSections || sectionsFromEntries
  );
  const [syncWithPlayer, setSyncWithPlayer] = useState(true);

  const { isPlaying } = usePlayerStore(
    useShallow((state) => ({
      isPlaying: state.isPlaying,
    }))
  );

  function createEntriesFromContent(content: string): Array<{
    id: number;
    startTime: string;
    endTime: string;
    text: string;
  }> {
    const lines = content.split("\n").filter((line) => line.trim());
    const entries: Array<{
      id: number;
      startTime: string;
      endTime: string;
      text: string;
    }> = [];

    let currentTime = 0;
    const timePerLine = 5;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const { text } = extractTimeAndText(line);

      if (text.trim()) {
        const startTime = formatTime(currentTime);
        const endTime = formatTime(currentTime + timePerLine);

        entries.push({
          id: i + 1,
          startTime,
          endTime,
          text: text.trim(),
        });

        currentTime += timePerLine;
      }
    }

    return entries;
  }

  function formatTime(seconds: number): string {
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

  useEffect(() => {
    const allSections = timeMarkedSections || sectionsFromEntries;

    if (!searchQuery.trim() || !allSections) {
      setFilteredSections(allSections || []);
      return;
    }

    const results = allSections.filter((section) =>
      section.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredSections(results);
  }, [searchQuery, timeMarkedSections, sectionsFromEntries]);





  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.breadcrumb}>
            <Link
              href={`/episodes/${episode.slug}`}
              className={styles.backLink}
            >
              <ArrowLeft size={18} strokeWidth={2.2} />
              <span>Épisode</span>
            </Link>
          </div>
          <div className={styles.episodeTitle}>{episode.title}</div>
          <div className={styles.headerActions}>
            <button
              className={styles.playButton}
              type="button"
              onClick={() => {
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
              }}
              title={isPlaying ? "Mettre en pause" : "Lancer l'épisode"}
            >
              <span className={styles.playIcon}>
                {isPlaying ? (
                  <PauseIcon size={20} strokeWidth={2.2} />
                ) : (
                  <Play size={20} strokeWidth={2.2} />
                )}
              </span>
              {isPlaying ? "Pause" : "Écouter"}
            </button>
            <button
              className={
                styles.syncButton +
                " " +
                (syncWithPlayer ? styles.active : styles.inactive)
              }
              type="button"
              onClick={() => setSyncWithPlayer((v) => !v)}
              aria-pressed={syncWithPlayer}
              title="Synchroniser l'affichage avec le player audio"
            >
              <span className={styles.syncIcon}>
                {syncWithPlayer ? (
                  <LinkIcon size={18} strokeWidth={2.2} />
                ) : (
                  <PauseIcon size={18} strokeWidth={2.2} />
                )}
              </span>
              Sync
              <span className={styles.syncState}>
                {syncWithPlayer ? "ON" : "OFF"}
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Rechercher dans la transcription..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      <main className={styles.main}>
        <div className={styles.lyricsScroller}>
          {filteredSections && filteredSections.length > 0 ? (
            <div className={styles.timeMarkedSections}>
              {filteredSections.map((section) => (
                <div key={section.id} className={styles.timeMarkedSection}>
                  {section.isSectionHeader && (
                    <div className={styles.sectionHeader}>
                      <div className={styles.sectionTimeMarker}>
                        {section.timeMarker}
                      </div>
                      <div className={styles.sectionDivider}></div>
                    </div>
                  )}
                  {section.content && (
                    <LyricLine
                      key={section.id}
                      text={section.content}
                      timeMarker={section.timeMarker}
                      timeSeconds={section.startSeconds}
                      timeEnd={section.endSeconds || section.startSeconds + 5}
                      episodeId={episode.id}
                      syncWithPlayer={syncWithPlayer}
                      episode={episode}
                      mainFilmImageUrl={mainFilmImageUrl}
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noResults}>
              <div>Aucune parole trouvée</div>
              <div>Essayez avec un autre mot-clé</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
