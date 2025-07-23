export const TRANSCRIPTION_CONFIG = {
  uploadServer: "https://uploadfiles.clairdev.com/api/upload",
  readServer:
    "https://uploadfiles.clairdev.com/api/display/podcasts/laboitedechocolat/episodes/",
  allowedTypes: [".srt", ".txt", ".vtt"],
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

export function srtTimeToSeconds(time: string): number {
  const match = time.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
  if (!match) return 0;

  const hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const seconds = parseInt(match[3]);
  const milliseconds = parseInt(match[4]);

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
