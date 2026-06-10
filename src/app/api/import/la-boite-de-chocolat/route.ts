import Parser from "rss-parser";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/helpers/podcastHelpers";
import { allowedHours, shouldRunImport } from "@/helpers/timeHelpers";
import {
  autoLinkFilmToEpisode,
  parseEpisodeTitle,
  type AutoLinkResult,
} from "@/lib/import/autoLinkFilm";
import {
  autoTranscribeEpisode,
  isAutoTranscribeEnabled,
  getAutoTranscribeMaxAgeDays,
  getAutoTranscribeMonthlyLimit,
  countAutoTranscriptionsThisMonth,
  type AutoTranscribeResult,
} from "@/lib/import/autoTranscribe";

// Nombre max d'épisodes auto-liés par run (limite les appels TMDB/upload).
const AUTO_LINK_BATCH_SIZE = 10;
// Transcription : 1 épisode par run (l'appel Mistral prend plusieurs minutes
// et est facturé à la minute d'audio). Le backlog se vide au fil des runs.
const AUTO_TRANSCRIBE_BATCH_SIZE = 1;

const parser = new Parser();

const FEED_URL =
  "https://feeds.acast.com/public/shows/la-boite-de-chocolat-la-bdc";

interface RssItemWithItunes {
  title?: string;
  content?: string;
  contentSnippet?: string;
  pubDate?: string;
  enclosure?: { url: string };
  itunes?: {
    duration?: string;
    season?: string | number;
    episode?: string | number;
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';
    
    const shouldRun = await shouldRunImport();
    if (!shouldRun && !force) {
      return Response.json({
        message: `Import ignoré - pas l'heure de l'import ${allowedHours
          .map((hour) => `${hour}h`)
          .join(", ")}. Utilisez ?force=true pour forcer l'import.`,
        currentTime: new Date().toISOString(),
        shouldRun: false,
        force: false,
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
    for (const itemRaw of feed.items) {
      const item = itemRaw as RssItemWithItunes;
      if (!item.enclosure?.url) continue;

      // Extraire la durée si disponible
      let duration: number | null = null;
      if (item.itunes?.duration) {
        // Convertir la durée en secondes
        const durationStr = item.itunes.duration;
        if (durationStr.includes(":")) {
          const parts = durationStr.split(":").map(Number);
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

      // Extraire saison et épisode
      let season: number | null = null;
      let episode: number | null = null;
      if (item.itunes?.season) {
        season =
          typeof item.itunes.season === "string"
            ? parseInt(item.itunes.season)
            : item.itunes.season;
        if (isNaN(season as number)) season = null;
      }
      if (item.itunes?.episode) {
        episode =
          typeof item.itunes.episode === "string"
            ? parseInt(item.itunes.episode)
            : item.itunes.episode;
        if (isNaN(episode as number)) episode = null;
      }

      // Générer un slug unique
      let baseSlug = generateSlug(item.title || "");
      let year = item.pubDate ? new Date(item.pubDate).getFullYear() : "";
      let slug = `${baseSlug}-${year}`;
      let finalSlug = slug;
      let counter = 1;
      while (
        await prisma.podcastEpisode.findUnique({ where: { slug: finalSlug } })
      ) {
        finalSlug = counter > 1 ? `${slug}-${counter}` : slug;
        counter++;
      }

      // Épisodes adultes ("p0rno - ...") et annonces ("- ... -") détectés
      // depuis le titre RSS
      const { isAdult, isAnnouncement } = parseEpisodeTitle(item.title || "");

      await prisma.podcastEpisode.upsert({
        where: { audioUrl: item.enclosure.url },
        update: {
          title: item.title || "",
          description: item.contentSnippet || item.content || "",
          pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
          duration: duration,
          season: season ?? undefined,
          episode: episode ?? undefined,
          ...(isAdult && { age: "18+" }),
        },
        create: {
          rssFeedId: rssFeed.id,
          title: item.title || "",
          description: item.contentSnippet || item.content || "",
          pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
          audioUrl: item.enclosure.url,
          duration: duration,
          slug: finalSlug,
          season: season ?? undefined,
          episode: episode ?? undefined,
          ...(isAdult && { age: "18+" }),
          ...(isAnnouncement && { genre: "Annonce" }),
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
    // Auto-liaison film TMDB : traite les épisodes sans aucun lien film
    // (les nouveaux ET les anciens ratés -> le cron est auto-réparant).
    // Les épisodes avec un genre (annonces marquées, ou classés à la main)
    // sont définitivement hors du pipeline.
    const unlinkedEpisodes = await prisma.podcastEpisode.findMany({
      where: {
        rssFeedId: rssFeed.id,
        links: { none: {} },
        genre: null,
      },
      select: { id: true, title: true },
      orderBy: { pubDate: "desc" },
      take: AUTO_LINK_BATCH_SIZE,
    });

    const autoLinkResults: AutoLinkResult[] = [];
    for (const ep of unlinkedEpisodes) {
      // Séquentiel volontairement : ménage TMDB et le serveur d'upload.
      autoLinkResults.push(await autoLinkFilmToEpisode(ep));
    }

    const autoLink = {
      processed: autoLinkResults.length,
      linked: autoLinkResults.filter((r) => r.status === "linked").length,
      alreadyLinked: autoLinkResults.filter((r) => r.status === "already").length,
      skippedAnnouncements: autoLinkResults
        .filter((r) => r.status === "skipped_announcement")
        .map((r) => r.episodeTitle),
      lowConfidence: autoLinkResults
        .filter((r) => r.status === "low_confidence")
        .map((r) => r.episodeTitle),
      noMatch: autoLinkResults
        .filter((r) => r.status === "no_match")
        .map((r) => r.episodeTitle),
      errors: autoLinkResults
        .filter((r) => r.status === "error")
        .map((r) => ({ episode: r.episodeTitle, error: r.error })),
      details: autoLinkResults
        .filter((r) => r.status === "linked")
        .map((r) => `${r.episodeTitle} → ${r.filmTitle}`),
    };

    // Auto-transcription Mistral — DÉSACTIVÉE par défaut.
    // Activation : AUTO_TRANSCRIBE_ENABLED="true" + MISTRAL_API_KEY dans l'env.
    let autoTranscribe: {
      enabled: boolean;
      processed?: number;
      transcribed?: string[];
      errors?: Array<{ episode: string; error?: string }>;
      monthlyUsage?: string;
      skippedReason?: string;
    } = { enabled: false };

    if (isAutoTranscribeEnabled()) {
      const monthlyLimit = getAutoTranscribeMonthlyLimit();
      const usedThisMonth = await countAutoTranscriptionsThisMonth();
      const maxAgeDays = getAutoTranscribeMaxAgeDays();

      if (usedThisMonth >= monthlyLimit) {
        // Garde-fou budget : plafond mensuel atteint, on ne dépense plus.
        autoTranscribe = {
          enabled: true,
          processed: 0,
          monthlyUsage: `${usedThisMonth}/${monthlyLimit}`,
          skippedReason: `Plafond mensuel atteint (${usedThisMonth}/${monthlyLimit}) — augmenter AUTO_TRANSCRIBE_MONTHLY_LIMIT si besoin`,
        };
      } else {
        // Garde-fou backlog : uniquement les épisodes récents.
        const minPubDate = new Date(
          Date.now() - maxAgeDays * 24 * 60 * 60 * 1000
        );

        const untranscribed = await prisma.podcastEpisode.findMany({
          where: {
            rssFeedId: rssFeed.id,
            transcription: null,
            genre: null, // exclut les annonces et les épisodes classés à la main
            pubDate: { gte: minPubDate },
          },
          select: { id: true, title: true, slug: true, audioUrl: true },
          orderBy: { pubDate: "desc" },
          take: Math.min(AUTO_TRANSCRIBE_BATCH_SIZE, monthlyLimit - usedThisMonth),
        });

        const results: AutoTranscribeResult[] = [];
        for (const ep of untranscribed) {
          results.push(await autoTranscribeEpisode(ep));
        }

        autoTranscribe = {
          enabled: true,
          processed: results.length,
          monthlyUsage: `${usedThisMonth + results.filter((r) => r.status === "transcribed").length}/${monthlyLimit}`,
          transcribed: results
            .filter((r) => r.status === "transcribed")
            .map((r) =>
              r.audioMinutes
                ? `${r.episodeTitle} (${r.audioMinutes} min)`
                : r.episodeTitle
            ),
          errors: results
            .filter((r) => r.status === "error")
            .map((r) => ({ episode: r.episodeTitle, error: r.error })),
        };
      }
    }

    return Response.json({
      message: `Import terminé${force ? ' (forcé)' : ''}`,
      imported,
      updated,
      autoLink,
      autoTranscribe,
      currentTime: new Date().toISOString(),
      shouldRun: true,
      force: force,
    });
  } catch (e: unknown) {
    if (e instanceof Error) {
      return Response.json({ error: e.message }, { status: 500 });
    }
    return Response.json({ error: "Erreur inconnue" }, { status: 500 });
  }
}
