# Store sequenceStore

## Description
Store Alpine.js consolidé pour la gestion complète des séquences, des actions, des profils SMTP, des variables, et des liens de paiement. Ce store centralise toutes les opérations liées aux séquences et fournit une interface unifiée pour interagir avec les données du backend.

## Comportement
- **Gestion des séquences** : Charge, crée, met à jour, et supprime des séquences.
- **Gestion des actions** : Ajoute, met à jour, et supprime des actions dans les séquences.
- **Gestion des profils SMTP** : Charge, crée, met à jour, et supprime des profils SMTP.
- **Gestion des variables** : Charge et filtre des variables pour les templates.
- **Gestion des liens de paiement** : Charge, crée, et gère des liens de paiement.
- **Gestion des données associées** : Charge les impayés associés aux séquences.

## État

### Séquences
- **sequences** : Liste des séquences chargées.
- **currentSequence** : Séquence actuellement sélectionnée.
- **associatedImpayes** : Liste des impayés associés à la séquence courante.

### Profils SMTP
- **smtpProfiles.profiles** : Liste des profils SMTP.
- **smtpProfiles.selectedProfile** : Profil SMTP actuellement sélectionné.
- **smtpProfiles.isLoading** : Indique si les profils SMTP sont en cours de chargement.
- **smtpProfiles.error** : Erreur éventuelle lors du chargement des profils SMTP.

### Variables
- **variables.variables** : Liste des variables disponibles.
- **variables.filteredVariables** : Liste des variables filtrées.
- **variables.isLoading** : Indique si les variables sont en cours de chargement.
- **variables.error** : Erreur éventuelle lors du chargement des variables.
- **variables.searchTerm** : Terme de recherche pour filtrer les variables.

### Liens de Paiement
- **paymentLinks.links** : Liste des liens de paiement.
- **paymentLinks.selectedLink** : Lien de paiement actuellement sélectionné.
- **paymentLinks.isLoading** : Indique si les liens de paiement sont en cours de chargement.
- **paymentLinks.error** : Erreur éventuelle lors du chargement des liens de paiement.
- **paymentLinks.showLink** : Indique si le lien de paiement doit être affiché.
- **paymentLinks.customMessage** : Message personnalisé pour les liens de paiement.

### État Global
- **isLoading** : Indique si une opération est en cours.
- **error** : Erreur éventuelle lors des opérations.

## Fonctions

### Gestion des Séquences

#### loadSequences()
@description Charge toutes les séquences depuis le serveur.
@returns {Promise<Array>} Liste des séquences chargées.

#### loadSequence(sequenceId)
@description Charge une séquence spécifique par son ID.
@param {string} sequenceId - ID de la séquence à charger.
@returns {Promise<Object>} Séquence chargée.

#### saveSequence()
@description Enregistre la séquence courante.
@returns {Promise<boolean>} `true` si l'enregistrement a réussi, `false` sinon.

#### createSequence(sequenceData)
@description Crée une nouvelle séquence.
@param {Object} sequenceData - Données de la nouvelle séquence.
@returns {Promise<Object>} Nouvelle séquence créée.

#### deleteSequence(sequenceId)
@description Supprime une séquence.
@param {string} sequenceId - ID de la séquence à supprimer.
@returns {Promise<boolean>} `true` si la suppression a réussi, `false` sinon.

### Gestion des Actions

#### addActionToCurrentSequence(type)
@description Ajoute une nouvelle action à la séquence courante.
@param {string} type - Type d'action (`'email'`, `'sms'`, etc.).
@returns {void}

#### removeActionFromCurrentSequence(index)
@description Supprime une action de la séquence courante.
@param {number} index - Index de l'action à supprimer.
@returns {void}

#### updateActionInCurrentSequence(index, updatedAction)
@description Met à jour une action dans la séquence courante.
@param {number} index - Index de l'action à mettre à jour.
@param {Object} updatedAction - Données mises à jour de l'action.
@returns {void}

### Gestion des Profils SMTP

#### loadSmtpProfiles()
@description Charge tous les profils SMTP depuis le serveur.
@returns {Promise<Array>} Liste des profils SMTP chargés.

#### addSmtpProfile(profileData)
@description Ajoute un nouveau profil SMTP.
@param {Object} profileData - Données du nouveau profil.
@returns {Promise<Object>} Nouveau profil SMTP créé.

#### updateSmtpProfile(profileId, updatedData)
@description Met à jour un profil SMTP existant.
@param {string} profileId - ID du profil à mettre à jour.
@param {Object} updatedData - Données mises à jour.
@returns {Promise<boolean>} `true` si la mise à jour a réussi, `false` sinon.

