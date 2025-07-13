import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth/auth-server";
import { searchCollection } from "@/app/actions/saga";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { force = false } = body;

    const sagas = await prisma.saga.findMany({
      where: force ? {} : { tmdbId: null },
      include: {
        films: {
          orderBy: {
            title: "asc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    if (sagas.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Aucune saga à traiter",
        processed: 0,
        updated: 0,
        errors: [],
      });
    }

    const results = {
      processed: 0,
      updated: 0,
      errors: [] as Array<{ sagaId: string; sagaName: string; error: string }>,
      details: [] as Array<{
        sagaId: string;
        sagaName: string;
        tmdbId: number | null;
        found: boolean;
      }>,
    };

    for (const saga of sagas) {
      results.processed++;

      try {
        const searchResult = await searchCollection(saga.name, 1);

        if (searchResult.results && searchResult.results.length > 0) {
          const tmdbResult = searchResult.results[0];

          const existingSagaWithTmdbId = await prisma.saga.findUnique({
            where: { tmdbId: tmdbResult.id },
          });

          if (existingSagaWithTmdbId && existingSagaWithTmdbId.id !== saga.id) {
            results.errors.push({
              sagaId: saga.id,
              sagaName: saga.name,
              error: `ID TMDB ${tmdbResult.id} déjà utilisé par la saga "${existingSagaWithTmdbId.name}"`,
            });
            results.details.push({
              sagaId: saga.id,
              sagaName: saga.name,
              tmdbId: null,
              found: false,
            });
            continue;
          }

          await prisma.saga.update({
            where: { id: saga.id },
            data: {
              tmdbId: tmdbResult.id,
              updatedAt: new Date(),
            },
          });

          results.updated++;
          results.details.push({
            sagaId: saga.id,
            sagaName: saga.name,
            tmdbId: tmdbResult.id,
            found: true,
          });

          console.log(
            `✅ Saga "${saga.name}" mise à jour avec TMDB ID: ${tmdbResult.id}`
          );
        } else {
          results.errors.push({
            sagaId: saga.id,
            sagaName: saga.name,
            error: "Aucun résultat trouvé dans TMDB",
          });
          results.details.push({
            sagaId: saga.id,
            sagaName: saga.name,
            tmdbId: null,
            found: false,
          });
          console.log(`❌ Aucun résultat TMDB trouvé pour "${saga.name}"`);
        }
      } catch (error) {
        console.error(
          `Erreur lors du traitement de la saga "${saga.name}":`,
          error
        );
        const errorMessage =
          error instanceof Error ? error.message : "Erreur inconnue";
        results.errors.push({
          sagaId: saga.id,
          sagaName: saga.name,
          error: errorMessage,
        });
        results.details.push({
          sagaId: saga.id,
          sagaName: saga.name,
          tmdbId: null,
          found: false,
        });

        if (errorMessage.includes("TMDB") || errorMessage.includes("JSON")) {
          console.log("⏸️ Pause plus longue à cause d'une erreur TMDB...");
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      // Pour éviter de surcharger l'API TMDB
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return NextResponse.json({
      success: true,
      message: `Traitement terminé. ${results.processed} sagas traitées, ${results.updated} mises à jour.`,
      ...results,
    });
  } catch (error) {
    console.error("Erreur lors du traitement automatique des sagas:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    const totalSagas = await prisma.saga.count();
    const sagasWithTmdbId = await prisma.saga.count({
      where: { tmdbId: { not: null } },
    });
    const sagasWithoutTmdbId = await prisma.saga.count({
      where: { tmdbId: null },
    });

    const sagasWithoutTmdb = await prisma.saga.findMany({
      where: { tmdbId: null },
      select: {
        id: true,
        name: true,
        films: {
          select: {
            title: true,
          },
        },
      },
      take: 5,
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      stats: {
        total: totalSagas,
        withTmdbId: sagasWithTmdbId,
        withoutTmdbId: sagasWithoutTmdbId,
        percentage:
          totalSagas > 0 ? Math.round((sagasWithTmdbId / totalSagas) * 100) : 0,
      },
      examples: sagasWithoutTmdb,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
