# Guide d'utilisation des notifications

## Introduction

Le composant `Notifications` est un composant stéroïde qui permet d'afficher des notifications à l'utilisateur. Il est entièrement autonome et utilise Alpine.js pour gérer son état. Ce guide explique comment l'utiliser dans votre application.

## Intégration du composant

Pour utiliser le composant `Notifications`, vous devez l'importer dans vos pages ou composants Astro. Voici un exemple d'intégration :

```astro
---
import Notifications from "../components/Notifications.astro";
---

<html>
  <body>
    <!-- Votre contenu -->
    <Notifications client:load />
  </body>
</html>
```

## Utilisation des notifications

### Ajouter une notification

Pour ajouter une notification, vous pouvez utiliser la méthode `addNotification` du store Alpine.js. Voici un exemple :

```javascript
// Ajouter une notification d'information
$store.notifications.addNotification("Ceci est une notification d'information.");

// Ajouter une notification de succès
$store.notifications.addNotification("Opération réussie !", "success");

// Ajouter une notification d'avertissement
$store.notifications.addNotification("Attention, cette action est irréversible.", "warning");

// Ajouter une notification d'erreur
$store.notifications.addNotification("Une erreur est survenue.", "error");
```

### Personnaliser la durée d'affichage

Par défaut, les notifications disparaissent après 5 secondes. Vous pouvez personnaliser cette durée en passant un troisième paramètre :

```javascript
// Notification qui disparaît après 10 secondes
$store.notifications.addNotification("Ceci est une notification longue.", "info", 10000);

// Notification qui ne disparaît pas automatiquement
$store.notifications.addNotification("Ceci est une notification permanente.", "info", 0);
```

### Supprimer une notification

Pour supprimer une notification spécifique, vous pouvez utiliser la méthode `removeNotification` :

```javascript
// Supprimer une notification par son ID
$store.notifications.removeNotification(id);
```

### Supprimer toutes les notifications

Pour supprimer toutes les notifications, utilisez la méthode `clearAll` :

```javascript
// Supprimer toutes les notifications
$store.notifications.clearAll();
```

## Exemples d'utilisation

### Exemple 1 : Notification après une action utilisateur

```javascript
function handleSubmit() {
  // Logique de soumission
  $store.notifications.addNotification("Vos modifications ont été enregistrées.", "success");
}
```

### Exemple 2 : Notification d'erreur

```javascript
try {
  // Logique qui peut échouer
} catch (error) {
  $store.notifications.addNotification("Une erreur est survenue : " + error.message, "error");
}
```

### Exemple 3 : Notification avec durée personnalisée

```javascript
function showTemporaryMessage() {
  $store.notifications.addNotification("Ce message disparaîtra dans 3 secondes.", "info", 3000);
}
```

## Types de notifications

Le composant `Notifications` prend en charge quatre types de notifications :

- **info** : Pour les informations générales.
- **success** : Pour les opérations réussies.
- **warning** : Pour les avertissements.
- **error** : Pour les erreurs.

Chaque type de notification a une couleur et une icône associées pour une meilleure expérience utilisateur.

## Conclusion

Le composant `Notifications` est un outil puissant pour informer les utilisateurs des actions et des événements dans votre application. Il est facile à intégrer et à utiliser, et offre une grande flexibilité pour personnaliser les notifications selon vos besoins.

Si vous avez des questions ou des suggestions, n'hésitez pas à demander !