# Guide de Standardisation des États Alpine.js

## Introduction

Ce guide explique la standardisation des états Alpine.js dans notre application. Tous les états doivent suivre un format cohérent pour améliorer la maintenabilité, la lisibilité et la cohérence du code.

## Format Standard

Tous les états Alpine.js doivent être déclarés de la manière suivante :

```javascript
/**
 * État Alpine.js pour [nom de la page/composant]
 * Version simplifiée et nettoyée
 */

document.addEventListener('alpine:init', () => {
  Alpine.data('nomDuState', () => ({
    // État initial
    
    // Propriétés calculées (getters)
    
    // Méthodes
    
    // Initialisation
    async init() {
      // Logique d'initialisation
    }
  }));
});
```

## Structure Recommandée

### 1. Commentaire d'en-tête
- Doit inclure une description claire de l'état
- Doit mentionner "Version simplifiée et nettoyée"
- Peut inclure des informations spécifiques sur la page ou le composant

### 2. Événement d'initialisation
- Utiliser **uniquement** `document.addEventListener('alpine:init', () => {`
- Ne pas utiliser `DOMContentLoaded` ou d'autres événements
- Ne pas utiliser d'intervalles pour vérifier si Alpine.js est disponible

### 3. Déclaration de l'état
- Utiliser `Alpine.data('nomDuState', () => ({ ... }))`
- Le nom doit être descriptif et unique
- Éviter les noms génériques comme "state" ou "component"

### 4. Structure interne
```javascript
Alpine.data('nomDuState', () => ({
  // 1. État initial (propriétés)
  propriete1: valeur1,
  propriete2: valeur2,
  
  // 2. Propriétés calculées (getters)
  get proprieteCalculee() {
    return this.calcul();
  },
  
  // 3. Méthodes principales
  async methodePrincipale() {
    // Implémentation
  },
  
  // 4. Méthode d'initialisation (si nécessaire)
  async init() {
    // Logique d'initialisation
  }
}));
```

## Exemples Concrets

### Exemple 1: État de page simple
```javascript
/**
 * État Alpine.js pour la page dashboard
 * Gère la récupération des produits depuis Parse et l'état du dashboard
 */

document.addEventListener('alpine:init', () => {
  Alpine.data('dashboardState', () => ({
    products: [],
    error: null,
    
    async init() {
      await this.loadProducts();
    },
    
    async loadProducts() {
      // Logique de chargement
    }
  }));
});
```

### Exemple 2: État avec propriétés calculées
```javascript
/**
 * État Alpine.js pour la page impayes list (vue liste détaillée)
 * Version simplifiée et nettoyée
 */

document.addEventListener('alpine:init', () => {
  Alpine.data('impayesState', () => ({
    impayes: [],
    searchQuery: '',
    
    get filteredImpayes() {
      return this.impayes.filter(invoice => 
        JSON.stringify(invoice).includes(this.searchQuery)
      );
    },
    
    async init() {
      await this.fetchImpayes();
    }
  }));
});
```

## Bonnes Pratiques

### 1. Nommage
- Utiliser des noms descriptifs pour les états
- Suivre la convention camelCase
- Éviter les abréviations obscures
- Exemples : `dashboardState`, `impayesListState`, `sequenceActionsFlow`

### 2. Organisation du code
- Regrouper les propriétés similaires
- Placer les getters avant les méthodes
- Placer la méthode `init()` à la fin
- Utiliser des commentaires pour séparer les sections

### 3. Gestion des erreurs
- Toujours inclure des blocs try/catch pour les opérations asynchrones
- Utiliser des messages d'erreur clairs et descriptifs
- Logger les erreurs avec `console.error()`

### 4. Documentation
- Documenter les méthodes complexes
- Utiliser JSDoc pour les méthodes publiques
- Commenter les parties critiques du code

## Migration des Anciens États

### Ancien format (à éviter) :
```javascript
// À NE PAS FAIRE
document.addEventListener('DOMContentLoaded', () => {
  const checkAlpineReady = setInterval(() => {
    if (window.Alpine) {
      clearInterval(checkAlpineReady);
      initializeState();
    }
  }, 100);
});

function initializeState() {
  Alpine.data('state', () => ({ ... }));
}
```

### Nouveau format (recommandé) :
```javascript
// À FAIRE
document.addEventListener('alpine:init', () => {
  Alpine.data('state', () => ({ ... }));
});
```

## Avantages de la Standardisation

1. **Cohérence** : Tous les états suivent le même modèle
2. **Maintenabilité** : Plus facile à comprendre et à modifier
3. **Lisibilité** : Structure claire et prévisible
4. **Performance** : Initialisation plus directe sans vérifications inutiles
5. **Collaboration** : Tous les développeurs utilisent le même modèle

## Vérification de la Conformité

Pour vérifier qu'un état est conforme :
1. Vérifier que l'événement utilisé est `alpine:init`
2. Vérifier qu'il n'y a pas de fonctions intermédiaires d'initialisation
3. Vérifier que le commentaire d'en-tête est présent
4. Vérifier que la structure interne est organisée

## Ressources

- [Documentation Alpine.js](https://alpinejs.dev/)
- [Guide des bonnes pratiques JavaScript](https://github.com/airbnb/javascript)
- [Conventions de codage du projet](#)

## Historique des Modifications

- **v1.0** : Création initiale du guide
- **v1.1** : Ajout d'exemples concrets
- **v1.2** : Ajout de la section sur la migration

---

*Dernière mise à jour : 2024-07-16*
*Maintenu par : Équipe de Développement*
