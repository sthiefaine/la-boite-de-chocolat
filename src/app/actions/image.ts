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
    return `/api/image/masked/${encodeURIComponent(imgFileName)}`;
  } else {
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

  // URL complète (Vercel Blob)
  if (imgFileName.startsWith("http")) {
    if (isAdult) {
      return `/api/image/og-masked/${encodeURIComponent(imgFileName)}`;
    } else {
      return `/api/image/og/${encodeURIComponent(imgFileName)}`;
    }
  }

  if (imgFileName.startsWith("/api/image/masked/")) {
    const maskedImageUrl = await fetch(
      `/api/image/masked/${encodeURIComponent(imgFileName)}`
    );
    const maskedImageUrlData = await maskedImageUrl.json();

    return `/api/image/og-masked/${encodeURIComponent(maskedImageUrlData)}`;
  }

  if (imgFileName === "/images/navet.png") {
    return "/api/image/og-default";
  }

  // fichier local
  if (isAdult) {
    return `/api/image/og-masked/${encodeURIComponent(imgFileName)}`;
  } else {
    return `/api/image/og/${encodeURIComponent(imgFileName)}`;
  }
}
