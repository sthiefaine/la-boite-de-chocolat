'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatFileSize } from '@/helpers/transcriptionHelpers';
import styles from './TranscriptionPage.module.css';

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
    id: number;
    timeMarker: string;
    content: string;
    startSeconds: number;
  }> | null;
}

export default function TranscriptionPage({
  episode,
  transcription,
  content,
  entries,
  detectedFormat,
  timeMarkedSections
}: TranscriptionPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSections, setFilteredSections] = useState(timeMarkedSections || []);

  // Recherche dans les sections (paroles)
  useEffect(() => {
    if (!searchQuery.trim() || !timeMarkedSections) {
      setFilteredSections(timeMarkedSections || []);
      return;
    }
    const results = timeMarkedSections
      .map(section => ({
        ...section,
        content: section.content
          .split('\n')
          .filter(line => line.toLowerCase().includes(searchQuery.toLowerCase()))
          .join('\n')
      }))
      .filter(section => section.content.trim().length > 0);
    setFilteredSections(results);
  }, [searchQuery, timeMarkedSections]);

  // Fonction utilitaire pour extraire timestamp et texte
  function extractTimeAndText(line: string): { time: string | null, text: string } {
    // Ex: [00:05:00.000] ou 00:05:00.000 ou 00:05:00,000 ou []
    const match = line.match(/^\s*(\[)?(\d{2}:\d{2}:\d{2}[.,]\d{3})?(\])?\s*(.*)$/);
    if (match) {
      // On garde que hh:mm:ss
      const time = match[2] ? match[2].replace(/([.,]\d{3})$/, '').replace(',', ':') : null;
      return { time, text: match[4] };
    }
    // Si la ligne est juste [] ou vide
    if (line.trim() === '[]') return { time: null, text: '' };
    return { time: null, text: line };
  }

  return (
    <div className={styles.container}>
      {/* Header minimaliste sticky */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.breadcrumb}>
            <Link href={`/episodes/${episode.slug}`} className={styles.backLink}>
              ← Retour
            </Link>
          </div>
          <div className={styles.episodeTitle}>
            {episode.title}
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
                  {/* Repère temporel toutes les 5min */}
                  <div className={styles.timeMarker}>{section.timeMarker}</div>
                  {/* On découpe chaque section en lignes/phrases */}
                  {section.content.split('\n').map((line, idx) => {
                    const { text } = extractTimeAndText(line);
                    if (!text.trim()) return null;
                    return (
                      <p key={idx} className={styles.lyricLine}>{text}</p>
                    );
                  })}
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