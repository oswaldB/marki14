# Documentation Technique : sequence_edit.html

## Description
Ce template est responsable de l'affichage du formulaire d'édition d'une séquence. Il permet de modifier les détails d'une séquence existante, y compris son nom, sa description, et ses paramètres.

## Comportement
- **Affichage conditionnel** : Affiche le formulaire d'édition uniquement si les données de la séquence sont chargées et qu'il n'y a pas d'erreur.
- **Gestion des états** : Utilise `x-show` pour contrôler l'affichage en fonction de l'état du store (`isLoading`, `error`, etc.).
- **Validation** : Valide les données fournies avant de soumettre le formulaire.

## ASCII Render

### Avec des données mockées
```
+---------------------------------------------------------------+
|  📝 Édition de la Séquence                                    |
|                                                               |
|  📋 Nom: Séquence de Relance                                  |
|  +---------------------------------------------------------+  |
|  |                                                           |  |
|  +---------------------------------------------------------+  |
|                                                               |
|  📝 Description:                                               |
|  +---------------------------------------------------------+  |
|  |  Séquence de relance pour les impayés.                   |  |
|  +---------------------------------------------------------+  |
|                                                               |
|  [Enregistrer] [Annuler]                                       |
+---------------------------------------------------------------+
```

### Avec les noms des variables
```
+---------------------------------------------------------------+
|  📝 Édition de la Séquence                                    |
|                                                               |
|  📋 Nom:                                                       |
|  +---------------------------------------------------------+  |
|  |  <input type="text" x-model="sequence.name" />        |  |
|  +---------------------------------------------------------+  |
|                                                               |
|  📝 Description:                                               |
|  +---------------------------------------------------------+  |
|  |  <textarea x-model="sequence.description"></textarea>  |  |
|  +---------------------------------------------------------+  |
|                                                               |
|  [Enregistrer] [Annuler]                                       |
+---------------------------------------------------------------+
```

## Props
- **$store.sequenceStore.isLoading** : État de chargement des données.
- **$store.sequenceStore.error** : État d'erreur lors du chargement des données.
- **$store.sequenceStore.getSequence()** : Retourne les détails de la séquence.

## Fonctions

### Édition de la séquence
@description Valide les données fournies et soumet le formulaire d'édition de la séquence. Affiche une erreur si les données sont invalides.
@param {Object} sequence - Objet contenant les détails de la séquence.
@returns {void} - Soumet le formulaire d'édition de la séquence.
@example
<!-- Exemple d'utilisation dans un template HTML -->
<form @submit.prevent="saveSequence(sequence)">
    <div>
        <label>📋 Nom:</label>
        <input type="text" x-model="sequence.name" />
    </div>
    <div>
        <label>📝 Description:</label>
        <textarea x-model="sequence.description"></textarea>
    </div>
    <button type="submit">Enregistrer</button>
    <button type="button" @click="cancelEdit">Annuler</button>
</form>

## Dépendances
- **Alpine.js** : Utilisé pour la réactivité et la gestion des états (`x-model`, `x-show`).
- **sequenceStore** : Store global pour la gestion des données des séquences.
- **Font Awesome** : Bibliothèque d'icônes utilisée pour les icônes d'interface.

## Exemples d'utilisation
- Ce template est utilisé pour afficher le formulaire d'édition d'une séquence.
- Il peut être inclus dans les pages de gestion des séquences.
