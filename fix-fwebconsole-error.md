# Plan de Correction des Erreurs de Console Web

## Introduction

Ce document décrit le plan pour identifier et corriger les erreurs de console sur les pages web du projet Marki14 en utilisant le console error catcher.

## Pages à Analyser

D'après l'analyse du code, les pages suivantes doivent être testées :

### Pages Frontend (Astro)
1. **Page d'accueil** - `front/src/pages/index.astro`
   - URL: `/` ou `/index.html`
   - Contenu: Page d'accueil avec logo et bouton d'accès

2. **Styleguide** - `front/src/pages/styleguide.astro`
   - URL: `/styleguide` ou `/styleguide.html`
   - Contenu: Guide de style avec composants UI, animations, etc.

### Pages Backend (Fastify)
1. **API Health Check** - `back/fastify-server/index.js`
   - URL: `/api/health`
   - Contenu: Endpoint de santé de l'API

### JavaScript States
1. **HelloWorld State** - `front/public/js/pages/helloworldState.js`
   - Ce fichier contient la logique Alpine.js pour une page hello world

## Étapes de Test

### 1. Préparation
- Vérifier que le serveur est démarré (`./start.sh`)
- Vérifier que le frontend est accessible à `http://localhost:5000`
- Vérifier que le backend est accessible à `http://localhost:3000`

### 2. Exécution des Tests

#### Test de la page d'accueil
```bash
node console_error_catcher.js http://localhost:5000 --headless=false --timeout=10000
```

#### Test de la page styleguide
```bash
node console_error_catcher.js http://localhost:5000/styleguide --headless=false --timeout=10000
```

#### Test de l'API health
```bash
node console_error_catcher.js http://localhost:3000/api/health --headless=false --timeout=5000
```

### 3. Analyse des Résultats

Pour chaque page testée :
- Examiner les erreurs de console
- Examiner les avertissements de console  
- Examiner les erreurs de page
- Examiner les requêtes réseau échouées

### 4. Correction des Problèmes

En fonction des résultats :
- Corriger les erreurs JavaScript
- Corriger les références manquantes
- Corriger les problèmes de CORS
- Corriger les problèmes de chargement de ressources

### 5. Re-test

Après les corrections, relancer les tests pour vérifier que les problèmes sont résolus.

## Problèmes Potentiels à Surveiller

1. **Ressources manquantes** : Fichiers JS/CSS non trouvés
2. **Erreurs Alpine.js** : Problèmes avec les états ou les bindings
3. **Problèmes CORS** : Requêtes API bloquées
4. **Erreurs de syntaxe JavaScript** : Dans les fichiers state
5. **Problèmes de chargement d'icônes** : Font Awesome non chargé

## Commandes Utiles

### Lancer le serveur
```bash
./start.sh
```

### Arrêter le serveur
```bash
./stop.sh
```

### Lancer le console error catcher
```bash
node console_error_catcher.js <url> [options]
```

### Options courantes
- `--headless=false` : Voir le navigateur
- `--timeout=10000` : Augmenter le timeout
- `--no-warnings` : Désactiver la capture des avertissements
- `--no-logs` : Désactiver la capture des logs

## Résultats Attendus

Après correction, toutes les pages devraient :
- Avoir 0 erreurs de console
- Avoir 0 erreurs de page
- Avoir 0 requêtes réseau échouées
- Avoir un minimum d'avertissements (seulement ceux qui sont acceptables)

## Prochaines Étapes

1. [ ] Démarrer le serveur avec `./start.sh`
2. [ ] Exécuter les tests sur chaque page
3. [ ] Documenter les erreurs trouvées
4. [ ] Corriger les erreurs identifiées
5. [ ] Re-tester pour vérifier les corrections
6. [ ] Documenter les résultats finaux
