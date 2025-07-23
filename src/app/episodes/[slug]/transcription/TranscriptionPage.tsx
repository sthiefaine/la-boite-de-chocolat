"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { srtTimeToSeconds } from "@/helpers/transcriptionHelpers";
import styles from "./TranscriptionPage.module.css";
import {
  Link as LinkIcon,
  Pause as PauseIcon,
  Play,
} from "lucide-react";
import { usePlayerStore } from "@/lib/store/player";
import { useShallow } from "zustand/shallow";

interface SubtitleEntry {
  id: number;
  startTime: string;
  endTime: string;
  text: string;
}

interface Transcription {
  id: string;
  fileName: string;
  fileSize: number | null;
  fileType: string;
  createdAt: Date;
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
  transcription: Transcription;
  content: string;
  entries: SubtitleEntry[];
  detectedFormat: string;
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
}: {
  text: string;
  timeMarker: string;
  timeSeconds: number;
  timeEnd: number;
  episodeId: string;
  syncWithPlayer: boolean;
}) {
  const [showTime, setShowTime] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  // Seulement ce composant se re-render quand le temps change
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

  // Debug pour voir les temps exacts
  if (syncWithPlayer && playerEpisode?.id === episodeId && isPlaying) {
    console.log(`[LYRIC DEBUG] "${text.substring(0, 30)}..." - Current: ${currentPlayTime}s, Start: ${timeSeconds}s, End: ${timeEnd}s, Active: ${isActive}`);
  }

  // Debug logs pour comprendre le problème (commenté pour éviter le spam)
  // if (syncWithPlayer && playerEpisode?.id === episodeId && isPlaying) {
  //   console.log("[DEBUG]", {
  //     text: text.substring(0, 30) + "...",
  //     timeSeconds,
  //     currentPlayTime,
  //     isActive,
  //     syncWithPlayer,
  //     playerEpisodeId: playerEpisode?.id,
  //     episodeId,
  //     isPlaying,
  //   });
  // }

  const handleSeek = () => {
    if (syncWithPlayer) {
      console.log("[SEEK]", text, timeSeconds);
      usePlayerStore.getState().setCurrentPlayTime(timeSeconds);
    }
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

  // if (isActive) {
  //   console.log("[ACTIVE]", text, timeSeconds, currentPlayTime);
  // }

  return (
    <p
      className={styles.lyricLine + (isActive ? " " + styles.lyricActive : "")}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleSeek}
      style={syncWithPlayer ? { cursor: "pointer" } : undefined}
    >
      {text}
      {showTime && <i className={styles.lyricTime}>{timeMarker}</i>}
    </p>
  );
}

