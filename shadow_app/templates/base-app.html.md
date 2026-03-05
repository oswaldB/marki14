# Documentation Technique : base-app.html

## Description
Ce template est la mise en page de base pour l'application. Il définit la structure globale de l'interface utilisateur, y compris la barre latérale, l'en-tête, et le contenu principal. Il charge également les dépendances JavaScript et CSS nécessaires pour l'application, y compris les stores Alpine.js globaux.

## Comportement
- **Structure de la page** : Définit la structure de base de l'application avec une barre latérale et un contenu principal.
- **Chargement des dépendances** : Charge les bibliothèques CSS et JavaScript nécessaires, y compris Tailwind CSS, Font Awesome, Axios, et Alpine.js.
- **Initialisation des stores** : Charge les stores Alpine.js globaux pour une utilisation dans toute l'application.
- **Navigation** : Gère la navigation entre les différentes pages de l'application.

## ASCII Render

### Avec des données mockées
```
+---------------------------------------------------------------+
|  🏠 Marki - Application                                      |
|  +---------------------------------------------------------+  |
|  |  📊 Tableau de Bord                                      |  |
|  |  📄 Impayés                                              |  |
|  |  👥 Contacts                                             |  |
|  |  ⚙️ Paramètres                                           |  |
|  +---------------------------------------------------------+  |
|  |                                                           |  |
|  |  📊 Contenu principal                                    |  |
|  |                                                           |  |
|  +---------------------------------------------------------+  |
+---------------------------------------------------------------+
```

### Avec les noms des variables
```
+---------------------------------------------------------------+
|  🏠 {{ title }}                                              |
|  +---------------------------------------------------------+  |
|  |  {% for item in navItems %}                             |  |
|  |  {{ item.label }}                                        |  |
|  |  {% endfor %}                                            |  |
|  +---------------------------------------------------------+  |
|  |                                                           |  |
|  |  {% block content %}{% endblock %}                      |  |
|  |                                                           |  |
|  +---------------------------------------------------------+  |
+---------------------------------------------------------------+
```

## Props
- **navItems** : Liste des éléments de navigation pour la barre latérale.
- **title** : Titre de la page.

## Fonctions

### Navigation
@description Gère la navigation entre les différentes pages de l'application.
@param {String} path - Chemin vers la page de destination.
@returns {void} - Navigue vers la page spécifiée.
@example
// Exemple d'utilisation pour naviguer vers une page
navigateTo('/dashboard');

### Déconnexion
@description Gère la déconnexion de l'utilisateur.
@returns {void} - Déconnecte l'utilisateur et redirige vers la page de connexion.
@example
// Exemple d'utilisation pour déconnecter l'utilisateur
logout();

## Dépendances
- **Tailwind CSS** : Utilisé pour le style de l'interface utilisateur.
- **Font Awesome** : Bibliothèque d'icônes utilisée pour les icônes d'interface.
- **Axios** : Utilisé pour les requêtes HTTP.
- **Alpine.js** : Utilisé pour la réactivité et la gestion des états.
- **parseAxios** : Utilisé pour les requêtes HTTP vers Parse Server.
- **Stores Alpine.js** : Stores globaux pour la gestion des données de l'application, y compris `impayesStore`, `sequenceStore`, etc.

## Exemples d'utilisation
- Ce template est utilisé comme mise en page de base pour toutes les pages de l'application.
- Il peut être étendu pour inclure des fonctionnalités spécifiques à chaque page.

## Notes
- Les stores Alpine.js sont chargés dans ce template pour être accessibles globalement dans toute l'application.
- Les templates spécifiques peuvent étendre ce template pour ajouter des fonctionnalités supplémentaires.
