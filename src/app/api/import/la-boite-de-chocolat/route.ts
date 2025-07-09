import Parser from "rss-parser";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/podcastHelpers";
import { shouldRunImport } from "@/lib/timeHelpers";

const parser = new Parser();

const FEED_URL =
  "https://feeds.acast.com/public/shows/la-boite-de-chocolat-la-bdc";

export async function GET() {
  try {
    // Vérifier si on doit exécuter l'import selon l'heure
    const shouldRun = await shouldRunImport();
    if (!shouldRun) {
      return Response.json({ 
        message: "Import ignoré - pas l'heure appropriée",
        currentTime: new Date().toISOString(),
        shouldRun: false
      });
    }

    const feed = await parser.parseURL(FEED_URL);
    let rssFeed = await prisma.rssFeed.findUnique({ where: { url: FEED_URL } });
    if (!rssFeed) {
      rssFeed = await prisma.rssFeed.create({
        data: {
          name: "La Boîte de Chocolat",
          nameId: "la-boite-de-chocolat",
          url: FEED_URL,
        },
      });
    }

    let imported = 0;
    let updated = 0;
    for (const item of feed.items) {
      if (!item.enclosure?.url) continue;

      // Extraire la durée si disponible
      let duration: number | null = null;
      if (item.itunes?.duration) {
        // Convertir la durée en secondes
        const durationStr = item.itunes.duration;
        if (durationStr.includes(':')) {
          const parts = durationStr.split(':').map(Number);
          if (parts.length === 2) {
            // Format MM:SS
            duration = parts[0] * 60 + parts[1];
          } else if (parts.length === 3) {
            // Format HH:MM:SS
            duration = parts[0] * 3600 + parts[1] * 60 + parts[2];
          }
        } else {
          // Format en secondes
          duration = parseInt(durationStr) || null;
        }
      }

      // Générer un slug unique
      let baseSlug = generateSlug(item.title || "");
      let year = item.pubDate ? new Date(item.pubDate).getFullYear() : "";
      let slug = `${baseSlug}-${year}`;
      let finalSlug = slug;
      let counter = 1;
      while (await prisma.podcastEpisode.findUnique({ where: { slug: finalSlug } })) {
        finalSlug =  counter > 1 ? `${slug}-${counter}` : slug;
        counter++;
      }

      await prisma.podcastEpisode.upsert({
        where: { audioUrl: item.enclosure.url },
        update: {
          title: item.title || "",
          description: item.contentSnippet || item.content || "",
          pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
          duration: duration,
        },
        create: {
          rssFeedId: rssFeed.id,
          title: item.title || "",
          description: item.contentSnippet || item.content || "",
          pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
          audioUrl: item.enclosure.url,
          duration: duration,
          slug: finalSlug,
        },
      });

      // Vérifier si c'était une création ou une mise à jour
      const existingEpisode = await prisma.podcastEpisode.findUnique({
        where: { audioUrl: item.enclosure.url },
        select: { id: true },
      });

      if (existingEpisode) {
        updated++;
      } else {
        imported++;
      }
    }
    return Response.json({ 
      message: `Import terminé`, 
      imported, 
      updated,
      currentTime: new Date().toISOString(),
      shouldRun: true
    });
  } catch (e: unknown) {
    if (e instanceof Error) {
      return Response.json({ error: e.message }, { status: 500 });
    }
    return Response.json({ error: "Erreur inconnue" }, { status: 500 });
  }
}
