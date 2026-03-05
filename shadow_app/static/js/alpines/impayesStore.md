# Alpine.js - impayesStore

## Description
Store Alpine.js pour la gestion globale des impayés. Ce store centralise toutes les données et la logique métier liée aux impayés, incluant le chargement des données, le filtrage, le tri, la sélection multiple, et la gestion des vues. Il sert d'interface entre les templates HTML et les données du backend.

## Comportement
- **Chargement des données** : Récupère les impayés depuis Parse Server et les stocke localement.
- **Gestion des vues** : Permet de basculer entre différentes vues (par payeur, par facture, par acteur, etc.).
- **Filtrage et tri** : Applique des filtres et des tris aux données pour afficher uniquement les impayés pertinents.
- **Sélection multiple** : Gère la sélection de plusieurs impayés pour des actions groupées.
- **Gestion des drawers** : Contrôle l'ouverture et la fermeture des drawers de détails, de factures, et de séquences.
- **Gestion des séquences** : Permet d'ajouter des impayés à des séquences de relance.

## État Global
- **impayesData** : Tableau contenant les données des impayés.
- **currentView** : Vue actuelle (`'payeur'`, `'facture'`, `'acteur'`, etc.).
- **isLoading** : Indique si les données sont en cours de chargement.
- **isSorting** : Indique si un tri est en cours.
- **error** : Contient les erreurs éventuelles lors du chargement des données.
- **selectedImpayes** : Tableau des IDs des impayés sélectionnés.
- **isBulkMode** : Indique si le mode de sélection multiple est activé.
- **filters** : Objet contenant les filtres appliqués (terme de recherche, payeur sélectionné, etc.).
- **sortDescriptors** : Tableau de descripteurs de tri pour ordonner les données.
- **viewStates** : Objet contenant l'état spécifique à chaque vue (groupes expansés, éléments sélectionnés, etc.).

## Propriétés Calculées
- **payeurs** : Retourne la liste unique des noms des payeurs.
- **selectedImpayeForDetails** : Retourne l'impayé sélectionné pour affichage dans le drawer de détails.

## Fonctions

### Initialisation

#### init()
@description Initialise le store en chargeant les données des impayés.
@returns {void}

### Chargement des Données

#### loadImpayes()
@description Charge les impayés depuis Parse Server et les stocke dans `impayesData`.
@returns {Promise<void>}

#### refreshData()
@description Rafraîchit les données en rechargeant les impayés.
@returns {void}

### Gestion des Vues

#### switchView(viewName)
@description Basculer vers une vue spécifique.
@param {string} viewName - Nom de la vue (`'payeur'`, `'facture'`, `'acteur'`, etc.).
@returns {void}

### Filtrage et Tri

#### filterImpayes()
@description Applique les filtres actuels aux données des impayés.
@returns {void}

#### getFilteredData()
@description Retourne les données filtrées selon les critères actuels.
@returns {Array} Tableau des impayés filtrés.

#### updateSortDescriptor(field)
@description Met à jour les descripteurs de tri pour un champ spécifique.
@param {string} field - Champ sur lequel appliquer le tri.
@returns {void}

#### applySortDescriptors(data)
@description Applique les descripteurs de tri aux données.
@param {Array} data - Données à trier.
@returns {Array} Données triées.

### Regroupement des Données

#### getGroupedData()
@description Retourne les données regroupées selon la vue actuelle.
@returns {Object} Données regroupées.

#### groupByPayeur(data)
@description Regroupe les impayés par payeur.
@param {Array} data - Données à regrouper.
@returns {Object} Données regroupées par payeur.

#### groupByFacture(data)
@description Regroupe les impayés par facture.
@param {Array} data - Données à regrouper.
@returns {Object} Données regroupées par facture.

#### groupByActeur(data)
@description Regroupe les impayés par acteur avec des sous-groupes pour les factures propres et apportées.
@param {Array} data - Données à regrouper.
@returns {Object} Données regroupées par acteur.

### Gestion des Groupes

#### toggleGroupExpansion(viewName, groupId)
@description Basculer l'expansion d'un groupe dans une vue spécifique.
@param {string} viewName - Nom de la vue.
@param {string} groupId - ID du groupe.
@returns {void}

