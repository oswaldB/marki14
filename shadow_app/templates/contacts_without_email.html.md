# Template contacts_without_email.html

## Description
Template pour la page des contacts sans email. Ce template étend `base-app.html` et fournit une interface pour afficher et filtrer les contacts sans email. Il est utilisé pour fournir une interface interactive pour la gestion des contacts sans email.

## Structure HTML

### Description
Le template `contacts_without_email.html` étend le template `base-app.html` et ajoute un contenu spécifique pour la page des contacts sans email. Il inclut un titre, des scripts spécifiques, et un contenu principal avec une interface pour afficher et filtrer les contacts sans email.

### Schéma ASCII

#### Structure Globale
```
+---------------------------------------------------------------+
|  Titre: Contacts sans email                                  |
+---------------------------------------------------------------+
|  Contenu Principal                                            |
|  +---------------------------------------------------------+  |
|  |  En-tête                                                |  |
|  |  - Titre: "Contacts sans email"                        |  |
|  |  - Nombre de contacts                                   |  |
|  +---------------------------------------------------------+  |
|  |  Filtres                                                |  |
|  |  - Recherche                                            |  |
|  |  - Type                                                 |  |
|  +---------------------------------------------------------+  |
|  |  Liste des contacts                                     |  |
|  |  - Tableau des contacts                                 |  |
|  |  - Nom, Référence facture, Date, Montant, Actions        |  |
|  +---------------------------------------------------------+  |
|  |  Pagination                                             |  |
|  |  - Affichage de X à Y sur Z contacts                    |  |
|  |  - Boutons: Précédent / Suivant                         |  |
|  +---------------------------------------------------------+  |
+---------------------------------------------------------------+
```

## Blocs
- **title** : Titre de la page. Par défaut, "Contacts sans email".
- **head** : Section pour ajouter des scripts spécifiques à la page.
- **content** : Contenu principal de la page.

## Dépendances
- **base-app.html** : Template de base pour l'application.
- **impayesStore.js** : Store Alpine.js pour la gestion des données des impayés.
- **contactsWithoutEmailState.js** : Composant Alpine.js pour la gestion de l'état de la page des contacts sans email.
- **Font Awesome** : Bibliothèque d'icônes utilisée pour les icônes d'interface.

## Comportement
- **Chargement des contacts** : Charge les contacts sans email à partir des données des impayés.
- **Filtrage des contacts** : Filtre les contacts en fonction d'un terme de recherche et d'un type sélectionné.
- **Pagination** : Gère la pagination des contacts pour une meilleure expérience utilisateur.
- **Affichage des contacts** : Affiche les contacts dans un tableau avec des informations telles que le nom, la référence de la facture, la date, et le montant.

## Exemples d'Utilisation
- Ce template est utilisé pour fournir une interface pour afficher et filtrer les contacts sans email.
- Il est utilisé dans les pages de gestion des contacts pour permettre aux utilisateurs de voir les contacts sans email et de les filtrer.

## Inclusions
- **impayesStore.js** : Store Alpine.js pour la gestion des données des impayés.
- **contactsWithoutEmailState.js** : Composant Alpine.js pour la gestion de l'état de la page des contacts sans email.
