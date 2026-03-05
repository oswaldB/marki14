# Blueprint script_bp

## Description
Ce blueprint Flask fournit une interface REST pour exécuter des scripts Python situés dans le dossier `app/scripts/`. Il permet d'appeler des scripts avec des paramètres et retourne les résultats au format JSON. Ce blueprint est utilisé pour exposer les fonctionnalités des scripts via des endpoints HTTP.

## Comportement
- **Exécution de scripts** : Permet d'exécuter des scripts Python dynamiquement en fonction du nom du script fourni dans l'URL.
- **Gestion des erreurs** : Retourne des erreurs détaillées si le script n'existe pas, n'est pas exécutable, ou si une exception se produit.
- **Format de réponse** : Tous les endpoints retournent des réponses JSON avec un statut, un message, des données, et un timestamp.
- **Listage des scripts** : Fournit un endpoint pour lister tous les scripts disponibles.

## Endpoints
### POST /script/<script_name>
@description Exécute un script spécifique.
@param {string} script_name - Nom du script à exécuter (sans l'extension `.py`).
@returns {JSON} Résultat de l'exécution du script.

@example
Pour exécuter un script spécifique, envoyez une requête POST à l'endpoint `/script/<script_name>` avec les paramètres nécessaires dans le corps de la requête au format JSON. Le résultat retourné est un objet JSON avec un statut, un message, des données, et un timestamp.

@response
```json
{
  "status": "success",
  "message": "Hello, John!",
  "data": { ... },
  "timestamp": "..."
}
```

### POST /script/getInvoice
@description Récupère une facture depuis FTP.
@param {string} invoice_url - URL de la facture à récupérer.
@returns {JSON} Résultat de la récupération de la facture.

@example
Pour récupérer une facture depuis FTP, envoyez une requête POST à l'endpoint `/script/getInvoice` avec l'URL de la facture dans le corps de la requête au format JSON. Le résultat retourné est un objet JSON avec un statut, un message, et les données de la facture.

### POST /script/populateImpayes
@description Exécute le workflow de récupération des factures impayées.
@param {Object} params - Paramètres pour le script, incluant des filtres et des options de recherche.
@returns {JSON} Résultat de l'exécution du script.

@example
Pour exécuter le workflow de récupération des factures impayées, envoyez une requête POST à l'endpoint `/script/populateImpayes` avec les filtres et les options de recherche dans le corps de la requête au format JSON. Le résultat retourné est un objet JSON avec un statut, un message, et les données traitées.



### POST /script/peuplerRelances
@description Génère automatiquement les relances pour les impayés.
@returns {JSON} Résultat de la génération des relances.

@example
Pour générer automatiquement les relances pour les impayés, envoyez une requête POST à l'endpoint `/script/peuplerRelances` avec un corps de requête vide au format JSON. Le résultat retourné est un objet JSON avec un statut, un message, et les données de la génération des relances.

### POST /script/impaye-details
@description Récupère les détails d'un impayé spécifique.
@param {string} impaye_id - ID de l'impayé.
@returns {JSON} Détails de l'impayé.

@example
Pour récupérer les détails d'un impayé spécifique, envoyez une requête POST à l'endpoint `/script/impaye-details` avec l'ID de l'impayé dans le corps de la requête au format JSON. Le résultat retourné est un objet JSON avec un statut, un message, et les détails de l'impayé.




## Fonctions Internes

### get_available_scripts(detailed=False)
@description Récupère la liste des scripts disponibles dans le dossier `scripts/`.
@param {boolean} detailed - Si `True`, retourne des informations détaillées sur chaque script.
@returns {Array} Liste des scripts disponibles.

## Dépendances
- **Flask** : Framework web pour Python.
- **importlib** : Module Python pour importer dynamiquement des modules.
- **os** : Module Python pour interagir avec le système de fichiers.
- **sys** : Module Python pour accéder aux paramètres du système.
- **datetime** : Module Python pour la gestion des dates et heures.

## Exemples d'Utilisation
- **Intégration avec une API** : Utiliser les endpoints pour exécuter des scripts depuis une application front-end.
- **Automatisation** : Appeler les endpoints depuis des scripts ou des tâches planifiées pour automatiser des processus.
- **Gestion des erreurs** : Utiliser les réponses d'erreur pour gérer les exceptions et fournir des feedbacks utilisateur.

## Structure
```
app/
└── scripts/
    ├── script_bp.py
    ├── populateImpayes.py
    └── ...
```
