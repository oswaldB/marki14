# Composant email-editors-container.html

## Description
Composant pour le conteneur des éditeurs d'emails dans les séquences. Ce composant gère la liste des actions email, permet d'ajouter, de supprimer, et de générer des actions email avec l'IA. Il est utilisé dans les templates de gestion des séquences pour fournir une interface interactive.

## État Alpine.js
Ce composant gère les séquences d'emails, permettant d'ajouter, supprimer, et générer des actions email avec l'IA. Il inclut des fonctionnalités pour gérer l'état des séquences, la pagination, et les interactions utilisateur.

### Fonctionnalités
- **sequences** : Liste des séquences disponibles.
- **filteredSequences** : Liste des séquences filtrées selon les critères de recherche.
- **paginatedSequences** : Liste des séquences paginées pour l'affichage.
- **searchTerm** : Terme de recherche pour filtrer les séquences.
- **selectedType** : Type de séquence sélectionné pour le filtrage.
- **selectedStatus** : Statut de séquence sélectionné pour le filtrage.
- **itemsPerPage** : Nombre d'éléments par page.
- **currentPage** : Page actuelle.
- **isLoading** : Indique si les données sont en cours de chargement.
- **error** : Stocke les erreurs éventuelles.
- **drawerOpen** : Indique si le tiroir d'édition est ouvert.
- **editingSequence** : Indique si une séquence est en cours d'édition.
- **currentSequence** : Séquence actuellement sélectionnée.
- **deleteConfirmOpen** : Indique si la confirmation de suppression est ouverte.
- **sequenceToDelete** : Séquence à supprimer.

### Méthodes
- **init()** : Initialise le composant et charge les séquences.
- **loadSequences()** : Charge les séquences depuis le serveur.
- **filterSequences()** : Filtre les séquences selon les critères de recherche.
- **openCreateDrawer()** : Ouvre le tiroir pour créer une nouvelle séquence.
- **openEditDrawer(sequence)** : Ouvre le tiroir pour éditer une séquence existante.
- **closeDrawer()** : Ferme le tiroir d'édition.
- **saveSequence()** : Sauvegarde une séquence.
- **deleteSequence(sequence)** : Supprime une séquence.
- **confirmDelete()** : Confirme la suppression d'une séquence.
- **cancelDelete()** : Annule la suppression d'une séquence.
- **duplicateSequence(sequence)** : Duplique une séquence.
- **previousPage()** : Passe à la page précédente.
- **nextPage()** : Passe à la page suivante.
- **formatDate(dateString)** : Formate une date pour l'affichage.

### Comportement
- **Gestion des séquences** : Permet de créer, éditer, supprimer et dupliquer des séquences.
- **Filtrage et pagination** : Filtre les séquences selon les critères de recherche et gère la pagination pour l'affichage.
- **Gestion des erreurs** : Capture et affiche les erreurs lors des opérations de chargement, sauvegarde et suppression.

## Structure HTML

### Description
Le composant `email-editors-container.html` est structuré en plusieurs parties principales :
1. **En-tête** : Affiche le titre de l'éditeur d'emails et des boutons pour ajouter une action email ou générer des actions avec l'IA.
2. **Liste des actions email** : Affiche une liste des actions email existantes, chacune étant éditable via le composant `email-action-editor.html`.
3. **Message vide** : Affiche un message si aucune action email n'est présente dans la séquence.
4. **Panneau de gestion des profils SMTP** : Inclut un composant pour la gestion des profils SMTP.

### Schéma ASCII

#### Structure Globale
```
+---------------------------------------------------------------+
|  En-tête                                                       |
|  +-------------------------+  +-------------------------------+
|  |  Titre: Éditeur d'emails |  |  Boutons:                     |
|  +-------------------------+  |  - Ajouter Email              |
|                                |  - Générer avec IA             |
+---------------------------------------------------------------+
|  Liste des actions email                                      |
|  +---------------------------------------------------------+  |
|  |  Action 1                                              |  |
|  |  - Objet                                               |  |
|  |  - CC                                                  |  |
|  |  - Délai                                               |  |
|  |  - Profil SMTP                                         |  |
|  |  - Email Expéditeur                                    |  |
|  |  - Message                                             |  |
|  +---------------------------------------------------------+  |
|  +---------------------------------------------------------+  |
|  |  Action 2                                              |  |
|  |  - Objet                                               |  |
|  |  - CC                                                  |  |
|  |  - Délai                                               |  |
|  |  - Profil SMTP                                         |  |
|  |  - Email Expéditeur                                    |  |
|  |  - Message                                             |  |
|  +---------------------------------------------------------+  |
+---------------------------------------------------------------+
|  Message vide (si aucune action)                              |
|  - "Aucune action email dans ce scénario"                   |
|  - "Cliquez sur 'Ajouter Email' pour commencer"             |
+---------------------------------------------------------------+
|  Panneau de gestion des profils SMTP                          |
+---------------------------------------------------------------+
```

## Props
- **sequence_id** : ID de la séquence pour laquelle les actions email sont gérées.

## Fonctions

### init()
@description Initialise le composant et configure les écouteurs d'événements.
@returns {void}

### addAction(type)
@description Ajoute une nouvelle action email à la séquence.
@param {string} type - Type de l'action à ajouter.
@returns {void}

### generateWithAI()
@description Génère des actions email avec l'IA en utilisant les variables de configuration.
@returns {Promise<void>}

### removeAction(index)
@description Supprime une action email de la séquence.
@param {number} index - Index de l'action à supprimer.
@returns {void}

### updateActionField(index, field, value)
@description Met à jour un champ d'une action email.
@param {number} index - Index de l'action à mettre à jour.
@param {string} field - Champ à mettre à jour.
@param {any} value - Valeur du champ.
@returns {void}

### sortActionsByDelay(actions)
@description Trie les actions par délai.
@param {Array} actions - Liste des actions à trier.
@returns {Array} Liste des actions triées.

## Dépendances
- **Alpine.js** : Bibliothèque JavaScript pour la réactivité et la gestion des états.
- **Axios** : Bibliothèque pour effectuer des requêtes HTTP.
- **Font Awesome** : Bibliothèque d'icônes utilisée pour les icônes d'interface.
- **sequenceStore.js** : Store Alpine.js pour la gestion des séquences.
- **email-action-editor.html** : Composant pour l'édition des actions email.
- **smtp-profile-panel.html** : Composant pour la gestion des profils SMTP.

## Exemples d'Utilisation
- Ce composant est utilisé dans les templates de gestion des séquences pour gérer les actions email.
- Il est inclus dans les templates comme `sequence_edit.html` pour afficher et éditer les actions email.

## Inclusions
- **email-action-editor.html** : Composant pour l'édition des actions email.
- **smtp-profile-panel.html** : Composant pour la gestion des profils SMTP.
