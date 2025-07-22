// Configuration pour les transcriptions

export const TRANSCRIPTION_CONFIG = {
  // Serveur d'upload
  uploadServer: "https://uploadfiles.clairdev.com/api/upload",
  
  // Serveur de lecture
  readServer: "https://uploadfiles.clairdev.com/uploads/transcriptions/",
  
  // Types de fichiers supportés
  allowedTypes: ['.srt', '.txt', '.vtt'],
  
  // Taille maximale (5MB)
  maxSize: 5 * 1024 * 1024,
};

/**
 * Construit l'URL de lecture d'une transcription
 */
export function getTranscriptionUrl(fileName: string): string {
  return `${TRANSCRIPTION_CONFIG.readServer}${fileName}`;
}

/**
 * Construit l'URL de téléchargement d'une transcription
 */
export function getTranscriptionDownloadUrl(fileName: string): string {
  return `${TRANSCRIPTION_CONFIG.readServer}${fileName}`;
}

/**
 * Vérifie si un type de fichier est supporté
 */
export function isSupportedFileType(fileName: string): boolean {
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  return TRANSCRIPTION_CONFIG.allowedTypes.includes(extension);
}

/**
 * Formate la taille d'un fichier
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Parse un fichier SRT et retourne un tableau d'entrées
 */
export interface SubtitleEntry {
  id: number;
  startTime: string;
  endTime: string;
  text: string;
}

export function parseSRT(content: string): SubtitleEntry[] {
  const entries: SubtitleEntry[] = [];
  const blocks = content.trim().split('\n\n');
  
  for (const block of blocks) {
    const lines = block.split('\n').filter(line => line.trim());
    if (lines.length >= 3) {
      const id = parseInt(lines[0]);
      const timeLine = lines[1];
      const text = lines.slice(2).join('\n');
      
      const timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);
      if (timeMatch) {
        entries.push({
          id,
          startTime: timeMatch[1],
          endTime: timeMatch[2],
          text
        });
      }
    }
  }
  
  return entries;
}

/**
 * Convertit un temps SRT en secondes
 */
export function srtTimeToSeconds(time: string): number {
  const match = time.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
  if (!match) return 0;
  
  const hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const seconds = parseInt(match[3]);
  const milliseconds = parseInt(match[4]);
  
  return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
}

/**
 * Recherche dans le texte des sous-titres
 */
export function searchInTranscription(entries: SubtitleEntry[], query: string): SubtitleEntry[] {
  const lowerQuery = query.toLowerCase();
  return entries.filter(entry => 
    entry.text.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Obtient les sous-titres pour une plage de temps donnée
 */
export function getSubtitlesForTimeRange(
  entries: SubtitleEntry[], 
  startSeconds: number, 
  endSeconds: number
): SubtitleEntry[] {
  return entries.filter(entry => {
    const entryStart = srtTimeToSeconds(entry.startTime);
    const entryEnd = srtTimeToSeconds(entry.endTime);
    
    return (entryStart >= startSeconds && entryStart <= endSeconds) ||
           (entryEnd >= startSeconds && entryEnd <= endSeconds) ||
           (entryStart <= startSeconds && entryEnd >= endSeconds);
  });
} 