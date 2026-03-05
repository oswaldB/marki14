# Script contact_impayes

## Description
Ce script permet de récupérer tous les impayés et apports d'affaires associés à un contact spécifique. Il interagit avec le serveur Parse pour récupérer les données du contact, ainsi que les impayés où ce contact est soit payeur, soit apporteur d'affaires.

## Comportement
- **Récupération des données** : Le script utilise l'API Parse pour récupérer les informations du contact et les impayés associés.
- **Gestion des erreurs** : Il gère les erreurs liées à l'absence de paramètres, aux requêtes API échouées, et aux exceptions générales.
- **Format de sortie** : Le résultat est retourné sous forme de dictionnaire avec un statut, un message, les données récupérées, et un timestamp.

## Fonctions

### execute(params)
@description Fonction principale pour exécuter le script et récupérer les impayés d'un contact.
@param {dict} params - Paramètres contenant l'ID du contact. Exemple : `{"contact_id": "objectId"}`.
@returns {dict} Résultat avec les impayés du contact. Structure du résultat :
- `status` (str) : Statut de l'exécution (`"success"` ou `"error"`).
- `message` (str) : Message décrivant le résultat ou l'erreur.
- `data` (dict) : Données récupérées, incluant :
  - `contact` (dict) : Informations du contact.
  - `impayes_as_payeur` (list) : Liste des impayés où le contact est payeur.
  - `impayes_as_apporteur` (list) : Liste des impayés où le contact est apporteur d'affaires.
- `timestamp` (str) : Date et heure de l'exécution au format ISO.

@example
Pour utiliser ce script, appelez la fonction `execute` avec un dictionnaire contenant l'ID du contact. Le résultat retourné est un dictionnaire avec un statut, un message, les données récupérées, et un timestamp. Vous pouvez vérifier le statut pour déterminer si l'exécution a réussi ou échoué.

## Dépendances
- **requests** : Bibliothèque Python pour effectuer des requêtes HTTP.
- **json** : Module Python pour la manipulation des données JSON.
- **os** : Module Python pour accéder aux variables d'environnement.
- **datetime** : Module Python pour la gestion des dates et heures.

## Variables d'Environnement
- **PARSE_SERVER_URL** : URL du serveur Parse.
- **PARSE_APP_ID** : Identifiant de l'application Parse.
- **PARSE_MASTER_KEY** : Clé maître pour l'authentification avec Parse.

## Exemples d'Utilisation
- Ce script est généralement utilisé pour afficher les impayés associés à un contact dans l'interface utilisateur.
- Il peut être intégré dans une API Flask pour fournir des données dynamiques aux templates HTML.
