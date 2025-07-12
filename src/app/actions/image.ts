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
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    return `${baseUrl}/api/image/masked/${encodeURIComponent(imgFileName)}`;
  } else {
    // Pour les autres films, utiliser l'image normale
    return getVercelBlobUrl(imgFileName, "films");
  }
}
