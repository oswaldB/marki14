# Documentation Technique : impaye_details.html

## Description
Ce template est responsable de l'affichage des détails d'un impayé spécifique. Il permet de visualiser toutes les informations relatives à un impayé, y compris les détails de la facture, du client, et les actions possibles.

## Comportement
- **Affichage conditionnel** : Affiche les détails de l'impayé uniquement si les données sont chargées et qu'il n'y a pas d'erreur.
- **Gestion des états** : Utilise `x-show` pour contrôler l'affichage en fonction de l'état du store (`isLoading`, `error`, etc.).
- **Navigation** : Permet de naviguer vers d'autres pages liées à l'impayé, comme les détails du client ou de la facture.

## ASCII Render

### Avec des données mockées
```
+---------------------------------------------------------------+
|  📄 Détails de l'Impayé                                       |
|                                                               |
|  📋 Facture: #INV-001                                        |
|  👤 Client: Société XYZ                                       |
|  💰 Montant: 1 250,00 €                                       |
|  📅 Date: 15/03/2024                                         |
|  ⏳ Retard: 30 jours                                          |
|                                                               |
|  📍 Adresse: 123 Rue de la Paix, 75000 Paris                |
|                                                               |
|  [Voir la facture] [Contacter le client] [Marquer comme payé] |
+---------------------------------------------------------------+
```

### Avec les noms des variables
```
+---------------------------------------------------------------+
|  📄 Détails de l'Impayé                                       |
|                                                               |
|  📋 Facture: {{ impaye.refpiece }}                            |
|  👤 Client: {{ impaye.client }}                               |
|  💰 Montant: {{ impaye.montant }} €                            |
|  📅 Date: {{ impaye.datepiece }}                              |
|  ⏳ Retard: {{ impaye.daysLate }} jours                        |
|                                                               |
|  📍 Adresse: {{ impaye.adresse }}                             |
|                                                               |
|  [Voir la facture] [Contacter le client] [Marquer comme payé] |
+---------------------------------------------------------------+
```

## Props
- **$store.impayeStore.isLoading** : État de chargement des données.
- **$store.impayeStore.error** : État d'erreur lors du chargement des données.
- **$store.impayeStore.getImpayeDetails()** : Retourne les détails de l'impayé.

## Fonctions

### Affichage des détails de l'impayé
@description Affiche les détails de l'impayé en utilisant les données du store. Utilise des cartes pour afficher les informations clés et des boutons pour les actions possibles.
@param {Object} impaye - Objet contenant les détails de l'impayé.
@returns {void} - Affiche les détails de l'impayé dans l'interface utilisateur.
@example
<!-- Exemple d'utilisation dans un template HTML -->
<div x-show="!$store.impayeStore.isLoading && !$store.impayeStore.error">
    <div class="impaye-details-card">
        <span>📋 Facture: <span x-text="impaye.refpiece"></span></span>
        <span>👤 Client: <span x-text="impaye.client"></span></span>
        <span>💰 Montant: <span x-text="impaye.montant"></span> €</span>
        <span>📅 Date: <span x-text="impaye.datepiece"></span></span>
        <span>⏳ Retard: <span x-text="impaye.daysLate"></span> jours</span>
        <span>📍 Adresse: <span x-text="impaye.adresse"></span></span>
    </div>
</div>

## Dépendances
- **Alpine.js** : Utilisé pour la réactivité et la gestion des états (`x-show`, `x-for`).
- **impayesStore** : Store global pour la gestion des données des impayés (chargé depuis `base-app.html`).
- **Font Awesome** : Bibliothèque d'icônes utilisée pour les icônes d'interface.

## Exemples d'utilisation
- Ce template est utilisé pour afficher les détails d'un impayé spécifique.
- Il peut être inclus dans les pages de détails des impayés ou des factures.
