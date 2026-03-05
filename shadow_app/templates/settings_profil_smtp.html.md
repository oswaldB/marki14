# Documentation Technique : settings_profil_smtp.html

## Description
Ce template est responsable de l'affichage du formulaire de configuration du profil SMTP. Il permet de configurer les paramètres SMTP pour l'envoi d'emails, y compris le serveur, le port, et les identifiants.

## Comportement
- **Affichage conditionnel** : Affiche le formulaire de configuration uniquement si les données sont chargées et qu'il n'y a pas d'erreur.
- **Gestion des états** : Utilise `x-show` pour contrôler l'affichage en fonction de l'état du store (`isLoading`, `error`, etc.).
- **Validation** : Valide les données fournies avant de soumettre le formulaire.

## ASCII Render

### Avec des données mockées
```
+---------------------------------------------------------------+
|  ⚙️ Configuration SMTP                                      |
|                                                               |
|  📧 Serveur SMTP: smtp.example.com                           |
|  +---------------------------------------------------------+  |
|  |                                                           |  |
|  +---------------------------------------------------------+  |
|                                                               |
|  🔑 Port: 587                                                |
|  +---------------------------------------------------------+  |
|  |                                                           |  |
|  +---------------------------------------------------------+  |
|                                                               |
|  👤 Utilisateur: user@example.com                            |
|  +---------------------------------------------------------+  |
|  |                                                           |  |
|  +---------------------------------------------------------+  |
|                                                               |
|  🔑 Mot de passe:                                            |
|  +---------------------------------------------------------+  |
|  |                                                           |  |
|  +---------------------------------------------------------+  |
|                                                               |
|  [Enregistrer] [Annuler]                                       |
+---------------------------------------------------------------+
```

### Avec les noms des variables
```
+---------------------------------------------------------------+
|  ⚙️ Configuration SMTP                                      |
|                                                               |
|  📧 Serveur SMTP:                                            |
|  +---------------------------------------------------------+  |
|  |  <input type="text" x-model="smtp.server" />          |  |
|  +---------------------------------------------------------+  |
|                                                               |
|  🔑 Port:                                                     |
|  +---------------------------------------------------------+  |
|  |  <input type="number" x-model="smtp.port" />           |  |
|  +---------------------------------------------------------+  |
|                                                               |
|  👤 Utilisateur:                                             |
|  +---------------------------------------------------------+  |
|  |  <input type="text" x-model="smtp.username" />        |  |
|  +---------------------------------------------------------+  |
|                                                               |
|  🔑 Mot de passe:                                            |
|  +---------------------------------------------------------+  |
|  |  <input type="password" x-model="smtp.password" />    |  |
|  +---------------------------------------------------------+  |
|                                                               |
|  [Enregistrer] [Annuler]                                       |
+---------------------------------------------------------------+
```

## Props
- **$store.smtpStore.isLoading** : État de chargement des données.
- **$store.smtpStore.error** : État d'erreur lors du chargement des données.
- **$store.smtpStore.getSmtpConfig()** : Retourne la configuration SMTP.

## Fonctions

### Configuration du profil SMTP
@description Valide les données fournies et soumet le formulaire de configuration SMTP. Affiche une erreur si les données sont invalides.
@param {Object} smtp - Objet contenant les paramètres SMTP.
@returns {void} - Soumet le formulaire de configuration SMTP.
@example
<!-- Exemple d'utilisation dans un template HTML -->
<form @submit.prevent="saveSmtpConfig(smtp)">
    <div>
        <label>📧 Serveur SMTP:</label>
        <input type="text" x-model="smtp.server" />
    </div>
    <div>
        <label>🔑 Port:</label>
        <input type="number" x-model="smtp.port" />
    </div>
    <div>
        <label>👤 Utilisateur:</label>
        <input type="text" x-model="smtp.username" />
    </div>
    <div>
        <label>🔑 Mot de passe:</label>
        <input type="password" x-model="smtp.password" />
    </div>
    <button type="submit">Enregistrer</button>
    <button type="button" @click="cancelEdit">Annuler</button>
</form>

## Dépendances
- **Alpine.js** : Utilisé pour la réactivité et la gestion des états (`x-model`, `x-show`).
- **smtpStore** : Store global pour la gestion des données SMTP.
- **Font Awesome** : Bibliothèque d'icônes utilisée pour les icônes d'interface.

## Exemples d'utilisation
- Ce template est utilisé pour afficher le formulaire de configuration du profil SMTP.
- Il peut être inclus dans les pages de paramètres de l'application.