#### deleteSmtpProfile(profileId)
@description Supprime un profil SMTP.
@param {string} profileId - ID du profil à supprimer.
@returns {Promise<boolean>} `true` si la suppression a réussi, `false` sinon.

#### selectSmtpProfile(profileId)
@description Sélectionne un profil SMTP.
@param {string} profileId - ID du profil à sélectionner.
@returns {void}

#### selectSmtpProfileByEmail(email)
@description Sélectionne un profil SMTP par son email.
@param {string} email - Email du profil à sélectionner.
@returns {void}

#### getDefaultProfile()
@description Retourne le profil SMTP par défaut.
@returns {Object} Profil SMTP par défaut.

#### getDefaultSenderEmail()
@description Retourne l'email du profil sélectionné ou du profil par défaut.
@returns {string} Email du profil SMTP.

#### getDefaultProfileId()
@description Retourne l'ID du profil sélectionné ou du profil par défaut.
@returns {string} ID du profil SMTP.

### Gestion des Variables

#### loadVariables()
@description Charge les variables depuis le fichier `variables.json`.
@returns {Promise<Array>} Liste des variables chargées.

#### updateFilteredVariables()
@description Met à jour les variables filtrées en fonction du terme de recherche.
@returns {void}

#### setSearchTerm(term)
@description Met à jour le terme de recherche et filtre les variables.
@param {string} term - Terme de recherche.
@returns {void}

#### copyVariable(variable)
@description Copie une variable dans le presse-papiers.
@param {string} variable - Variable à copier.
@returns {Promise<boolean>} `true` si la copie a réussi, `false` sinon.

### Gestion des Liens de Paiement

#### loadPaymentLinks()
@description Charge tous les liens de paiement depuis le serveur.
@returns {Promise<Array>} Liste des liens de paiement chargés.

#### addPaymentLink(linkData)
@description Ajoute un nouveau lien de paiement.
@param {Object} linkData - Données du nouveau lien.
@returns {Promise<Object>} Nouveau lien de paiement créé.

#### selectPaymentLink(linkUrl)
@description Sélectionne un lien de paiement.
@param {string} linkUrl - URL du lien à sélectionner.
@returns {void}

#### toggleShowPaymentLink()
@description Basculer l'affichage du lien de paiement.
@returns {void}

#### setPaymentLinkCustomMessage(message)
@description Met à jour le message personnalisé.
@param {string} message - Nouveau message personnalisé.
@returns {void}

#### copyPaymentLinkVariable(link)
@description Copie une variable de lien de paiement dans le presse-papiers.
@param {Object} link - Lien de paiement.
@returns {Promise<boolean>} `true` si la copie a réussi, `false` sinon.

#### copyPaymentLinkUrl(link)
@description Copie l'URL d'un lien de paiement dans le presse-papiers.
@param {Object} link - Lien de paiement.
@returns {Promise<boolean>} `true` si la copie a réussi, `false` sinon.

### Gestion des Données Associées

#### loadAssociatedImpayes(sequenceId)
@description Charge les impayés associés à une séquence.
@param {string} sequenceId - ID de la séquence.
@returns {Promise<void>}

### Utilitaires Globaux

#### resetStore()
@description Réinitialise l'état complet du store.
@returns {void}

#### formatDate(dateString)
@description Formate une date pour l'affichage.
@param {string} dateString - Chaîne de date à formater.
@returns {string} Date formatée.

#### formatCurrency(amount)
@description Formate un montant en euros.
@param {number} amount - Montant à formater.
@returns {string} Montant formaté.

## Dépendances
- **Alpine.js** : Bibliothèque JavaScript pour la réactivité et la gestion des états.
- **Axios** : Bibliothèque pour effectuer des requêtes HTTP.
- **parseAxios** : Instance Axios configurée pour interagir avec Parse Server.

## Exemples d'Utilisation
- **Chargement des séquences** : Utiliser `loadSequences()` pour charger toutes les séquences depuis le serveur.
- **Gestion des actions** : Utiliser `addActionToCurrentSequence()` pour ajouter une nouvelle action à une séquence.
- **Gestion des profils SMTP** : Utiliser `loadSmtpProfiles()` pour charger tous les profils SMTP.
- **Gestion des variables** : Utiliser `loadVariables()` pour charger les variables depuis le fichier `variables.json`.
- **Gestion des liens de paiement** : Utiliser `loadPaymentLinks()` pour charger tous les liens de paiement.

## Structure
```
app/
└── static/
    └── js/
        └── stores/
            └── sequenceStore.js
```
