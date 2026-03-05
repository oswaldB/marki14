# Alpine.js - smtpProfilesState

## Description
Composant Alpine.js pour la gestion de l'état des profils SMTP. Ce composant gère le chargement, le filtrage, la pagination, et les opérations sur les profils SMTP. Il est utilisé dans le template de la page des profils SMTP pour fournir une interface interactive.

## Comportement
- **Chargement des profils SMTP** : Charge les profils SMTP depuis Parse Server et les stocke localement.
- **Filtrage des profils** : Filtre les profils en fonction d'un terme de recherche et d'un statut.
- **Pagination** : Gère la pagination des profils pour une meilleure expérience utilisateur.
- **Gestion des panneaux** : Contrôle l'ouverture des panneaux pour la création et l'édition des profils SMTP.
- **Archivage des profils** : Permet d'archiver ou de désarchiver des profils SMTP.
- **Gestion des erreurs** : Capture et affiche les erreurs lors des opérations.

## État
- **profiles** : Liste de tous les profils SMTP.
- **filteredProfiles** : Liste des profils filtrés.
- **isLoading** : Indique si les profils sont en cours de chargement.
- **error** : Erreur éventuelle lors des opérations.
- **searchTerm** : Terme de recherche pour filtrer les profils.
- **selectedStatus** : Statut des profils sélectionné pour le filtrage.
- **currentPage** : Page actuelle pour la pagination.
- **itemsPerPage** : Nombre d'éléments par page.

## Fonctions

### paginatedProfiles
@description Retourne les profils paginés pour l'affichage.
@returns {Array} Liste des profils paginés.

### init()
@description Initialise le composant et charge les profils SMTP.
@returns {Promise<void>}

### loadProfiles()
@description Charge les profils SMTP depuis Parse Server.
@returns {Promise<void>}

### filterProfiles()
@description Filtre les profils en fonction du terme de recherche et du statut.
@returns {void}

### previousPage()
@description Passe à la page précédente.
@returns {void}

### nextPage()
@description Passe à la page suivante.
@returns {void}

### openCreatePanel()
@description Ouvre le panneau pour créer un nouveau profil SMTP.
@returns {void}

### openEditPanel(profile)
@description Ouvre le panneau pour éditer un profil SMTP existant.
@param {Object} profile - Profil SMTP à éditer.
@returns {void}

### toggleArchiveProfile(profile)
@description Archive ou désarchive un profil SMTP.
@param {Object} profile - Profil SMTP à archiver/désarchiver.
@returns {Promise<void>}

## Dépendances
- **Alpine.js** : Bibliothèque JavaScript pour la réactivité et la gestion des états.
- **Axios** : Bibliothèque pour effectuer des requêtes HTTP.
- **parseAxios** : Instance Axios configurée pour interagir avec Parse Server.

## Exemples d'Utilisation
- Ce composant est utilisé dans le template de la page des profils SMTP pour afficher et gérer les profils.
- Il est initialisé automatiquement lors du chargement de la page et peut être utilisé dans n'importe quel composant Alpine.js via `smtpProfilesState()`.

## Structure
```
app/
└── static/
    └── js/
        └── alpines/
            └── smtpProfilesState.js
```
