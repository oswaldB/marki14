# Configuration Tailwind CSS

## Description
Configuration personnalisée pour Tailwind CSS utilisée dans l'application Marki. Ce fichier étend la configuration par défaut de Tailwind CSS avec des couleurs, des polices, des ombres, et des utilitaires spécifiques à la marque Marki. Il est utilisé pour assurer une cohérence visuelle dans toute l'application.

## Comportement
- **Extension du thème** : Étend le thème par défaut de Tailwind CSS avec des couleurs, des polices, des ombres, et des bordures spécifiques à la marque Marki.
- **Utilitaires personnalisés** : Ajoute des utilitaires CSS personnalisés pour les couleurs, les transitions, et les effets de focus.
- **Plugins** : Utilise des plugins pour ajouter des utilitaires spécifiques à l'application.

## Configuration

### Couleurs
- **primary** : Couleur principale de la marque Marki (`#007ACE`).
- **marki** : Palette de couleurs étendue pour la marque Marki (du plus clair au plus foncé).

### Polices
- **sans** : Police sans-serif personnalisée utilisant Inter et d'autres polices système.

### Ombres
- **marki** : Ombre personnalisée pour les éléments de l'interface.
- **marki-lg** : Ombre plus grande pour les éléments de l'interface.

### Bordures
- **marki** : Rayon de bordure personnalisé (`6px`).
- **marki-lg** : Rayon de bordure plus grand (`8px`).

### Utilitaires
- **bg-marki-primary** : Couleur de fond principale de la marque Marki.
- **text-marki-primary** : Couleur de texte principale de la marque Marki.
- **border-marki-primary** : Couleur de bordure principale de la marque Marki.
- **hover:bg-marki-primary-dark** : Couleur de fond au survol.
- **focus:ring-marki-primary** : Effet de focus pour les éléments interactifs.
- **marki-transition** : Transition personnalisée pour les animations.
- **marki-focus** : Effet de focus personnalisé pour les éléments interactifs.

## Dépendances
- **Tailwind CSS** : Framework CSS pour le styling.

## Exemples d'Utilisation
- Ce fichier est chargé automatiquement lors de l'initialisation de l'application.
- Il est utilisé pour configurer Tailwind CSS et assurer une cohérence visuelle dans toute l'application.

## Structure
```
app/
└── static/
    └── js/
        └── tailwind-config.js
```
