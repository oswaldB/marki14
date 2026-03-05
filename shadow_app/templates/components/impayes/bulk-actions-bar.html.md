# Composant bulk-actions-bar.html

## Description
Composant pour la barre d'actions groupées dans les impayés. Ce composant affiche une barre d'actions lorsque des impayés sont sélectionnés en mode bulk. Il permet d'effectuer des actions groupées sur les impayés sélectionnés, telles que l'archivage.

## Structure HTML

### Description
Le composant `bulk-actions-bar.html` est structuré en une seule partie principale :
1. **Barre d'actions** : Affiche une barre d'actions lorsque des impayés sont sélectionnés en mode bulk. La barre affiche le nombre de factures sélectionnées, un bouton pour annuler la sélection, et un bouton pour archiver les impayés sélectionnés.

### Schéma ASCII

#### Structure Globale
```
+---------------------------------------------------------------+
|  Barre d'actions                                              |
|  +-------------------------+  +-------------------------------+
|  |  Nombre de factures       |  |  Boutons:                     |
|  |  sélectionnées           |  |  - Annuler                    |
|  +-------------------------+  |  - Archiver                   |
+---------------------------------------------------------------+
```

## Props
- **$store.impayesStore.isBulkMode** : Indique si le mode de sélection multiple est activé.
- **$store.impayesStore.selectedImpayes** : Liste des IDs des impayés sélectionnés.

## Fonctions

### archiveSelected()
@description Archive les impayés sélectionnés.
@returns {Promise<void>}

## Dépendances
- **Alpine.js** : Bibliothèque JavaScript pour la réactivité et la gestion des états.
- **impayesStore** : Store global pour la gestion des données des impayés.
- **Font Awesome** : Bibliothèque d'icônes utilisée pour les icônes d'interface.

## Exemples d'Utilisation
- Ce composant est utilisé dans les templates de gestion des impayés pour afficher une barre d'actions lorsque des impayés sont sélectionnés.
- Il est inclus dans les templates comme `impayes-main-content.html` pour fournir une interface interactive pour les actions groupées.

## Inclusions
- **impayesStore.js** : Store Alpine.js pour la gestion des données des impayés.
