'use client';

import Link from 'next/link';

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
  episodeSlug: string;
  className?: string;
  children?: React.ReactNode;
}

export default function TranscriptionButton({ episodeSlug, className, children }: TranscriptionButtonProps) {
  return (
    <Link
      href={`/episodes/${episodeSlug}/transcription`}
      className={className}
      title="Voir la transcription"
      tabIndex={0}
      role="button"
    >
      {children}
    </Link>
  );
} 