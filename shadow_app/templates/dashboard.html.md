# Documentation Technique : dashboard.html

## Description
Ce template est responsable de l'affichage du tableau de bord principal de l'application. Il fournit une vue d'ensemble des impayés, des contacts, et des statistiques clés.

## Comportement
- **Affichage conditionnel** : Affiche les données du tableau de bord uniquement si elles sont chargées et qu'il n'y a pas d'erreur.
- **Gestion des états** : Utilise `x-show` pour contrôler l'affichage en fonction de l'état du store (`isLoading`, `error`, etc.).
- **Statistiques** : Affiche des statistiques clés telles que le nombre total d'impayés, le montant total, et le nombre de contacts.

## ASCII Render

### Avec des données mockées
```
+---------------------------------------------------------------+
|  📊 Tableau de Bord                                          |
|                                                               |
|  📄 Impayés Totaux: 42                                        |
|  💰 Montant Total: 12 500,00 €                                |
|  👥 Contacts: 15                                              |
|                                                               |
|  📈 Statistiques                                             |
|  +---------------------------------------------------------+  |
|  |  📊 Graphique des impayés par mois                      |  |
|  +---------------------------------------------------------+  |
+---------------------------------------------------------------+
```

### Avec les noms des variables
```
+---------------------------------------------------------------+
|  📊 Tableau de Bord                                          |
|                                                               |
|  📄 Impayés Totaux: {{ stats.totalImpayes }}                  |
|  💰 Montant Total: {{ stats.totalAmount }} €                   |
|  👥 Contacts: {{ stats.totalContacts }}                       |
|                                                               |
|  📈 Statistiques                                             |
|  +---------------------------------------------------------+  |
|  |  📊 Graphique des impayés par mois                      |  |
|  +---------------------------------------------------------+  |
+---------------------------------------------------------------+
```

## Props
- **$store.dashboardStore.isLoading** : État de chargement des données.
- **$store.dashboardStore.error** : État d'erreur lors du chargement des données.
- **$store.dashboardStore.getStats()** : Retourne les statistiques du tableau de bord.

## Fonctions

### Affichage des statistiques
@description Affiche les statistiques du tableau de bord en utilisant les données du store. Utilise des cartes pour afficher les informations clés et des graphiques pour visualiser les tendances.
@param {Object} stats - Objet contenant les statistiques du tableau de bord.
@returns {void} - Affiche les statistiques dans l'interface utilisateur.
@example
<!-- Exemple d'utilisation dans un template HTML -->
<div x-show="!$store.dashboardStore.isLoading && !$store.dashboardStore.error">
    <div class="stats-card">
        <span>📄 Impayés Totaux: <span x-text="stats.totalImpayes"></span></span>
        <span>💰 Montant Total: <span x-text="stats.totalAmount"></span> €</span>
        <span>👥 Contacts: <span x-text="stats.totalContacts"></span></span>
    </div>
</div>

## Dépendances
- **Alpine.js** : Utilisé pour la réactivité et la gestion des états (`x-show`, `x-for`).
- **dashboardStore** : Store global pour la gestion des données du tableau de bord.
- **Font Awesome** : Bibliothèque d'icônes utilisée pour les icônes d'interface.

## Exemples d'utilisation
- Ce template est utilisé comme page d'accueil pour afficher une vue d'ensemble des données de l'application.
- Il peut être personnalisé pour afficher des statistiques spécifiques en fonction des besoins de l'utilisateur.
