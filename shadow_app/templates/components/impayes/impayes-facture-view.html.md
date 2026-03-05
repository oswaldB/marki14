# Composant impayes-facture-view.html

## Description
Composant pour afficher la liste des impayés groupés par facture. Ce composant est utilisé pour afficher les impayés regroupés par facture, en utilisant le composant `impayes-group-card.html` pour chaque groupe. Il gère également l'affichage des messages d'absence de résultats.

## Structure HTML

### Description
Le composant `impayes-facture-view.html` est structuré en deux parties principales :
1. **Liste des impayés groupés par facture** : Affiche les groupes d'impayés par facture en utilisant le composant `impayes-group-card.html` pour chaque groupe. L'affichage est conditionnel et dépend des états `isLoading` et `error` du store.
2. **Message d'absence de résultats** : Affiche un message si aucun impayé ne correspond aux critères de recherche.

### Schéma ASCII

#### Structure Globale
```
+---------------------------------------------------------------+
|  Liste des impayés groupés par facture                        |
|  +---------------------------------------------------------+  |
|  |  Groupe 1                                              |  |
|  |  - Titre                                               |  |
|  |  - Sous-titre                                          |  |
|  |  - Liste des impayés                                   |  |
|  +---------------------------------------------------------+  |
|  +---------------------------------------------------------+  |
|  |  Groupe 2                                              |  |
|  |  - Titre                                               |  |
|  |  - Sous-titre                                          |  |
|  |  - Liste des impayés                                   |  |
|  +---------------------------------------------------------+  |
+---------------------------------------------------------------+
|  Message d'absence de résultats (si aucun résultat)         |
|  +---------------------------------------------------------+  |
|  |  Icône                                                 |  |
|  |  Titre: "Aucun impayé trouvé"                          |  |
|  |  Description: "Aucune facture impayée ne correspond..."  |  |
|  +---------------------------------------------------------+  |
+---------------------------------------------------------------+
```

## Props
- **$store.impayesStore.isLoading** : Indique si les données sont en cours de chargement.
- **$store.impayesStore.error** : État d'erreur lors du chargement des données.
- **$store.impayesStore.getGroupedData()** : Retourne les données des impayés groupées par facture.
- **$store.impayesStore.getFilteredData()** : Retourne les données filtrées des impayés.

## Fonctions

### Affichage des groupes
@description Affiche les groupes d'impayés par facture en utilisant le composant `impayes-group-card.html`.
@returns {void} - Affiche les groupes d'impayés.

### Message d'absence de résultats
@description Affiche un message si aucun impayé ne correspond aux critères de recherche.
@returns {void} - Affiche le message d'absence de résultats.

## Dépendances
- **Alpine.js** : Utilisé pour la réactivité et la gestion des états (`x-show`, `x-for`).
- **impayesStore** : Store global pour la gestion des données des impayés.
- **Font Awesome** : Bibliothèque d'icônes utilisée pour les icônes d'interface.
- **impayes-group-card.html** : Composant inclus pour l'affichage des groupes d'impayés par facture.

## Exemples d'utilisation
- Ce composant est utilisé dans les templates de gestion des impayés pour afficher les impayés groupés par facture.
- Il est inclus dans les templates principaux comme `impayes-main-content.html` pour afficher les impayés par facture.

## Inclusions
- **impayes-group-card.html** : Composant inclus pour l'affichage des groupes d'impayés par facture.
