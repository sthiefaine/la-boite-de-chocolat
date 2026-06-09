import { NextResponse } from "next/server";
import { getEpisodesWithFilms } from "@/app/actions/episode";
import { getAllFilms } from "@/app/actions/film";
import { getAllSagasWithStats } from "@/app/actions/saga";
import { getAllPeople } from "@/app/actions/person";

// Index de recherche compact pour la palette globale (⌘K).
// Cache serveur 5 min : il agrège plusieurs requêtes Prisma.
export const revalidate = 300;

const isAdult = (age?: string | null) => age === "18+" || age === "adult";

// Chaque entrée est volontairement minimale : t = type, s = slug, n = nom.
type IndexItem = { t: "e" | "f" | "s" | "p"; s: string; n: string };

export async function GET() {
  try {
    const [epRes, filmRes, sagaRes, peopleRes] = await Promise.all([
      getEpisodesWithFilms(),
      getAllFilms(),
      getAllSagasWithStats(),
      getAllPeople(),
    ]);

    const items: IndexItem[] = [];

    for (const ep of epRes?.data ?? []) {
      if (ep.slug && !isAdult(ep.age) && !isAdult(ep.links?.[0]?.film?.age)) {
        items.push({ t: "e", s: ep.slug, n: ep.title });
      }
    }

    const films = filmRes?.success && filmRes.films ? filmRes.films : [];
    for (const f of films) {
      if (f.slug && !isAdult(f.age)) items.push({ t: "f", s: f.slug, n: f.title });
    }

    const sagas = sagaRes?.success && sagaRes.data ? sagaRes.data : [];
    for (const s of sagas) {
      if (s.slug) items.push({ t: "s", s: s.slug, n: s.name });
    }

    const people = peopleRes?.success && peopleRes.data ? peopleRes.data : [];
    for (const p of people) {
      if (p.slug) items.push({ t: "p", s: p.slug, n: p.name });
    }

    return NextResponse.json(
      { items },
      { headers: { "Cache-Control": "no-cache" } }
    );
  } catch (error) {
    console.error("Erreur génération index de recherche:", error);
    return NextResponse.json({ items: [] }, { status: 500 });
  }
}
