# Script peuplerRelance

## Description
Ce script permet de générer automatiquement des relances pour les impayés qui ont une séquence automatique mais pas encore de relances créées. Il est utilisé pour automatiser le processus de relance des impayés en créant des relances basées sur les séquences définies.

## Comportement
- **Récupération des impayés** : Récupère les impayés qui ont une séquence automatique mais pas encore de relances.
- **Génération des relances** : Pour chaque impayé, génère des relances basées sur les actions définies dans la séquence.
- **Gestion des variables** : Remplace les variables dans les templates de relance par les valeurs spécifiques à chaque impayé.
- **Journalisation** : Enregistre les opérations et les erreurs dans un fichier de log (`peupler_relances.log`).

## Fonctions

### peupler_relances()
@description Fonction principale pour générer les relances.
@returns {boolean} `True` si la génération a réussi, `False` sinon.

### execute(params)
@description Fonction d'exécution pour l'API Flask.
@param {dict} params - Paramètres pour la génération des relances.
@returns {dict} Résultat de l'exécution avec un statut, un message, et un timestamp.

## Classes

### ParseRelanceConnector
@description Classe pour gérer la connexion à Parse Server pour les relances.

#### Méthodes

##### get_impayes_with_sequence()
@description Récupère les impayés qui ont une séquence automatique mais pas de relances.
@returns {Array} Liste des impayés.

##### get_sequence_actions(sequence_id)
@description Récupère les actions d'une séquence.
@param {string} sequence_id - ID de la séquence.
@returns {Array} Liste des actions de la séquence.

##### get_existing_relances(impaye_id)
@description Récupère les relances existantes pour un impayé.
@param {string} impaye_id - ID de l'impayé.
@returns {Array} Liste des relances existantes.

##### create_relance(relance_data)
@description Crée une nouvelle relance.
@param {dict} relance_data - Données de la relance à créer.
@returns {boolean} `True` si la création a réussi, `False` sinon.

##### replace_variables(template, variables)
@description Remplace les variables dans un template par leurs valeurs.
@param {string} template - Template contenant des variables.
@param {dict} variables - Variables à remplacer.
@returns {string} Template avec les variables remplacées.

##### get_impaye_variables(impaye)
@description Extrait toutes les variables disponibles d'un impayé.
@param {dict} impaye - Données de l'impayé.
@returns {dict} Variables extraites.

##### calculate_due_date(delai, unite)
@description Calcule la date d'échéance pour une relance.
@param {number} delai - Délai pour la relance.
@param {string} unite - Unité de temps (`'days'` ou `'weeks'`).
@returns {string} Date d'échéance au format ISO.

##### get_destinataire(impaye, action_type)
@description Détermine le destinataire en fonction du type d'action.
@param {dict} impaye - Données de l'impayé.
@param {string} action_type - Type d'action (`'email'`, `'sms'`, etc.).
@returns {string} Destinataire de la relance.

## Variables d'Environnement
- **PARSE_SERVER_URL** : URL du serveur Parse.
- **PARSE_APP_ID** : Identifiant de l'application Parse.
- **PARSE_MASTER_KEY** : Clé maître pour l'authentification avec Parse.

## Dépendances
- **requests** : Bibliothèque Python pour effectuer des requêtes HTTP.
- **json** : Module Python pour la manipulation des données JSON.
- **logging** : Module Python pour la journalisation.
- **re** : Module Python pour les expressions régulières.
- **datetime** : Module Python pour la gestion des dates et heures.
- **dotenv** : Bibliothèque pour charger les variables d'environnement depuis un fichier `.env`.

## Exemples d'Utilisation
- **En ligne de commande** : Exécuter le script pour générer des relances pour tous les impayés éligibles.
- **Via l'API Flask** : Intégrer le script dans une API Flask pour générer des relances à la demande.
- **Automatisation** : Utiliser le script dans un workflow pour automatiser la génération des relances.

## Structure
```
app/
└── scripts/
    └── peuplerRelance.py
```
