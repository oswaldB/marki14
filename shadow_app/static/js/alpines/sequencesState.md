# Alpine.js - sequencesState

## Description
Composant Alpine.js pour la gestion de l'état des séquences. Ce composant gère le chargement, le filtrage, la pagination, et les opérations CRUD sur les séquences. Il est utilisé dans le template de la page des séquences pour fournir une interface interactive.

## Comportement
- **Chargement des séquences** : Charge les séquences depuis Parse Server et les stocke localement.
- **Filtrage des séquences** : Filtre les séquences en fonction d'un terme de recherche, d'un type, et d'un statut.
- **Pagination** : Gère la pagination des séquences pour une meilleure expérience utilisateur.
- **Opérations CRUD** : Permet de créer, lire, mettre à jour, et supprimer des séquences.
- **Gestion des drawers** : Contrôle l'ouverture et la fermeture des drawers pour la création et l'édition des séquences.
- **Gestion des erreurs** : Capture et affiche les erreurs lors des opérations.

## État
- **sequences** : Liste de toutes les séquences.
- **filteredSequences** : Liste des séquences filtrées.
- **paginatedSequences** : Liste des séquences paginées.
- **searchTerm** : Terme de recherche pour filtrer les séquences.
- **selectedType** : Type de séquence sélectionné pour le filtrage.
- **selectedStatus** : Statut de séquence sélectionné pour le filtrage.
- **itemsPerPage** : Nombre d'éléments par page.
- **currentPage** : Page actuelle pour la pagination.
- **isLoading** : Indique si les séquences sont en cours de chargement.
- **error** : Erreur éventuelle lors des opérations.
- **drawerOpen** : Indique si le drawer de création/édition est ouvert.
- **editingSequence** : Indique si une séquence est en cours d'édition.
- **currentSequence** : Séquence actuellement sélectionnée pour l'édition.
- **deleteConfirmOpen** : Indique si la confirmation de suppression est ouverte.
- **sequenceToDelete** : Séquence à supprimer.

## Fonctions

### loadSequences()
@description Charge les séquences depuis Parse Server.
@returns {Promise<void>}

### getParseAxios()
@description Retourne l'instance Axios configurée pour Parse Server.
@returns {Object} Instance Axios pour Parse Server.

### filterSequences()
@description Filtre les séquences en fonction du terme de recherche, du type, et du statut.
@returns {void}

### updatePagination()
@description Met à jour la pagination des séquences.
@returns {void}

### openCreateDrawer()
@description Ouvre le drawer pour créer une nouvelle séquence.
@returns {void}

### openEditDrawer(sequence)
@description Ouvre le drawer pour éditer une séquence existante.
@param {Object} sequence - Séquence à éditer.
@returns {void}

### closeDrawer()
@description Ferme le drawer de création/édition.
@returns {void}

### saveSequence()
@description Enregistre une séquence (création ou mise à jour).
@returns {Promise<void>}

### deleteSequence(sequence)
@description Ouvre la confirmation de suppression pour une séquence.
@param {Object} sequence - Séquence à supprimer.
@returns {void}

### confirmDelete()
@description Confirme la suppression d'une séquence.
@returns {Promise<void>}

### cancelDelete()
@description Annule la suppression d'une séquence.
@returns {void}

### duplicateSequence(sequence)
@description Duplique une séquence existante.
@param {Object} sequence - Séquence à dupliquer.
@returns {Promise<void>}

### previousPage()
@description Passe à la page précédente.
@returns {void}

### nextPage()
@description Passe à la page suivante.
@returns {void}

### formatDate(dateString)
@description Formate une date pour l'affichage.
@param {string} dateString - Chaîne de date à formater.
@returns {string} Date formatée.

## Dépendances
- **Alpine.js** : Bibliothèque JavaScript pour la réactivité et la gestion des états.
- **Axios** : Bibliothèque pour effectuer des requêtes HTTP.
- **parseAxios** : Instance Axios configurée pour interagir avec Parse Server.

## Exemples d'Utilisation
- Ce composant est utilisé dans le template de la page des séquences pour afficher et gérer les séquences.
- Il est initialisé automatiquement lors du chargement de la page et peut être utilisé dans n'importe quel composant Alpine.js via `sequencesState()`.

## Structure
```
app/
└── static/
    └── js/
        └── alpines/
            └── sequencesState.js
```
