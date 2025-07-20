"use server";

import { getUploadServerUrl } from "@/helpers/imageConfig";

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
    return getUploadServerUrl(imgFileName, "films");
  }
}