# Template base-app.html

## Description
Template de base pour l'application avec une barre latérale de navigation. Ce template étend `base.html` et ajoute une structure de mise en page avec une barre latérale et un contenu principal. Il utilise Alpine.js pour gérer l'état de l'application et la navigation.

## Structure HTML

### Description
Le template `base-app.html` est structuré en trois parties principales :
1. **En-tête** : Contient les métadonnées, les liens vers les bibliothèques CSS et JavaScript, et les configurations nécessaires.
2. **Barre latérale** : Affiche le logo de l'application, un menu de navigation dynamique, et une section utilisateur avec un bouton de déconnexion.
3. **Contenu principal** : Zone où le contenu spécifique à chaque page est inséré via le bloc `content`.

### Schéma ASCII

#### Structure Globale
```
+---------------------------------------------------------------+
|  En-tête (Head)                                              |
|  - Métadonnées                                               |
|  - Liens CSS/JS                                              |
|  - Configuration Tailwind et Font Awesome                    |
+---------------------------------------------------------------+
|  Corps (Body)                                                |
|  +-------------------------+  +-------------------------------+
|  |  Barre Latérale          |  |  Contenu Principal            |
|  |  - Logo                  |  |  - Contenu dynamique          |
|  |  - Menu de Navigation    |  |    (bloc `content`)           |
|  |  - Section Utilisateur   |  |                               |
|  |  - Bouton Déconnexion   |  |                               |
|  +-------------------------+  +-------------------------------+
|  Scripts JS                                                |
|  - ToastUI Editor                                          |
|  - Notifications                                           |
+---------------------------------------------------------------+
```

#### Barre Latérale
```
+---------------------------------------------------------------+
|  Logo Marki                                                  |
|                                                               |
|  Menu de Navigation                                           |
|  [📊 Tableau de bord]                                         |
|  [📄 Impayés]                                                 |
|  [📧 Contacts]                                                |
|  [⚙️ Paramètres]                                              |
|                                                               |
|  Section Utilisateur                                          |
|  +-------------------------+                                  |
|  |  👤 Utilisateur          |                                  |
|  |  Marki App              |                                  |
|  +-------------------------+                                  |
|  [Déconnexion]                                               |
+---------------------------------------------------------------+
```

## Blocs
- **title** : Titre de la page. Par défaut, "Marki - Application".
- **head** : Section pour ajouter des éléments supplémentaires dans l'en-tête.
- **content** : Contenu principal de la page.
- **scripts** : Section pour ajouter des scripts spécifiques à la page.

## Dépendances
- **Tailwind CSS** : Utilisé pour le styling via CDN.
- **Alpine.js** : Utilisé pour la réactivité et la gestion des états (`x-data`, `x-for`, etc.).
- **Font Awesome** : Bibliothèque d'icônes utilisée pour les icônes d'interface.
- **Axios** : Bibliothèque pour effectuer des requêtes HTTP.
- **parseAxios.js** : Configuration personnalisée pour Axios pour interagir avec Parse Server.
- **baseAppState.js** : État de base de l'application pour la gestion de la navigation et de l'authentification.
- **sequenceStore.js** : Store pour la gestion des séquences.
- **index.js** : Store principal pour la gestion des données de l'application.
- **LitElement** : Bibliothèque pour les composants web.
- **ToastUI Editor** : Éditeur de texte riche pour les emails et les séquences.

## Comportement
- **Navigation** : La barre latérale affiche un menu de navigation avec des éléments dynamiques gérés par `baseAppState`.
- **Authentification** : La section utilisateur affiche les informations de l'utilisateur et un bouton de déconnexion.
- **Responsive Design** : La barre latérale est masquée sur les appareils mobiles et visible sur les écrans de bureau.

## Exemples d'Utilisation
- Ce template est utilisé comme base pour toutes les pages de l'application qui nécessitent une barre latérale de navigation.
- Les autres templates étendent ce template et remplissent les blocs `title`, `content`, et `scripts` avec leur contenu spécifique.

## Inclusions
- **_notifications.html** : Système de notifications inclus dans toutes les pages pour afficher des messages à l'utilisateur.
