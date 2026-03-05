# Documentation Technique : styleguide.html

## Description
Ce template est responsable de l'affichage du guide de style de l'application. Il fournit une référence visuelle pour les composants, les couleurs, les typographies, et les conventions de design utilisées dans l'application.

## Comportement
- **Affichage statique** : Affiche les éléments de style de manière statique pour référence.
- **Exemples de composants** : Montre des exemples de composants réutilisables avec leur code.
- **Palettes de couleurs** : Affiche les couleurs utilisées dans l'application avec leurs codes hexadécimaux.

## ASCII Render

### Avec des données mockées
```
+---------------------------------------------------------------+
|  🎨 Guide de Style                                            |
|                                                               |
|  📐 Typographie                                               |
|  +---------------------------------------------------------+  |
|  |  Titre 1: Font-size: 24px, Font-weight: bold           |  |
|  |  Titre 2: Font-size: 20px, Font-weight: bold           |  |
|  |  Texte: Font-size: 16px, Font-weight: normal           |  |
|  +---------------------------------------------------------+  |
|                                                               |
|  🎨 Couleurs                                                  |
|  +---------------------------------------------------------+  |
|  |  Primaire: #3498db                                        |  |
|  |  Secondaire: #2ecc71                                      |  |
|  |  Erreur: #e74c3c                                         |  |
|  +---------------------------------------------------------+  |
|                                                               |
|  📦 Composants                                               |
|  +---------------------------------------------------------+  |
|  |  [Bouton] [Carte] [Notification]                         |  |
|  +---------------------------------------------------------+  |
+---------------------------------------------------------------+
```

### Avec les noms des variables
```
+---------------------------------------------------------------+
|  🎨 Guide de Style                                            |
|                                                               |
|  📐 Typographie                                               |
|  +---------------------------------------------------------+  |
|  |  Titre 1: {{ typography.h1 }}                            |  |
|  |  Titre 2: {{ typography.h2 }}                            |  |
|  |  Texte: {{ typography.body }}                            |  |
|  +---------------------------------------------------------+  |
|                                                               |
|  🎨 Couleurs                                                  |
|  +---------------------------------------------------------+  |
|  |  Primaire: {{ colors.primary }}                          |  |
|  |  Secondaire: {{ colors.secondary }}                      |  |
|  |  Erreur: {{ colors.error }}                              |  |
|  +---------------------------------------------------------+  |
|                                                               |
|  📦 Composants                                               |
|  +---------------------------------------------------------+  |
|  |  [Bouton] [Carte] [Notification]                         |  |
|  +---------------------------------------------------------+  |
+---------------------------------------------------------------+
```

## Props
- **typography** : Objet contenant les styles de typographie.
- **colors** : Objet contenant les couleurs utilisées dans l'application.
- **components** : Liste des composants réutilisables.

## Fonctions

### Affichage du guide de style
@description Affiche les éléments de style de l'application, y compris la typographie, les couleurs, et les composants.
@param {Object} typography - Objet contenant les styles de typographie.
@param {Object} colors - Objet contenant les couleurs utilisées dans l'application.
@param {Array} components - Liste des composants réutilisables.
@returns {void} - Affiche le guide de style dans l'interface utilisateur.
@example
<!-- Exemple d'utilisation dans un template HTML -->
<div class="styleguide">
    <div class="typography-section">
        <h2>📐 Typographie</h2>
        <div>
            <span>Titre 1: <span x-text="typography.h1"></span></span>
            <span>Titre 2: <span x-text="typography.h2"></span></span>
            <span>Texte: <span x-text="typography.body"></span></span>
        </div>
    </div>
    <div class="colors-section">
        <h2>🎨 Couleurs</h2>
        <div>
            <span>Primaire: <span x-text="colors.primary"></span></span>
            <span>Secondaire: <span x-text="colors.secondary"></span></span>
            <span>Erreur: <span x-text="colors.error"></span></span>
        </div>
    </div>
</div>

## Dépendances
- **Alpine.js** : Utilisé pour la réactivité et la gestion des états (`x-show`, `x-for`).
- **Font Awesome** : Bibliothèque d'icônes utilisée pour les icônes d'interface.

## Exemples d'utilisation
- Ce template est utilisé pour afficher le guide de style de l'application.
- Il peut être utilisé comme référence pour les développeurs et les designers.
