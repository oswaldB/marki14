# parseAxios.js

## Description
Ce fichier configure et initialise des instances Axios pour interagir avec Parse Server et l'API Flask. Il fournit des instances préconfigurées pour effectuer des requêtes HTTP vers ces services, en adaptant les configurations en fonction de l'environnement (localhost ou domaine).

## Comportement
- **Initialisation** : Crée des instances Axios pour Parse Server et Flask avec des configurations spécifiques.
- **Détection de l'environnement** : Adapte les configurations en fonction de l'URL actuelle (localhost ou domaine).
- **Disponibilité globale** : Rend les instances Axios disponibles globalement via `window.parseAxios` et `window.flaskAxios`.
- **Intégration avec Alpine.js** : Ajoute les instances Axios au store Alpine.js pour une utilisation dans les composants Alpine.

## Fonctions

### initializeParseAxios()
@description Initialise les instances Axios pour Parse Server et Flask.
@returns {void}

@example
Pour initialiser les instances Axios pour Parse Server et Flask, appelez la fonction `initializeParseAxios()`. Cette fonction crée des instances Axios préconfigurées et les rend disponibles globalement.

### ensureParseAxiosInAlpineStore()
@description S'assure que les instances Axios sont disponibles dans le store Alpine.js.
@returns {void}

@example
Pour s'assurer que les instances Axios sont disponibles dans le store Alpine.js, appelez la fonction `ensureParseAxiosInAlpineStore()`. Cette fonction ajoute les instances Axios au store Alpine.js pour une utilisation dans les composants Alpine.

## Instances Axios

### parseAxios
@description Instance Axios configurée pour interagir avec Parse Server.
- **baseURL** : `https://parse.markidiags.com/parse/`
- **headers** :
  - `X-Parse-Application-Id` : `adti`
  - `X-Parse-REST-API-Key` : `Careless7-Gore4-Guileless0-Jogger5-Clubbed9`
  - `Content-Type` : `application/json`

### flaskAxios
@description Instance Axios configurée pour interagir avec l'API Flask.
- **baseURL** : Adaptée en fonction de l'environnement (`http://127.0.0.1:5000/` pour localhost, `https://dev.markidiags.com/` pour le domaine).
- **headers** :
  - `Content-Type` : `application/json`

## Variables Globales
- **window.parseAxios** : Instance Axios pour Parse Server.
- **window.flaskAxios** : Instance Axios pour l'API Flask.
- **window.__parseAxiosForAlpine** : Instance Axios pour Parse Server, destinée à Alpine.js.
- **window.__flaskAxiosForAlpine** : Instance Axios pour l'API Flask, destinée à Alpine.js.

## Dépendances
- **Axios** : Bibliothèque pour effectuer des requêtes HTTP.
- **Alpine.js** : Bibliothèque JavaScript pour la réactivité et la gestion des états.

## Exemples d'Utilisation
- **Requêtes vers Parse Server** : Utiliser `window.parseAxios` pour effectuer des requêtes vers Parse Server.
- **Requêtes vers l'API Flask** : Utiliser `window.flaskAxios` pour effectuer des requêtes vers l'API Flask.
- **Intégration avec Alpine.js** : Utiliser les instances Axios dans les composants Alpine.js pour interagir avec les APIs.

@example
Pour effectuer des requêtes vers Parse Server, utilisez l'instance `window.parseAxios`. Pour effectuer des requêtes vers l'API Flask, utilisez l'instance `window.flaskAxios`. Ces instances sont préconfigurées avec les en-têtes et les URLs de base appropriés. Vous pouvez utiliser les méthodes standard d'Axios, telles que `get()` et `post()`, pour interagir avec les APIs.

## Structure
```
app/
└── static/
    └── js/
        └── parseAxios.js
```
