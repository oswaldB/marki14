# Documentation Technique : login.html

## Description
Ce template est responsable de l'affichage de la page de connexion de l'application. Il permet aux utilisateurs de se connecter en fournissant leurs identifiants.

## Comportement
- **Affichage conditionnel** : Affiche le formulaire de connexion uniquement si l'utilisateur n'est pas déjà connecté.
- **Gestion des états** : Utilise `x-show` pour contrôler l'affichage en fonction de l'état de connexion (`isLoggedIn`, `error`, etc.).
- **Validation** : Valide les identifiants fournis avant de soumettre le formulaire.

## ASCII Render

### Avec des données mockées
```
+---------------------------------------------------------------+
|  🔒 Connexion                                                 |
|                                                               |
|  📧 Email:                                                    |
|  +---------------------------------------------------------+  |
|  |                                                           |  |
|  +---------------------------------------------------------+  |
|                                                               |
|  🔑 Mot de passe:                                             |
|  +---------------------------------------------------------+  |
|  |                                                           |  |
|  +---------------------------------------------------------+  |
|                                                               |
|  [Se connecter]                                               |
+---------------------------------------------------------------+
```

### Avec les noms des variables
```
+---------------------------------------------------------------+
|  🔒 Connexion                                                 |
|                                                               |
|  📧 Email:                                                    |
|  +---------------------------------------------------------+  |
|  |  <input type="email" x-model="email" />                |  |
|  +---------------------------------------------------------+  |
|                                                               |
|  🔑 Mot de passe:                                             |
|  +---------------------------------------------------------+  |
|  |  <input type="password" x-model="password" />          |  |
|  +---------------------------------------------------------+  |
|                                                               |
|  [Se connecter]                                               |
+---------------------------------------------------------------+
```

## Props
- **email** : Adresse email de l'utilisateur.
- **password** : Mot de passe de l'utilisateur.
- **error** : État d'erreur lors de la connexion.

## Fonctions

### Connexion de l'utilisateur
@description Valide les identifiants fournis et soumet le formulaire de connexion. Affiche une erreur si les identifiants sont invalides.
@param {String} email - Adresse email de l'utilisateur.
@param {String} password - Mot de passe de l'utilisateur.
@returns {void} - Soumet le formulaire de connexion.
@example
<!-- Exemple d'utilisation dans un template HTML -->
<form @submit.prevent="login(email, password)">
    <div>
        <label>📧 Email:</label>
        <input type="email" x-model="email" />
    </div>
    <div>
        <label>🔑 Mot de passe:</label>
        <input type="password" x-model="password" />
    </div>
    <button type="submit">Se connecter</button>
</form>

## Dépendances
- **Alpine.js** : Utilisé pour la réactivité et la gestion des états (`x-model`, `x-show`).
- **Font Awesome** : Bibliothèque d'icônes utilisée pour les icônes d'interface.

## Exemples d'utilisation
- Ce template est utilisé pour afficher la page de connexion de l'application.
- Il peut être personnalisé pour inclure des options de récupération de mot de passe ou d'inscription.
