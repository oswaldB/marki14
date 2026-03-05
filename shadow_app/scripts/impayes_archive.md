# Script impayes_archive

## Description
Ce script permet d'archiver plusieurs factures impayées en mettant à jour leur statut dans Parse Server. Il est utilisé pour marquer les factures comme archivées et soldées, ce qui les exclut des listes d'impayés actifs.

## Comportement
- **Récupération des paramètres** : Le script récupère les IDs des impayés à archiver depuis les paramètres fournis.
- **Validation des paramètres** : Vérifie que les paramètres sont valides et que des IDs d'impayés sont fournis.
- **Connexion à Parse Server** : Utilise l'API Parse Server pour mettre à jour le statut des impayés.
- **Gestion des erreurs** : Gère les erreurs de connexion, les requêtes échouées, et les exceptions générales.
- **Format de sortie** : Retourne un dictionnaire avec un statut, un message, les données de l'archivage, et un timestamp.

## Fonctions

### execute(params)
@description Fonction principale pour exécuter le script et archiver les impayés.
@param {dict} params - Paramètres contenant les IDs des impayés à archiver. Exemple : `{"impaye_ids": ["id1", "id2"]}`.
@returns {dict} Résultat de l'archivage. Structure du résultat :
- `status` (str) : Statut de l'exécution (`"success"` ou `"error"`).
- `message` (str) : Message décrivant le résultat ou l'erreur.
- `data` (dict) : Données de l'archivage, incluant :
  - `archived_count` (int) : Nombre de factures archivées avec succès.
  - `total_attempted` (int) : Nombre total de factures tentées.
- `timestamp` (str) : Date et heure de l'exécution au format ISO.

@example
Pour archiver plusieurs factures impayées, appelez la fonction `execute()` avec un dictionnaire contenant les IDs des impayés à archiver. Le résultat retourné est un dictionnaire avec un statut, un message, les données de l'archivage, et un timestamp. Vous pouvez vérifier le statut pour déterminer si l'opération a réussi ou échoué.

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
- **Archivage manuel** : Utiliser ce script pour archiver des factures spécifiques via une interface utilisateur.
- **Automatisation** : Intégrer ce script dans un workflow pour archiver automatiquement les factures soldées.
- **Gestion des erreurs** : Utiliser les réponses d'erreur pour informer l'utilisateur des problèmes rencontrés.

## Structure
```
app/
└── scripts/
    └── impayes_archive.py
```
