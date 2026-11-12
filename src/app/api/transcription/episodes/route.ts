import {
  getTranscriptionCatalog,
  parseTranscriptionStatus,
} from "@/lib/transcriptionCatalog";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = parseTranscriptionStatus(
    searchParams.get("status"),
    "missing",
  );
  if (!status) {
    return Response.json(
      { error: "status doit être all, missing ou available" },
      { status: 400 },
    );
  }

  try {
    const episodes = await getTranscriptionCatalog(status);
    return Response.json(
      {
        version: 1,
        generatedAt: new Date().toISOString(),
        status,
        count: episodes.length,
        episodes,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Erreur génération catalogue de transcription:", error);
    return Response.json(
      { error: "Catalogue de transcription indisponible" },
      { status: 500 },
    );
  }
}
