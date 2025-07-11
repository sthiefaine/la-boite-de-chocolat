# 🍫 La Boîte de Chocolat

Un site web moderne pour le podcast cinéma "La Boîte de Chocolat" avec Thomas, Charlie et Thomas. Du cinéma, de la mauvaise foi, un soupçon de beauferie et le tour est joué !

## 🎯 Fonctionnalités

### 🎧 Lecteur Audio Avancé
- **Lecteur intégré** avec contrôles de lecture/pause
- **File d'attente** pour organiser vos écoutes
- **Visualiseur audio** en temps réel
- **Contrôles média** (lecture/pause depuis les notifications système)
- **Skip automatique** des intros (configurable)
- **Navigation** entre épisodes (précédent/suivant)

### 🎬 Gestion des Films
- **Liaison épisodes-films** : chaque épisode peut être lié à un ou plusieurs films
- **Intégration TMDB** : données des films depuis The Movie Database
- **Système de sagas** : organisation des films en sagas
- **Recherche** de films et épisodes

### 👥 Système d'Authentification
- **Connexion/Inscription** avec Better Auth
- **Gestion des rôles**
- **Système de bannissement** temporaire ou permanent
- **Sessions sécurisées**

### 🎛️ Interface d'Administration
- **Gestion des épisodes** : ajout, modification, suppression
- **Gestion des films** : liaison avec les épisodes
- **Gestion des utilisateurs** : modération, bannissement
- **Import automatique** depuis les flux RSS

## 🛠️ Technologies Utilisées

### Frontend
- **Next.js 15** avec App Router
- **React 19** avec Server Components
- **TypeScript** pour la sécurité des types
- **Tailwind CSS** pour le styling
- **Zustand** pour la gestion d'état
- **Lucide React** pour les icônes

### Backend & Base de Données
- **Prisma** comme ORM
- **PostgreSQL** comme base de données
- **Better Auth** pour l'authentification
- **Vercel Blob** pour le stockage d'images

### Audio & Médias
- **Web Audio API** pour le visualiseur
- **MediaSession API** pour les contrôles système
- **RSS Parser** pour l'import des épisodes

## 🚀 Installation

### Prérequis
- Node.js 18+
- PostgreSQL
- Compte Vercel (pour le déploiement)

### 1. Cloner le projet
```bash
git clone <votre-repo>
cd laboitedechocolat
```

### 2. Installer les dépendances
```bash
pnpm install
```

### 3. Configuration de l'environnement
Créer un fichier `.env.local` :
```env
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/laboitedechocolat"

# Better Auth
AUTH_SECRET="votre-secret-super-securise"
AUTH_URL="http://localhost:3000"

# Vercel Blob (optionnel)
BLOB_READ_WRITE_TOKEN="votre-token-vercel-blob"

# TMDB (optionnel)
TMDB_API_KEY="votre-clé-api-tmdb"
```

### 4. Configuration de la base de données
```bash
# Générer le client Prisma
pnpm prisma:generate

# Appliquer les migrations
pnpm prisma:migrate

# (Optionnel) Ouvrir Prisma Studio
pnpm prisma:studio
```

### 5. Générer les types Better Auth
```bash
pnpm better-auth:generate
```

### 6. Lancer le serveur de développement
```bash
pnpm dev
```

Le site sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📁 Structure du Projet

```
src/
├── app/                    # App Router Next.js
│   ├── (auth)/            # Pages d'authentification
│   ├── admin/             # Interface d'administration
│   ├── api/               # Routes API
│   ├── podcasts/          # Pages des podcasts
│   └── actions/           # Server Actions
├── components/            # Composants React
│   ├── Player/           # Lecteur audio
│   ├── PodcastCard/      # Cartes d'épisodes
│   ├── Sections/         # Sections de la page d'accueil
│   └── ...
├── lib/                  # Utilitaires et configuration
│   ├── auth/            # Configuration Better Auth
│   ├── store/           # Stores Zustand
│   └── ...
└── hooks/               # Hooks personnalisés
```

## 🎮 Scripts Disponibles

```bash
# Développement
pnpm dev              # Serveur de développement avec Turbopack
pnpm build            # Build de production
pnpm start            # Serveur de production

# Base de données
pnpm prisma:generate  # Générer le client Prisma
pnpm prisma:migrate   # Appliquer les migrations
pnpm prisma:studio    # Interface graphique Prisma

# Authentification
pnpm better-auth:generate  # Générer les types Better Auth

# Linting
pnpm lint             # Vérifier le code
```

## 🎨 Fonctionnalités Avancées

### Lecteur Audio
- **Visualiseur en temps réel** avec Web Audio API
- **Contrôles système** via MediaSession API
- **File d'attente persistante** avec Zustand
- **Skip automatique** des intros (configurable dans les options)

### Gestion des Médias
- **Stockage d'images** via Vercel Blob
- **Optimisation automatique** des images
- **Génération de couleurs** depuis les posters de films

### Performance
- **Server Components** pour le rendu côté serveur
- **Lazy loading** des composants
- **Optimisation des images** avec Next.js Image
- **Infinite scroll** pour les listes d'épisodes

## 🔧 Configuration Avancée

### Variables d'Environnement

| Variable | Description | Requis |
|----------|-------------|--------|
| `DATABASE_URL` | URL de connexion PostgreSQL | ✅ |
| `AUTH_SECRET` | Secret pour Better Auth | ✅ |
| `AUTH_URL` | URL de base de l'application | ✅ |
| `BLOB_READ_WRITE_TOKEN` | Token Vercel Blob | ❌ |
| `TMDB_API_KEY` | Clé API The Movie Database | ❌ |

### Options du Lecteur
Les utilisateurs peuvent configurer :
- **Skip automatique des intros** : durée à sauter
- **Volume par défaut**
- **Préférences de lecture**

## 🚀 Déploiement

### Vercel (Recommandé)
1. Connecter votre repo GitHub à Vercel
2. Configurer les variables d'environnement
3. Déployer automatiquement

### Variables d'environnement Vercel
```bash
# Ajouter dans les paramètres Vercel
DATABASE_URL=postgresql://...
AUTH_SECRET=votre-secret
AUTH_URL=https://votre-domaine.vercel.app
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.
---