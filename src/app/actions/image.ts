"use server";

import { getFilmPosterUrlWithAge } from "@/helpers/imageConfig";

export async function getMaskedImageUrl(
  imgFileName: string | null,
  age: string | null,
  tmdbId?: number | null
): Promise<string> {
  // Délègue à la résolution centralisée : override (imgFileName) >
  // canonique media/films/{tmdbId}.jpg > placeholder, floutée si 18+.
  return getFilmPosterUrlWithAge({ imgFileName, tmdbId }, age);
}
