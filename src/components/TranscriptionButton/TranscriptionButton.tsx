'use client';

import { useState } from 'react';
import TranscriptionModal from '../TranscriptionModal/TranscriptionModal';
import styles from './TranscriptionButton.module.css';

interface Transcription {
  id: string;
  fileName: string;
  fileSize: number | null;
  fileType: string;
  createdAt: Date;
}

interface TranscriptionButtonProps {
  episodeId: string;
  transcription: Transcription;
}

export default function TranscriptionButton({ episodeId, transcription }: TranscriptionButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <button 
        className={styles.transcriptionButton}
        onClick={handleOpenModal}
        title="Voir la transcription"
      >
        <span className={styles.icon}>📝</span>
        <span className={styles.text}>Transcription</span>
        <span className={styles.fileType}>{transcription.fileType.toUpperCase()}</span>
      </button>

      <TranscriptionModal
        episodeId={episodeId}
        transcription={transcription}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
} 