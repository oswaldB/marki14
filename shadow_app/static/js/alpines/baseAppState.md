# Alpine.js - baseAppState

## Description
Composant Alpine.js pour la gestion de l'état de base de l'application. Ce composant gère la navigation, l'état de la barre latérale, et les interactions utilisateur de base. Il est utilisé dans le template `base-app.html` pour fournir une interface de navigation cohérente.

## Comportement
- **Gestion de la barre latérale** : Contrôle l'état de la barre latérale (ouverte ou fermée) et adapte son comportement en fonction de la taille de l'écran.
- **Navigation** : Gère la navigation entre les différentes pages de l'application et met à jour l'état actif des éléments de navigation.
- **Authentification** : Fournit une méthode pour déconnecter l'utilisateur.
- **Responsive Design** : Adapte l'état de la barre latérale en fonction de la taille de l'écran (fermée sur les appareils mobiles).

## État
- **sidebarCollapsed** : Indique si la barre latérale est fermée.
- **currentPage** : Page actuelle de l'application.
- **currentUser** : Utilisateur actuel (non utilisé dans ce composant).
- **navItems** : Liste des éléments de navigation pour la barre latérale.

## Fonctions

### toggleSidebar()
@description Basculer l'état de la barre latérale (ouverte/fermée).
@returns {void}

@example
Pour basculer l'état de la barre latérale, appelez la fonction `toggleSidebar()`. Cette fonction alterne entre l'état ouvert et fermé de la barre latérale.

### navigateTo(path)
@description Naviguer vers une page spécifique et mettre à jour l'état actif des éléments de navigation.
@param {string} path - Chemin de la page vers laquelle naviguer.
@returns {void}

@example
Pour naviguer vers une page spécifique, appelez la fonction `navigateTo()` avec le chemin de la page comme argument. Cette fonction met à jour l'état actif des éléments de navigation et redirige l'utilisateur vers la page demandée.

### logout()
@description Déconnecter l'utilisateur et rediriger vers la page de connexion.
@returns {void}

@example
Pour déconnecter l'utilisateur, appelez la fonction `logout()`. Cette fonction redirige l'utilisateur vers la page de connexion et met fin à la session active.

### init()
@description Initialiser l'état de l'application et configurer les écouteurs d'événements.
@returns {void}

### checkScreenSize()
@description Vérifier la taille de l'écran et adapter l'état de la barre latérale en conséquence.
@returns {void}

## Dépendances
- **Alpine.js** : Bibliothèque JavaScript pour la réactivité et la gestion des états.
- **Font Awesome** : Bibliothèque d'icônes utilisée pour les icônes de navigation.

## Exemples d'Utilisation
- Ce composant est utilisé dans le template `base-app.html` pour gérer la navigation et l'état de la barre latérale.
- Il est initialisé automatiquement lors du chargement de la page et peut être utilisé dans n'importe quel composant Alpine.js via `baseAppState()`.

## Structure
```
app/
└── static/
    └── js/
        └── alpines/
            └── baseAppState.js
```
