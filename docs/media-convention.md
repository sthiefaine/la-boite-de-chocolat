# Convention médias partagés (multi-sites)

Spec commune à tous les sites de l'écosystème (laboitedechocolat, scene2films,
agrégateur…) pour stocker chaque image de film/personne/saga **une seule fois**.

## Principe

- **Clé de partage : le `tmdbId`** (film, personne ou collection TMDB).
- Les images sourcées TMDB sont stockées sur le serveur d'upload
  (`uploadfiles.clairdev.com`, projet `next-upload`) sous un **chemin
  déterministe** — l'URL est une fonction pure du tmdbId, aucun échange entre
  sites n'est nécessaire :

```
https://uploadfiles.clairdev.com/api/display/podcasts/media/films/{tmdbId}.jpg    (posters, source w1280)
https://uploadfiles.clairdev.com/api/display/podcasts/media/people/{tmdbId}.jpg   (photos, source w300)
https://uploadfiles.clairdev.com/api/display/podcasts/media/sagas/{tmdbId}.jpg    (collections, source w1280)
```

- Les images **custom** (hors TMDB, upload manuel) vivent dans
  `media/{kind}/custom/` avec un nom `custom-{slug}-{YYYYMMDD}.{ext}` et sont
  référencées par le champ `imgFileName`/`photoFileName` de la DB du site,
  qui agit comme un **override** : non nul → on le sert ; nul → URL canonique.

## Règles d'écriture

1. **HEAD avant upload** : avant de poser `media/{kind}/{tmdbId}.jpg`, faire un
   `HEAD` sur l'URL de lecture. `200` → ne rien faire (un autre site l'a déjà
   posée). C'est ce qui rend l'écriture idempotente et le stockage dédupliqué.
2. **Upload avec `keepName`** : l'API d'upload renomme les fichiers par défaut.
   Pour les médias canoniques, passer le champ multipart `keepName: "true"`
   (supporté par `next-upload`) pour conserver le nom déterministe.
   Un ré-upload du même nom écrase le fichier (idempotent).
3. Conserver en DB le chemin TMDB d'origine (`posterPath`/`profilePath`) pour
   pouvoir re-télécharger sans re-scraper.

## Implémentation de référence (ce repo)

- `src/helpers/imageConfig.ts` : `getCanonicalMediaUrl`, `getFilmPosterUrl`,
  `getPersonPhotoUrl`, `getSagaPosterUrl`, `getFilmPosterUrlWithAge` (flou 18+).
- `src/helpers/uploadHelpers.ts` : `canonicalMediaExists` (HEAD),
  `uploadCanonicalMediaFromTMDB` (check + upload `keepName`).
- `scripts/migrate-images-canonical.ts` : migration du catalogue existant.

Pour un nouveau site, ~10 lignes suffisent :

```ts
const MEDIA = "https://uploadfiles.clairdev.com/api/display/podcasts/media";
export const filmPoster = (tmdbId: number) => `${MEDIA}/films/${tmdbId}.jpg`;
export const personPhoto = (tmdbId: number) => `${MEDIA}/people/${tmdbId}.jpg`;
// écriture : HEAD filmPoster(id) → 404 ? upload TMDB w1280 avec keepName=true
```

## Partage des métadonnées (hors images)

On partage **les images, pas les bases de données**. Chaque site garde sa DB
(épisodes, liens, notes…) ; les métadonnées de films se re-fetchent depuis
TMDB. Le `tmdbId` sert de jointure : l'agrégateur interroge un endpoint public
par site (ex. `/api/catalog` → `[{ tmdbId, slug, episodes }]`) et fusionne.
