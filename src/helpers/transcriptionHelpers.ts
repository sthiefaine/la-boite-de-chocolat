export const TRANSCRIPTION_CONFIG = {
  uploadServer: "https://uploadfiles.clairdev.com/api/upload",
  readServer:
    "https://uploadfiles.clairdev.com/api/display/podcasts/laboitedechocolat/episodes/",
  allowedTypes: [".srt", ".txt", ".vtt", ".json"],
  maxSize: 5 * 1024 * 1024,
};

export function getTranscriptionUrl(fileName: string): string {
  return `${TRANSCRIPTION_CONFIG.readServer}${fileName}`;
}

export function getTranscriptionDownloadUrl(fileName: string): string {
  return `${TRANSCRIPTION_CONFIG.readServer}${fileName}`;
}

export function isSupportedFileType(fileName: string): boolean {
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf("."));
  return TRANSCRIPTION_CONFIG.allowedTypes.includes(extension);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export interface SubtitleEntry {
  id: number;
  startTime: string;
  endTime: string;
  text: string;
  speaker_id?: string;
}

export interface SpeakerSegment {
  start: number;
  end: number;
  speakerId: string;
}

export const SPEAKER_COLORS = [
  "#e67e22", // orange chaud
  "#3498db", // bleu
  "#2ecc71", // vert
  "#9b59b6", // violet
  "#e74c3c", // rouge
  "#1abc9c", // turquoise
  "#f39c12", // jaune doré
  "#e84393", // rose
  "#00cec9", // cyan
  "#6c5ce7", // indigo
  "#fd79a8", // rose clair
  "#00b894", // vert menthe
];

export function getSpeakerColor(speakerId: string): string {
  const match = speakerId.match(/(\d+)/);
  const index = match ? (parseInt(match[1]) - 1) % SPEAKER_COLORS.length : 0;
  return SPEAKER_COLORS[index];
}

export function getSpeakerLabel(speakerId: string): string {
  const match = speakerId.match(/(\d+)/);
  return match ? `Intervenant ${match[1]}` : speakerId;
}

const SRT_TIMESTAMP_LINE_REGEX =
  /(\d{1,2}:\d{2}:\d{2}[,.]\d{1,3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}[,.]\d{1,3})/;

// Le format SRT n'a pas de champ speaker structuré (contrairement au JSON
// Whisper). Certains outils l'embarquent en préfixe texte : "Locuteur 1: ...",
// "Speaker 2: ...". On l'extrait vers speaker_id (normalisé "speaker_N") pour
// retrouver les couleurs/labels d'intervenants comme en JSON.
const SRT_SPEAKER_PREFIX_REGEX =
  /^(?:locuteur|speaker|intervenant)\s*[_-]?\s*(\d+)\s*:\s*/i;

function normalizeSrtTimestamp(timestamp: string): string {
  const match = timestamp.match(/(\d{1,2}):(\d{2}):(\d{2})[,.](\d{1,3})/);
  if (!match) return timestamp;

  const hours = match[1].padStart(2, "0");
  const milliseconds = match[4].padEnd(3, "0");

  return `${hours}:${match[2]}:${match[3]},${milliseconds}`;
}

