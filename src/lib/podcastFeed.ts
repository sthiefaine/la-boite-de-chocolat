import { SITE_URL } from "@/helpers/config";
import type { TranscriptionCatalogEntry } from "@/lib/transcriptionCatalog";

export function escapeXml(value: string): string {
  return value
    .replace(/\p{Cc}/gu, (character) =>
      "\t\n\r".includes(character) ? character : "",
    )
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildPodcastFeed(
  episodes: TranscriptionCatalogEntry[],
  selfUrl: string,
  builtAt = new Date(),
): string {
  const items = episodes
    .map((ep) => {
      const transcript = ep.transcription;
      const transcriptTags = transcript
        ? [
            `      <podcast:transcript url="${escapeXml(transcript.pageUrl)}" type="text/html" language="fr"/>`,
            // Les JSON Whisper/Mistral ne suivent pas le schéma JSON Podcasting 2.0.
            // Les lier comme fichiers sans les annoncer à tort dans ce format.
            `      <atom:link href="${escapeXml(transcript.url)}" rel="related" type="${escapeXml(transcript.contentType)}" title="Transcription ${escapeXml(transcript.format.toUpperCase())}"/>`,
            ...(["srt", "vtt", "txt"].includes(transcript.format)
              ? [
                  `      <podcast:transcript url="${escapeXml(transcript.url)}" type="${escapeXml(transcript.contentType)}" language="fr"/>`,
                ]
              : []),
          ]
        : [];

      return [
        "    <item>",
        `      <title>${escapeXml(ep.title)}</title>`,
        `      <link>${escapeXml(ep.url)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(ep.url)}</guid>`,
        `      <description>${escapeXml(ep.description)}</description>`,
        `      <pubDate>${new Date(ep.publishedAt).toUTCString()}</pubDate>`,
        ...(ep.audioUrl
          ? [
              `      <enclosure url="${escapeXml(ep.audioUrl)}" type="audio/mpeg"/>`,
            ]
          : []),
        ...(ep.durationSeconds !== null
          ? [`      <itunes:duration>${ep.durationSeconds}</itunes:duration>`]
          : []),
        ...(ep.season !== null
          ? [`      <itunes:season>${ep.season}</itunes:season>`]
          : []),
        ...(ep.episode !== null
          ? [`      <itunes:episode>${ep.episode}</itunes:episode>`]
          : []),
        `      <atom:link href="${escapeXml(ep.context.url)}" rel="related" type="application/json" title="Contexte de transcription"/>`,
        ...transcriptTags,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:podcast="https://podcastindex.org/namespace/1.0">
  <channel>
    <title>La Boîte de Chocolat</title>
    <link>${SITE_URL}</link>
    <description>Le podcast cinéma français qui analyse vos films préférés avec mauvaise foi.</description>
    <language>fr</language>
    <lastBuildDate>${builtAt.toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(selfUrl)}" rel="self" type="application/rss+xml"/>
    <atom:link href="${SITE_URL}/api/transcription/episodes?status=all" rel="alternate" type="application/json" title="Catalogue des transcriptions"/>
    <itunes:author>La Boîte de Chocolat</itunes:author>
    <itunes:category text="Arts"><itunes:category text="Film Reviews"/></itunes:category>
    <itunes:explicit>false</itunes:explicit>
    <itunes:image href="${SITE_URL}/images/icons/web-app-manifest-512x512.png"/>
${items}
  </channel>
</rss>`;
}
