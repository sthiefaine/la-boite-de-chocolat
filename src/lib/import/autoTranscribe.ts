import { prisma } from "@/lib/prisma";
import { uploadTranscription } from "@/app/actions/transcription";

// Transcription automatique des épisodes via l'API Mistral (Voxtral).
// DÉSACTIVÉE PAR DÉFAUT — double verrou :
//   AUTO_TRANSCRIBE_ENABLED="true"  (opt-in explicite)
//   MISTRAL_API_KEY=...             (clé API)
// Coût indicatif : ~0,003 $/min d'audio (≈ 0,36 $ pour un épisode de 2 h).
//
// Garde-fous de dépense (surchargables par env) :
//   AUTO_TRANSCRIBE_MAX_AGE_DAYS   (défaut 7)  : seuls les épisodes publiés
//     dans cette fenêtre sont transcrits -> le backlog n'est JAMAIS attaqué.
//   AUTO_TRANSCRIBE_MONTHLY_LIMIT  (défaut 5)  : plafond d'auto-transcriptions
//     par mois calendaire (5 x ~0,36 $ ≈ 1,80 €/mois maxi par défaut).

const MISTRAL_API_URL = "https://api.mistral.ai/v1/audio/transcriptions";
const MISTRAL_MODEL = "voxtral-mini-latest";

// Marqueur dans le nom de fichier : permet de compter les transcriptions
// générées automatiquement (vs uploads manuels) pour le plafond mensuel.
export const AUTO_FILENAME_MARKER = "-transcription-auto-";

export function isAutoTranscribeEnabled(): boolean {
  return (
    process.env.AUTO_TRANSCRIBE_ENABLED === "true" &&
    !!process.env.MISTRAL_API_KEY
  );
}

const envInt = (name: string, fallback: number): number => {
  const value = parseInt(process.env[name] ?? "", 10);
  return Number.isNaN(value) || value < 0 ? fallback : value;
};

export function getAutoTranscribeMaxAgeDays(): number {
  return envInt("AUTO_TRANSCRIBE_MAX_AGE_DAYS", 7);
}

export function getAutoTranscribeMonthlyLimit(): number {
  return envInt("AUTO_TRANSCRIBE_MONTHLY_LIMIT", 5);
}

// Nombre d'auto-transcriptions déjà effectuées ce mois-ci (mois calendaire).
export async function countAutoTranscriptionsThisMonth(): Promise<number> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  return prisma.transcription.count({
    where: {
      fileName: { contains: AUTO_FILENAME_MARKER },
      createdAt: { gte: monthStart },
    },
  });
}

// Biais de contexte pour Voxtral (max 100 entrées) : oriente le modèle vers
// la bonne orthographe des noms propres. On connaît déjà le film lié à
// l'épisode (l'auto-liaison tourne avant la transcription dans le même run) :
// titre, saga, réalisateurs, casting et personnages.
const CONTEXT_BIAS_MAX = 100;

export async function buildContextBias(episodeId: string): Promise<string[]> {
  const bias = new Set<string>(["La Boîte de Chocolat"]);

  try {
    const episode = await prisma.podcastEpisode.findUnique({
      where: { id: episodeId },
      select: {
        links: {
          select: {
            film: {
              select: {
                title: true,
                director: true,
                saga: { select: { name: true } },
                directors: {
                  select: { person: { select: { name: true } } },
                },
                cast: {
                  select: {
                    character: true,
                    person: { select: { name: true } },
                  },
                  orderBy: { order: "asc" },
                  take: 15,
                },
              },
            },
          },
        },
      },
    });

    for (const link of episode?.links ?? []) {
      const film = link.film;
      if (!film) continue;
      if (film.title) bias.add(film.title);
      if (film.director) bias.add(film.director);
      if (film.saga?.name) bias.add(film.saga.name);
      for (const d of film.directors) {
        if (d.person?.name) bias.add(d.person.name);
      }
      for (const c of film.cast) {
        if (c.person?.name) bias.add(c.person.name);
        if (c.character) bias.add(c.character);
      }
    }
  } catch (error) {
    // Le biais est un bonus : son échec ne doit pas empêcher la transcription.
    console.error("Erreur construction context_bias:", error);
  }

  return [...bias].filter(Boolean).slice(0, CONTEXT_BIAS_MAX);
}

