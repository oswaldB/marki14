# Composant impayes-view-selector.html

## Description
Composant pour le sélecteur de vue des impayés. Ce composant permet de basculer entre différentes vues d'affichage des impayés, telles que le regroupement par payeur, par facture, ou par acteur. Il est utilisé dans les templates de gestion des impayés pour fournir une interface interactive de sélection de vue.

## Structure HTML

### Description
Le composant `impayes-view-selector.html` est structuré en une seule partie principale :
1. **Sélecteur de vue** : Affiche un sélecteur de vue avec des boutons pour basculer entre différentes vues d'affichage des impayés (par payeur, par facture, par acteur). Le bouton correspondant à la vue actuelle est mis en évidence.

### Schéma ASCII

#### Structure Globale
```
+---------------------------------------------------------------+
|  Sélecteur de vue                                            |
|  +---------------------------------------------------------+  |
|  |  Mode d'affichage:                                      |  |
|  |  - Bouton: Groupé par payeur                            |  |
|  |  - Bouton: Groupé par facture                           |  |
|  |  - Bouton: Groupé par acteur                            |  |
|  +---------------------------------------------------------+  |
+---------------------------------------------------------------+
```

## Props
- **$store.impayesStore.currentView** : Vue actuelle des impayés (`'payeur'`, `'facture'`, `'acteur'`).

## Fonctions

### Basculer la vue
@description Basculer vers une vue spécifique pour l'affichage des impayés.
@param {string} viewName - Nom de la vue à afficher (`'payeur'`, `'facture'`, `'acteur'`).
@returns {void} - Met à jour la vue actuelle.

## Dépendances
- **Alpine.js** : Utilisé pour la réactivité et la gestion des états (`x-show`, `x-for`, `x-text`).
- **impayesStore** : Store global pour la gestion des données des impayés.

## Exemples d'utilisation
- Ce composant est utilisé dans les templates de gestion des impayés pour basculer entre différentes vues d'affichage.
- Il est inclus dans les templates comme `impayes-main-content.html` pour fournir une interface interactive de sélection de vue.

## Inclusions
- **impayesStore.js** : Store Alpine.js pour la gestion des données des impayés.
