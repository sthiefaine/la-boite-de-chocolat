/**
 * Migration des images vers le stockage canonique partagé (media/{kind}/{tmdbId}.jpg).
 * Voir docs/media-convention.md.
 *
 * Pour chaque Film/Person/Saga avec tmdbId :
 *   1. backfill du chemin TMDB (posterPath/profilePath) s'il manque ;
 *   2. upload canonique si l'image n'existe pas déjà (HEAD) ;
 *   3. mise à null de imgFileName/photoFileName (l'URL canonique prend le relais).
 *
 * Idempotent et relançable. Usage :
 *   npx tsx --env-file=.env scripts/migrate-images-canonical.ts [--limit N] [--kind films|people|sagas] [--dry]
 */
import { PrismaClient } from "@prisma/client";
import {
  canonicalMediaExists,
  uploadCanonicalMediaFromTMDB,
} from "../src/helpers/uploadHelpers";

const prisma = new PrismaClient();
const TMDB_API_KEY = process.env.TMDB_API_KEY;

const args = process.argv.slice(2);
const getArg = (name: string): string | null => {
  const i = args.indexOf(name);
  return i !== -1 ? args[i + 1] ?? null : null;
};
const LIMIT = parseInt(getArg("--limit") ?? "", 10) || Infinity;
const KIND = getArg("--kind"); // films | people | sagas | null = tous
const DRY = args.includes("--dry");

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const THROTTLE_MS = 250; // ~4 req/s TMDB

const stats = { backfilled: 0, uploaded: 0, alreadyThere: 0, cleared: 0, errors: 0, skipped: 0 };

async function fetchTmdbPath(
  endpoint: "movie" | "person" | "collection",
  tmdbId: number,
  field: "poster_path" | "profile_path"
): Promise<string | null> {
  const res = await fetch(
    `https://api.themoviedb.org/3/${endpoint}/${tmdbId}?api_key=${TMDB_API_KEY}&language=fr-FR`
  );
  if (!res.ok) throw new Error(`TMDB ${endpoint}/${tmdbId}: ${res.status}`);
  const data = await res.json();
  return data[field] ?? null;
}

async function migrateOne(opts: {
  label: string;
  kind: "films" | "people" | "sagas";
  tmdbId: number;
  tmdbEndpoint: "movie" | "person" | "collection";
  tmdbField: "poster_path" | "profile_path";
  storedPath: string | null;
  hasLegacyFile: boolean;
  saveBackfill: (path: string) => Promise<void>;
  clearLegacy: () => Promise<void>;
}): Promise<void> {
  try {
    // 1. Backfill du chemin TMDB
    let path = opts.storedPath;
    if (!path) {
      await sleep(THROTTLE_MS);
      path = await fetchTmdbPath(opts.tmdbEndpoint, opts.tmdbId, opts.tmdbField);
      if (!path) {
        console.log(`  ∅ ${opts.label} : pas d'image sur TMDB — ignoré`);
        stats.skipped++;
        return;
      }
      if (!DRY) await opts.saveBackfill(path);
      stats.backfilled++;
    }

    // 2. Upload canonique si absent
    if (await canonicalMediaExists(opts.kind, opts.tmdbId)) {
      stats.alreadyThere++;
    } else if (DRY) {
      console.log(`  ↑ [dry] ${opts.label} → media/${opts.kind}/${opts.tmdbId}.jpg`);
      stats.uploaded++;
    } else {
      await sleep(THROTTLE_MS);
      const up = await uploadCanonicalMediaFromTMDB(opts.kind, opts.tmdbId, path);
      if (!up.success) throw new Error(up.error || "upload échoué");
      console.log(`  ↑ ${opts.label} → media/${opts.kind}/${opts.tmdbId}.jpg`);
      stats.uploaded++;
    }

    // 3. Basculer sur l'URL canonique (l'ancien fichier devient lettre morte)
    if (opts.hasLegacyFile) {
      if (!DRY) await opts.clearLegacy();
      stats.cleared++;
    }
  } catch (error) {
    stats.errors++;
    console.error(`  ✗ ${opts.label}:`, error instanceof Error ? error.message : error);
  }
}

