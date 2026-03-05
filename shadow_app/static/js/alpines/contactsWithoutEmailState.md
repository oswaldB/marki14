# Alpine.js - contactsWithoutEmailState

## Description
Composant Alpine.js pour la gestion de l'état de la page des contacts sans email. Ce composant charge, filtre, et affiche les contacts sans email à partir des données des impayés. Il est utilisé dans le template de la page des contacts sans email pour fournir une interface interactive.

## Comportement
- **Chargement des contacts** : Charge les contacts sans email à partir des données des impayés ou utilise des données simulées si le store `impayesStore` n'est pas disponible.
- **Filtrage des contacts** : Filtre les contacts en fonction d'un terme de recherche et d'un type sélectionné.
- **Pagination** : Gère la pagination des contacts pour une meilleure expérience utilisateur.
- **Formatage des données** : Formate les adresses, les dates, et les montants pour l'affichage.
- **Gestion des erreurs** : Capture et gère les erreurs lors du chargement des données.

## État
- **contacts** : Liste de tous les contacts sans email.
- **filteredContacts** : Liste des contacts filtrés.
- **searchTerm** : Terme de recherche pour filtrer les contacts.
- **selectedType** : Type de contact sélectionné pour le filtrage.
- **currentPage** : Page actuelle pour la pagination.
- **itemsPerPage** : Nombre d'éléments par page.
- **isLoading** : Indique si les contacts sont en cours de chargement.

## Fonctions

### loadContacts()
@description Charge les contacts sans email à partir des données des impayés ou utilise des données simulées.
@returns {Promise<void>}

### formatAddress(impaye)
@description Formate l'adresse à partir des données de l'impayé.
@param {Object} impaye - Données de l'impayé.
@returns {string} Adresse formatée.

### formatDate(dateString)
@description Formate une date pour l'affichage.
@param {string} dateString - Chaîne de date à formater.
@returns {string} Date formatée.

### formatCurrency(amount)
@description Formate un montant en euros.
@param {number} amount - Montant à formater.
@returns {string} Montant formaté.

### filterContacts()
@description Filtre les contacts en fonction du terme de recherche et du type sélectionné.
@returns {void}

### paginatedContacts
@description Retourne les contacts paginés pour l'affichage.
@returns {Array} Liste des contacts paginés.

### previousPage()
@description Passe à la page précédente.
@returns {void}

### nextPage()
@description Passe à la page suivante.
@returns {void}

### showNotification({ type, message })
@description Affiche une notification à l'utilisateur.
@param {Object} notification - Objet contenant le type et le message de la notification.
@returns {void}

## Dépendances
- **Alpine.js** : Bibliothèque JavaScript pour la réactivité et la gestion des états.
- **impayesStore** : Store global pour la gestion des données des impayés.

## Exemples d'Utilisation
- Ce composant est utilisé dans le template de la page des contacts sans email pour afficher et filtrer les contacts.
- Il est initialisé automatiquement lors du chargement de la page et peut être utilisé dans n'importe quel composant Alpine.js via `contactsWithoutEmailState()`.

## Structure
```
app/
└── static/
    └── js/
        └── alpines/
            └── contactsWithoutEmailState.js
```
