# Composant smtp-profile-panel.html

## Description
Composant pour le panneau de création et d'édition des profils SMTP. Ce composant permet de créer ou de modifier un profil SMTP avec des informations telles que le nom, l'email, l'hôte, le port, le nom d'utilisateur, le mot de passe, et les options de sécurité. Il est utilisé dans les templates de gestion des profils SMTP pour fournir une interface interactive.

## Structure HTML

### Description
Le composant `smtp-profile-panel.html` est structuré en deux parties principales :
1. **Panneau de création/édition** : Affiche un panneau latéral pour créer ou modifier un profil SMTP. Le panneau contient un formulaire avec des champs pour le nom du profil, l'email, le nom de l'expéditeur, l'hôte SMTP, le port, le nom d'utilisateur, le mot de passe, les options de sécurité (SSL, TLS, actif), et la signature HTML.
2. **Script d'initialisation** : Configure le composant Alpine.js pour gérer l'ouverture, la fermeture, et la sauvegarde du panneau.

### Schéma ASCII

#### Structure Globale
```
+---------------------------------------------------------------+
|  Panneau de création/édition                                |
|  +---------------------------------------------------------+  |
|  |  En-tête                                                |  |
|  |  - Titre: "Créer/Modifier le profil SMTP"              |  |
|  |  - Bouton de fermeture                                   |  |
|  +---------------------------------------------------------+  |
|  |  Formulaire                                             |  |
|  |  - Nom du profil                                        |  |
|  |  - Email                                                |  |
|  |  - Nom de l'expéditeur                                  |  |
|  |  - Hôte SMTP                                            |  |
|  |  - Port                                                |  |
|  |  - Nom d'utilisateur                                    |  |
|  |  - Mot de passe                                         |  |
|  |  - Options de sécurité                                  |  |
|  |  - Signature HTML                                      |  |
|  |  Boutons: Annuler / Créer/Mettre à jour                  |  |
|  +---------------------------------------------------------+  |
+---------------------------------------------------------------+
```

## Props
- **panelOpen** : Indique si le panneau est ouvert.
- **editingProfile** : Profil SMTP en cours d'édition.
- **saving** : Indique si le profil est en cours de sauvegarde.
- **currentProfile** : Profil SMTP actuellement édité.

## Fonctions

### init()
@description Initialise le composant et configure les écouteurs d'événements.
@returns {void}

### openPanel(profile)
@description Ouvre le panneau pour créer ou éditer un profil SMTP.
@param {Object} profile - Profil SMTP à éditer (optionnel).
@returns {void}

### close()
@description Ferme le panneau de création/édition.
@returns {void}

### save()
@description Sauvegarde le profil SMTP (création ou mise à jour).
@returns {Promise<void>}

## Dépendances
- **Alpine.js** : Utilisé pour la réactivité et la gestion des états (`x-show`, `x-for`, `x-model`).
- **parseAxios** : Instance Axios configurée pour interagir avec Parse Server.
- **Font Awesome** : Bibliothèque d'icônes utilisée pour les icônes d'interface.

## Exemples d'utilisation
- Ce composant est utilisé dans les templates de gestion des profils SMTP pour créer ou modifier un profil.
- Il est inclus dans les templates comme `email-editors-container.html` pour fournir une interface interactive de gestion des profils SMTP.

## Inclusions
- **parseAxios.js** : Instance Axios configurée pour interagir avec Parse Server.
