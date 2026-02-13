# Guide : Quand Utiliser Fastify vs Parse/REST/Axios

Ce guide clarifie les critères de décision pour choisir entre Fastify et les approches existantes (Parse Cloud, REST avec Axios) dans le projet Marki-Parse.

## Règle Fondamentale

**Fastify ne se fait que si et uniquement si il y a une demande lors du prompt.**

C'est la règle la plus importante à respecter dans ce projet.

## Arbre de Décision

```
┌───────────────────────────────────────────────────┐
│               Nouvelle fonctionnalité à développer │
└───────────────────────────────────────────────────┘
                            │
                            ▼
┌───────────────────────────────────────────────────┐
│         Y a-t-il une demande explicite pour Fastify ? │
└───────────────────────────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌─────────────────────┐           ┌─────────────────────┐
│         OUI         │           │         NON         │
└─────────────────────┘           └─────────────────────┘
            │                               │
            ▼                               ▼
┌─────────────────────────────┐   ┌─────────────────────────────┐
│   Utiliser Fastify           │   │   Utiliser Parse/REST/Axios  │
└─────────────────────────────┘   └─────────────────────────────┘
```

## Cas d'Utilisation de Fastify

### 1. Demande Explicite dans le Prompt

**Exemples de prompts qui justifient Fastify** :
- "Créer une nouvelle API Fastify pour X"
- "Migrer la fonctionnalité Y vers Fastify"
- "Développer un endpoint Fastify pour Z"
- "Nous avons besoin d'une route Fastify pour X"

**Exemples de prompts qui NE justifient PAS Fastify** :
- "Ajouter une fonctionnalité pour X"
- "Créer un endpoint pour Y"
- "Développer une API pour Z"
- "Nous avons besoin d'une nouvelle fonctionnalité"

### 2. Migration Spécifique depuis Parse Cloud

Lorsque le but explicite est de migrer une fonctionnalité existante de Parse Cloud vers Fastify pour :
- Améliorer les performances
- Réduire la dépendance à Parse
- Moderniser l'architecture

### 3. Besoins de Performance Critiques

Pour les endpoints qui nécessitent :
- Très haute performance
- Faible latence
- Gestion de gros volumes de requêtes
- Streaming ou WebSockets

## Cas d'Utilisation de Parse/REST/Axios

### 1. Développement Standard (sans demande Fastify)

**Toutes les fonctionnalités qui ne sont pas explicitement demandées en Fastify** doivent utiliser l'approche existante :

- Parse Cloud Functions pour la logique backend
- Axios pour les appels API depuis le frontend
- L'architecture REST existante

### 2. Prototypage Rapide

Pour les :
- Preuves de concept
- Tests rapides
- Prototypes jetables
- Expérimentations

### 3. Modifications Mineures

Pour les :
- Corrections de bugs
- Améliorations mineures
- Ajouts de champs
- Modifications cosmétiques

### 4. Fonctionnalités Existantes

Pour les fonctionnalités qui :
- Fonctionnent déjà bien dans Parse Cloud
- N'ont pas de problèmes de performance
- Ne sont pas explicitement ciblées pour migration

## Comparaison Technique

| Critère                | Fastify                          | Parse/REST/Axios                |
|------------------------|----------------------------------|---------------------------------|
| **Performance**        | ⭐⭐⭐⭐⭐ Très haute performance  | ⭐⭐⭐ Bonne performance         |
| **Complexité**         | ⭐⭐⭐ Modérée                     | ⭐ Simple                       |
| **Déploiement**        | ⭐⭐⭐⭐ Facile                     | ⭐⭐⭐ Facile                    |
| **Maintenance**        | ⭐⭐⭐⭐ Bon support                | ⭐⭐⭐ Support existant           |
| **Migration**          | ⭐⭐⭐⭐ Bon pour la migration      | ⭐⭐⭐⭐ Déjà en place            |
| **Flexibilité**        | ⭐⭐⭐⭐⭐ Très flexible            | ⭐⭐⭐ Flexible                  |
| **Apprentissage**      | ⭐⭐⭐ Courbe d'apprentissage      | ⭐⭐⭐⭐ Déjà connu                |

## Exemples Concrets

### ❌ À NE PAS FAIRE (Fastify sans demande)

**Prompt** : "Ajouter une fonctionnalité pour exporter les données en CSV"

**Mauvaise approche** : Créer une route Fastify `/api/export-csv`

**Bonne approche** : Utiliser Parse Cloud ou Axios pour l'export

### ✅ À FAIRE (Fastify avec demande explicite)

**Prompt** : "Créer une nouvelle API Fastify pour gérer les rapports PDF avec haute performance"

**Bonne approche** : Créer une route Fastify `/api/generate-pdf-report` avec optimisation

### ❌ À NE PAS FAIRE (Migration non demandée)

