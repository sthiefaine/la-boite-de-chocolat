"use server";

import { getVercelBlobUrl } from "@/lib/imageConfig";

export async function getMaskedImageUrl(
  imgFileName: string | null,
  age: string | null
): Promise<string> {
  if (!imgFileName) {
    return "/images/navet.png";
  }

  const isAdult = age === "18+" || age === "adult";

  if (isAdult) {
    // Utiliser une URL relative pour éviter les problèmes de proxy
    return `/api/image/masked/${encodeURIComponent(imgFileName)}`;
  } else {
    // Pour les autres films, utiliser l'image normale
    return getVercelBlobUrl(imgFileName, "films");
  }
}

export async function getOpenGraphImageUrl(
  imgFileName: string | null,
  age: string | null
): Promise<string> {
  if (!imgFileName) {
    return "/api/image/og-default";
  }

  const isAdult = age === "18+" || age === "adult";

  if (isAdult) {
    // Pour les contenus adultes, utiliser l'image par défaut
    return `/api/image/og-masked/${encodeURIComponent(imgFileName)}`;
  } else {
    // Pour les autres films, utiliser l'image Open Graph optimisée
    return `/api/image/og/${encodeURIComponent(imgFileName)}`;
  }
}
