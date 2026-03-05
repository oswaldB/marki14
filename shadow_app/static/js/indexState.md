# Alpine.js - indexState

## Description
Composant Alpine.js pour la gestion de l'état de la page d'accueil. Ce composant gère les données et les interactions de la page d'accueil, fournissant une interface interactive pour les utilisateurs. Il est utilisé dans le template de la page d'accueil pour afficher les fonctionnalités et les informations de l'application.

## Comportement
- **Gestion des données de la page** : Gère les données de la page d'accueil, telles que le titre, la description, et les fonctionnalités.
- **Initialisation** : Initialise l'état de la page et configure les données réactives.
- **Affichage des fonctionnalités** : Affiche une liste de fonctionnalités avec des icônes et des descriptions.

## État
- **pageTitle** : Titre de la page d'accueil.
- **pageDescription** : Description de la page d'accueil.
- **features** : Liste des fonctionnalités à afficher sur la page d'accueil.

## Fonctions

### initialize()
@description Initialise l'état de la page d'accueil et configure les données réactives.
@returns {void}

@example
Pour initialiser l'état de la page d'accueil, appelez la fonction `initialize()`. Cette fonction configure les données réactives de la page, telles que le titre, la description, et la liste des fonctionnalités.

## Dépendances
- **Alpine.js** : Bibliothèque JavaScript pour la réactivité et la gestion des états.
- **Line Icons** : Bibliothèque d'icônes utilisée pour les icônes des fonctionnalités.

## Exemples d'Utilisation
- Ce composant est utilisé dans le template de la page d'accueil pour afficher les fonctionnalités et les informations de l'application.
- Il est initialisé automatiquement lors du chargement de la page et peut être utilisé dans n'importe quel composant Alpine.js via `indexState()`.

## Structure
```
app/
└── static/
    └── js/
        └── indexState.js
```
