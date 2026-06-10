# podcastsfilms.clairdev.com — Architecture

> Copier ce fichier en `ARCHITECTURE.md` à la racine du nouveau projet.
> Document de bootstrap : périmètre, données, images, synchronisation.

## 1. Le produit

Annuaire inversé : **un film → tous les épisodes de podcasts qui en parlent**.
Sources initiales : La Boîte de Chocolat, scene2films (extensible : chaque
nouvelle source = une ligne en DB, zéro code).

Pages principales :
- `/films` — grille de tous les films couverts (filtres : genre, année, nb d'épisodes)
- `/films/[slug]` — fiche film : poster, méta, **liste des épisodes par podcast** (lien
  vers la page de l'épisode sur le site source + lien d'écoute direct)
- `/podcasts` et `/podcasts/[nameId]` — les sources et leur catalogue
- SEO-first : SSG/ISR, sitemap, JSON-LD `Movie` + `PodcastEpisode`

## 2. La clé universelle : `tmdbId`

Tout l'écosystème pivote sur l'identifiant TMDB (film, personne, collection).
C'est la clé de jointure entre les sites ET la clé de nommage des images.

## 3. Images : AUCUNE copie (convention existante)

Les images sont déjà mutualisées sur le serveur d'upload (`next-upload`,
voir `docs/media-convention.md` du repo laboitedechocolat). URL = fonction
pure du tmdbId :

```ts
const MEDIA = "https://uploadfiles.clairdev.com/api/display/podcasts/media";
export const filmPoster  = (tmdbId: number) => `${MEDIA}/films/${tmdbId}.jpg`;
export const personPhoto = (tmdbId: number) => `${MEDIA}/people/${tmdbId}.jpg`;
export const sagaPoster  = (tmdbId: number) => `${MEDIA}/sagas/${tmdbId}.jpg`;
```

podcastsfilms ne stocke **jamais** d'image. Si un film n'a pas encore son
image canonique (posée par un site source), fallback : hotlink
`https://image.tmdb.org/t/p/w780{posterPath}` (attribution TMDb obligatoire
en footer) — ou upload canonique idempotent (HEAD → upload `keepName`) si on
veut la matérialiser.

## 4. Données : DB propre + synchronisation (recommandé)

### La question « copier des données ou DB mutualisée ? »

**Recommandation : chaque site garde sa DB ; podcastsfilms a la sienne et
"copie" automatiquement le minimum via des APIs de catalogue.**

| | DB mutualisée | DB propre + sync (recommandé) |
|---|---|---|
| Couplage | Fort : une migration Prisma d'un site peut casser les autres ; versions de client à synchroniser | Nul : chaque projet évolue/déploie seul |
| Panne | Point unique pour tous les sites | Une source down = données juste un peu périmées |
| Écriture | Qui a le droit d'écrire quoi ? (conflits) | Chaque site écrit chez lui ; l'agrégateur est lecteur |
| Coût d'ajout d'une source | Schéma commun à négocier | Une URL de catalogue à enregistrer |

La « copie » n'est pas un problème : c'est un **cache structuré minuscule**
(titre, slug, année — quelques Ko par film), rafraîchi par cron. Les
métadonnées riches (synopsis, casting, budget) se prennent directement de
TMDB côté podcastsfilms — inutile de les copier des sites sources.

### Schéma Prisma de podcastsfilms (squelette)

