# DBZ Backend API

Backend API pour l'application Dragon Ball Z Battle Game.

## Technologies utilisées

- Node.js
- Express
- TypeScript
- MySQL avec Sequelize
- JWT pour l'authentification

## Installation

```bash
# Installer les dépendances
npm install

# Créer un fichier .env basé sur .env.example
cp .env.example .env

# Configurer les variables d'environnement dans le fichier .env
# Notamment les informations de connexion à la base de données MySQL

# Démarrer le serveur en mode développement
npm run dev
```

## Déploiement sur Railway

Ce projet est configuré pour être déployé sur Railway. Assurez-vous de configurer les variables d'environnement suivantes sur Railway :

- `PORT` - Port sur lequel le serveur s'exécutera (Railway le définit automatiquement)
- `DB_HOST` - Hôte de la base de données MySQL
- `DB_USER` - Utilisateur de la base de données
- `DB_PASSWORD` - Mot de passe de la base de données
- `DB_NAME` - Nom de la base de données
- `DB_PORT` - Port de la base de données (généralement 3306)
- `JWT_SECRET` - Clé secrète pour signer les tokens JWT

## Structure du projet

- `src/config` - Configuration de la base de données
- `src/controllers` - Contrôleurs pour gérer les requêtes
- `src/middleware` - Middleware pour l'authentification
- `src/models` - Modèles Sequelize
- `src/routes` - Routes API
- `src/server.ts` - Point d'entrée de l'application
