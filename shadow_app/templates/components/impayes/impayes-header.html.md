# Composant impayes-header.html

## Description
Composant pour l'en-tête de la page des impayés. Ce composant affiche le titre de la page, le nombre de factures impayées, et un bouton pour rafraîchir les données. Il est utilisé dans les templates de gestion des impayés pour fournir une interface interactive.

## Structure HTML

### Description
Le composant `impayes-header.html` est structuré en deux parties principales :
1. **Titre et nombre de factures** : Affiche le titre de la page et le nombre de factures impayées.
2. **Bouton de rafraîchissement** : Affiche un bouton pour rafraîchir les données des impayés. Le bouton affiche une icône de synchronisation ou une icône de chargement en fonction de l'état de chargement.

### Schéma ASCII

#### Structure Globale
```
+---------------------------------------------------------------+
|  Titre et nombre de factures                               |
|  - Titre: "Impayés"                                         |
|  - Nombre de factures impayées                             |
+---------------------------------------------------------------+
|  Bouton de rafraîchissement                                 |
|  - Icône: Synchronisation / Chargement                      |
|  - Texte: "Rafraîchir"                                     |
+---------------------------------------------------------------+
```

## Props
- **$store.impayesStore.getFilteredData()** : Retourne les données filtrées des impayés.
- **$store.impayesStore.isLoading** : Indique si les données sont en cours de chargement.

## Fonctions

### Rafraîchir les données
@description Rafraîchit les données des impayés en appelant la méthode correspondante du store.
@returns {Promise<void>} - Une promesse qui se résout lorsque les données sont rafraîchies.

## Dépendances
- **Alpine.js** : Utilisé pour la réactivité et la gestion des états (`x-show`, `x-text`).
- **impayesStore** : Store global pour la gestion des données des impayés.
- **Font Awesome** : Bibliothèque d'icônes utilisée pour les icônes d'interface.

## Exemples d'utilisation
- Ce composant est utilisé dans les templates de gestion des impayés pour afficher l'en-tête de la page.
- Il est inclus dans les templates comme `impayes-main-content.html` pour fournir une interface interactive.

## Inclusions
- **impayesStore.js** : Store Alpine.js pour la gestion des données des impayés.
