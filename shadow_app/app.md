# Application principale

## Description
Fichier principal de l'application Flask. Ce fichier configure et initialise l'application, définit les routes principales, et gère les dépendances et les middlewares nécessaires au fonctionnement de l'application.

## Fonctions principales

### create_app()
@description Crée et configure l'application Flask. Initialise les configurations, les extensions, et les blueprints.
@returns {Flask} Instance de l'application Flask configurée.

### init_db()
@description Initialise la base de données et les connexions nécessaires.
@returns {void}

### register_blueprints()
@description Enregistre les blueprints de l'application pour modulariser les routes.
@returns {void}

## Routes principales

### / (home)
@description Route principale de l'application. Affiche la page d'accueil.
@returns {Response} Page d'accueil.

### /login (GET, POST)
@description Route pour la gestion de l'authentification des utilisateurs.
- **GET** : Affiche le formulaire de connexion.
- **POST** : Traite les données de connexion et authentifie l'utilisateur.
@returns {Response} Page de connexion ou redirection vers le tableau de bord en cas de succès.

### /dashboard
@description Route pour afficher le tableau de bord de l'application.
@returns {Response} Page du tableau de bord.

### /impayes
@description Route pour afficher la liste des impayés.
@returns {Response} Page des impayés.

### /impaye/<impaye_id>
@description Route pour afficher les détails d'un impayé spécifique.
@param {string} impaye_id - Identifiant de l'impayé.
@returns {Response} Page des détails de l'impayé.

### /contact/<contact_id>/impayes
@description Route pour afficher les impayés associés à un contact.
@param {string} contact_id - Identifiant du contact.
@returns {Response} Page des impayés du contact.

### /admin/configurations
@description Route pour afficher les configurations administratives.
@returns {Response} Page des configurations administratives.

### /admin/superadmin
@description Route pour afficher le panneau d'administration superadmin.
@returns {Response} Page du panneau d'administration superadmin.

### /settings/profil-smtp
@description Route pour gérer les profils SMTP.
@returns {Response} Page des profils SMTP.

### /sequences
@description Route pour afficher les séquences de relance.
@returns {Response} Page des séquences.

### /sequence/<sequence_id>
@description Route pour afficher les détails d'une séquence spécifique.
@param {string} sequence_id - Identifiant de la séquence.
@returns {Response} Page des détails de la séquence.

### /sequence/<sequence_id>/edit
@description Route pour éditer une séquence spécifique.
@param {string} sequence_id - Identifiant de la séquence.
@returns {Response} Page d'édition de la séquence.

## Middlewares et Décorateurs

### login_required
@description Décorateur pour vérifier l'authentification de l'utilisateur avant d'accéder à une route.
@param {function} f - Fonction de vue à décorer.
@returns {function} Fonction décorée.

## Configuration
- **TEMPLATES_AUTO_RELOAD** : Active le rechargement automatique des templates.
- **SECRET_KEY** : Clé secrète pour la gestion des sessions.
- **CORS** : Active le partage de ressources cross-origin pour toutes les routes.

## Dépendances
- **Flask** : Framework web pour Python.
- **Flask-CORS** : Extension pour gérer les requêtes CORS.
- **Flask-Livereload** : Extension pour le rechargement automatique du navigateur.
- **python-dotenv** : Bibliothèque pour charger les variables d'environnement depuis un fichier `.env`.
- **APScheduler** : Planificateur de tâches pour exécuter des scripts périodiquement.
- **logging** : Module Python pour la journalisation.

## Planificateur de Tâches
Le planificateur de tâches est utilisé pour exécuter des scripts périodiquement :
- **getImpayesColumns** : Exécuté toutes les heures à la minute 0.
- **populateImpayes** : Exécuté toutes les heures à la minute 3.
- **peuplerRelance** : Exécuté toutes les heures à la minute 15.

## Exemples d'Utilisation
- **Lancement de l'application** : `python app.py`
- **Accès à l'application** : `http://localhost:5000`
- **Authentification** : Utiliser la route `/login` pour se connecter.

## Structure
```
app/
├── app.py
├── scripts/
│   └── script_bp.py
└── templates/
    └── *.html
```
