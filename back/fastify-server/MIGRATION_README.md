# Migration Parse Cloud → Fastify - Documentation

## 📋 Aperçu de la Migration

Ce projet représente la migration des fonctions Parse Cloud vers un serveur Fastify moderne. Cette migration permet de:

- **Améliorer les performances** en utilisant un serveur Node.js natif
- **Réduire les dépendances** en éliminant Parse Server
- **Faciliter le déploiement** avec une architecture plus simple
- **Améliorer la maintenabilité** avec du code plus clair et mieux structuré

## 🚀 Fonctions Migrées

### Fonctions Principales Migrées

| Fonction Parse Cloud | Endpoint Fastify | Statut | Description |
|---------------------|------------------|---------|-------------|
| `getDistinctValues` | `GET /api/distinct-values/:columnName` | ✅ Migré | Récupère les valeurs distinctes pour une colonne |
| `getInvoicePdf` | `POST /api/invoice-pdf` | ✅ Migré | Récupère les PDFs des factures via SFTP |
| `sendTestEmail` | `POST /api/test-email` | ✅ Migré | Envoie des emails de test via SMTP |
| `initCollections` | `POST /api/initCollections` | ✅ Migré | Initialise les collections de base |
| `smtpProfiles` | `GET/POST /api/smtp-profiles` | ✅ Migré | Gestion des profils SMTP |
| `userManagement` | `GET/POST /api/users` | ✅ Migré | Gestion des utilisateurs |

### Fonctions à Migrer (Backlog)

| Fonction Parse Cloud | Priorité | Complexité |
|---------------------|----------|------------|
| `generateEmailWithOllama` | Haute | Moyenne |
| `generateFullSequenceWithAI` | Haute | Élevée |
| `generateSingleEmailWithAI` | Moyenne | Moyenne |
| `populateRelanceSequence` | Moyenne | Élevée |
| `cleanupRelancesOnDeactivate` | Moyenne | Moyenne |
| `handleManualSequenceAssignment` | Moyenne | Moyenne |
| `sequenceTriggers` | Basse | Élevée |
| `syncImpayes` | Haute | Très Élevée |

## 🛠️ Architecture Technique

### Structure du Projet

```
fastify-server/
├── index.js                # Point d'entrée principal
├── db.js                  # Module de connexion à la base de données
├── sftp.js                # Module de connexion SFTP
├── routes/                # Routes Fastify
│   ├── example.js         # Exemple de route
│   ├── getDistinctValues.js # Route pour les valeurs distinctes
│   ├── getInvoicePdf.js    # Route pour les PDFs de factures
│   ├── sendTestEmail.js   # Route pour les emails de test
│   └── ...                # Autres routes
├── package.json           # Dépendances
├── .env.example           # Exemple de configuration
└── test-migration.js      # Script de test
```

### Modules Clés

1. **`db.js`** - Gestion des connexions PostgreSQL
   - Pool de connexions
   - Exécution de requêtes
   - Gestion des erreurs

2. **`sftp.js`** - Gestion des téléchargements SFTP
   - Connexion sécurisée
   - Téléchargement de fichiers
   - Vérification d'existence des fichiers

3. **Routes Fastify** - Endpoints API
   - Validation des entrées
   - Gestion des erreurs
   - Réponses standardisées

## 🔧 Configuration

### Variables d'Environnement

Copiez `.env.example` en `.env` et configurez les valeurs appropriées:

```env
# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe
DB_NAME=postgres

# SFTP
FTP_HOST=votre_serveur
FTP_PORT=2222
FTP_USERNAME=utilisateur
FTP_PASSWORD=motdepasse

# SMTP
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASSWORD=motdepasse
```

### Dépendances

Les dépendances nécessaires sont déjà incluses dans `package.json`:

- `fastify` - Framework web principal
- `@fastify/cors` - Support CORS
- `@fastify/formbody` - Support des formulaires
- `pg` - Client PostgreSQL
- `ssh2-sftp-client` - Client SFTP
- `nodemailer` - Envoi d'emails
- `dotenv` - Gestion des variables d'environnement

## 🧪 Tests

### Exécution des Tests

1. **Démarrer le serveur:**
   ```bash
   cd fastify-server
   npm run dev
   ```

2. **Exécuter les tests:**
   ```bash
   node test-migration.js
   ```

### Endpoints de Test

- `GET /api/test-distinct-values` - Test de la route getDistinctValues
- `GET /api/test-invoice-pdf` - Test de la route getInvoicePdf
- `GET /api/test-send-email` - Test de la route sendTestEmail

## 📈 Progression de la Migration

### Phase 1: Infrastructure (✅ Complété)
- [x] Configuration du serveur Fastify
- [x] Module de base de données
- [x] Module SFTP
- [x] Structure des routes

### Phase 2: Fonctions Principales (✅ En Cours)
- [x] getDistinctValues
- [x] getInvoicePdf
- [x] sendTestEmail
- [x] initCollections
- [x] smtpProfiles
- [x] userManagement
- [ ] generateEmailWithOllama
- [x] generateFullSequenceWithAI
- [ ] populateRelanceSequence

### Phase 3: Fonctions Avancées (🔄 À Venir)
- [ ] sequenceTriggers
- [ ] cleanupRelancesOnDeactivate
- [ ] handleManualSequenceAssignment
- [ ] syncImpayes

## 🎯 Prochaines Étapes

1. **Tester avec des données réelles**
   - Configurer la base de données
   - Tester les endpoints avec des données réelles
   - Valider les performances

2. **Migrer les fonctions restantes**
   - Prioriser les fonctions IA (Ollama)
   - Migrer les fonctions de séquence
   - Tester chaque fonction individuellement

3. **Documentation et Déploiement**
   - Mettre à jour la documentation technique
   - Créer des scripts de déploiement
   - Configurer CI/CD

4. **Optimisation et Sécurité**
   - Ajouter l'authentification
   - Configurer les autorisations
   - Optimiser les performances

## 📚 Références

- [Documentation Fastify](https://fastify.dev/)
- [Documentation Parse Server](https://docs.parseplatform.org/)
- [Migration Guide](https://github.com/parse-community/parse-server/wiki/Migration-Guide)

---

*Ce document sera mis à jour au fur et à mesure de la progression de la migration.*