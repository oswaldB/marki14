# Documentation Technique : sequences.html

## Description
Ce template est responsable de l'affichage de la liste des séquences. Il permet de visualiser les séquences disponibles, de les filtrer, et de naviguer vers leurs détails ou leur édition.

## Comportement
- **Affichage conditionnel** : Affiche la liste des séquences uniquement si les données sont chargées et qu'il n'y a pas d'erreur.
- **Gestion des états** : Utilise `x-show` pour contrôler l'affichage en fonction de l'état du store (`isLoading`, `error`, etc.).
- **Filtrage et tri** : Permet de filtrer et trier les séquences en fonction de différents critères.

## ASCII Render

### Avec des données mockées
```
+---------------------------------------------------------------+
|  📊 Liste des Séquences                                      |
|  +---------------------------------------------------------+  |
|  |  📋 Séquence de Relance                                  |  |
|  |  📝 Séquence de relance pour les impayés.               |  |
|  |  📅 Date: 15/03/2024                                    |  |
|  +---------------------------------------------------------+  |
|  |  📋 Séquence de Rappel                                   |  |
|  |  📝 Séquence de rappel pour les contacts.               |  |
|  |  📅 Date: 10/03/2024                                    |  |
|  +---------------------------------------------------------+  |
+---------------------------------------------------------------+
```

### Avec les noms des variables
```
+---------------------------------------------------------------+
|  📊 Liste des Séquences                                      |
|  +---------------------------------------------------------+  |
|  |  📋 {{ sequence.name }}                                  |  |
|  |  📝 {{ sequence.description }}                           |  |
|  |  📅 {{ sequence.createdAt }}                             |  |
|  +---------------------------------------------------------+  |
|  |  📋 {{ sequence.name }}                                  |  |
|  |  📝 {{ sequence.description }}                           |  |
|  |  📅 {{ sequence.createdAt }}                             |  |
|  +---------------------------------------------------------+  |
+---------------------------------------------------------------+
```

## Props
- **$store.sequenceStore.isLoading** : État de chargement des données.
- **$store.sequenceStore.error** : État d'erreur lors du chargement des données.
- **$store.sequenceStore.getSequences()** : Retourne la liste des séquences.

## Fonctions

### Affichage des séquences
@description Affiche la liste des séquences en utilisant les données du store. Utilise une boucle `x-for` pour itérer sur les séquences et affiche leurs informations.
@param {Array} sequences - Tableau de séquences retourné par `getSequences()`.
@returns {void} - Affiche les séquences dans l'interface utilisateur.
@example
<!-- Exemple d'utilisation dans un template HTML -->
<div x-show="!$store.sequenceStore.isLoading && !$store.sequenceStore.error">
    <template x-for="sequence in $store.sequenceStore.getSequences()">
        <div class="sequence-card">
            <span>📋 <span x-text="sequence.name"></span></span>
            <span>📝 <span x-text="sequence.description"></span></span>
            <span>📅 <span x-text="sequence.createdAt"></span></span>
        </div>
    </template>
</div>

## Dépendances
- **Alpine.js** : Utilisé pour la réactivité et la gestion des états (`x-show`, `x-for`).
- **sequenceStore** : Store global pour la gestion des données des séquences.
- **Font Awesome** : Bibliothèque d'icônes utilisée pour les icônes d'interface.

## Exemples d'utilisation
- Ce template est utilisé pour afficher la liste des séquences disponibles.
- Il peut être utilisé en combinaison avec des filtres pour affiner les résultats.
