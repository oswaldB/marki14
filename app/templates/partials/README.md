# Système de Notifications Alpine.js

Ce dossier contient le système de notifications toast pour l'application.

## Fichiers

- `_notifications.html` - Template et store Alpine.js pour les notifications
- `NOTIFICATIONS_GUIDE.md` - Guide complet d'utilisation
- `test_notifications.html` - Page de test pour démontrer les fonctionnalités
- `README.md` - Ce fichier

## Fonctionnalités

✅ **Store Alpine.js pur** - Utilisation exclusive du store sans méthodes globales
✅ **Pas de :key** - Conforme aux restrictions techniques
✅ **4 types de notifications** - success, info, warning, error
✅ **Animations fluides** - Entrée/sortie avec transitions
✅ **Gestion automatique** - Disparition après durée configurable
✅ **Fermeture manuelle** - Cliquez pour fermer
✅ **Événements personnalisés** - Support des événements DOM
✅ **Responsive** - Largeur maximale adaptée (max-w-2xl)
✅ **Positionnement fixe** - Barre en haut de l'écran

## Utilisation de base

```html
<!-- Inclure dans votre template -->
{% include 'partials/_notifications.html' %}

<!-- Utiliser dans votre code -->
<button onclick="$store.notifications.addNotification('Hello!', 'success')">
    Montrer notification
</button>
```

## Installation

1. Assurez-vous qu'Alpine.js est chargé dans votre application
2. Incluez le partial `_notifications.html` dans votre layout principal
3. Utilisez `$store.notifications.addNotification()` pour afficher des notifications

## Exemple complet

Voir `test_notifications.html` pour une démonstration complète avec tous les types et fonctionnalités.