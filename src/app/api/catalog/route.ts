import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/helpers/config";

// Catalogue public pour l'agrégateur podcastsfilms.clairdev.com :
// liste des films couverts (clé tmdbId) avec leurs épisodes.
// Contrat documenté dans docs/podcastsfilms-architecture.md (§5).
export const revalidate = 3600;

export async function GET() {
  try {
    const films = await prisma.film.findMany({
      where: {
        tmdbId: { not: null },
        links: { some: {} },
      },
      select: {
        tmdbId: true,
        title: true,
        year: true,
        age: true,
        links: {
          select: {
            podcast: {
              select: {
                slug: true,
                title: true,
                audioUrl: true,
                pubDate: true,
                age: true,
              },
            },
          },
        },
      },
      orderBy: { title: "asc" },
    });

    const payload = {
      podcast: {
        nameId: "la-boite-de-chocolat",
        name: "La Boîte de Chocolat",
        siteUrl: SITE_URL,
      },
      films: films.map((film) => ({
        tmdbId: film.tmdbId,
        title: film.title,
        year: film.year,
        age: film.age,
        episodes: film.links
          .filter((link) => link.podcast.slug)
          .map((link) => ({
            slug: link.podcast.slug,
            title: link.podcast.title,
            url: `${SITE_URL}/episodes/${link.podcast.slug}`,
            audioUrl: link.podcast.audioUrl,
            pubDate: link.podcast.pubDate,
            age: link.podcast.age,
          })),
      })),
    };

    return NextResponse.json(payload, {
      headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" },
    });
  } catch (error) {
    console.error("Erreur génération catalogue:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du catalogue" },
      { status: 500 }
    );
  }
}
