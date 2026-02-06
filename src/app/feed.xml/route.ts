import { prisma } from "@/lib/prisma";
import { SITE_URL, PODCAST_URLS } from "@/helpers/config";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const episodes = await prisma.podcastEpisode.findMany({
    where: {
      slug: { not: null },
    },
    orderBy: { pubDate: "desc" },
    take: 50,
    include: {
      links: {
        include: {
          film: {
            select: {
              title: true,
              slug: true,
              director: true,
              year: true,
            },
          },
        },
      },
    },
  });

  const filteredEpisodes = episodes.filter(
    (ep) => ep.age !== "18+" && ep.age !== "adult"
  );

  const lastBuildDate = new Date().toUTCString();

  const items = filteredEpisodes
    .map((ep) => {
      const pubDate = new Date(ep.pubDate).toUTCString();
      const description = ep.description ? escapeXml(ep.description) : "";
      const durationTag =
        ep.duration != null
          ? `      <itunes:duration>${ep.duration}</itunes:duration>`
          : "";
      const enclosureTag = ep.audioUrl
        ? `      <enclosure url="${escapeXml(ep.audioUrl)}" type="audio/mpeg"/>`
        : "";

      return `    <item>
      <title>${escapeXml(ep.title)}</title>
      <link>${SITE_URL}/episodes/${ep.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/episodes/${ep.slug}</guid>
      <description>${description}</description>
      <pubDate>${pubDate}</pubDate>
${enclosureTag}
${durationTag}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title>La Bo\u00eete de Chocolat</title>
    <link>${SITE_URL}</link>
    <description>Le podcast cin\u00e9ma fran\u00e7ais qui analyse vos films pr\u00e9f\u00e9r\u00e9s avec mauvaise foi.</description>
    <language>fr</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <itunes:author>La Bo\u00eete de Chocolat</itunes:author>
    <itunes:category text="Arts"><itunes:category text="Film Reviews"/></itunes:category>
    <itunes:explicit>false</itunes:explicit>
    <itunes:image href="${SITE_URL}/images/icons/web-app-manifest-512x512.png"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