**Prompt** : "Corriger le bug dans la récupération des utilisateurs"

**Mauvaise approche** : Migrer toute la gestion des utilisateurs vers Fastify

**Bonne approche** : Corriger le bug dans le code Parse Cloud existant

## Processus de Décision

1. **Analyser le prompt** : Chercher des mots-clés comme "Fastify", "migration Fastify", "API Fastify"
2. **Demander clarification** : Si le prompt est ambigu, demander si Fastify est spécifiquement requis
3. **Évaluer l'effort** : Même avec une demande Fastify, évaluer si l'effort est justifié
4. **Consulter l'équipe** : Pour les gros changements, valider avec l'équipe backend

## Checklist avant de choisir Fastify

- [ ] Y a-t-il une demande **explicite** pour Fastify dans le prompt ?
- [ ] La demande vient-elle d'une source autorisée (PM, lead tech, etc.) ?
- [ ] L'effort de développement Fastify est-il justifié par les bénéfices ?
- [ ] L'équipe a-t-elle les ressources pour maintenir cette route Fastify ?
- [ ] La fonctionnalité nécessite-t-elle vraiment les performances de Fastify ?

Si une seule réponse est "non", utiliser Parse/REST/Axios à la place.

## Migration Progressive

Même lorsqu'on utilise Fastify, il est important de :

1. **Maintenir la compatibilité** : Garder les anciens endpoints Parse fonctionnels
2. **Faire des migrations incrémentielles** : Migrer une fonctionnalité à la fois
3. **Tester rigoureusement** : Vérifier que la nouvelle API Fastify donne les mêmes résultats
4. **Documenter les changements** : Mettre à jour la documentation et informer les équipes frontend

## Exemple de Migration Planifiée

**Étape 1** : Créer la nouvelle route Fastify (sans supprimer l'ancienne)
```javascript
// Nouvelle route Fastify
fastify.get('/api/v2/users', async (request, reply) => {
  // Nouvelle implémentation
})
```

**Étape 2** : Mettre à jour le frontend pour utiliser la nouvelle route
```javascript
// Ancien code (conservé temporairement)
const oldUsers = await Parse.Cloud.run('getUsers')

// Nouveau code
const newUsers = await axios.get('/api/v2/users')
```

**Étape 3** : Une fois que tout fonctionne, déprécier l'ancienne route
```javascript
// Dans Parse Cloud (à supprimer plus tard)
Parse.Cloud.define('getUsers', async () => {
  console.warn('DEPRECATED: Use /api/v2/users instead')
  // ... ancienne implémentation
})
```

**Étape 4** : Supprimer l'ancienne route après validation complète

## Bonnes Pratiques pour la Cohabitation

### 1. Préfixes d'API

Utiliser des préfixes clairs pour distinguer les versions :
- `/api/` - Routes Fastify (nouveautés)
- `/parse/` - Endpoints Parse Cloud (existants)
- `/api/v2/` - Nouvelles versions d'API

### 2. Documentation

Toujours documenter :
- Quelle approche est utilisée pour chaque fonctionnalité
- Où trouver le code (Fastify vs Parse Cloud)
- Comment appeler l'API (endpoint, paramètres, authentification)

### 3. Monitoring

Surveiller :
- Les performances relatives des deux approches
- Les erreurs et temps de réponse
- L'utilisation réelle des endpoints

## Quand Migrer vers Fastify (même sans demande) ?

Il existe quelques exceptions où la migration vers Fastify peut être justifiée même sans demande explicite :

1. **Problèmes de performance critiques** : Si un endpoint Parse cause des timeouts ou des goulots d'étranglement
2. **Sécurité** : Si Parse Cloud présente des vulnérabilités pour une fonctionnalité spécifique
3. **Maintenance** : Si le code Parse est devenu ingérable et nécessite une réécriture complète
4. **Dépréciations** : Si Parse annonce la fin de support pour une fonctionnalité utilisée

**Dans ces cas** :
- Documenter clairement la justification
- Obtenir l'approbation de l'équipe technique
- Planifier la migration de manière contrôlée

## Conclusion

**La règle d'or reste** : Fastify ne se fait que si et uniquement si il y a une demande lors du prompt.

En cas de doute, **choisir Parse/REST/Axios** - c'est l'approche par défaut du projet.

Fastify est un outil puissant pour les cas spécifiques où ses avantages sont explicitement requis, mais il ne doit pas devenir la solution par défaut pour tout nouveau développement.

## Références

- [Guide de développement Fastify](FASTIFY_DEVELOPMENT_GUIDE.md)
- [Documentation Parse Cloud existante](https://docs.parseplatform.org/cloudcode/guide/)
- [Guide Axios](https://axios-http.com/docs/intro)
- [Architecture du projet](data-model.md)