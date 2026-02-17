 - **preparation**: 
   - [] lancer le script: getParseData.sh et ensuite lire le fichier data-model.md.
   - [] lire le contenu du dossier guides/. Tous les fichiers.
  - **action  à faire en RESPECTANT les guides** : # Authentification - US1.1 Connexion sécurisée

## Description Gherkin

```
Scénario : Connexion réussie avec redirection paramétrée
  Étant donné que je suis sur "/login?redirect=/dashboard/clients"
  Quand je saisis "oswald" et mon mot de passe: coucou
  Et que je coche "Se souvenir de moi"
  Alors mon token Parse est stocké dans localStorage
  Et je suis redirigé vers "/dashboard/clients"

Scénario : Connexion sans paramètre redirect
  Étant donné que je suis sur "/login"
  Quand je saisis mes identifiants
  Alors je suis redirigé vers "/dashboard" (par défaut)
```

## Écrans ASCII

```
+-------------------------------------+
|  ______                            |
| |  ___|                           |
| | |_   ___  _ __ ___   ___  ___   |
| |  _| / _ \| '_ ` _ \ / _ \/ __|  |
| | |   | (_) | | | | | |  __\__ \  |
| \_|    \___/|_| |_| |_|\___||___/  |
|                                     |
| [Identifiant] _______________      |
| [Mot de passe] _______________      |
| [ ] Se souvenir de moi             |
|                                     |
| [Connexion]       [Mot de passe     |
|                   oublié ?]          |
+-------------------------------------+
```

## Classes Parse Utilisées

- `_User` (Parse native) :
  ```javascript
  {
    username: String,
    password: String
  }
  ```

## Autres Informations

- **Logique de redirection** :
  - Frontend (Alpine.js) :
    ```javascript
    // Après succès de Parse.User.logIn()
    const redirectUrl = new URL(window.location).searchParams.get('redirect') || '/dashboard';
    window.location.href = redirectUrl;
    ```
- **Stockage du token** :
  - `localStorage` si "Se souvenir de moi" coché, sinon `sessionStorage`.
- **Exemple de token** :
  ```json
  { "parseToken": "r:abc123xyz456", "userId": "k7X9pLmN2" }
  ```

## Notes supplémentaires

- **Approche technique** : Cette fonctionnalité utilise Parse REST via Axios pour l'authentification, conformément aux règles du projet.
- **Fastify** : Non nécessaire pour cette fonctionnalité, car elle peut être entièrement gérée par Parse REST.
