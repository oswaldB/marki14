# Alpine.js - loginState

## Description
Composant Alpine.js pour la gestion de l'état de la page de connexion. Ce composant gère les champs de formulaire, la validation, et la soumission des données de connexion. Il est utilisé dans le template de la page de connexion pour fournir une interface de connexion interactive.

## Comportement
- **Gestion des champs de formulaire** : Gère les champs de nom d'utilisateur, de mot de passe, et de la case à cocher "Se souvenir de moi".
- **Validation** : Valide les données de connexion et affiche des messages d'erreur en cas d'échec.
- **Soumission du formulaire** : Soumet les données de connexion à l'API Flask et gère la réponse.
- **Gestion des erreurs** : Affiche des messages d'erreur en cas de connexion échouée.
- **État de chargement** : Indique si une requête de connexion est en cours.

## État
- **username** : Nom d'utilisateur saisi par l'utilisateur.
- **password** : Mot de passe saisi par l'utilisateur.
- **rememberMe** : Indique si l'utilisateur souhaite être remembered.
- **errorMessage** : Message d'erreur à afficher en cas de connexion échouée.
- **isLoading** : Indique si une requête de connexion est en cours.

## Fonctions

### login()
@description Soumet les données de connexion à l'API Flask et gère la réponse.
@returns {Promise<void>}

@example
Pour soumettre les données de connexion, appelez la fonction `login()`. Cette fonction valide les champs du formulaire, soumet les données à l'API Flask, et gère la réponse. En cas de succès, l'utilisateur est redirigé vers la page d'accueil. En cas d'échec, un message d'erreur est affiché.

## Dépendances
- **Alpine.js** : Bibliothèque JavaScript pour la réactivité et la gestion des états.
- **Fetch API** : API JavaScript pour effectuer des requêtes HTTP.

## Exemples d'Utilisation
- Ce composant est utilisé dans le template de la page de connexion pour gérer l'état du formulaire et la soumission des données.
- Il est initialisé automatiquement lors du chargement de la page et peut être utilisé dans n'importe quel composant Alpine.js via `loginState()`.

## Structure
```
app/
└── static/
    └── js/
        └── alpines/
            └── loginState.js
```
