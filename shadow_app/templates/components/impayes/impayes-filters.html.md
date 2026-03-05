# Composant impayes-filters.html

## Description
Composant pour les filtres des impayés. Ce composant permet de filtrer et de trier les impayés en fonction de différents critères, tels que le terme de recherche, le payeur, le champ de tri, et le filtre de séquences. Il est utilisé dans les templates de gestion des impayés pour fournir une interface interactive de filtrage.

## Structure HTML

### Description
Le composant `impayes-filters.html` est structuré en une seule partie principale :
1. **Barre de filtres** : Affiche une barre de filtres avec quatre champs pour filtrer et trier les impayés : recherche, payeur, trier par, et séquences. Chaque champ est affiché dans une colonne de la grille.

### Schéma ASCII

#### Structure Globale
```
+---------------------------------------------------------------+
|  Barre de filtres                                            |
|  +-------------------------+  +-------------------------------+
|  |  Recherche               |  |  Payeur                      |
|  |  - Champ de texte        |  |  - Liste déroulante         |
|  +-------------------------+  +-------------------------------+
|  +-------------------------+  +-------------------------------+
|  |  Trier par                |  |  Séquences                  |
|  |  - Liste déroulante      |  |  - Liste déroulante         |
|  |  - Bouton d'inversion    |  |                             |
|  +-------------------------+  +-------------------------------+
+---------------------------------------------------------------+
```

## Props
- **$store.impayesStore.filters.searchTerm** : Terme de recherche pour filtrer les impayés.
- **$store.impayesStore.filters.selectedPayeur** : Payeur sélectionné pour filtrer les impayés.
- **$store.impayesStore.filters.sequenceFilter** : Filtre de séquences pour filtrer les impayés.
- **$store.impayesStore.sortDescriptors** : Liste des descripteurs de tri pour ordonner les impayés.
- **$store.impayesStore.isSorting** : Indique si un tri est en cours.
- **$store.impayesStore.payeurs** : Liste des payeurs disponibles.

## Fonctions

### Filtrer les impayés
@description Filtre les impayés en fonction des critères sélectionnés.
@returns {void} - Met à jour les impayés filtrés.

### Mettre à jour le descripteur de tri
@description Met à jour le descripteur de tri pour le champ sélectionné.
@param {string} field - Champ sur lequel appliquer le tri.
@returns {void} - Met à jour les descripteurs de tri.

### Basculer la direction de tri
@description Basculer la direction de tri entre ascendant et descendant.
@returns {void} - Met à jour la direction de tri.

## Dépendances
- **Alpine.js** : Utilisé pour la réactivité et la gestion des états (`x-model`, `x-show`, `x-for`).
- **impayesStore** : Store global pour la gestion des données des impayés.
- **Font Awesome** : Bibliothèque d'icônes utilisée pour les icônes d'interface.

## Exemples d'utilisation
- Ce composant est utilisé dans les templates de gestion des impayés pour filtrer et trier les impayés.
- Il est inclus dans les templates comme `impayes-main-content.html` pour fournir une interface interactive de filtrage.

## Inclusions
- **impayesStore.js** : Store Alpine.js pour la gestion des données des impayés.
