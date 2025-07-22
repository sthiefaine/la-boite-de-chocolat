'use client';

import { useState, useEffect } from 'react';
import { downloadTranscriptionContent } from '@/app/actions/transcription';
import { parseSRT, searchInTranscription, formatFileSize, TRANSCRIPTION_CONFIG } from '@/helpers/transcriptionHelpers';
import styles from './TranscriptionModal.module.css';

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

interface TranscriptionModalProps {
  episodeId: string;
  transcription: Transcription;
  isOpen: boolean;
  onClose: () => void;
}

export default function TranscriptionModal({ 
  episodeId, 
  transcription, 
  isOpen, 
  onClose 
}: TranscriptionModalProps) {
  const [content, setContent] = useState<string>('');
  const [entries, setEntries] = useState<SubtitleEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEntries, setFilteredEntries] = useState<SubtitleEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger le contenu de la transcription quand la modal s'ouvre
  useEffect(() => {
    if (isOpen && !content) {
      loadTranscriptionContent();
    }
  }, [isOpen, content]);

  const loadTranscriptionContent = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await downloadTranscriptionContent(episodeId);

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors du chargement');
      }

      if (!result.transcription) {
        throw new Error('Transcription non trouvée');
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
    const downloadUrl = `${TRANSCRIPTION_CONFIG.readServer}${transcription.fileName}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = transcription.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Transcription</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
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

          <div className={styles.actions}>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Rechercher dans la transcription..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <button className={styles.downloadButton} onClick={handleDownload}>
              📥 Télécharger
            </button>
          </div>

          {isLoading && (
            <div className={styles.loading}>
              Chargement de la transcription...
            </div>
          )}

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          {!isLoading && !error && (
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
          )}
        </div>
      </div>
    </div>
  );
} 