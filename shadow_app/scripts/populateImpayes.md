# Script populateImpayes

## Description
Ce script permet de récupérer les factures impayées depuis une base de données PostgreSQL et de les intégrer dans Parse Server. Il implémente un workflow complet pour extraire, transformer et charger les données des impayés, en gérant les contacts associés et les relations entre eux.

## Comportement
- **Connexion aux bases de données** : Le script se connecte à PostgreSQL pour extraire les données des impayés et à Parse Server pour les stocker.
- **Filtrage des données** : Il applique des filtres pour sélectionner uniquement les factures impayées pertinentes.
- **Gestion des contacts** : Il crée ou met à jour les contacts associés aux impayés (payeurs, apporteurs d'affaires, etc.).
- **Gestion des relations** : Il établit des relations entre les contacts de type morale et les personnes physiques associées.
- **Génération d'URLs** : Il génère des URLs pour accéder aux factures en fonction de leur référence et de leur date.
- **Journalisation** : Il enregistre les opérations et les erreurs dans un fichier de log (`populate_impayes.log`).

## Fonctions Principales

### execute(params)
@description Fonction principale pour exécuter le workflow via l'API Flask.
@param {dict} params - Paramètres contenant les filtres et les options de recherche. Exemple : `{"filters": {...}, "global_search": "terme"}`.
@returns {dict} Résultat de l'exécution avec un statut, un message, les données traitées, et un timestamp.

@example
Pour exécuter le workflow via l'API Flask, appelez la fonction `execute()` avec un dictionnaire contenant les filtres et les options de recherche. Le résultat retourné est un dictionnaire avec un statut, un message, les données traitées, et un timestamp. Vous pouvez vérifier le statut pour déterminer si l'opération a réussi ou échoué.

### main()
@description Fonction principale pour exécuter le script en ligne de commande.
@returns {void} Exécute le workflow et termine le script avec un code de sortie approprié.

@example
Pour exécuter le script en ligne de commande, utilisez la commande `python populateImpayes.py` suivie des options souhaitées (par exemple, `--global-search` pour spécifier un terme de recherche global et `--debug` pour activer le mode débogage).

## Classes

### PostgreSQLConnector
@description Gère la connexion à la base de données PostgreSQL et l'exécution des requêtes SQL.

#### Méthodes
- **connect()** : Établit la connexion à PostgreSQL.
- **execute_query(query, params)** : Exécute une requête SQL et retourne les résultats.
- **close()** : Ferme la connexion à PostgreSQL.

### ParseServerConnector
@description Gère la connexion à Parse Server et les opérations CRUD sur les données.

#### Méthodes
- **get_existing_impayes()** : Récupère les impayés existants dans Parse Server.
- **get_existing_contact(contact_data)** : Récupère un contact existant ou retourne `None`.
- **create_contact(contact_data)** : Crée un nouveau contact et retourne son `objectId`.
- **create_impaye(data)** : Crée une nouvelle entrée dans la classe `Impayes`.
- **update_impaye_url(impaye_id, invoice_url)** : Met à jour l'URL de la facture pour un impayé existant.
- **batch_create_impayes(data_list)** : Crée plusieurs impayés en une seule requête.

### ImpayesFilter
@description Applique des filtres aux factures impayées pour sélectionner uniquement les données pertinentes.

#### Méthodes
- **apply_filters(data, filters)** : Applique les filtres à un enregistrement et retourne `True` si l'enregistrement correspond aux critères.

### ImpayesWorkflow
@description Classe principale pour exécuter le workflow de récupération des factures impayées.

#### Méthodes
- **run()** : Exécute le workflow complet.
- **_fetch_impayes_from_postgres()** : Récupère les factures impayées depuis PostgreSQL.
- **_apply_filters(data)** : Applique les filtres aux données.
- **_find_new_impayes(new_data, existing_data)** : Trouve les nouvelles factures à ajouter.
- **_create_or_get_contact(impaye_data, contact_type)** : Crée ou récupère un contact et retourne son `objectId`.
- **_handle_morale_relations(impaye_data, contact_id)** : Gère les relations pour les contacts de type morale.

## Fonctions Utilitaires

### json_serializer(obj)
@description Convertit les objets non sérialisables en JSON.
@param {object} obj - Objet à sérialiser.
@returns {object} Objet sérialisé ou lève une exception si l'objet n'est pas sérialisable.

### generate_invoice_url(impaye_data)
@description Génère une URL pour accéder à la facture en fonction de sa référence et de sa date.
@param {dict} impaye_data - Données de l'impayé.
@returns {str} URL de la facture ou une chaîne vide en cas d'erreur.

## Variables d'Environnement
- **DB_HOST** : Hôte de la base de données PostgreSQL.
- **DB_NAME** : Nom de la base de données PostgreSQL.
- **DB_USER** : Utilisateur de la base de données PostgreSQL.
- **DB_PASSWORD** : Mot de passe de la base de données PostgreSQL.
- **DB_PORT** : Port de la base de données PostgreSQL.
- **PARSE_SERVER_URL** : URL du serveur Parse.
- **PARSE_APP_ID** : Identifiant de l'application Parse.
- **PARSE_MASTER_KEY** : Clé maître pour l'authentification avec Parse.

## Dépendances
- **psycopg2** : Bibliothèque Python pour interagir avec PostgreSQL.
- **requests** : Bibliothèque Python pour effectuer des requêtes HTTP.
- **python-dotenv** : Bibliothèque pour charger les variables d'environnement depuis un fichier `.env`.
- **logging** : Module Python pour la journalisation.
- **json** : Module Python pour la manipulation des données JSON.
- **datetime** : Module Python pour la gestion des dates et heures.

## Exemples d'Utilisation
- **En ligne de commande** : Exécuter le script pour récupérer et intégrer les impayés dans Parse Server.
- **Via l'API Flask** : Intégrer le script dans une API Flask pour fournir des données dynamiques aux templates HTML.
- **Avec des filtres** : Utiliser des filtres pour sélectionner uniquement les impayés pertinents (par payeur, statut, etc.).
