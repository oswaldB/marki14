# Composant toastui-editor-lit.js

## Description
Composant Lit pour l'éditeur ToastUI. Ce composant encapsule l'éditeur ToastUI dans un élément personnalisé pour une utilisation facile dans les templates HTML. Il est utilisé pour fournir une interface d'édition de texte riche dans l'application.

## Comportement
- **Initialisation** : Charge et initialise l'éditeur ToastUI avec une configuration spécifique.
- **Gestion des événements** : Émet des événements personnalisés lors des changements de contenu.
- **Configuration** : Permet de configurer la hauteur de l'éditeur et le contenu initial.
- **Intégration avec Alpine.js** : Émet des événements pour notifier les composants Alpine.js des changements de contenu.

## Props
- **content** : Contenu HTML de l'éditeur.
- **body** : Contenu initial de l'éditeur.
- **height** : Hauteur de l'éditeur (par défaut : `400px`).

## Fonctions

### createRenderRoot()
@description Désactive le shadow DOM pour permettre l'accès aux éléments internes.
@returns {HTMLElement} L'élément racine.

### firstUpdated()
@description Méthode appelée après la première mise à jour du composant. Charge le script ToastUI.
@returns {void}

### loadToastUIScript()
@description Charge le script ToastUI et initialise l'éditeur.
@returns {Promise<void>}

### initializeEditor()
@description Initialise l'éditeur ToastUI avec une configuration spécifique.
@returns {void}

### render()
@description Rend le template HTML du composant.
@returns {TemplateResult} Template HTML du composant.

## Événements
- **content-change** : Émis lors des changements de contenu dans l'éditeur.
- **toastui-content-changed** : Émis pour notifier les composants Alpine.js des changements de contenu.

## Dépendances
- **LitElement** : Bibliothèque pour créer des composants web.
- **ToastUI Editor** : Éditeur de texte riche pour les emails et les séquences.

## Exemples d'Utilisation
- Ce composant est utilisé dans les templates HTML pour fournir une interface d'édition de texte riche.
- Il peut être utilisé dans les pages de création et d'édition de séquences pour permettre aux utilisateurs de rédiger des emails et des messages.

@example
Pour utiliser ce composant dans un template HTML, incluez l'élément `toastui-editor-lit` avec les attributs souhaités, tels que `id`, `content`, et `height`. Vous pouvez écouter les événements de changement de contenu pour réagir aux modifications apportées par l'utilisateur. Par exemple, vous pouvez ajouter un écouteur d'événements pour le type `content-change` et récupérer le contenu mis à jour via `e.detail.content`.

## Structure
```
app/
└── static/
    └── js/
        └── components/
            └── toastui-editor-lit.js
```
