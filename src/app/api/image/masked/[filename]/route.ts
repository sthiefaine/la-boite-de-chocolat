import { NextRequest, NextResponse } from "next/server";
import {
  getUploadServerUrl,
  getCanonicalMediaUrl,
  IMAGE_CONFIG,
  MEDIA_FOLDER,
} from "@/helpers/imageConfig";
import sharp from "sharp";

// Résout le fichier source selon le nommage :
// - "{tmdbId}.jpg" (que des chiffres) -> média canonique partagé media/films/
// - "custom-..."                       -> override custom media/films/custom/
// - sinon                              -> ancien dossier films/ (legacy)
function resolveSourceUrl(filename: string): string {
  const canonicalMatch = filename.match(/^(\d+)\.(jpg|jpeg|png|webp)$/i);
  if (canonicalMatch) {
    return getCanonicalMediaUrl("films", parseInt(canonicalMatch[1], 10));
  }
  if (filename.startsWith("custom-")) {
    return `${IMAGE_CONFIG.domains.uploadReadServer}/${MEDIA_FOLDER}/films/custom/${filename}`;
  }
  return getUploadServerUrl(filename, "films");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    if (!filename) {
      return new NextResponse("Nom de fichier requis", { status: 400 });
    }

    const originalImageUrl = resolveSourceUrl(filename);

    const imageResponse = await fetch(originalImageUrl);
    if (!imageResponse.ok) {
      throw new Error("Impossible de récupérer l'image");
    }

    const imageBuffer = await imageResponse.arrayBuffer();

    const processedImageBuffer = await sharp(Buffer.from(imageBuffer))
      .resize(500, 750, { fit: "cover" })
      .blur(20)
      .png()
      .toBuffer();

    return new NextResponse(new Uint8Array(processedImageBuffer), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Erreur lors de la génération de l'image masquée:", error);

    const fallbackResponse = await fetch(
      new URL("/images/navet.png", request.url)
    );
    if (fallbackResponse.ok) {
      const fallbackBuffer = await fallbackResponse.arrayBuffer();
      return new NextResponse(fallbackBuffer, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    return new NextResponse("Image non trouvée", { status: 404 });
  }
}
