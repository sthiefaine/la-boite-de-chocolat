import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import Parser from "rss-parser";
import { prisma } from "../src/lib/prisma";
import { buildContextBiasFromFilms } from "../src/lib/transcriptionContext";
import { buildPodcastFeed, escapeXml } from "../src/lib/podcastFeed";
import {
  parseTranscriptionStatus,
  toTranscriptionCatalogEntry,
} from "../src/lib/transcriptionCatalog";
import { GET as catalogGET } from "../src/app/api/transcription/episodes/route";
import { GET as feedGET } from "../src/app/feed.xml/route";

type Episode = Parameters<typeof toTranscriptionCatalogEntry>[0];
const date = new Date("2026-11-08T19:30:00.000Z");

function episode(overrides: Partial<Episode> = {}): Episode {
  return {
    id: "episode-1",
    slug: "spider-man-2",
    title: 'Cinéma & "chocolat" <3',
    description: "Texte\u0000 & <script>reste du texte</script>",
    audioUrl: "https://audio.example/episode.mp3?a=1&b=2",
    duration: 6547,
    season: 5,
    episode: 8,
    genre: null,
    pubDate: date,
    updatedAt: date,
    transcription: null,
    links: [
      {
        film: {
          title: "Spider-Man 2",
          director: "Sam Raimi",
          saga: { name: "Spider-Man" },
          directors: [{ person: { name: "Sam Raimi" } }],
          cast: [
            { person: { name: "Tobey Maguire" }, character: "Peter Parker" },
          ],
        },
      },
    ],
    ...overrides,
  };
}

const originalFindMany = prisma.podcastEpisode.findMany;

function mockFindMany(
  implementation: (
    ...args: Parameters<typeof originalFindMany>
  ) => Promise<Episode[]>,
) {
  const query = mock.fn(implementation);
  // Les délégués Prisma sont des proxies : mock.method ne voit pas leur
  // descripteur de propriété, contrairement à une méthode JavaScript ordinaire.
  prisma.podcastEpisode.findMany = query as typeof originalFindMany;
  return query;
}

afterEach(() => {
  prisma.podcastEpisode.findMany = originalFindMany;
  mock.restoreAll();
});

test("le contexte conserve les noms complets, déduplique et borne la taille", () => {
  const film = episode().links[0].film;
  const terms = buildContextBiasFromFilms([film, film]);
  assert.deepEqual(terms, [
    "La Boîte de Chocolat",
    "Spider-Man 2",
    "Sam Raimi",
    "Spider-Man",
    "Tobey Maguire",
    "Peter Parker",
  ]);
  const many = {
    ...film,
    cast: Array.from({ length: 110 }, (_, i) => ({
      person: { name: `Acteur ${i}` },
      character: `Personnage ${i}`,
    })),
  };
  assert.equal(buildContextBiasFromFilms([many]).length, 100);
});

test("le catalogue distingue absence, fichier disponible et annonce", () => {
  const missing = toTranscriptionCatalogEntry(episode());
  assert.equal(missing.needsTranscription, true);
  assert.equal(missing.transcription, null);
  assert.equal(missing.durationSeconds, 6547);
  assert.equal(missing.publishedAt, "2026-11-08T19:30:00.000Z");
  assert.equal(
    toTranscriptionCatalogEntry(episode({ genre: "annonce" }))
      .needsTranscription,
    false,
  );
  assert.equal(
    toTranscriptionCatalogEntry(episode({ genre: "anonce" }))
      .needsTranscription,
    false,
  );
  assert.equal(
    toTranscriptionCatalogEntry(episode({ genre: "interview" }))
      .needsTranscription,
    true,
  );

  const available = toTranscriptionCatalogEntry(
    episode({
      transcription: {
        fileName: "épisode & voix.JSON",
        fileType: "JSON",
        fileSize: 123,
        updatedAt: date,
      },
    }),
  );
  assert.equal(available.status, "available");
  assert.equal(available.needsTranscription, false);
  assert.equal(available.transcription?.contentType, "application/json");
  assert.ok(
    available.transcription?.url.endsWith("%C3%A9pisode%20%26%20voix.JSON"),
  );
});

