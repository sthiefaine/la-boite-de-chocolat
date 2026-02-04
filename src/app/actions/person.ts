"use server";

import { prisma } from "@/lib/prisma";
import { cache } from "react";

/**
 * Récupère tous les slugs de personnes (pour generateStaticParams)
 */
export async function getAllPersonSlugs() {
  try {
    const people = await prisma.person.findMany({
      where: {
        slug: {
          not: null,
        },
      },
      select: { slug: true },
    });

    return { success: true, data: people };
  } catch (error) {
    console.error("Error fetching person slugs:", error);
    return { success: false, data: [] };
  }
}

/**
 * Récupère une personne par son slug avec ses films
 */
export const getPersonBySlug = cache(async (slug: string) => {
  try {
    const person = await prisma.person.findUnique({
      where: { slug },
      include: {
        directorOf: {
          include: {
            film: {
              select: {
                id: true,
                title: true,
                slug: true,
                year: true,
                imgFileName: true,
                age: true,
                director: true,
                links: {
                  include: {
                    podcast: {
                      select: {
                        id: true,
                        title: true,
                        slug: true,
                        pubDate: true,
                      },
                    },
                  },
                  orderBy: {
                    podcast: {
                      pubDate: "desc",
                    },
                  },
                },
              },
            },
          },
          orderBy: {
            film: {
              year: "desc",
            },
          },
        },
        actorIn: {
          include: {
            film: {
              select: {
                id: true,
                title: true,
                slug: true,
                year: true,
                imgFileName: true,
                age: true,
                director: true,
                links: {
                  include: {
                    podcast: {
                      select: {
                        id: true,
                        title: true,
                        slug: true,
                        pubDate: true,
                      },
                    },
                  },
                  orderBy: {
                    podcast: {
                      pubDate: "desc",
                    },
                  },
                },
              },
            },
          },
          orderBy: {
            order: "asc", // Ordre d'importance dans le casting
          },
        },
      },
    });

    if (!person) {
      return { success: false };
    }

    // Séparer les films en tant que réalisateur et acteur
    const directedFilms = person.directorOf.map((d) => d.film);
    const actedFilms = person.actorIn.map((c) => ({
      ...c.film,
      character: c.character,
    }));

    return {
      success: true,
      person: {
        id: person.id,
        name: person.name,
        slug: person.slug!,
        photoFileName: person.photoFileName,
        tmdbId: person.tmdbId,
        directedFilms,
        actedFilms,
      },
    };
  } catch (error) {
    console.error(`Error fetching person by slug ${slug}:`, error);
    return { success: false };
  }
});
