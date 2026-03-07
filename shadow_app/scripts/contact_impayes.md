# Script : Récupération des impayés d'un contact

## Description
Ce script permet de récupérer tous les impayés associés à un contact spécifique, que ce soit en tant que payeur ou en tant qu'apporteur d'affaires. Il interagit avec Parse Server pour récupérer les données nécessaires et retourne un résultat structuré.

## Fonction principale

### execute(params)
@description Fonction d'exécution pour récupérer les impayés d'un contact.
@param {dict} params - Paramètres contenant l'ID du contact.
- **contact_id** (string) : Identifiant du contact dans Parse Server.
@returns {dict} Résultat avec les impayés du contact.
- **status** (string) : Statut de l'exécution (success/error).
- **message** (string) : Message descriptif.
- **data** (dict) : Données retournées.
  - **contact** (dict) : Informations du contact.
  - **impayes_as_payeur** (list) : Liste des impayés où le contact est payeur.
  - **impayes_as_apporteur** (list) : Liste des impayés où le contact est apporteur d'affaires.
- **timestamp** (string) : Horodatage de l'exécution.

## Comportement
1. **Validation des paramètres** : Vérifie que l'ID du contact est fourni dans les paramètres.
2. **Récupération du contact** : Récupère les informations du contact depuis Parse Server.
3. **Récupération des impayés** :
   - Récupère les impayés où le contact est payeur.
   - Récupère les impayés où le contact est apporteur d'affaires.
4. **Combinaison des résultats** : Combine les résultats dans un dictionnaire structuré.
5. **Gestion des erreurs** : Capture les exceptions et retourne un statut d'erreur en cas de problème.

## Exemple d'utilisation
```python
params = {
    "contact_id": "objectId123"
}
result = execute(params)
print(result)
```

## Dépendances
- **requests** : Bibliothèque pour effectuer des requêtes HTTP.
- **json** : Module pour la manipulation des données JSON.
- **os** : Module pour accéder aux variables d'environnement.
- **datetime** : Module pour la gestion des dates et heures.

## Configuration requise
Les variables d'environnement suivantes doivent être définies :
- **PARSE_SERVER_URL** : URL du serveur Parse.
- **PARSE_APP_ID** : Identifiant de l'application Parse.
- **PARSE_MASTER_KEY** : Clé maître de l'application Parse.

## Cas d'erreur
- **ID du contact manquant** : Si l'ID du contact n'est pas fourni dans les paramètres.
- **Erreur de récupération du contact** : Si la requête pour récupérer le contact échoue.
- **Erreur de récupération des impayés** : Si les requêtes pour récupérer les impayés échouent.
- **Exception générale** : Toute autre erreur lors de l'exécution du script.

## Exemple de réponse en cas de succès
```json
{
    "status": "success",
    "message": "Impayés du contact récupérés avec succès",
    "data": {
        "contact": {
            "objectId": "objectId123",
            "nom": "Dupont",
            "prenom": "Jean"
        },
        "impayes_as_payeur": [
            {
                "objectId": "impaye1",
                "montant": 1000.00,
                "date": "2024-01-01"
            }
        ],
        "impayes_as_apporteur": [
            {
                "objectId": "impaye2",
                "montant": 2000.00,
                "date": "2024-02-01"
            }
        ]
    },
    "timestamp": "2024-03-05T12:00:00.000000"
}
```

## Exemple de réponse en cas d'erreur
```json
{
    "status": "error",
    "message": "ID du contact manquant",
    "data": {},
    "timestamp": "2024-03-05T12:00:00.000000"
}
```

## Notes
- Ce script est conçu pour être utilisé dans un environnement Flask ou en tant que script autonome.
- Les requêtes à Parse Server utilisent la clé maître pour un accès complet aux données.
- Les résultats sont retournés sous forme de dictionnaire pour une intégration facile dans d'autres parties de l'application.
