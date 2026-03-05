# Documentation Technique : variables-panel-alpine.html

## Description
Ce composant est responsable de l'affichage d'un panneau de variables pour la gestion des données dynamiques dans l'application. Il permet de visualiser et de modifier les variables utilisées dans les séquences ou les templates.

## Comportement
- **Affichage conditionnel** : Affiche le panneau de variables uniquement si les données sont chargées et qu'il n'y a pas d'erreur.
- **Gestion des états** : Utilise `x-show` pour contrôler l'affichage en fonction de l'état du store (`isLoading`, `error`, etc.).
- **Édition des variables** : Permet de modifier les valeurs des variables et de les enregistrer.

## ASCII Render

### Avec des données mockées
```
+---------------------------------------------------------------+
|  📝 Panneau de Variables                                     |
|  +---------------------------------------------------------+  |
|  |  📋 Variable 1: Valeur 1                                 |  |
|  |  [Éditer] [Supprimer]                                    |  |
|  +---------------------------------------------------------+  |
|  |  📋 Variable 2: Valeur 2                                 |  |
|  |  [Éditer] [Supprimer]                                    |  |
|  +---------------------------------------------------------+  |
|                                                               |
|  [Ajouter une variable]                                      |
+---------------------------------------------------------------+
```

### Avec les noms des variables
```
+---------------------------------------------------------------+
|  📝 Panneau de Variables                                     |
|  +---------------------------------------------------------+  |
|  |  📋 {{ variable.name }}: {{ variable.value }}           |  |
|  |  [Éditer] [Supprimer]                                    |  |
|  +---------------------------------------------------------+  |
|  |  📋 {{ variable.name }}: {{ variable.value }}           |  |
|  |  [Éditer] [Supprimer]                                    |  |
|  +---------------------------------------------------------+  |
|                                                               |
|  [Ajouter une variable]                                      |
+---------------------------------------------------------------+
```

## Props
- **$store.variablesStore.isLoading** : État de chargement des données.
- **$store.variablesStore.error** : État d'erreur lors du chargement des données.
- **$store.variablesStore.getVariables()** : Retourne la liste des variables.

## Fonctions

### Affichage des variables
@description Affiche la liste des variables en utilisant les données du store. Utilise une boucle `x-for` pour itérer sur les variables et affiche leurs noms et valeurs.
@param {Array} variables - Tableau de variables retourné par `getVariables()`.
@returns {void} - Affiche les variables dans l'interface utilisateur.
@example
<!-- Exemple d'utilisation dans un template HTML -->
<div x-show="!$store.variablesStore.isLoading && !$store.variablesStore.error">
    <template x-for="variable in $store.variablesStore.getVariables()">
        <div class="variable-card">
            <span>📋 <span x-text="variable.name"></span>: <span x-text="variable.value"></span></span>
            <button @click="editVariable(variable.id)">Éditer</button>
            <button @click="deleteVariable(variable.id)">Supprimer</button>
        </div>
    </template>
</div>

## Dépendances
- **Alpine.js** : Utilisé pour la réactivité et la gestion des états (`x-show`, `x-for`).
- **variablesStore** : Store global pour la gestion des données des variables.
- **Font Awesome** : Bibliothèque d'icônes utilisée pour les icônes d'interface.

## Exemples d'utilisation
- Ce composant est utilisé pour afficher et gérer les variables dynamiques de l'application.
- Il peut être inclus dans les pages de configuration des séquences ou des templates.
