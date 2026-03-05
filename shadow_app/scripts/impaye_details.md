# Script impaye_details

## Description
Ce script permet de récupérer les détails d'un impayé spécifique, y compris son historique d'actions. Il est utilisé pour afficher des informations détaillées sur un impayé, telles que les données de la facture, les informations sur le payeur et l'apporteur, ainsi que l'historique des actions effectuées sur cet impayé.

## Comportement
- **Récupération des paramètres** : Le script récupère l'ID de l'impayé depuis les paramètres fournis.
- **Validation des paramètres** : Vérifie que l'ID de l'impayé est fourni.
- **Connexion à Parse Server** : Utilise l'API Parse Server pour récupérer les détails de l'impayé et son historique d'actions.
- **Gestion des erreurs** : Gère les erreurs de connexion, les requêtes échouées, et les exceptions générales.
- **Format de sortie** : Retourne un dictionnaire avec un statut, un message, les données de l'impayé et son historique, et un timestamp.

## Fonctions

### execute(params)
@description Fonction principale pour exécuter le script et récupérer les détails de l'impayé.
@param {dict} params - Paramètres contenant l'ID de l'impayé. Exemple : `{"impaye_id": "objectId"}`.
@returns {dict} Résultat avec les détails de l'impayé et son historique d'actions. Structure du résultat :
- `status` (str) : Statut de l'exécution (`"success"` ou `"error"`).
- `message` (str) : Message décrivant le résultat ou l'erreur.
- `data` (dict) : Données de l'impayé et son historique, incluant :
  - `impaye` (dict) : Détails de l'impayé.
  - `actions` (list) : Historique des actions effectuées sur l'impayé.
- `timestamp` (str) : Date et heure de l'exécution au format ISO.

@example
Pour récupérer les détails d'un impayé spécifique, appelez la fonction `execute()` avec un dictionnaire contenant l'ID de l'impayé. Le résultat retourné est un dictionnaire avec un statut, un message, les données de l'impayé et son historique d'actions, et un timestamp. Vous pouvez vérifier le statut pour déterminer si l'opération a réussi ou échoué.

## Variables d'Environnement
- **PARSE_SERVER_URL** : URL du serveur Parse.
- **PARSE_APP_ID** : Identifiant de l'application Parse.
- **PARSE_MASTER_KEY** : Clé maître pour l'authentification avec Parse.

## Dépendances
- **requests** : Bibliothèque Python pour effectuer des requêtes HTTP.
- **json** : Module Python pour la manipulation des données JSON.
- **os** : Module Python pour accéder aux variables d'environnement.
- **datetime** : Module Python pour la gestion des dates et heures.

## Exemples d'Utilisation
- **Affichage des détails** : Utiliser ce script pour afficher les détails d'un impayé dans une interface utilisateur.
- **Historique des actions** : Utiliser ce script pour afficher l'historique des actions effectuées sur un impayé.
- **Gestion des erreurs** : Utiliser les réponses d'erreur pour informer l'utilisateur des problèmes rencontrés.

## Structure
```
app/
└── scripts/
    └── impaye_details.py
```
