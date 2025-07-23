// Configuration pour les transcriptions

export const TRANSCRIPTION_CONFIG = {
  // Serveur d'upload
  uploadServer: "https://uploadfiles.clairdev.com/api/upload",

  // Serveur de lecture
  readServer:
    "https://uploadfiles.clairdev.com/api/display/podcasts/laboitedechocolat/episodes/",

  // Types de fichiers supportés
  allowedTypes: [".srt", ".txt", ".vtt"],

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
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf("."));
  return TRANSCRIPTION_CONFIG.allowedTypes.includes(extension);
}

/**
 * Formate la taille d'un fichier
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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

  const cleanContent = content.trim();

  if (cleanContent.includes("-->")) {
    return parseVTT(cleanContent);
  }

  const blocks = cleanContent.split("\n\n");

  for (const block of blocks) {
    const lines = block.split("\n").filter((line) => line.trim());
    if (lines.length >= 3) {
      const id = parseInt(lines[0]);
      const timeLine = lines[1];
      const text = lines.slice(2).join("\n");

      const timeMatch = timeLine.match(
        /(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/
      );
      if (timeMatch) {
        entries.push({
          id,
          startTime: timeMatch[1],
          endTime: timeMatch[2],
          text,
        });
      }
    }
  }

  return entries;
}

/**
 * Parse un fichier VTT (format WebVTT)
 */
function parseVTT(content: string): SubtitleEntry[] {
  const entries: SubtitleEntry[] = [];
  const lines = content.split("\n");
  let id = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Ignorer les lignes vides et les métadonnées VTT
    if (!line || line.startsWith("WEBVTT") || line.startsWith("NOTE")) {
      continue;
    }

    // Chercher une ligne avec timestamp + texte sur la même ligne
    // Format: [00:00:00.480 --> 00:00:04.880]   Maman disait toujours...
    let timeMatch = line.match(
      /\[(\d{2}:\d{2}:\d{2}[.,]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[.,]\d{3})\]\s*(.*)$/
    );

    if (timeMatch) {
      const startTime = timeMatch[1].replace(".", ",");
      const endTime = timeMatch[2].replace(".", ",");
      const text = timeMatch[3].trim();

      if (text) {
        entries.push({
          id: id++,
          startTime,
          endTime,
          text,
        });
      }
    } else {
      timeMatch = line.match(
        /(\d{2}:\d{2}:\d{2}[.,]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[.,]\d{3})\s*(.*)$/
      );

      if (timeMatch) {
        const startTime = timeMatch[1].replace(".", ",");
        const endTime = timeMatch[2].replace(".", ",");
        const text = timeMatch[3].trim();

        if (text) {
          entries.push({
            id: id++,
            startTime,
            endTime,
            text,
          });
        }
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
export function searchInTranscription(
  entries: SubtitleEntry[],
  query: string
): SubtitleEntry[] {
  const lowerQuery = query.toLowerCase();
  return entries.filter((entry) =>
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
  return entries.filter((entry) => {
    const entryStart = srtTimeToSeconds(entry.startTime);
    const entryEnd = srtTimeToSeconds(entry.endTime);

    return (
      (entryStart >= startSeconds && entryStart <= endSeconds) ||
      (entryEnd >= startSeconds && entryEnd <= endSeconds) ||
      (entryStart <= startSeconds && entryEnd >= endSeconds)
    );
  });
}

/**
 * Parse le contenu et crée des sections avec repères temporels toutes les 5 minutes
 */
export function parseWithTimeMarkers(content: string): Array<{
  id: number;
  timeMarker: string;
  content: string;
  startSeconds: number;
}> {
  const sections: Array<{
    id: number;
    timeMarker: string;
    content: string;
    startSeconds: number;
  }> = [];

  const timeMatches = content.match(/(\d{2}:\d{2}:\d{2}[.,]\d{3})/g) || [];

  if (timeMatches.length === 0) {
    // Aucun timestamp trouvé, créer des sections basées sur la longueur
    const words = content.split(/\s+/);
    const wordsPerSection = Math.ceil(words.length / 12); // ~12 sections de 5 min

    for (let i = 0; i < words.length; i += wordsPerSection) {
      const sectionWords = words.slice(i, i + wordsPerSection);
      const minutes = Math.floor((i / words.length) * 60); // Estimation basée sur la position
      const timeMarker = formatTimeMarker(minutes * 60);

      sections.push({
        id: sections.length + 1,
        timeMarker,
        content: sectionWords.join(" "),
        startSeconds: minutes * 60,
      });
    }

    return sections;
  }

  // Extraire les timestamps et leur contenu associé
  const lines = content.split("\n");
  let currentSection: {
    id: number;
    timeMarker: string;
    content: string;
    startSeconds: number;
  } | null = null;

  for (const line of lines) {
    const timeMatch = line.match(/(\d{2}:\d{2}:\d{2}[.,]\d{3})/);

    if (timeMatch) {
      const timestamp = timeMatch[1];
      const seconds = timeToSeconds(timestamp);
      const minutes = Math.floor(seconds / 60);

      // Créer une nouvelle section toutes les 5 minutes
      const sectionMinutes = Math.floor(minutes / 5) * 5;
      const timeMarker = formatTimeMarker(sectionMinutes * 60);

      // Si c'est une nouvelle section de 5 minutes
      if (!currentSection || currentSection.timeMarker !== timeMarker) {
        if (currentSection) {
          sections.push(currentSection);
        }

        currentSection = {
          id: sections.length + 1,
          timeMarker,
          content: "",
          startSeconds: sectionMinutes * 60,
        };
      }

      // Ajouter le contenu de cette ligne
      const textContent = line
        .replace(
          /\d{2}:\d{2}:\d{2}[.,]\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}[.,]\d{3}/,
          ""
        )
        .trim();
      if (textContent && currentSection) {
        currentSection.content +=
          (currentSection.content ? "\n" : "") + textContent;
      }
    } else if (currentSection && line.trim()) {
      // Ligne de texte sans timestamp
      currentSection.content +=
        (currentSection.content ? "\n" : "") + line.trim();
    }
  }

  // Ajouter la dernière section
  if (currentSection) {
    sections.push(currentSection);
  }

  console.log("✅ Sections créées:", sections.length);
  return sections;
}

/**
 * Convertit des secondes en format HH:MM:SS
 */
function formatTimeMarker(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Convertit un timestamp en secondes
 */
function timeToSeconds(time: string): number {
  const cleanTime = time.replace(",", ".").replace(/[\[\]]/g, "");
  const [hours, minutes, seconds] = cleanTime.split(":").map(Number);
  return hours * 3600 + minutes * 60 + parseFloat(seconds.toString());
}
