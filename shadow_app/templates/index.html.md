# Documentation Technique : index.html

## Description
Ce template est responsable de l'affichage de la page d'accueil de l'application. Il fournit une vue d'ensemble des fonctionnalités principales et des liens vers les différentes sections de l'application.

## Comportement
- **Affichage conditionnel** : Affiche les données de la page d'accueil uniquement si elles sont chargées et qu'il n'y a pas d'erreur.
- **Gestion des états** : Utilise `x-show` pour contrôler l'affichage en fonction de l'état du store (`isLoading`, `error`, etc.).
- **Navigation** : Permet de naviguer vers les différentes sections de l'application.

## ASCII Render

### Avec des données mockées
```
+---------------------------------------------------------------+
|  🏠 Accueil                                                   |
|                                                               |
|  📊 Tableau de Bord                                           |
|  📄 Impayés                                                   |
|  👥 Contacts                                                  |
|  ⚙️ Paramètres                                                |
|                                                               |
|  📈 Statistiques                                              |
|  +---------------------------------------------------------+  |
|  |  📊 Graphique des impayés par mois                      |  |
|  +---------------------------------------------------------+  |
+---------------------------------------------------------------+
```

### Avec les noms des variables
```
+---------------------------------------------------------------+
|  🏠 Accueil                                                   |
|                                                               |
|  📊 Tableau de Bord                                           |
|  📄 Impayés                                                   |
|  👥 Contacts                                                  |
|  ⚙️ Paramètres                                                |
|                                                               |
|  📈 Statistiques                                              |
|  +---------------------------------------------------------+  |
|  |  📊 Graphique des impayés par mois                      |  |
|  +---------------------------------------------------------+  |
+---------------------------------------------------------------+
```

## Props
- **$store.homeStore.isLoading** : État de chargement des données.
- **$store.homeStore.error** : État d'erreur lors du chargement des données.
- **$store.homeStore.getStats()** : Retourne les statistiques de la page d'accueil.

## Fonctions

### Affichage de la page d'accueil
@description Affiche la page d'accueil avec les liens vers les différentes sections de l'application et les statistiques clés.
@param {Object} stats - Objet contenant les statistiques de la page d'accueil.
@returns {void} - Affiche la page d'accueil dans l'interface utilisateur.
@example
<!-- Exemple d'utilisation dans un template HTML -->
<div x-show="!$store.homeStore.isLoading && !$store.homeStore.error">
    <div class="home-links">
        <a href="/dashboard">📊 Tableau de Bord</a>
        <a href="/impayes">📄 Impayés</a>
        <a href="/contacts">👥 Contacts</a>
        <a href="/settings">⚙️ Paramètres</a>
    </div>
</div>

## Dépendances
- **Alpine.js** : Utilisé pour la réactivité et la gestion des états (`x-show`, `x-for`).
- **homeStore** : Store global pour la gestion des données de la page d'accueil.
- **Font Awesome** : Bibliothèque d'icônes utilisée pour les icônes d'interface.

## Exemples d'utilisation
- Ce template est utilisé comme page d'accueil pour afficher une vue d'ensemble des fonctionnalités de l'application.
- Il peut être personnalisé pour afficher des liens spécifiques en fonction des besoins de l'utilisateur.