#### isGroupExpanded(viewName, groupId)
@description Vérifier si un groupe est expansé dans une vue spécifique.
@param {string} viewName - Nom de la vue.
@param {string} groupId - ID du groupe.
@returns {boolean} `true` si le groupe est expansé, `false` sinon.

#### getGroupDisplayInfo(group, groupKey)
@description Retourne les informations d'affichage pour un groupe.
@param {Object} group - Objet représentant le groupe.
@param {string} groupKey - Clé du groupe.
@returns {Object} Informations d'affichage (titre, icône, sous-titre, type).

#### getGroupItems(group)
@description Retourne les éléments d'un groupe pour les templates.
@param {Object} group - Objet représentant le groupe.
@returns {Array} Tableau des éléments du groupe.

### Gestion des Drawers

#### openDetailsDrawer(item)
@description Ouvre le drawer de détails pour un impayé spécifique.
@param {Object} item - Objet représentant l'impayé.
@returns {void}

#### closeDetailsDrawer()
@description Ferme le drawer de détails.
@returns {void}

#### openInvoice(invoiceUrl)
@description Ouvre le drawer de facture pour afficher un PDF.
@param {string} invoiceUrl - URL de la facture.
@returns {Promise<void>}

#### closeInvoiceDrawer()
@description Ferme le drawer de facture.
@returns {void}

### Gestion des Séquences

#### openSequenceDrawer()
@description Ouvre le drawer pour ajouter des impayés à une séquence.
@returns {Promise<void>}

#### closeSequenceDrawer()
@description Ferme le drawer de séquences.
@returns {void}

#### loadAvailableSequences()
@description Charge les séquences disponibles depuis Parse Server.
@returns {Promise<void>}

#### addToSequence()
@description Ajoute les impayés sélectionnés à une séquence.
@returns {Promise<Object>} Résultat de l'opération.

### Sélection Multiple

#### toggleImpayeSelection(impayeId)
@description Basculer la sélection d'un impayé.
@param {string} impayeId - ID de l'impayé.
@returns {void}

#### clearSelection()
@description Désélectionner tous les impayés.
@returns {void}

#### selectSingleImpaye(impayeId)
@description Sélectionner un seul impayé.
@param {string} impayeId - ID de l'impayé.
@returns {void}

#### selectAllInGroup(group)
@description Sélectionner tous les impayés d'un groupe.
@param {Object} group - Objet représentant le groupe.
@returns {void}

#### deselectAllInGroup(group)
@description Désélectionner tous les impayés d'un groupe.
@param {Object} group - Objet représentant le groupe.
@returns {void}

#### isGroupFullySelected(group)
@description Vérifier si tous les impayés d'un groupe sont sélectionnés.
@param {Object} group - Objet représentant le groupe.
@returns {boolean} `true` si tous les impayés sont sélectionnés, `false` sinon.

### Archivage

#### archiveSelectedImpayes()
@description Archive les impayés sélectionnés.
@returns {Promise<Object>} Résultat de l'opération.

### Utilitaires

#### calculateDelai(impaye)
@description Calcule le délai en jours pour une facture.
@param {Object} impaye - Objet représentant l'impayé.
@returns {number} Délai en jours.

#### formatDate(dateString)
@description Formate une date pour l'affichage.
@param {string} dateString - Date à formater.
@returns {string} Date formatée.

#### formatCurrency(amount)
@description Formate un montant en euros.
@param {number} amount - Montant à formater.
@returns {string} Montant formaté.

#### calculateMaxDaysLate(group)
@description Calcule le retard maximum pour un groupe d'impayés.
@param {Array} group - Tableau des impayés du groupe.
@returns {number} Retard maximum en jours.

## Dépendances
- **Alpine.js** : Bibliothèque JavaScript pour la réactivité et la gestion des états.
- **Parse Server** : Backend pour le stockage et la récupération des données.
- **Axios** : Bibliothèque pour effectuer des requêtes HTTP.
- **parseAxios** : Configuration personnalisée pour Axios pour interagir avec Parse Server.

## Exemples d'Utilisation
- Ce store est utilisé dans les templates HTML pour afficher et interagir avec les données des impayés.
- Il est initialisé automatiquement lors du chargement de la page et peut être utilisé dans n'importe quel composant Alpine.js via `$store.impayesStore`.
