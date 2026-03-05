# Alpine.js - adminSuperadminState

## Description
Composant Alpine.js pour la gestion de l'état de la page d'administration superadmin. Ce composant gère les opérations de synchronisation et affiche des messages de statut à l'utilisateur. Il est utilisé dans le template de la page d'administration pour fournir une interface interactive.

## Comportement
- **Gestion des opérations de synchronisation** : Exécute des opérations de synchronisation et gère les états de chargement et de statut.
- **Affichage des messages de statut** : Affiche des messages de statut pour informer l'utilisateur de l'état des opérations.
- **Gestion des erreurs** : Capture et affiche les erreurs éventuelles lors des opérations.

## État
- **isLoading** : Indique si une opération de synchronisation est en cours.
- **statusMessage** : Message de statut à afficher à l'utilisateur.
- **resultData** : Données résultantes des opérations (non utilisé dans ce composant).

## Fonctions

### runSynchronization()
@description Exécute une opération de synchronisation et gère les états de chargement et de statut.
@returns {Promise<void>}

@example
Pour exécuter une opération de synchronisation, appelez la fonction `runSynchronization()`. Cette fonction gère automatiquement les états de chargement et de statut, et affiche les messages appropriés à l'utilisateur.

## Dépendances
- **Alpine.js** : Bibliothèque JavaScript pour la réactivité et la gestion des états.

## Exemples d'Utilisation
- Ce composant est utilisé dans le template de la page d'administration pour gérer les opérations de synchronisation.
- Il est initialisé automatiquement lors du chargement de la page et peut être utilisé dans n'importe quel composant Alpine.js via `adminSuperadminState()`.

## Structure
```
app/
└── static/
    └── js/
        └── alpines/
            └── adminSuperadminState.js
```
