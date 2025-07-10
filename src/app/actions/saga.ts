import { prisma } from "@/lib/prisma";

export async function getSagaByFilmId(filmId: string) {
  try {
    const film = await prisma.film.findUnique({
      where: { id: filmId },
      include: {
        saga: {
          include: {
            films: {
              orderBy: {
                title: 'asc'
              }
            }
          }
        }
      }
    });

    if (!film || !film.saga) {
      return {
        success: false,
        error: "Saga non trouvée pour ce film"
      };
    }

    return {
      success: true,
      saga: film.saga
    };
  } catch (error) {
    console.error("Erreur lors de la récupération de la saga:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération de la saga"
    };
  }
} 