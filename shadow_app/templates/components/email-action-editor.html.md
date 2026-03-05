# Composant email-action-editor.html

## Description
Composant pour l'édition des actions de type email dans les séquences. Ce composant permet de gérer les détails d'une action email, tels que l'objet, le CC, le délai, le profil SMTP, l'email de l'expéditeur, et le contenu du message. Il est utilisé dans les templates de gestion des séquences pour fournir une interface interactive.

## Structure HTML

### Description
Le composant `email-action-editor.html` est structuré en plusieurs parties principales :
1. **En-tête** : Affiche un résumé de l'action email avec un bouton pour basculer l'expansion et un bouton pour supprimer l'action.
2. **Boîte de dialogue de confirmation** : Affiche une boîte de dialogue pour confirmer la suppression de l'action.
3. **Contenu expansé** : Contient les champs pour éditer les détails de l'action email, tels que l'objet, le CC, le délai, le profil SMTP, l'email de l'expéditeur, et le contenu du message.

### Schéma ASCII

#### Structure Globale
```
+---------------------------------------------------------------+
|  En-tête                                                       |
|  +-------------------------+  +-------------------------------+
|  |  Bouton d'expansion     |  |  Résumé de l'action          |
|  +-------------------------+  +-------------------------------+
|  |  Bouton de suppression  |                                |
+---------------------------------------------------------------+
|  Boîte de dialogue de confirmation (si visible)              |
|  +---------------------------------------------------------+  |
|  |  Message de confirmation                               |  |
|  |  Boutons: Annuler / Supprimer                          |  |
|  +---------------------------------------------------------+  |
+---------------------------------------------------------------+
|  Contenu expansé (si visible)                                  |
|  +---------------------------------------------------------+  |
|  |  Champs d'édition:                                     |  |
|  |  - Objet                                               |  |
|  |  - CC                                                  |  |
|  |  - Délai (jours)                                       |  |
|  |  - Profil SMTP                                         |  |
|  |  - Email Expéditeur                                    |  |
|  |  - Message (éditeur ToastUI)                           |  |
|  +---------------------------------------------------------+  |
+---------------------------------------------------------------+
```

## Props
- **action** : Objet représentant l'action email à éditer.
- **index** : Index de l'action dans la liste des actions.
- **updateActionField(index, field, value)** : Fonction pour mettre à jour un champ de l'action.
- **removeAction(index)** : Fonction pour supprimer une action.

## Fonctions

### updateSubject()
@description Met à jour le sujet de l'action email.
@returns {void}

### updateCC()
@description Met à jour le champ CC de l'action email.
@returns {void}

### updateDelay()
@description Met à jour le délai de l'action email.
@returns {void}

### updateSenderEmail()
@description Met à jour l'email de l'expéditeur de l'action email.
@returns {void}

### handleContentChange(event)
@description Gère les changements de contenu dans l'éditeur ToastUI et émet un événement personnalisé.
@param {Event} event - Événement de changement de contenu.
@returns {void}

### toggleExpand()
@description Basculer l'état d'expansion du composant.
@returns {void}

### confirmDelete()
@description Ouvre la confirmation de suppression de l'action.
@returns {void}

### cancelDelete()
@description Annule la suppression de l'action.
@returns {void}

### executeDelete()
@description Exécute la suppression de l'action.
@returns {void}

## Dépendances
- **Alpine.js** : Bibliothèque JavaScript pour la réactivité et la gestion des états.
- **Font Awesome** : Bibliothèque d'icônes utilisée pour les icônes d'interface.
- **toastui-editor-lit.js** : Composant Lit pour l'éditeur ToastUI.
- **sequenceStore.js** : Store Alpine.js pour la gestion des séquences.

## Exemples d'Utilisation
- Ce composant est utilisé dans les templates de gestion des séquences pour éditer les actions de type email.
- Il est inclus dans les templates comme `email-editors-container.html` pour afficher et éditer les actions email.

## Inclusions
- **toastui-editor-lit.js** : Composant Lit pour l'éditeur ToastUI.
