import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth/auth-server";
import { isAdminRole } from "@/lib/auth/auth-helpers";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user || !isAdminRole(user.role)) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sagaId, useReleaseDate = true } = body;

    if (!sagaId) {
      return NextResponse.json(
        { error: "ID de la saga requis" },
        { status: 400 }
      );
    }

    const existingSaga = await prisma.saga.findUnique({
      where: { id: sagaId },
      include: {
        films: {
          orderBy: {
            year: "asc",
          },
        },
      },
    });

    if (!existingSaga) {
      return NextResponse.json({ error: "Saga non trouvée" }, { status: 404 });
    }

    if (!existingSaga.tmdbId) {
      return NextResponse.json(
        {
          error:
            "Cette saga n'a pas d'ID TMDB. Utilisez d'abord /api/saga/auto-tmdb pour récupérer l'ID TMDB.",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "TMDB API key non configurée" },
        { status: 500 }
      );
    }

    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/collection/${existingSaga.tmdbId}?api_key=${apiKey}&language=fr-FR`,
        { next: { revalidate: 3600 } }
      );

      if (!response.ok) {
        throw new Error(`Erreur TMDB: ${response.status}`);
      }

      const collectionData = await response.json();

      const tmdbFilms = collectionData.parts || [];
      const filmMappings: Array<{ tmdbFilm: any; localFilm: any }> = [];
      const usedLocalFilmIds = new Set<string>();

      for (const tmdbFilm of tmdbFilms) {
        const matchingFilm = existingSaga.films.find(
          (film) =>
            !usedLocalFilmIds.has(film.id) && (
              film.tmdbId === tmdbFilm.id ||
              film.title.toLowerCase() === tmdbFilm.title.toLowerCase() ||
              film.tmdbId === tmdbFilm.id
            )
        );

        if (matchingFilm) {
          filmMappings.push({
            tmdbFilm,
            localFilm: matchingFilm,
          });
          usedLocalFilmIds.add(matchingFilm.id);
        }
      }

      let filmsOrder: string[] = [];

      if (useReleaseDate) {
        filmMappings.sort((a, b) => {
          const dateA = a.tmdbFilm.release_date
            ? new Date(a.tmdbFilm.release_date)
            : new Date(a.localFilm.year || 0, 0, 1);
          const dateB = b.tmdbFilm.release_date
            ? new Date(b.tmdbFilm.release_date)
            : new Date(b.localFilm.year || 0, 0, 1);
          return dateA.getTime() - dateB.getTime();
        });
        filmsOrder = filmMappings.map((mapping) => mapping.localFilm.id);
      } else {
        filmsOrder = filmMappings.map((mapping) => mapping.localFilm.id);
      }

      for (const film of existingSaga.films) {
        if (!filmsOrder.includes(film.id)) {
          filmsOrder.push(film.id);
        }
      }

      const updatedSaga = await prisma.saga.update({
        where: { id: sagaId },
        data: {
          filmsOrder: filmsOrder,
          updatedAt: new Date(),
        },
        include: {
          films: {
            orderBy: {
              title: "asc",
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        saga: updatedSaga,
        message: `Ordre des films mis à jour automatiquement pour la saga "${
          existingSaga.name
        }" (${useReleaseDate ? "tri par date de sortie" : "ordre TMDB"})`,
        tmdbCollection: {
          id: collectionData.id,
          name: collectionData.name,
          filmsCount: tmdbFilms.length,
        },
        filmsOrder: filmsOrder,
        matchedFilms: filmsOrder.length,
        totalFilms: existingSaga.films.length,
      });
    } catch (tmdbError) {
      console.error(
        "Erreur lors de la récupération des données TMDB:",
        tmdbError
      );

      const filmsOrderByYear = existingSaga.films
        .sort((a, b) => (a.year || 0) - (b.year || 0))
        .map((film) => film.id);

      const updatedSaga = await prisma.saga.update({
        where: { id: sagaId },
        data: {
          filmsOrder: filmsOrderByYear,
          updatedAt: new Date(),
        },
        include: {
          films: {
            orderBy: {
              title: "asc",
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        saga: updatedSaga,
        message: `Ordre des films mis à jour par année de sortie (fallback) pour la saga "${existingSaga.name}"`,
        filmsOrder: filmsOrderByYear,
        fallback: true,
      });
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'ordre des films:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sagaId = searchParams.get("sagaId");

    if (!sagaId) {
      return NextResponse.json(
        { error: "ID de la saga requis" },
        { status: 400 }
      );
    }

    const saga = await prisma.saga.findUnique({
      where: { id: sagaId },
      include: {
        films: {
          orderBy: {
            title: "asc",
          },
        },
      },
    });

    if (!saga) {
      return NextResponse.json({ error: "Saga non trouvée" }, { status: 404 });
    }

    const orderedFilms = [];
    const unorderedFilms = [];

    for (const filmId of saga.filmsOrder) {
      const film = saga.films.find((f) => f.id === filmId);
      if (film) {
        orderedFilms.push(film);
      }
    }

    for (const film of saga.films) {
      if (!saga.filmsOrder.includes(film.id)) {
        unorderedFilms.push(film);
      }
    }

    return NextResponse.json({
      success: true,
      saga: {
        ...saga,
        films: [...orderedFilms, ...unorderedFilms],
      },
      filmsOrder: saga.filmsOrder,
      orderedFilms: orderedFilms.map((f) => ({
        id: f.id,
        title: f.title,
        year: f.year,
      })),
      unorderedFilms: unorderedFilms.map((f) => ({
        id: f.id,
        title: f.title,
        year: f.year,
      })),
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de la saga:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