export function parseSRT(content: string): SubtitleEntry[] {
  const cleanContent = content
    .replace(/^﻿/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();

  // Actual VTT content (e.g. a .vtt file routed here): delegate to the VTT parser
  if (cleanContent.startsWith("WEBVTT")) {
    return parseVTT(cleanContent);
  }

  const entries: SubtitleEntry[] = [];
  const blocks = cleanContent.split(/\n{2,}/);
  let fallbackId = 1;

  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) continue;

    // Optional numeric index line before the timestamp line
    let timeLineIndex = 0;
    if (/^\d+$/.test(lines[0]) && !lines[0].includes("-->")) {
      timeLineIndex = 1;
    }

    const timeLine = lines[timeLineIndex];
    if (!timeLine) continue;

    const timeMatch = timeLine.match(SRT_TIMESTAMP_LINE_REGEX);
    if (!timeMatch) continue;

    let text = lines
      .slice(timeLineIndex + 1)
      .join(" ")
      .trim();

    if (!text) continue;

    // Extraire un éventuel préfixe d'intervenant ("Locuteur 1: ...")
    let speakerId: string | undefined;
    const speakerMatch = text.match(SRT_SPEAKER_PREFIX_REGEX);
    if (speakerMatch) {
      speakerId = `speaker_${speakerMatch[1]}`;
      text = text.slice(speakerMatch[0].length).trim();
      if (!text) continue;
    }

    const parsedIndex = timeLineIndex === 1 ? parseInt(lines[0], 10) : NaN;
    const id = Number.isNaN(parsedIndex) ? fallbackId : parsedIndex;

    entries.push({
      id,
      startTime: normalizeSrtTimestamp(timeMatch[1]),
      endTime: normalizeSrtTimestamp(timeMatch[2]),
      text,
      ...(speakerId && { speaker_id: speakerId }),
    });

    fallbackId = id + 1;
  }

  return entries;
}

function parseVTT(content: string): SubtitleEntry[] {
  const entries: SubtitleEntry[] = [];
  const lines = content.split("\n");
  let id = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line || line.startsWith("WEBVTT") || line.startsWith("NOTE")) {
      continue;
    }

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

