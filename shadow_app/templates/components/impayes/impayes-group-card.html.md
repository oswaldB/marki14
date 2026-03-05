# Composant impayes-group-card.html

## Description
Ce composant affiche une carte représentant un groupe d'impayés. Il est utilisé pour regrouper les impayés par critère (par exemple, par client, par date, ou par statut) et permet de gérer l'expansion/collapse du groupe, ainsi que la sélection des impayés dans le groupe.

## Comportement
- **Affichage du groupe** : Le composant affiche un en-tête avec des informations sur le groupe (titre, sous-titre, retard maximum) et une liste des impayés du groupe.
- **Expansion/Collapse** : Le groupe peut être expansé ou réduit en cliquant sur le bouton dédié. L'état d'expansion est géré par le store `impayesStore`.
- **Sélection des impayés** : Une case à cocher permet de sélectionner ou désélectionner tous les impayés du groupe. La sélection est gérée par le store `impayesStore`.
- **Affichage conditionnel** : La liste des impayés n'est affichée que si le groupe est expansé.

## ASCII Render

### Avec des données mockées
```
+---------------------------------------------------------------+
|  [ ]  📄  Facture #INV-001                                   |
|       Client: Société XYZ                                     |
|       Montant: 1 250,00 €  │  Reste: 1 250,00 €              |
|       Date: 15/03/2024  │  Dossier: D-2024-001              |
|       📍 123 Rue de la Paix, 75000 Paris                     |
|                                                               |
|  ⚠️  Retard max: 30 jours                                     |
|                                                               |
|  [Voir la facture] [Détails]                                   |
+---------------------------------------------------------------+
```

### Avec les noms des variables
```
+---------------------------------------------------------------+
|  [ ]  📄  {{ group.refpiece }}                               |
|       Client: {{ group.client }}                               |
|       Montant: {{ group.totalttcnet }}  │  Reste: {{ group.resteapayer }}|
|       Date: {{ group.datepiece }}  │  Dossier: {{ group.numero }}  |
|       📍  {{ group.adresse }}                                |
|                                                               |
|  ⚠️  Retard max: {{ group.maxDaysLate }} jours                |
|                                                               |
|  [Voir la facture] [Détails]                                   |
+---------------------------------------------------------------+
```

## Props
- **group** : Objet représentant le groupe d'impayés. Contient des informations comme `refpiece`, `client`, `totalttcnet`, `resteapayer`, etc.
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

## Dépendances
- **Alpine.js** : Utilisé pour la réactivité et la gestion des états (`x-show`, `x-for`, `x-text`).
- **impayesStore** : Store global pour la gestion des données des impayés.
- **Font Awesome** : Bibliothèque d'icônes utilisée pour les icônes d'interface.
- **impayes-item-card.html** : Composant inclus pour l'affichage des impayés individuels.

## Exemples d'utilisation
- Ce composant est utilisé dans les vues groupées des impayés (par client, par date, par statut) pour afficher les groupes d'impayés.
- Il est inclus dans les templates principaux comme `impayes-main-content.html` pour afficher les groupes d'impayés.
