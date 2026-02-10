# Serveur Fastify pour Marki-Parse

Ce serveur Fastify est conçu pour migrer les fonctionnalités depuis Parse Cloud vers une architecture Fastify moderne.

## Installation

```bash
cd fastify-server
npm install
```

## Démarrage

### Mode production
```bash
npm start
```

### Mode développement (avec rechargement automatique)
```bash
npm run dev
```

## Configuration

Le serveur écoute sur le port **3000** et expose les routes sous le préfixe `/api`.

## Routes disponibles

### Routes de base
- `GET /api/health` - Vérifie l'état du serveur
- `GET /api/test` - Route de test pour vérifier le fonctionnement
- `POST /api/initCollections` - Initialise les collections (version mock pour le développement)

### Routes migrées (à venir)
- `smtpProfiles` - Gestion des profils SMTP
- `userManagement` - Gestion des utilisateurs
- `getInvoicePdf` - Récupération des PDF de factures
- `sequenceTriggers` - Gestion des déclencheurs de séquences

## Migration depuis Parse Cloud

Ce serveur est conçu pour remplacer progressivement les fonctions Parse.Cloud.define par des endpoints Fastify.

### Exemple de migration

**Parse Cloud (ancien):**
```javascript
Parse.Cloud.define('hello', async (request) => {
  return 'Hello, world!'
})
```

**Fastify (nouveau):**
```javascript
fastify.get('/api/hello', async (request, reply) => {
  return { message: 'Hello, world!' }
})
```

## Configuration Caddy

Le serveur est configuré pour fonctionner avec Caddy. La route suivante est disponible:

```
dev.markidiags.com/api {
    reverse_proxy 192.168.1.239:3000
}
```

## Dépendances

- Fastify - Framework web rapide et léger
- @fastify/cors - Support CORS
- @fastify/formbody - Support des formulaires
- @fastify/sensible - Utilitaires pour les réponses HTTP

## Développement

Pour ajouter une nouvelle route migrée:

1. Créer un fichier dans le répertoire `routes/`
2. Exporter une fonction qui prend l'instance Fastify en paramètre
3. Ajouter le nom de la route à la liste dans `index.js`

Exemple:
```javascript
// routes/maNouvelleRoute.js
export default async function (fastify) {
  fastify.get('/api/ma-route', async (request, reply) => {
    return { data: 'Ma nouvelle route' }
  })
}
```