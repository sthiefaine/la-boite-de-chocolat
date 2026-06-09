'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { uploadTranscription, deleteTranscription, getTranscription } from '@/app/actions/transcription';
import { isSupportedFileType, formatFileSize } from '@/helpers/transcriptionHelpers';
import styles from './TranscriptionUpload.module.css';

interface TranscriptionUploadProps {
  episodeId: string;
}

export default function TranscriptionUpload({ episodeId }: TranscriptionUploadProps) {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingTranscription, setExistingTranscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadState, setUploadState] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Charger la transcription existante
  useEffect(() => {
    const loadExistingTranscription = async () => {
      const result = await getTranscription(episodeId);
      if (result.success && result.transcription) {
        setExistingTranscription(result.transcription);
      }
    };

    loadExistingTranscription();
  }, [episodeId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (!isSupportedFileType(file.name)) {
        alert('Type de fichier non supporté. Utilisez .srt, .txt, .vtt ou .json');
        return;
      }

      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Fichier trop volumineux (max 5MB)');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsLoading(true);
    setUploadState(null);

    try {
      const formData = new FormData();
      formData.append('episodeId', episodeId);
      formData.append('transcriptionFile', selectedFile);

      const result = await uploadTranscription(formData);
      setUploadState(result);

      if (result.success) {
        setSelectedFile(null);

        const existingResult = await getTranscription(episodeId);
        if (existingResult.success && existingResult.transcription) {
          setExistingTranscription(existingResult.transcription);
        }

        // Purge le Router Cache client pour que la page publique
        // affiche le bouton Transcription sans rechargement complet
        router.refresh();
      }
    } catch (error) {
      setUploadState({ success: false, error: 'Erreur lors de l\'upload' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette transcription ?')) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await deleteTranscription(episodeId);
      if (result.success) {
        setExistingTranscription(null);
        router.refresh();
        alert(result.message);
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert('Erreur lors de la suppression');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className={styles.transcriptionUpload}>
      <h3>Transcription</h3>
      
      {existingTranscription && (
        <div className={styles.existingTranscription}>
          <div className={styles.existingTitle}>
            Transcription existante
          </div>
          <div className={styles.existingDetails}>
            <div>Fichier: {existingTranscription.fileName}</div>
            <div>Taille: {formatFileSize(existingTranscription.fileSize || 0)}</div>
            <div>Type: {existingTranscription.fileType}</div>
          </div>
          <button
            className={styles.deleteButton}
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? 'Suppression...' : 'Supprimer'}
          </button>
        </div>
      )}

      <form onSubmit={handleUpload} className={styles.uploadForm}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".srt,.txt,.json"
          onChange={handleFileSelect}
          className={styles.fileInput}
        />

        <div className={styles.uploadArea} onClick={handleUploadClick}>
          <div className={styles.uploadIcon}>📄</div>
          <div className={styles.uploadText}>
            {selectedFile ? selectedFile.name : 'Cliquez pour sélectionner un fichier SRT, TXT ou JSON'}
          </div>
          <div className={styles.uploadSubtext}>
            {selectedFile 
              ? `Taille: ${formatFileSize(selectedFile.size)}`
              : 'Formats supportés: .srt, .txt, .vtt, .json (max 5MB)'
            }
          </div>
        </div>

        {selectedFile && (
          <div className={styles.fileInfo}>
            <div className={styles.fileName}>{selectedFile.name}</div>
            <div className={styles.fileSize}>{formatFileSize(selectedFile.size)}</div>
          </div>
        )}

        {selectedFile && (
          <button
            type="submit"
            className={styles.uploadButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className={styles.loadingSpinner}></span>
                Upload en cours...
              </>
            ) : (
              'Uploader la transcription'
            )}
          </button>
        )}
      </form>

      {uploadState && (
        <div className={`${styles.message} ${uploadState.success ? styles.success : styles.error}`}>
          {uploadState.message || uploadState.error}
        </div>
      )}
    </div>
  );
} 