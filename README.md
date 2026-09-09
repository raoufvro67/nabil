# Madrasti Platform

Architecture de base pour une vraie application de cours en ligne avec :

- Frontend React + TypeScript
- Backend NestJS + TypeScript
- Base de données PostgreSQL
- Stockage de vidéos via un service externe (S3 / Supabase / Cloudinary)
- Gestion des rôles admin / enseignant / étudiant

## Structure

- `frontend/` : application web cliente
- `backend/` : API backend

## Démarrage rapide

1. Installer les dépendances :
   npm install
2. Démarrer le frontend :
   npm run dev
3. Démarrer le backend :
   npm run start --workspace backend

## Architecture recommandée

- `frontend` : interface utilisateur, pages, composants, état UI
- `backend` : logique métier, API REST, authentification, gestion des cours et vidéos
- `database` : données structurées et relations
- `storage` : fichiers multimédias

## Sécurité

- Les vidéos ne doivent pas être téléchargées directement depuis la page publique
- L’admin publie les ressources depuis un espace dédié
- Les permissions doivent être vérifiées côté serveur
## visiter le site