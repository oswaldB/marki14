# Composant impayes-acteur-group-card.html

## Description
Composant pour afficher une carte représentant un groupe d'impayés par acteur. Ce composant est utilisé pour regrouper les impayés par acteur et afficher les sous-groupes de factures propres en retard et de factures apportées. Il permet également de gérer l'expansion/collapse du groupe et la sélection des impayés dans le groupe.

## Structure HTML

### Description
Le composant `impayes-acteur-group-card.html` est structuré en deux parties principales :
1. **En-tête du groupe acteur** : Affiche les informations du groupe, telles que le titre, le sous-titre, le retard maximum, une case à cocher pour sélectionner tout le groupe, et des boutons pour basculer l'expansion et ajouter le groupe à une séquence.
2. **Liste des impayés du groupe** : Affiche la liste des impayés du groupe, avec des sous-groupes pour les factures propres en retard et les factures apportées (en mode acteur).

### Schéma ASCII

#### Structure Globale
```
+---------------------------------------------------------------+
|  En-tête du groupe acteur                                    |
|  +-------------------------+  +-------------------------------+
|  |  Case à cocher           |  |  Titre et sous-titre        |
|  |  Icône                   |  |  Retard max                 |
|  +-------------------------+  +-------------------------------+
|  Boutons:                                                  |
|  - Basculer l'expansion                                     |
|  - Ajouter à une séquence                                   |
+---------------------------------------------------------------+
|  Liste des impayés du groupe (si expansé)                    |
|  +---------------------------------------------------------+  |
|  |  Sous-groupe 1: Factures propres en retard             |  |
|  |  - Nombre de factures                                   |  |
|  |  - Total                                                  |  |
|  |  - Liste des impayés                                     |  |
|  +---------------------------------------------------------+  |
|  +---------------------------------------------------------+  |
|  |  Sous-groupe 2: Factures apportées                       |  |
|  |  - Nombre de factures                                   |  |
|  |  - Total                                                  |  |
|  |  - Liste des impayés                                     |  |
|  +---------------------------------------------------------+  |
+---------------------------------------------------------------+
```

## Props
- **group** : Objet représentant le groupe d'impayés par acteur.
- **groupKey** : Clé unique pour identifier le groupe dans le store.

## Fonctions

### Affichage du groupe
@description Affiche l'en-tête du groupe avec des informations comme le titre, le sous-titre, et le retard maximum. Utilise des icônes pour représenter le type de groupe.
@param {Object} group - Objet représentant le groupe d'impayés.
@param {string} groupKey - Clé unique pour identifier le groupe.
@returns {void} - Affiche l'en-tête du groupe.

### Gestion de l'expansion
@description Gère l'expansion et le collapse du groupe. Utilise `x-show` pour afficher ou masquer la liste des impayés.
@param {string} groupKey - Clé unique pour identifier le groupe.
@returns {void} - Affiche ou masque la liste des impayés.

### Sélection des impayés
@description Gère la sélection ou la désélection de tous les impayés dans le groupe. Utilise une case à cocher pour basculer l'état de sélection.
@param {Object} group - Objet représentant le groupe d'impayés.
@returns {void} - Met à jour l'état de sélection des impayés.

### Affichage des sous-groupes
@description Affiche les sous-groupes de factures propres en retard et de factures apportées pour le mode acteur.
@param {Object} group - Objet représentant le groupe d'impayés.
@returns {void} - Affiche les sous-groupes de factures.

## Dépendances
- **Alpine.js** : Utilisé pour la réactivité et la gestion des états (`x-show`, `x-for`, `x-text`).
- **impayesStore** : Store global pour la gestion des données des impayés.
- **Font Awesome** : Bibliothèque d'icônes utilisée pour les icônes d'interface.
- **impayes-item-card.html** : Composant inclus pour l'affichage des impayés individuels.

## Exemples d'utilisation
- Ce composant est utilisé dans les vues groupées des impayés par acteur pour afficher les groupes d'impayés.
- Il est inclus dans les templates principaux comme `impayes-main-content.html` pour afficher les groupes d'impayés par acteur.

## Inclusions
- **impayes-item-card.html** : Composant inclus pour l'affichage des impayés individuels.
