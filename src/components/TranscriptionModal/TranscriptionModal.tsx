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
    if (isOpen) {
      loadTranscriptionContent();
    }
  }, [isOpen]);

  const loadTranscriptionContent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔄 Chargement de la transcription pour episodeId:', episodeId);

      const result = await downloadTranscriptionContent(episodeId);
      console.log('📥 Résultat du téléchargement:', result);

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors du chargement');
      }

      if (!result.transcription) {
        throw new Error('Transcription non trouvée');
      }

      console.log('📄 Contenu reçu:', result.transcription.content?.substring(0, 200) + '...');
      
      setContent(result.transcription.content);
      
      // Détecter automatiquement le format basé sur le contenu
      const isVTT = result.transcription.content.includes('-->');
      const detectedFormat = isVTT ? 'vtt' : 'srt';
      
      console.log('🔍 Format détecté:', detectedFormat);
      
      const parsedEntries = parseSRT(result.transcription.content);
      console.log('🔢 Entrées parsées:', parsedEntries.length);
      
      setEntries(parsedEntries);
      setFilteredEntries(parsedEntries);

    } catch (err) {
      console.error('❌ Erreur lors du chargement:', err);
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
            {content && (
              <div className={styles.stat}>
                <span>📝</span>
                <span>{content.length} caractères</span>
              </div>
            )}
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

          {/* Affichage amélioré des paroles */}
          {!isLoading && !error && (
            <div className={styles.subtitlesContainer}>
              {/* Cas TXT : texte brut, paragraphes */}
              {transcription.fileType === 'txt' && content && (
                <div className={styles.txtContent}>
                  {content.split(/\n{2,}/).map((para, idx) => (
                    <p key={idx} className={styles.txtParagraph}>{para.trim()}</p>
                  ))}
                </div>
              )}
              {/* Cas SRT/VTT : blocs synchronisés - détection automatique */}
              {(transcription.fileType === 'srt' || transcription.fileType === 'vtt') && content && (
                <>
                  {filteredEntries.length > 0 ? (
                    <div className={styles.srtList}>
                      {filteredEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className={styles.srtBlock}
                        >
                          <div className={styles.srtTime}>{entry.startTime.replace(",", ".")} → {entry.endTime.replace(",", ".")}</div>
                          <div className={styles.srtText}>{entry.text}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.noResults}>
                      <div>📄 Fichier chargé ({content.length} caractères)</div>
                      <div>Aucun sous-titre détecté</div>
                      <div style={{marginTop: '1rem', fontSize: '0.8rem', opacity: 0.6}}>
                        Format déclaré: {transcription.fileType.toUpperCase()} | 
                        Format détecté: {content.includes('-->') ? 'VTT' : 'SRT'}
                      </div>
                      <div style={{marginTop: '1rem', fontSize: '0.8rem', opacity: 0.6}}>
                        Aperçu: {content.substring(0, 100)}...
                      </div>
                    </div>
                  )}
                </>
              )}
              {/* Aucun contenu */}
              {!content && (
                <div className={styles.noResults}>
                  <div>📄 Aucun contenu disponible</div>
                  <div>Le fichier de transcription semble vide</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 