export type AutoTranscribeResult = {
  episodeTitle: string;
  status: "transcribed" | "error";
  audioMinutes?: number;
  error?: string;
};

type MistralSegment = {
  start: number;
  end: number;
  text: string;
  speaker?: string | null;
};

function secondsToSrtTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
    .toString()
    .padStart(2, "0")},${ms.toString().padStart(3, "0")}`;
}

// Convertit les segments Mistral en SRT au format déjà géré par le site :
// le speaker est préfixé "Locuteur N:" (extrait par parseSRT -> couleurs).
export function segmentsToSrt(segments: MistralSegment[]): string {
  const speakerIndex = new Map<string, number>();
  const blocks: string[] = [];

  segments.forEach((seg, i) => {
    const text = seg.text.trim();
    if (!text) return;

    let prefix = "";
    if (seg.speaker) {
      if (!speakerIndex.has(seg.speaker)) {
        speakerIndex.set(seg.speaker, speakerIndex.size + 1);
      }
      prefix = `Locuteur ${speakerIndex.get(seg.speaker)}: `;
    }

    blocks.push(
      `${i + 1}\n${secondsToSrtTime(seg.start)} --> ${secondsToSrtTime(
        seg.end
      )}\n${prefix}${text}`
    );
  });

  return blocks.join("\n\n") + "\n";
}

export async function autoTranscribeEpisode(episode: {
  id: string;
  title: string;
  slug: string | null;
  audioUrl: string;
}): Promise<AutoTranscribeResult> {
  try {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      return {
        episodeTitle: episode.title,
        status: "error",
        error: "MISTRAL_API_KEY manquante",
      };
    }

    // L'audio est passé par URL (flux Acast public) : pas de téléchargement local.
    const form = new FormData();
    form.append("model", MISTRAL_MODEL);
    form.append("file_url", episode.audioUrl);
    form.append("diarize", "true");
    form.append("language", "fr");
    form.append("timestamp_granularities", "segment");

    // Biais de contexte : noms propres du film lié (titre, casting, personnages…)
    for (const term of await buildContextBias(episode.id)) {
      form.append("context_bias", term);
    }

    const response = await fetch(MISTRAL_API_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
      // Un épisode de 2 h peut prendre plusieurs minutes à transcrire.
      signal: AbortSignal.timeout(15 * 60 * 1000),
    });

    if (!response.ok) {
      const body = await response.text();
      return {
        episodeTitle: episode.title,
        status: "error",
        error: `Mistral ${response.status}: ${body.slice(0, 300)}`,
      };
    }

    const data: {
      segments?: MistralSegment[];
      usage?: { prompt_audio_seconds?: number };
    } = await response.json();

    if (!data.segments?.length) {
      return {
        episodeTitle: episode.title,
        status: "error",
        error: "Réponse Mistral sans segments",
      };
    }

    const srt = segmentsToSrt(data.segments);
    const fileName = `${episode.slug || episode.id}${AUTO_FILENAME_MARKER}${Date.now()}.srt`;
    const file = new File([srt], fileName, { type: "text/plain" });

    // Réutilise le flux d'upload existant : upload serveur de fichiers,
    // upsert Transcription en DB, revalidation des pages.
    const uploadForm = new FormData();
    uploadForm.append("episodeId", episode.id);
    uploadForm.append("transcriptionFile", file);
    const result = await uploadTranscription(uploadForm);

    if (!result.success) {
      return {
        episodeTitle: episode.title,
        status: "error",
        error: result.error || "Échec upload transcription",
      };
    }

    return {
      episodeTitle: episode.title,
      status: "transcribed",
      audioMinutes: data.usage?.prompt_audio_seconds
        ? Math.round(data.usage.prompt_audio_seconds / 60)
        : undefined,
    };
  } catch (error) {
    return {
      episodeTitle: episode.title,
      status: "error",
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}
