# Migration Frontend - Guide d'Intégration

## 📋 Aperçu

Ce guide explique comment adapter le frontend pour utiliser les nouveaux endpoints Fastify au lieu des fonctions Parse Cloud. L'objectif est de permettre une transition en douceur pendant la migration.

## 🔧 Configuration Requise

### 1. Importer l'Adaptateur

Dans vos fichiers frontend, importez l'adaptateur Fastify :

```javascript
// Dans vos fichiers JavaScript frontend
import { fastifyCloudRun } from '/js/api/fastifyAdapter.js';
```

Ou utilisez le script directement :

```html
<!-- Dans votre HTML -->
<script src="/js/api/fastifyAdapter.js" type="module"></script>
```

### 2. Remplacement Automatique

L'adaptateur configure automatiquement `Parse.Cloud.run()` pour utiliser les nouveaux endpoints Fastify. Aucune modification n'est nécessaire pour les appels existants.

## 🚀 Utilisation

### Appels Existants (Aucune Modification Nécessaire)

Les appels existants continueront à fonctionner :

```javascript
// Avant (Parse Cloud)
const response = await Parse.Cloud.run('getInvoicePdf', { invoiceId: 'FACT001' });

// Après (Fastify) - Même code, fonctionne automatiquement
const response = await Parse.Cloud.run('getInvoicePdf', { invoiceId: 'FACT001' });
```

### Appels Directs (Recommandé pour les nouveaux développements)

Pour les nouveaux développements, utilisez directement l'adaptateur :

```javascript
// Utilisation directe de l'adaptateur
const response = await fastifyCloudRun('getInvoicePdf', { invoiceId: 'FACT001' });
```

## 📊 Mappage des Fonctions

Voici le mappage entre les fonctions Parse Cloud et les nouveaux endpoints Fastify :

| Fonction Parse Cloud | Endpoint Fastify | Méthode | Statut |
|---------------------|------------------|---------|---------|
| `getDistinctValues` | `/api/distinct-values/:columnName` | GET | ✅ Migré |
| `getInvoicePdf` | `/api/invoice-pdf` | POST | ✅ Migré |
| `sendTestEmail` | `/api/test-email` | POST | ✅ Migré |
| `initCollections` | `/api/initCollections` | POST | ✅ Migré |
| `syncImpayes` | `/api/sync-impayes` | POST | ⚠️ Mock |
| `generateEmailWithOllama` | `/api/generate-email` | POST | ✅ Migré |
| `generateSingleEmailWithAI` | `/api/generate-single-email` | POST | ✅ Migré |
| `populateRelanceSequence` | `/api/populate-relance-sequence` | POST | ✅ Migré |
| `cleanupRelancesOnDeactivate` | `/api/cleanup-relances` | POST | ✅ Migré |
| `handleManualSequenceAssignment` | `/api/assign-sequence` | POST | ✅ Migré |

## 🔄 Transition Progressive

### Phase 1: Compatibilité (Actuelle)
- L'adaptateur permet aux appels existants de fonctionner
- Les fonctions migrées utilisent les nouveaux endpoints
- Les fonctions non migrées retournent des réponses mock

### Phase 2: Migration Complète
- Implémenter les fonctions manquantes (syncImpayes)
- Remplacer progressivement les appels directs
- Supprimer l'adaptateur une fois la migration terminée

## 📈 Exemples de Migration

### Exemple 1: getInvoicePdf

**Avant (Parse Cloud)** :
```javascript
const response = await Parse.Cloud.run('getInvoicePdf', { invoiceId: 'FACT001' });
```

**Après (Fastify)** :
```javascript
// Méthode 1: Utilisation de l'adaptateur (compatibilité)
const response = await Parse.Cloud.run('getInvoicePdf', { invoiceId: 'FACT001' });

// Méthode 2: Appel direct (recommandé)
const response = await fetch('/api/invoice-pdf', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ invoiceId: 'FACT001' })
});
const data = await response.json();
```

### Exemple 2: sendTestEmail

**Avant (Parse Cloud)** :
```javascript
const result = await Parse.Cloud.run('sendTestEmail', {
  recipient: 'test@example.com',
  smtpProfile: profileData
});
```

**Après (Fastify)** :
```javascript
// Méthode 1: Utilisation de l'adaptateur (compatibilité)
const result = await Parse.Cloud.run('sendTestEmail', {
  recipient: 'test@example.com',
  smtpProfile: profileData
});

// Méthode 2: Appel direct (recommandé)
const response = await fetch('/api/test-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recipient: 'test@example.com',
    smtpProfile: profileData
  })
});
const result = await response.json();
```

## 🛠️ Gestion des Erreurs

L'adaptateur gère automatiquement les erreurs et les convertit au format attendu par le frontend :

```javascript
try {
  const response = await Parse.Cloud.run('getInvoicePdf', { invoiceId: 'FACT001' });
  console.log('Succès:', response);
} catch (error) {
  console.error('Erreur:', error.message);
  // Le frontend existant peut gérer cette erreur normalement
}
```

## 📚 Documentation Technique

### Structure de l'Adaptateur

```javascript
// Mappage des fonctions
const endpointMap = {
  'getDistinctValues': { method: 'GET', endpoint: `/distinct-values/${params.columnName}` },
  'getInvoicePdf': { method: 'POST', endpoint: '/invoice-pdf' },
  // ... autres fonctions
}
```

### Journalisation

L'adaptateur journalise toutes les requêtes pour faciliter le débogage :

```
🔄 Appel Fastify: POST /api/invoice-pdf
✅ Réponse Fastify pour getInvoicePdf: { success: true, ... }
```

## 🎯 Prochaines Étapes

1. **Tester les appels existants** avec l'adaptateur
2. **Migrer progressivement** les appels directs vers les nouveaux endpoints
3. **Implémenter les fonctions manquantes** (syncImpayes)
4. **Optimiser les performances** et la gestion des erreurs
5. **Documenter les nouveaux endpoints** pour les développeurs frontend

## 📝 Notes Importantes

- L'adaptateur est conçu pour une transition en douceur
- Les fonctions mock doivent être implémentées pour la production
- La journalisation peut être désactivée en production
- Les endpoints Fastify suivent les conventions REST

---

*Ce document sera mis à jour au fur et à mesure de la progression de la migration frontend.*