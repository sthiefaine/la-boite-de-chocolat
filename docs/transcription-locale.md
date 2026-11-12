# Transcriptions locales et flux enrichi

Ces points d'accès sont publics et en lecture seule. Ils préparent un traitement
sur le PC : aucun appel de transcription, téléchargement audio, upload ou
traitement planifié n'est déclenché par leur consultation.

## Catalogue pour le PC

- `/api/transcription/episodes` : tous les épisodes à transcrire, sans limite de 50.
- `/api/transcription/episodes?status=all` : catalogue complet.
- `/api/transcription/episodes?status=available` : transcriptions déjà présentes.
- Un statut inconnu renvoie HTTP 400.

La réponse contient `version: 1`, `generatedAt`, `status`, `count` et `episodes`.
Chaque épisode fournit :

- `id` : identifiant stable à utiliser pour suivre les traitements locaux.
- `slug`, `title`, `description`, `url`, `audioUrl` et `language`.
- `durationSeconds`, `season`, `episode`, `publishedAt` et `updatedAt`.
- `genre`, `status` (`missing` ou `available`) et `needsTranscription`.
- `transcription` : `null`, ou les liens du fichier original et de sa page,
  son format, son type MIME, sa taille en octets et sa date de modification.
- `context` : termes de cinéma, texte joint et lien vers le service de contexte
  existant. Ce vocabulaire reprend le titre des films, la saga, les réalisateurs,
  les acteurs et les personnages, avec déduplication et au plus 100 termes.

Le filtre `missing` exclut les épisodes ayant déjà une transcription ainsi que
les annonces (`genre` égal à `anonce`, valeur historique, ou `annonce`). Les
interviews restent à transcrire. Le catalogue exclut les épisodes sans slug et
ceux classés `18+` ou `adult`, comme le flux public. Les dates sont en ISO 8601.
Les réponses JSON ne sont pas mises en cache pour limiter les retraitements
après l'ajout d'une transcription. Le contexte et les films sont lus dans la
même requête de catalogue, sans requête de contexte supplémentaire par épisode.

Exemple de consultation depuis Windows, après déploiement de cette version :

```powershell
$catalogue = Invoke-RestMethod 'https://laboitedechocolat.clairdev.com/api/transcription/episodes'
$catalogue.episodes | Select-Object id, title, audioUrl, durationSeconds
```

Un futur traitement peut retenir les identifiants déjà terminés sur le PC,
ignorer les transcriptions présentes sur le site, puis enregistrer localement
le texte et les segments avec des étiquettes de voix anonymes. La présence
d'un fichier sur le site ne garantit pas qu'il contienne déjà ces étiquettes :
cette information n'est pas stockée en base.

## RSS enrichi

- `/feed.xml` conserve les 50 derniers épisodes publics et les GUID existants.
- `/feed.xml?all=true` couvre toute l'archive.
- `/feed.xml?transcription=missing` couvre tous les épisodes à transcrire.
- `/feed.xml?transcription=available` couvre ceux déjà transcrits.

Le flux ajoute les numéros de saison et d'épisode, un lien de contexte et un
lien vers le catalogue JSON. Les transcriptions existantes sont annoncées via
`podcast:transcript`, dans l'espace de noms Podcasting 2.0. Leur page HTML est
toujours liée ; les fichiers SRT, VTT et TXT peuvent aussi être liés directement.
Les fichiers JSON Whisper/Mistral sont exposés avec `atom:link rel="related"` :
leur schéma ne doit pas être confondu avec le format JSON Podcasting 2.0.
Le RSS peut être mis en cache pendant 60 secondes.

Les liens de récupération des transcriptions pointent vers le stockage public
existant. Cette modification n'ajoute ni accès en écriture ni publication
automatique des résultats du PC.

## Vérifications

```sh
corepack pnpm exec prisma generate
corepack pnpm exec tsc --noEmit
corepack pnpm dlx tsx --test scripts/transcription-feed.test.ts
```

Le test du catalogue en conditions réelles nécessite une `DATABASE_URL` valide.
