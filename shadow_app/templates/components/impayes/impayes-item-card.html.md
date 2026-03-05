# Composant impayes-item-card.html

## Description
Ce composant affiche une carte représentant un impayé individuel. Il est utilisé pour afficher les détails d'un impayé, tels que son statut, sa référence, son numéro de facture, son montant, et son adresse. Il permet également de sélectionner l'impayé pour des actions groupées et d'ouvrir des drawers pour afficher des détails supplémentaires ou la facture.

## Comportement
- **Affichage des détails** : Le composant affiche les informations principales de l'impayé, telles que son statut (soldée ou impayée), sa référence, son numéro de facture, son montant, et son adresse.
- **Sélection multiple** : Une case à cocher permet de sélectionner l'impayé pour des actions groupées. La sélection est gérée par le store `impayesStore`.
- **Actions** : Des boutons permettent d'ouvrir la facture ou les détails de l'impayé dans des drawers dédiés.

## ASCII Render

### Avec des données mockées
```
+---------------------------------------------------------------+
|  [ ]  📄  Facture #INV-001                                   |
|       Statut: Impayée                                         |
|       N° F2024001 - 15/03/2024                                |
|       Dossier: D-2024-001                                    |
|       📍 123 Rue de la Paix, 75000 Paris                     |
|                                                               |
|       Montant: 1 250,00 €                                     |
|       Reste: 1 250,00 €                                      |
|                                                               |
|  [Voir la facture] [Détails]                                   |
+---------------------------------------------------------------+
```

### Avec les noms des variables
```
+---------------------------------------------------------------+
|  [ ]  📄  {{ impaye.refpiece }}                               |
|       Statut: {{ impaye.facturesoldee ? 'Soldée' : 'Impayée' }}|
|       N° {{ impaye.nfacture }} - {{ impaye.datepiece }}       |
|       Dossier: {{ impaye.numero }}                            |
|       📍  {{ impaye.adresse }}, {{ impaye.codepostal }} {{ impaye.ville }}|
|                                                               |
|       Montant: {{ impaye.totalttcnet }}                        |
|       Reste: {{ impaye.resteapayer }}                          |
|                                                               |
|  [Voir la facture] [Détails]                                   |
+---------------------------------------------------------------+
```

## Props
- **impaye** : Objet représentant l'impayé. Contient des informations comme `refpiece`, `nfacture`, `datepiece`, `totalttcnet`, `resteapayer`, `facturesoldee`, etc.

## Fonctions

### Affichage des détails
@description Affiche les informations principales de l'impayé, telles que son statut, sa référence, son numéro de facture, son montant, et son adresse.
@param {Object} impaye - Objet représentant l'impayé.
@returns {void} - Affiche les détails de l'impayé.

### Sélection multiple
@description Gère la sélection de l'impayé pour des actions groupées. Utilise une case à cocher pour basculer l'état de sélection.
@param {Object} impaye - Objet représentant l'impayé.
@returns {void} - Met à jour l'état de sélection des impayés.

### Actions
@description Ouvre des drawers pour afficher la facture ou les détails de l'impayé.
@param {Object} impaye - Objet représentant l'impayé.
@returns {void} - Ouvre le drawer correspondant.

## Dépendances
- **Alpine.js** : Utilisé pour la réactivité et la gestion des états (`x-model`, `x-show`, `x-text`).
- **impayesStore** : Store global pour la gestion des données des impayés.
- **Font Awesome** : Bibliothèque d'icônes utilisée pour les icônes d'interface.

## Exemples d'utilisation
- Ce composant est utilisé dans les vues groupées des impayés pour afficher les impayés individuels.
- Il est inclus dans les templates comme `impayes-group-card.html` pour afficher les impayés d'un groupe.
