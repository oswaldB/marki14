# Documentation Technique : _notifications.html

## Description
Ce template est responsable de l'affichage des notifications globales dans l'application. Il gère les messages d'erreur, de succès, d'information et d'avertissement, et s'intègre avec le système de notifications de l'application.

## Comportement
- **Affichage conditionnel** : Les notifications sont affichées en fonction de leur présence dans le store global ou via des événements.
- **Types de notifications** : Prend en charge plusieurs types de notifications (erreur, succès, info, avertissement).
- **Fermeture automatique** : Les notifications peuvent être fermées manuellement ou automatiquement après un certain délai.

## ASCII Render

### Avec des données mockées
```
+---------------------------------------------------------------+
|  ❌ Erreur: Impossible de charger les données.                |
|  [Fermer]                                                      |
+---------------------------------------------------------------+
```

### Avec les noms des variables
```
+---------------------------------------------------------------+
|  {{ icon }} {{ message }}                                      |
|  [Fermer]                                                      |
+---------------------------------------------------------------+
```

## Props
- **notifications** : Liste des notifications à afficher.
- **type** : Type de notification (error, success, info, warning).
- **message** : Message de la notification.

## Fonctions

### Affichage des notifications
@description Affiche les notifications en fonction de leur type et de leur message. Utilise des icônes spécifiques pour chaque type de notification et permet la fermeture manuelle.
@param {Array} notifications - Liste des notifications à afficher.
@returns {void} - Affiche les notifications dans l'interface utilisateur.
@example
<!-- Exemple d'utilisation dans un template HTML -->
<div x-show="notifications.length > 0">
    <template x-for="notification in notifications">
        <div class="notification {{ notification.type }}">
            <span x-text="notification.message"></span>
            <button @click="closeNotification(notification.id)">Fermer</button>
        </div>
    </template>
</div>

## Dépendances
- **Alpine.js** : Utilisé pour la réactivité et la gestion des états (`x-show`, `x-for`).
- **Font Awesome** : Bibliothèque d'icônes utilisée pour les icônes de notification.

## Exemples d'utilisation
- Ce template est inclus dans la mise en page principale pour afficher les notifications globales.
- Il peut être utilisé pour afficher des messages d'erreur, de succès ou d'information.
