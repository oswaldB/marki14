# Scripts Playwright pour Marki14

Ce dossier contient des scripts Playwright pour automatiser les tests et les interactions avec l'application Marki14.

## Prérequis

1. Assurez-vous que Playwright est installé :
   ```bash
   npm install playwright
   ```

2. Assurez-vous que votre application Marki14 est en cours d'exécution sur `http://localhost:3000`

## Scripts disponibles

### check-sequences-display.js

**Nouveau script** pour vérifier que les séquences s'affichent correctement sur la page `/sequences`.

**Fonctionnalités :**
- Connexion à l'application
- Navigation vers la page des séquences
- Vérification complète de l'initialisation Alpine.js
- Vérification de l'affichage des séquences
- Capture d'écran automatique
- Détection des états vides ou d'erreur

**Utilisation :**
```bash
node tests/playwright/check-sequences-display.js
```

### console-page-sequences.js

Ce script automatise le processus de connexion et navigue vers la page des séquences.

**Fonctionnalités :**
- Se connecte avec l'identifiant `oswald` et le mot de passe `coucou`
- Navigue vers la page des séquences (`/sequences`)
- Vérifie que la page est correctement chargée
- **Capture et affiche les logs de la console** (console.log, console.error, etc.)
- **Surveille et affiche les requêtes réseau** (requêtes, réponses, erreurs)
- Affiche des logs détaillés de l'exécution

**Utilisation :**
```bash
node tests/playwright/console-page-sequences.js
```

**Options de configuration :**
- Modifiez les identifiants de connexion directement dans le script
- Ajustez l'URL de base si nécessaire
- Changez le mode `headless` à `false` pour voir l'exécution dans le navigateur

## Structure du projet

```
tests/
└── playwright/
    ├── check-sequences-display.js  # Test d'affichage des séquences
    ├── console-page-sequences.js   # Script de console et réseau
    ├── screenshots/               # Captures d'écran des tests
    └── README.md                   # Documentation
```

## Bonnes pratiques

1. **Exécution en mode développement** : Lancez le script avec `headless: false` pour voir ce qui se passe
2. **Logs** : Les scripts affichent des logs détaillés pour le débogage
3. **Sélecteurs** : Les sélecteurs sont basés sur les IDs et classes du DOM
4. **Attentes** : Les scripts attendent que les éléments soient prêts avant d'interagir

## Résolution des problèmes

- **Problème de connexion** : Vérifiez que les identifiants sont corrects
- **Page non trouvée** : Assurez-vous que l'application est en cours d'exécution
- **Sélecteurs introuvables** : Vérifiez que le DOM n'a pas changé

## Contribution

Pour ajouter de nouveaux scripts :
1. Créez un nouveau fichier `.js` dans ce dossier
2. Suivez la même structure que les scripts existants
3. Ajoutez une documentation dans ce README