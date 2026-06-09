// Comptage de fréquence des mots pour les statistiques de transcriptions.
// Filtre les mots vides du français (articles, pronoms, conjonctions…) et
// les tics de langage oral fréquents en podcast.

const FRENCH_STOPWORDS = new Set([
  // articles & déterminants
  "le", "la", "les", "un", "une", "des", "du", "de", "au", "aux", "ce", "cet",
  "cette", "ces", "mon", "ma", "mes", "ton", "ta", "tes", "son", "sa", "ses",
  "notre", "nos", "votre", "vos", "leur", "leurs", "quel", "quelle", "quels",
  "quelles", "chaque", "tout", "toute", "tous", "toutes", "autre", "autres",
  "même", "mêmes", "tel", "telle", "tels", "telles", "certain", "certains",
  "certaine", "certaines", "aucun", "aucune", "plusieurs", "quelque", "quelques",
  // pronoms
  "je", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles", "me", "te",
  "se", "moi", "toi", "lui", "eux", "soi", "celui", "celle", "ceux", "celles",
  "ceci", "cela", "ça", "qui", "que", "quoi", "dont", "où", "lequel",
  "laquelle", "lesquels", "lesquelles", "rien", "personne", "chacun", "chacune",
  "quelqu", "quelquun",
  // conjonctions & prépositions
  "et", "ou", "mais", "donc", "or", "ni", "car", "si", "comme", "quand",
  "lorsque", "puisque", "parce", "afin", "pour", "par", "avec", "sans", "sous",
  "sur", "dans", "entre", "vers", "chez", "dès", "depuis", "pendant", "avant",
  "après", "contre", "malgré", "selon", "sauf", "hors", "envers", "via",
  // adverbes très fréquents
  "ne", "pas", "plus", "moins", "très", "trop", "peu", "assez", "aussi",
  "alors", "ainsi", "encore", "déjà", "jamais", "toujours", "souvent",
  "parfois", "ensuite", "puis", "enfin", "bref", "ici", "là", "ailleurs",
  "loin", "près", "bien", "mal", "mieux", "beaucoup", "vraiment", "peut-être",
  "surtout", "seulement", "presque", "tellement", "autant", "tant", "fois",
  "maintenant", "aujourd", "hier", "demain", "tard", "tôt", "vite", "longtemps",
  "jusqu", "partout", "dessus", "dessous", "dedans", "dehors", "non", "oui",
  "pourquoi", "comment", "combien", "plutôt", "carrément", "complètement",
  "totalement", "forcément", "justement", "effectivement", "franchement",
  "absolument", "exactement", "évidemment", "clairement", "simplement",
  // auxiliaires & verbes ultra-fréquents (formes conjuguées)
  "être", "est", "es", "suis", "sommes", "êtes", "sont", "était", "étais",
  "étaient", "été", "étant", "sera", "seront", "serait", "seraient", "soit",
  "avoir", "ai", "as", "a", "avons", "avez", "ont", "avait", "avais",
  "avaient", "aura", "auront", "aurait", "auraient", "ayant", "eu",
  "faire", "fais", "fait", "faites", "faisons", "font", "faisait", "faisaient",
  "fera", "feront", "ferait", "fallait", "faut", "faudrait",
  "aller", "vais", "vas", "va", "allons", "allez", "vont", "allait", "allé",
  "dire", "dis", "dit", "dites", "disons", "disent", "disait", "disaient",
  "voir", "vois", "voit", "voyez", "voyons", "voient", "voyait", "vu",
  "savoir", "sais", "sait", "savez", "savons", "savent", "savait", "su",
  "pouvoir", "peux", "peut", "pouvez", "pouvons", "peuvent", "pouvait",
  "pourrait", "pourraient", "pu", "puisse",
  "vouloir", "veux", "veut", "voulez", "voulons", "veulent", "voulait",
  "voudrait", "voulu",
  "devoir", "dois", "doit", "devez", "devons", "doivent", "devait", "devrait",
  "dû",
  "mettre", "mets", "met", "mis", "prendre", "prends", "prend", "pris",
  "venir", "viens", "vient", "venu", "passe", "passé", "trouve", "trouvé",
  "donne", "donné", "reste", "resté", "parle", "parlé", "crois", "croit",
  "pense", "pensé", "regarde", "regardé", "arrive", "arrivé", "semble",
  // tics de langage oral (podcast)
  "euh", "heu", "hum", "hmm", "bah", "ben", "hein", "ouais", "ouai", "ok",
  "voilà", "genre", "enfin", "quand-même", "truc", "trucs", "machin", "coup",
  "moment", "espèce", "putain", "merde", "ah", "oh", "eh", "hé", "wow", "wouah",
  // contexte récurrent du podcast (génériques sans intérêt statistique)
  "film", "films", "scène", "scènes", "moments", "histoire", "personnage",
  "personnages", "acteur", "acteurs", "côté", "niveau", "façon", "manière",
  "chose", "choses", "gens", "monde", "vie", "an", "ans", "année", "années",
  "jour", "jours", "heure", "heures", "minute", "minutes", "seconde", "secondes",
  // restes d'oral & génériques observés sur les vraies transcriptions
  "est-ce", "est-à-dire", "c'est-à-dire", "n'est-ce", "qu'est-ce",
  "bon", "bonne", "bons", "bonnes", "juste", "vrai", "vraie", "vrais",
  "vraies", "sûr", "sûre", "accord", "mec", "mecs", "gars", "petit",
  "petite", "petits", "petites", "grand", "grande", "grands", "grandes",
  "temps", "commence", "commencé", "espèces",
  // nombres en toutes lettres
  "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix",
  "vingt", "trente", "cent", "cents", "mille",
]);

// Préfixes d'élision à retirer : l'avalanche -> avalanche, c'est -> est…
const ELISION_REGEX = /^(?:l|d|c|j|n|s|t|m|qu|jusqu|lorsqu|puisqu|quoiqu)['’]/i;

export type WordCount = { word: string; count: number };

export function countWords(text: string, limit = 150): WordCount[] {
  const counts = new Map<string, number>();

  const tokens = text
    .toLowerCase()
    .split(/[^a-zà-öø-ÿœæ'’-]+/i);

  for (let token of tokens) {
    token = token.replace(ELISION_REGEX, "").replace(/^['’-]+|['’-]+$/g, "");
    if (token.length < 3) continue;
    if (FRENCH_STOPWORDS.has(token)) continue;
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word, "fr"))
    .slice(0, limit);
}

// Hash déterministe (rendu serveur stable) pour varier couleur et ordre
// d'affichage des mots du nuage sans Math.random.
export function wordHash(word: string): number {
  let h = 0;
  for (let i = 0; i < word.length; i++) {
    h = (h * 31 + word.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}