test("le RSS reste lisible avec les caractères XML et conserve le GUID", async () => {
  const entry = toTranscriptionCatalogEntry(
    episode({
      transcription: {
        fileName: "episode.json",
        fileType: "json",
        fileSize: 123,
        updatedAt: date,
      },
    }),
  );
  const xml = buildPodcastFeed(
    [entry],
    "https://example.com/feed.xml?all=true&transcription=available",
    date,
  );
  const feed = await new Parser().parseString(xml);
  assert.equal(feed.items.length, 1);
  assert.equal(feed.items[0].title, entry.title);
  assert.equal(feed.items[0].guid, entry.url);
  assert.equal(feed.items[0].enclosure?.url, entry.audioUrl);
  assert.ok(
    xml.includes('xmlns:podcast="https://podcastindex.org/namespace/1.0"'),
  );
  assert.ok(xml.includes('type="text/html" language="fr"'));
  assert.ok(
    xml.includes(
      'rel="related" type="application/json" title="Transcription JSON"',
    ),
  );
  assert.ok(!/<podcast:transcript[^>]+type="application\/json"/.test(xml));
  assert.ok(!xml.includes("\u0000"));
  assert.equal(escapeXml("&<>\"'"), "&amp;&lt;&gt;&quot;&apos;");
});

test("les SRT disponibles sont liés directement, les épisodes manquants ne le sont pas", () => {
  const available = toTranscriptionCatalogEntry(
    episode({
      transcription: {
        fileName: "episode.srt",
        fileType: "srt",
        fileSize: 321,
        updatedAt: date,
      },
    }),
  );
  assert.match(
    buildPodcastFeed([available], "https://example.com/feed.xml", date),
    /<podcast:transcript[^>]+type="application\/x-subrip"/,
  );
  assert.ok(
    !buildPodcastFeed(
      [toTranscriptionCatalogEntry(episode())],
      "https://example.com/feed.xml",
      date,
    ).includes("<podcast:transcript "),
  );
});

test("les paramètres invalides sont refusés avant tout accès à la base", async () => {
  const query = mockFindMany(async () => {
    throw new Error("Unexpected database call");
  });
  assert.equal(parseTranscriptionStatus(null, "missing"), "missing");
  assert.equal(parseTranscriptionStatus("unknown", "all"), null);
  assert.equal(
    (
      await catalogGET(
        new Request(
          "https://example.com/api/transcription/episodes?status=nope",
        ),
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await feedGET(
        new Request("https://example.com/feed.xml?transcription=nope"),
      )
    ).status,
    400,
  );
  assert.equal(query.mock.callCount(), 0);
});

test("le catalogue renvoie les données pour le PC en une requête sans cache", async () => {
  const query = mockFindMany(async () => [episode()]);
  const response = await catalogGET(
    new Request("https://example.com/api/transcription/episodes"),
  );
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(body.status, "missing");
  assert.equal(body.count, 1);
  assert.equal(body.episodes[0].id, "episode-1");
  assert.ok(body.episodes[0].context.terms.includes("Peter Parker"));
  assert.equal(query.mock.callCount(), 1);
  const args = query.mock.calls[0].arguments[0];
  assert.equal(args?.where?.transcription, null);
  assert.equal(args?.take, undefined);
});

test("le mode archive et le filtre manquant couvrent les épisodes au-delà des 50 derniers", async () => {
  const archive = Array.from({ length: 63 }, (_, i) =>
    episode({ id: `episode-${i}`, slug: `episode-${i}` }),
  );
  mockFindMany(async (args) => archive.slice(0, args?.take ?? archive.length));
  for (const [path, count] of [
    ["/feed.xml", 50],
    ["/feed.xml?all=true", 63],
    ["/feed.xml?transcription=missing", 63],
  ] as const) {
    const response = await feedGET(new Request(`https://example.com${path}`));
    assert.equal(response.status, 200);
    const feed = await new Parser().parseString(await response.text());
    assert.equal(feed.items.length, count);
  }
});
