# Documentation Technique : sequence_id_3.html

## Description
Ce template est responsable de l'affichage des détails d'une séquence spécifique (ID 3). Il permet de visualiser les détails de la séquence, y compris son nom, sa description, et ses paramètres.

## Comportement
- **Affichage conditionnel** : Affiche les détails de la séquence uniquement si les données sont chargées et qu'il n'y a pas d'erreur.
- **Gestion des états** : Utilise `x-show` pour contrôler l'affichage en fonction de l'état du store (`isLoading`, `error`, etc.).
- **Navigation** : Permet de naviguer vers d'autres pages liées à la séquence, comme l'édition ou la suppression.

## ASCII Render

### Avec des données mockées
```
+---------------------------------------------------------------+
|  📄 Détails de la Séquence (ID 3)                            |
|                                                               |
|  📋 Nom: Séquence de Relance                                 |
|  📝 Description: Séquence de relance pour les impayés.        |
|  📅 Date de création: 15/03/2024                             |
|                                                               |
|  [Éditer] [Supprimer]                                         |
+---------------------------------------------------------------+
```

### Avec les noms des variables
```
+---------------------------------------------------------------+
|  📄 Détails de la Séquence (ID 3)                            |
|                                                               |
|  📋 Nom: {{ sequence.name }}                                 |
|  📝 Description: {{ sequence.description }}                   |
|  📅 Date de création: {{ sequence.createdAt }}                |
|                                                               |
|  [Éditer] [Supprimer]                                         |
+---------------------------------------------------------------+
```

## Props
- **$store.sequenceStore.isLoading** : État de chargement des données.
- **$store.sequenceStore.error** : État d'erreur lors du chargement des données.
- **$store.sequenceStore.getSequence()** : Retourne les détails de la séquence.

## Fonctions

### Affichage des détails de la séquence
@description Affiche les détails de la séquence en utilisant les données du store. Utilise des cartes pour afficher les informations clés et des boutons pour les actions possibles.
@param {Object} sequence - Objet contenant les détails de la séquence.
@returns {void} - Affiche les détails de la séquence dans l'interface utilisateur.
@example
<!-- Exemple d'utilisation dans un template HTML -->
<div x-show="!$store.sequenceStore.isLoading && !$store.sequenceStore.error">
    <div class="sequence-details-card">
        <span>📋 Nom: <span x-text="sequence.name"></span></span>
        <span>📝 Description: <span x-text="sequence.description"></span></span>
        <span>📅 Date de création: <span x-text="sequence.createdAt"></span></span>
    </div>
</div>

## Dépendances
- **Alpine.js** : Utilisé pour la réactivité et la gestion des états (`x-show`, `x-for`).
- **sequenceStore** : Store global pour la gestion des données des séquences.
- **Font Awesome** : Bibliothèque d'icônes utilisée pour les icônes d'interface.

## Exemples d'utilisation
- Ce template est utilisé pour afficher les détails d'une séquence spécifique.
- Il peut être inclus dans les pages de gestion des séquences.
