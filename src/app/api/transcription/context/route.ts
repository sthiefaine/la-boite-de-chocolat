import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildContextBias } from "@/lib/import/autoTranscribe";

// Contexte de transcription par épisode, prêt à copier-coller dans la
// console Mistral (champ "context bias") pour les transcriptions manuelles.
//
// GET /api/transcription/context            -> tous les épisodes SANS transcription
// GET /api/transcription/context?slug=xxx   -> un épisode précis
// GET /api/transcription/context?all=true   -> tous les épisodes (même transcrits)

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const includeAll = searchParams.get("all") === "true";

    const episodes = await prisma.podcastEpisode.findMany({
      where: slug
        ? { slug }
        : {
            ...(includeAll ? {} : { transcription: null }),
            genre: null, // exclut les annonces
          },
      select: { id: true, title: true, slug: true, pubDate: true },
      orderBy: { pubDate: "desc" },
    });

    if (slug && episodes.length === 0) {
      return NextResponse.json(
        { error: `Épisode introuvable pour le slug "${slug}"` },
        { status: 404 }
      );
    }

    const results = [];
    for (const ep of episodes) {
      const terms = await buildContextBias(ep.id);

      // La console Mistral n'accepte que des tags SANS espace ni virgule :
      // on éclate les phrases ("Sylvester Stallone") en mots uniques
      // ("Sylvester", "Stallone"), dédupliqués, mots courts exclus.
      const seen = new Set<string>();
      const tags: string[] = [];
      for (const term of terms) {
        for (const word of term.split(/[\s,:;()'’"-]+/)) {
          const clean = word.trim();
          if (clean.length < 3) continue;
          const key = clean.toLowerCase();
          if (seen.has(key)) continue;
          seen.add(key);
          tags.push(clean);
        }
      }

      results.push({
        title: ep.title,
        slug: ep.slug,
        pubDate: ep.pubDate,
        // Phrases complètes (utilisées par l'API Mistral, qui les accepte)
        context: terms.join(", "),
        // Tags mot-par-mot pour le champ de la console Mistral
        tags,
        // Pratique pour copier-coller : un tag par ligne
        tagsText: tags.join("\n"),
      });
    }

    return NextResponse.json({ count: results.length, episodes: results });
  } catch (error) {
    console.error("Erreur génération contexte transcription:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du contexte" },
      { status: 500 }
    );
  }
}
