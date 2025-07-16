"use client";

import { useState, useRef } from "react";
import { uploadPodcastPoster } from "@/app/actions/episode";
import { getVercelBlobUrl } from "@/helpers/imageConfig";
import styles from "./FileUpload.module.css";

interface FileUploadProps {
  currentFileName: string | null;
  onFileUploaded: (fileName: string) => void;
}

export default function FileUpload({ currentFileName, onFileUploaded }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentFileName ? getVercelBlobUrl(currentFileName, "podcasts/la-boite-de-chocolat/episodes") : null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation du fichier
    if (!file.type.startsWith('image/')) {
      setError("Le fichier doit être une image");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Le fichier est trop volumineux (max 5MB)");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadPodcastPoster(formData);

      if (result.success && result.data) {
        const fileName = result.data.fileName;
        onFileUploaded(fileName);
        setPreviewUrl(result.data.url);
        setError(null);
      } else {
        setError(result.error || "Erreur lors de l'upload");
      }
    } catch (error) {
      setError("Erreur lors de l'upload du fichier");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (!file) return;

    // Simuler un changement d'input
    if (fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
      
      // Déclencher l'événement change
      const changeEvent = new Event('change', { bubbles: true });
      fileInputRef.current.dispatchEvent(changeEvent);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div className={styles.container}>
      <div className={styles.uploadArea}>
        <div
          className={`${styles.dropZone} ${isUploading ? styles.uploading : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className={styles.fileInput}
            disabled={isUploading}
          />
          
          {isUploading ? (
            <div className={styles.uploadingContent}>
              <div className={styles.spinner}></div>
              <p>Upload en cours...</p>
            </div>
          ) : previewUrl ? (
            <div className={styles.previewContainer}>
              <img 
                src={previewUrl} 
                alt="Aperçu du poster" 
                className={styles.preview}
              />
              <div className={styles.overlay}>
                <p>Cliquez ou glissez pour changer</p>
              </div>
            </div>
          ) : (
            <div className={styles.placeholder}>
              <div className={styles.uploadIcon}>📁</div>
              <p>Cliquez ou glissez une image ici</p>
              <p className={styles.uploadHint}>JPG, PNG, WebP (max 5MB)</p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          <span className={styles.errorIcon}>⚠️</span>
          {error}
        </div>
      )}

      {previewUrl && (
        <div className={styles.fileInfo}>
          <p className={styles.fileName}>
            Fichier: {currentFileName || "Nouveau fichier"}
          </p>
          <p className={styles.filePath}>
            Chemin: /podcasts/la-boite-de-chocolat/episodes/{currentFileName || "..."}
          </p>
        </div>
      )}
    </div>
  );
} 