async function migrateFilms() {
  const films = await prisma.film.findMany({
    where: { tmdbId: { not: null } },
    select: { id: true, title: true, tmdbId: true, posterPath: true, imgFileName: true },
    orderBy: { title: "asc" },
  });
  console.log(`\n=== Films : ${films.length} avec tmdbId ===`);
  let n = 0;
  for (const film of films) {
    if (++n > LIMIT) break;
    await migrateOne({
      label: film.title,
      kind: "films",
      tmdbId: film.tmdbId!,
      tmdbEndpoint: "movie",
      tmdbField: "poster_path",
      storedPath: film.posterPath,
      hasLegacyFile: !!film.imgFileName,
      saveBackfill: async (path) => {
        await prisma.film.update({ where: { id: film.id }, data: { posterPath: path } });
      },
      clearLegacy: async () => {
        await prisma.film.update({ where: { id: film.id }, data: { imgFileName: null } });
      },
    });
  }
}

async function migratePeople() {
  const people = await prisma.person.findMany({
    select: { id: true, name: true, tmdbId: true, profilePath: true, photoFileName: true },
    orderBy: { name: "asc" },
  });
  console.log(`\n=== Personnes : ${people.length} ===`);
  let n = 0;
  for (const person of people) {
    if (++n > LIMIT) break;
    await migrateOne({
      label: person.name,
      kind: "people",
      tmdbId: person.tmdbId,
      tmdbEndpoint: "person",
      tmdbField: "profile_path",
      storedPath: person.profilePath,
      hasLegacyFile: !!person.photoFileName,
      saveBackfill: async (path) => {
        await prisma.person.update({ where: { id: person.id }, data: { profilePath: path } });
      },
      clearLegacy: async () => {
        await prisma.person.update({ where: { id: person.id }, data: { photoFileName: null } });
      },
    });
  }
}

async function migrateSagas() {
  const sagas = await prisma.saga.findMany({
    where: { tmdbId: { not: null } },
    select: { id: true, name: true, tmdbId: true, posterPath: true, imgFileName: true },
    orderBy: { name: "asc" },
  });
  console.log(`\n=== Sagas : ${sagas.length} avec tmdbId ===`);
  let n = 0;
  for (const saga of sagas) {
    if (++n > LIMIT) break;
    await migrateOne({
      label: saga.name,
      kind: "sagas",
      tmdbId: saga.tmdbId!,
      tmdbEndpoint: "collection",
      tmdbField: "poster_path",
      storedPath: saga.posterPath,
      hasLegacyFile: !!saga.imgFileName,
      saveBackfill: async (path) => {
        await prisma.saga.update({ where: { id: saga.id }, data: { posterPath: path } });
      },
      clearLegacy: async () => {
        await prisma.saga.update({ where: { id: saga.id }, data: { imgFileName: null } });
      },
    });
  }
}

async function main() {
  if (!TMDB_API_KEY) {
    console.error("TMDB_API_KEY manquante (lancer avec --env-file=.env)");
    process.exit(1);
  }
  console.log(
    `Migration images canoniques${DRY ? " [DRY RUN]" : ""}${
      Number.isFinite(LIMIT) ? ` (limit ${LIMIT}/type)` : ""
    }`
  );

  if (!KIND || KIND === "films") await migrateFilms();
  if (!KIND || KIND === "people") await migratePeople();
  if (!KIND || KIND === "sagas") await migrateSagas();

  console.log(`\n=== Rapport ===`);
  console.log(`  backfill posterPath/profilePath : ${stats.backfilled}`);
  console.log(`  images uploadées                : ${stats.uploaded}`);
  console.log(`  déjà présentes (dédupliquées)   : ${stats.alreadyThere}`);
  console.log(`  bascules vers canonique         : ${stats.cleared}`);
  console.log(`  sans image TMDB                 : ${stats.skipped}`);
  console.log(`  erreurs                         : ${stats.errors}`);

  await prisma.$disconnect();
}

main();