```prisma
model Film {
  id         String     @id @default(uuid())
  tmdbId     Int        @unique          // la clé universelle
  slug       String     @unique          // slug local podcastsfilms
  title      String
  year       Int?
  posterPath String?                     // chemin TMDB (fallback image)
  age        String?                     // "18+" -> floutage
  genres     String[]
  overview   String?                     // depuis TMDB
  coverages  Coverage[]
  updatedAt  DateTime   @updatedAt
}

model PodcastSource {
  id         String     @id @default(uuid())
  nameId     String     @unique          // "la-boite-de-chocolat", "scene2films"
  name       String
  siteUrl    String                      // https://laboitedechocolat.clairdev.com
  catalogUrl String                      // {siteUrl}/api/catalog
  rssUrl     String?
  coverages  Coverage[]
}

// "le podcast X parle du film Y dans l'épisode Z"
model Coverage {
  id           String        @id @default(uuid())
  filmId       String
  sourceId     String
  episodeSlug  String                    // slug sur le site source
  episodeTitle String
  episodeUrl   String                    // lien profond vers le site source
  audioUrl     String?                   // écoute directe
  pubDate      DateTime?
  film         Film          @relation(fields: [filmId], references: [id])
  source       PodcastSource @relation(fields: [sourceId], references: [id])
  @@unique([sourceId, episodeSlug, filmId])
}
```

### Synchronisation (cron horaire, comme l'import laboitedechocolat)

```
pour chaque PodcastSource :
  GET source.catalogUrl                       -> [{ tmdbId, age, episodes: [...] }]
  pour chaque film du catalogue :
    upsert Film par tmdbId
      (si nouveau : fetch TMDB une fois -> title/year/genres/overview/posterPath)
    upsert Coverage par (sourceId, episodeSlug, filmId)
  supprimer les Coverage disparues du catalogue (délink côté source)
```

Idempotent, tolérant aux pannes (une source en erreur n'affecte pas les
autres), throttlé TMDB (~4 req/s, uniquement pour les films nouveaux).

## 5. Contrat de l'API catalogue (côté sites sources)

Chaque site source expose `GET /api/catalog` (JSON, public, ISR ~1 h) :

```jsonc
{
  "podcast": { "nameId": "la-boite-de-chocolat", "name": "La Boîte de Chocolat",
               "siteUrl": "https://laboitedechocolat.clairdev.com" },
  "films": [
    {
      "tmdbId": 9350,
      "title": "Cliffhanger : Traque au sommet",
      "year": 1993,
      "age": null,                       // "18+" si contenu adulte
      "episodes": [
        {
          "slug": "cliffhanger-2026",
          "title": "Cliffhanger",
          "url": "https://laboitedechocolat.clairdev.com/episodes/cliffhanger-2026",
          "audioUrl": "https://...mp3",
          "pubDate": "2026-06-07T21:30:00.000Z"
        }
      ]
    }
  ]
}
```

**Statut : implémenté dans laboitedechocolat (`src/app/api/catalog/route.ts`).**
À répliquer dans scene2films (même contrat).

## 6. Stack conseillée

Même fondation que laboitedechocolat (réutilisation des réflexes et helpers) :
- Next.js 16 (App Router, SSG/ISR), TypeScript, Prisma + PostgreSQL
- Déploiement Coolify sur le serveur existant ; **base dédiée** sur le
  Postgres existant — la nommer explicitement (`PodcastsFilms`), et NE PAS
  utiliser la base par défaut `postgres` (leçon vécue : URL publique Coolify
  pointe sur `postgres` qui est vide)
- Pas d'auth au lancement (site de consultation pure)
- `TMDB_API_KEY` en env ; attribution TMDb en footer

## 7. Checklist de démarrage

1. `create-next-app` + Prisma + schéma ci-dessus, base `PodcastsFilms`
2. Helper images (3 lignes, §3) + composant `FilmCard` avec floutage 18+
   (route masked à copier de laboitedechocolat si besoin)
3. Seed des `PodcastSource` (laboitedechocolat ; scene2films quand son
   `/api/catalog` existera)
4. Script/route de sync (§4) + cron horaire (`curl` comme l'existant)
5. Pages /films, /films/[slug], /podcasts + sitemap + JSON-LD
6. Search Console dès la mise en ligne : sitemap soumis + backlinks croisés
   depuis les sites sources (footer "Découvrez les podcasts qui parlent de ce
   film sur podcastsfilms") — maillage qui profite aux trois sites
