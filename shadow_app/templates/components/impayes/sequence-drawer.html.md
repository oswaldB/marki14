# Composant sequence-drawer.html

## Description
Composant pour le drawer de séquences. Ce composant permet d'ajouter des impayés sélectionnés à une séquence existante ou de créer une nouvelle séquence. Il est utilisé dans les templates de gestion des impayés pour fournir une interface interactive d'ajout à une séquence.

## Structure HTML

### Description
Le composant `sequence-drawer.html` est structuré en deux parties principales :
1. **En-tête** : Affiche l'en-tête du drawer avec le titre et le nombre de factures sélectionnées, ainsi qu'un bouton pour fermer le drawer.
2. **Contenu** : Affiche le contenu du drawer avec une liste des séquences existantes, un champ pour créer une nouvelle séquence, et un bouton pour ajouter les impayés à une séquence.

### Schéma ASCII

#### Structure Globale
```
+---------------------------------------------------------------+
|  En-tête                                                    |
|  +---------------------------------------------------------+  |
|  |  Titre: "Ajouter à une séquence (X)"                   |  |
|  |  Bouton de fermeture                                     |  |
|  +---------------------------------------------------------+  |
|  Contenu                                                    |
|  +---------------------------------------------------------+  |
|  |  Sélectionner une séquence existante                    |  |
|  |  - Liste des séquences                                  |  |
|  |  Ou créer une nouvelle séquence                          |  |
|  |  - Champ de texte: Nom de la nouvelle séquence          |  |
|  |  Pied de page                                           |  |
|  |  - Nombre de factures sélectionnées                    |  |
|  |  - Bouton: Ajouter à la séquence                        |  |
|  +---------------------------------------------------------+  |
+---------------------------------------------------------------+
```

## Props
- **$store.impayesStore.isSequenceDrawerOpen** : Indique si le drawer de séquences est ouvert.
- **$store.impayesStore.selectedImpayes** : Liste des IDs des impayés sélectionnés.
- **$store.impayesStore.availableSequences** : Liste des séquences disponibles.
- **$store.impayesStore.selectedSequenceForAdd** : ID de la séquence sélectionnée pour l'ajout.
- **$store.impayesStore.newSequenceName** : Nom de la nouvelle séquence à créer.

## Fonctions

### Ouvrir le drawer de séquences
@description Ouvre le drawer pour ajouter des impayés à une séquence.
@returns {void} - Ouvre le drawer de séquences.

### Fermer le drawer de séquences
@description Ferme le drawer de séquences.
@returns {void} - Ferme le drawer de séquences.

### Ajouter à une séquence
@description Ajoute les impayés sélectionnés à une séquence existante ou crée une nouvelle séquence.
@returns {Promise<Object>} - Résultat de l'opération.

## Dépendances
- **Alpine.js** : Utilisé pour la réactivité et la gestion des états (`x-show`, `x-for`, `x-model`).
- **impayesStore** : Store global pour la gestion des données des impayés.
- **Font Awesome** : Bibliothèque d'icônes utilisée pour les icônes d'interface.

## Exemples d'utilisation
- Ce composant est utilisé dans les templates de gestion des impayés pour ajouter des impayés à une séquence.
- Il est inclus dans les templates comme `impayes-main-content.html` pour fournir une interface interactive d'ajout à une séquence.

## Inclusions
- **impayesStore.js** : Store Alpine.js pour la gestion des données des impayés.
