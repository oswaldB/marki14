# Template admin-superadmin.html

## Description
Template pour la page d'administration superadmin. Ce template étend `base-app.html` et fournit une interface pour gérer les opérations d'administration, telles que la synchronisation des factures impayées. Il est utilisé pour fournir une interface interactive pour les opérations d'administration.

## Structure HTML

### Description
Le template `admin-superadmin.html` étend le template `base-app.html` et ajoute un contenu spécifique pour la page d'administration superadmin. Il inclut un titre, des scripts spécifiques, et un contenu principal avec une interface pour gérer les opérations d'administration.

## État Alpine.js
Ce composant gère les opérations d'administration superadmin, notamment la synchronisation des factures impayées. Il inclut des fonctionnalités pour gérer l'état de chargement, afficher des messages de statut, et traiter les résultats de la synchronisation.

### Fonctionnalités
- **isLoading** : Indique si une opération de synchronisation est en cours.
- **statusMessage** : Affiche des messages de statut pour informer l'utilisateur.
- **resultData** : Stocke les résultats de la synchronisation.
- **runSynchronization()** : Méthode asynchrone pour lancer la synchronisation des factures depuis PostgreSQL vers Parse Server.

### Comportement
- **Gestion des erreurs** : Capture et affiche les erreurs lors de la synchronisation.
- **Messages de statut** : Met à jour les messages pour refléter l'état de l'opération.

### Schéma ASCII

#### Structure Globale
```
+---------------------------------------------------------------+
|  Titre: Super Admin - Gestion des Impayés                     |
+---------------------------------------------------------------+
|  Contenu Principal                                            |
|  +---------------------------------------------------------+  |
|  |  Récupération des factures impayées                     |  |
|  |                                                         |  |
|  |  Description:                                           |  |
|  |  - Synchronisation des factures depuis PostgreSQL      |  |
|  |  - Intégration dans Parse Server                        |  |
|  |                                                         |  |
|  |  Bouton: Lancer la synchronisation                     |  |
|  |                                                         |  |
|  |  Messages de statut:                                    |  |
|  |  - Chargement...                                       |  |
|  |  - Succès                                               |  |
|  |  - Erreur                                               |  |
|  |                                                         |  |
|  |  Résultats de la synchronisation:                      |  |
|  |  - Message                                              |  |
|  |  - Filtres appliqués                                   |  |
|  +---------------------------------------------------------+  |
+---------------------------------------------------------------+
```

## Blocs
- **title** : Titre de la page. Par défaut, "Super Admin - Gestion des Impayés".
- **scripts** : Section pour ajouter des scripts spécifiques à la page.
- **content** : Contenu principal de la page.

## Dépendances
- **base-app.html** : Template de base pour l'application.
- **adminSuperadminState.js** : Composant Alpine.js pour la gestion de l'état de la page d'administration superadmin.
- **Font Awesome** : Bibliothèque d'icônes utilisée pour les icônes d'interface.

## Comportement
- **Synchronisation des factures** : Permet de lancer une synchronisation des factures impayées depuis PostgreSQL vers Parse Server.
- **Affichage des messages de statut** : Affiche des messages de statut pour informer l'utilisateur de l'état des opérations.
- **Gestion des erreurs** : Affiche des messages d'erreur en cas de problème lors de la synchronisation.

## Exemples d'Utilisation
- Ce template est utilisé pour fournir une interface d'administration pour les opérations de synchronisation des factures impayées.
- Il est utilisé dans les pages d'administration pour permettre aux utilisateurs de lancer des opérations de synchronisation.

## Inclusions
- **adminSuperadminState.js** : Composant Alpine.js pour la gestion de l'état de la page d'administration superadmin.