export default function TranscriptionPage({
  episode,
  transcription,
  content,
  entries,
  detectedFormat,
  timeMarkedSections,
  mainFilmImageUrl,
}: TranscriptionPageProps) {
  

  const [searchQuery, setSearchQuery] = useState("");
  
  const entriesWithTimestamps = entries.length > 0 ? entries : createEntriesFromContent(content);
  
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
    
    const maxSeconds = entriesWithTimestamps.length > 0 
      ? Math.max(...entriesWithTimestamps.map(entry => srtTimeToSeconds(entry.endTime)))
      : 0;
    
    const totalMinutes = Math.floor(maxSeconds / 60);
    const sectionInterval = totalMinutes > 30 ? Math.ceil(totalMinutes / 10) : 5;
    const sectionIntervalSeconds = sectionInterval * 60;
    
    console.log(`[SECTIONS] Durée totale: ${totalMinutes}min, Intervalle: ${sectionInterval}min`);
    
    const sectionMarkers: string[] = [];
    for (let seconds = 0; seconds <= maxSeconds; seconds += sectionIntervalSeconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      sectionMarkers.push(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`);
    }
    
    sectionMarkers.forEach((timeMarker, index) => {
      const seconds = index * sectionIntervalSeconds;
      sections.push({
        id: `section-${index}`,
        timeMarker,
        content: '',
        startSeconds: seconds,
        endSeconds: seconds,
        showTimeMarker: true,
        isSectionHeader: true
      });
    });
    
    entriesWithTimestamps.forEach((entry, index) => {
      const startSeconds = srtTimeToSeconds(entry.startTime);
      const endSeconds = srtTimeToSeconds(entry.endTime);
      
      sections.push({
        id: `entry-${index}`,
        timeMarker: '',
        content: entry.text,
        startSeconds,
        endSeconds,
        showTimeMarker: false,
        isSectionHeader: false
      });
    });
    
    // Trier par temps de début
    const sortedSections = sections.sort((a, b) => a.startSeconds - b.startSeconds);
    
    console.log("[SECTIONS DEBUG] Sections créées:", sortedSections.length);
    console.log("[SECTIONS DEBUG] Sections avec en-têtes:", sortedSections.filter(s => s.isSectionHeader).length);
    console.log("[SECTIONS DEBUG] Premières sections:", sortedSections.slice(0, 5));
    
    return sortedSections;
  })();
  
  const [filteredSections, setFilteredSections] = useState(
    timeMarkedSections || sectionsFromEntries
  );
  const [syncWithPlayer, setSyncWithPlayer] = useState(false);

  // Récupérer l'état du player pour le bouton play/pause
  const { isPlaying } = usePlayerStore(
    useShallow((state) => ({
      isPlaying: state.isPlaying,
    }))
  );

  // Fonction pour créer des entrées avec timestamps à partir du contenu brut
  function createEntriesFromContent(content: string): Array<{
    id: number;
    startTime: string;
    endTime: string;
    text: string;
  }> {
    const lines = content.split('\n').filter(line => line.trim());
    const entries: Array<{
      id: number;
      startTime: string;
      endTime: string;
      text: string;
    }> = [];
    
    let currentTime = 0; // Commencer à 0 seconde
    const timePerLine = 5; // 5 secondes par ligne par défaut
    
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
          text: text.trim()
        });
        
        currentTime += timePerLine;
      }
    }
    
    return entries;
  }
  
  // Fonction pour formater le temps en HH:MM:SS,mmm
  function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  }

  // Recherche dans les sections (paroles)
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

  // Fonction utilitaire pour extraire timestamp et texte
  function extractTimeAndText(line: string): {
    startTime: string | null;
    endTime: string | null;
    text: string;
  } {
    // Format VTT avec crochets: [00:00:00.480 --> 00:00:04.880]
    const vttMatchWithBrackets = line.match(
      /^\s*\[(\d{2}:\d{2}:\d{2}[.,]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[.,]\d{3})\]\s*(.*)$/
    );
    if (vttMatchWithBrackets) {
      const startTime = vttMatchWithBrackets[1].replace(".", ",");
      const endTime = vttMatchWithBrackets[2].replace(".", ",");
      return { startTime, endTime, text: vttMatchWithBrackets[3] };
    }

    // Format VTT sans crochets: 00:00:00.480 --> 00:00:04.880
    const vttMatchWithoutBrackets = line.match(
      /^\s*(\d{2}:\d{2}:\d{2}[.,]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[.,]\d{3})\s*(.*)$/
    );
    if (vttMatchWithoutBrackets) {
      const startTime = vttMatchWithoutBrackets[1].replace(".", ",");
      const endTime = vttMatchWithoutBrackets[2].replace(".", ",");
      return { startTime, endTime, text: vttMatchWithoutBrackets[3] };
    }

    // Format simple avec un seul timestamp
    const simpleMatch = line.match(
      /^\s*(\[)?(\d{2}:\d{2}:\d{2}[.,]\d{3})?(\])?\s*(.*)$/
    );
    if (simpleMatch && simpleMatch[2]) {
      const time = simpleMatch[2].replace(".", ",");
      return { startTime: time, endTime: null, text: simpleMatch[4] };
    }

    // Format avec crochets vides: []   texte
    const emptyBracketsMatch = line.match(/^\s*\[\]\s*(.*)$/);
    if (emptyBracketsMatch) {
      return { startTime: null, endTime: null, text: emptyBracketsMatch[1] };
    }

    // Si la ligne est juste [] ou vide
    if (line.trim() === "[]")
      return { startTime: null, endTime: null, text: "" };
    return { startTime: null, endTime: null, text: line };
  }

  // Helper pour convertir hh:mm:ss en secondes (utilise srtTimeToSeconds importée)
  function timeToSeconds(time: string): number {
    return srtTimeToSeconds(time);
  }

  return (
    <div className={styles.container}>
      {/* Header minimaliste sticky */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.breadcrumb}>
            <Link
              href={`/episodes/${episode.slug}`}
              className={styles.backLink}
            >
              ← Retour
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
              Sync with player
              <span className={styles.syncState}>
                {syncWithPlayer ? "ON" : "OFF"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Barre de recherche sticky */}
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

      {/* Zone scrollable des paroles */}
      <main className={styles.main}>
        <div className={styles.lyricsScroller}>
          {filteredSections && filteredSections.length > 0 ? (
            <div className={styles.timeMarkedSections}>
              {filteredSections.map((section) => (
                <div key={section.id} className={styles.timeMarkedSection}>
                  {/* En-tête de section avec style spécial */}
                  {section.isSectionHeader && (
                    <div className={styles.sectionHeader}>
                      <div className={styles.sectionTimeMarker}>{section.timeMarker}</div>
                      <div className={styles.sectionDivider}></div>
                    </div>
                  )}
                  {/* Afficher le contenu seulement s'il y en a */}
                  {section.content && (
                    <LyricLine
                      key={section.id}
                      text={section.content}
                      timeMarker={section.timeMarker}
                      timeSeconds={section.startSeconds}
                      timeEnd={section.endSeconds || (section.startSeconds + 5)}
                      episodeId={episode.id}
                      syncWithPlayer={syncWithPlayer}
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
