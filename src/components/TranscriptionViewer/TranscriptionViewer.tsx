'use client';

import { useState, useEffect } from 'react';
import { getTranscriptionDownloadUrl, parseSRT, searchInTranscription, formatFileSize } from '@/helpers/transcriptionHelpers';
import styles from './TranscriptionViewer.module.css';

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

interface TranscriptionViewerProps {
  episodeId: string;
  transcription: Transcription;
}

export default function TranscriptionViewer({ episodeId, transcription }: TranscriptionViewerProps) {
  const [content, setContent] = useState<string>('');
  const [entries, setEntries] = useState<SubtitleEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEntries, setFilteredEntries] = useState<SubtitleEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger le contenu de la transcription
  useEffect(() => {
    const loadTranscription = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/transcription/${episodeId}`);
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Erreur lors du chargement');
        }

        setContent(result.transcription.content);
        const parsedEntries = parseSRT(result.transcription.content);
        setEntries(parsedEntries);
        setFilteredEntries(parsedEntries);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      } finally {
        setIsLoading(false);
      }
    };

    loadTranscription();
  }, [episodeId]);

  // Recherche dans les sous-titres
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEntries(entries);
      return;
    }

    const results = searchInTranscription(entries, searchQuery);
    setFilteredEntries(results);
  }, [searchQuery, entries]);

  const handleDownload = () => {
    const downloadUrl = getTranscriptionDownloadUrl(transcription.fileName);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = transcription.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className={styles.transcriptionViewer}>
        <div className={styles.loading}>
          Chargement de la transcription...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.transcriptionViewer}>
        <div className={styles.error}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.transcriptionViewer}>
      <div className={styles.header}>
        <h3 className={styles.title}>Transcription</h3>
        <a
          href={getTranscriptionDownloadUrl(transcription.fileName)}
          download={transcription.fileName}
          className={styles.downloadButton}
          onClick={handleDownload}
        >
          📥 Télécharger
        </a>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span>📄</span>
          <span>{transcription.fileType.toUpperCase()}</span>
        </div>
        <div className={styles.stat}>
          <span>📏</span>
          <span>{formatFileSize(transcription.fileSize || 0)}</span>
        </div>
        <div className={styles.stat}>
          <span>🔢</span>
          <span>{entries.length} sous-titres</span>
        </div>
        {searchQuery && (
          <div className={styles.stat}>
            <span>🔍</span>
            <span>{filteredEntries.length} résultats</span>
          </div>
        )}
      </div>

      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Rechercher dans la transcription..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.subtitlesContainer}>
        {filteredEntries.length === 0 ? (
          <div className={styles.noResults}>
            {searchQuery ? 'Aucun résultat trouvé' : 'Aucun sous-titre disponible'}
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className={`${styles.subtitleEntry} ${
                searchQuery && entry.text.toLowerCase().includes(searchQuery.toLowerCase())
                  ? styles.highlighted
                  : ''
              }`}
            >
              <div className={styles.subtitleHeader}>
                <span className={styles.subtitleId}>#{entry.id}</span>
                <span className={styles.subtitleTime}>
                  {entry.startTime} → {entry.endTime}
                </span>
              </div>
              <div className={styles.subtitleText}>{entry.text}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 