export function secondsToSrtTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const milliseconds = Math.round((totalSeconds % 1) * 1000);

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")},${milliseconds
    .toString()
    .padStart(3, "0")}`;
}

interface TranscriptionJsonSegment {
  text: string;
  start: number;
  end: number;
  type?: string;
  speaker_id?: string;
}

export function parseJSON(content: string): SubtitleEntry[] {
  try {
    const data = JSON.parse(content);
    const segments: TranscriptionJsonSegment[] = data.segments;

    if (!Array.isArray(segments)) {
      return [];
    }

    return segments.map((segment, index) => ({
      id: index + 1,
      startTime: secondsToSrtTime(segment.start),
      endTime: secondsToSrtTime(segment.end),
      text: segment.text.trim(),
      ...(segment.speaker_id && { speaker_id: segment.speaker_id }),
    }));
  } catch {
    return [];
  }
}

export function parseTranscription(content: string): SubtitleEntry[] {
  const trimmed = content.replace(/^﻿/, "").trim();

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return parseJSON(trimmed);
  }

  if (trimmed.startsWith("WEBVTT")) {
    return parseVTT(trimmed);
  }

  return parseSRT(trimmed);
}

export function srtTimeToSeconds(time: string): number {
  const match = time.match(/(\d{1,2}):(\d{2}):(\d{2})[,.](\d{1,3})/);
  if (!match) return 0;

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const seconds = parseInt(match[3], 10);
  const milliseconds = parseInt(match[4].padEnd(3, "0"), 10);

  return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
}

export function searchInTranscription(
  entries: SubtitleEntry[],
  query: string
): SubtitleEntry[] {
  const lowerQuery = query.toLowerCase();
  return entries.filter((entry) =>
    entry.text.toLowerCase().includes(lowerQuery)
  );
}

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
    const words = content.split(/\s+/);
    const wordsPerSection = Math.ceil(words.length / 12);

    for (let i = 0; i < words.length; i += wordsPerSection) {
      const sectionWords = words.slice(i, i + wordsPerSection);
      const minutes = Math.floor((i / words.length) * 60);
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

      const sectionMinutes = Math.floor(minutes / 5) * 5;
      const timeMarker = formatTimeMarker(sectionMinutes * 60);

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
      currentSection.content +=
        (currentSection.content ? "\n" : "") + line.trim();
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
}

function formatTimeMarker(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function timeToSeconds(time: string): number {
  const cleanTime = time.replace(",", ".").replace(/[\[\]]/g, "");
  const [hours, minutes, seconds] = cleanTime.split(":").map(Number);
  return hours * 3600 + minutes * 60 + parseFloat(seconds.toString());
}

// --- Speaker Turn grouping for conversation/chat layout ---

export interface SpeakerTurn {
  speakerId: string | undefined;
  startSeconds: number;
  endSeconds: number;
  startTime: string; // format "MM:SS"
  segments: Array<{
    id: number | string;
    text: string;
    startSeconds: number;
    endSeconds: number;
  }>;
  mergedText: string;
}

interface SectionForGrouping {
  id: number | string;
  content: string;
  startSeconds: number;
  endSeconds?: number;
  isSectionHeader?: boolean;
  speaker_id?: string;
}

export function formatMinutesSeconds(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export function groupEntriesIntoTurns(
  sections: SectionForGrouping[],
  sectionIntervalMinutes: number = 15
): { turns: SpeakerTurn[]; timeMarkers: number[] } {
  const turns: SpeakerTurn[] = [];
  let currentTurn: SpeakerTurn | null = null;

  const contentSections = sections.filter(
    (s) => !s.isSectionHeader && s.content
  );

  for (const section of contentSections) {
    const endSec = section.endSeconds || section.startSeconds + 5;

    if (currentTurn && section.speaker_id === currentTurn.speakerId) {
      currentTurn.segments.push({
        id: section.id,
        text: section.content,
        startSeconds: section.startSeconds,
        endSeconds: endSec,
      });
      currentTurn.endSeconds = endSec;
      currentTurn.mergedText += " " + section.content;
    } else {
      if (currentTurn) turns.push(currentTurn);
      currentTurn = {
        speakerId: section.speaker_id,
        startSeconds: section.startSeconds,
        endSeconds: endSec,
        startTime: formatMinutesSeconds(section.startSeconds),
        segments: [
          {
            id: section.id,
            text: section.content,
            startSeconds: section.startSeconds,
            endSeconds: endSec,
          },
        ],
        mergedText: section.content,
      };
    }
  }
  if (currentTurn) turns.push(currentTurn);

  // Compute time markers
  const maxSeconds =
    turns.length > 0 ? turns[turns.length - 1].endSeconds : 0;
  const intervalSeconds = sectionIntervalMinutes * 60;
  const timeMarkers: number[] = [];
  for (let s = intervalSeconds; s < maxSeconds; s += intervalSeconds) {
    timeMarkers.push(s);
  }

  return { turns, timeMarkers };
}

export function extractTimeAndText(line: string): {
  startTime: string | null;
  endTime: string | null;
  text: string;
} {
  const vttMatchWithBrackets = line.match(
    /^\s*\[(\d{2}:\d{2}:\d{2}[.,]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[.,]\d{3})\]\s*(.*)$/
  );
  if (vttMatchWithBrackets) {
    const startTime = vttMatchWithBrackets[1].replace(".", ",");
    const endTime = vttMatchWithBrackets[2].replace(".", ",");
    return { startTime, endTime, text: vttMatchWithBrackets[3] };
  }

  const vttMatchWithoutBrackets = line.match(
    /^\s*(\d{2}:\d{2}:\d{2}[.,]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[.,]\d{3})\s*(.*)$/
  );
  if (vttMatchWithoutBrackets) {
    const startTime = vttMatchWithoutBrackets[1].replace(".", ",");
    const endTime = vttMatchWithoutBrackets[2].replace(".", ",");
    return { startTime, endTime, text: vttMatchWithoutBrackets[3] };
  }

  const simpleMatch = line.match(
    /^\s*(\[)?(\d{2}:\d{2}:\d{2}[.,]\d{3})?(\])?\s*(.*)$/
  );
  if (simpleMatch && simpleMatch[2]) {
    const time = simpleMatch[2].replace(".", ",");
    return { startTime: time, endTime: null, text: simpleMatch[4] };
  }

  const emptyBracketsMatch = line.match(/^\s*\[\]\s*(.*)$/);
  if (emptyBracketsMatch) {
    return { startTime: null, endTime: null, text: emptyBracketsMatch[1] };
  }

  if (line.trim() === "[]")
    return { startTime: null, endTime: null, text: "" };
  return { startTime: null, endTime: null, text: line };
}
