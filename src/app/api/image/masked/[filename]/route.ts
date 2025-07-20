import { NextRequest, NextResponse } from "next/server";
import { getUploadServerUrl } from "@/helpers/imageConfig";
import sharp from "sharp";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    if (!filename) {
      return new NextResponse("Nom de fichier requis", { status: 400 });
    }

    const originalImageUrl = getUploadServerUrl(filename, "films");

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

    return new NextResponse(processedImageBuffer, {
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
