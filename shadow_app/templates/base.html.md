# Template base.html

## Description
Template de base pour l'application. Il définit la structure HTML commune à toutes les pages, incluant les métadonnées, les styles CSS, les scripts JavaScript, et les blocs de contenu dynamiques. Ce template utilise Tailwind CSS pour le styling, Alpine.js pour la réactivité, et Font Awesome pour les icônes.

## Structure HTML

### Description
Le template `base.html` est structuré en deux parties principales :
1. **En-tête (Head)** : Contient les métadonnées, les liens vers les bibliothèques CSS et JavaScript, et les configurations nécessaires.
2. **Corps (Body)** : Contient le contenu principal de la page et les scripts spécifiques.

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
|  - Contenu dynamique (bloc `content`)                         |
|  - Notifications                                             |
|  - Scripts spécifiques (bloc `scripts`)                       |
+---------------------------------------------------------------+
```

## Blocs
- **title** : Titre de la page. Par défaut, "Mon Application".
- **head** : Section pour ajouter des éléments supplémentaires dans l'en-tête (par exemple, des styles ou des scripts spécifiques).
- **content** : Contenu principal de la page.
- **scripts** : Section pour ajouter des scripts spécifiques à la page.

## Dépendances
- **Tailwind CSS** : Utilisé pour le styling via CDN.
- **Alpine.js** : Utilisé pour la réactivité et la gestion des états dans l'interface utilisateur.
- **Font Awesome** : Bibliothèque d'icônes utilisée pour les icônes d'interface.
- **Line Icons** : Bibliothèque d'icônes supplémentaire pour les fonctionnalités spécifiques.
- **Axios** : Bibliothèque pour effectuer des requêtes HTTP.
- **parseAxios.js** : Configuration personnalisée pour Axios pour interagir avec Parse Server.
- **tailwind-config.js** : Configuration personnalisée pour Tailwind CSS.

## Styles Personnalisés
- **Couleurs Marki** : Définies pour correspondre à l'identité visuelle de la marque.
  - `bg-marki-primary` : Couleur de fond principale (#007ace).
  - `text-marki-primary` : Couleur de texte principale (#007ace).
  - `border-marki-primary` : Couleur de bordure principale (#007ace).
  - `hover:bg-marki-primary-dark` : Couleur de fond au survol (#005bb5).
  - `focus:ring-marki-primary` : Effet de focus pour les éléments interactifs.

## Exemples d'Utilisation
- Ce template est utilisé comme base pour toutes les pages de l'application.
- Les autres templates étendent ce template et remplissent les blocs `title`, `content`, et `scripts` avec leur contenu spécifique.

## Inclusions
- **_notifications.html** : Système de notifications inclus dans toutes les pages pour afficher des messages à l'utilisateur.
