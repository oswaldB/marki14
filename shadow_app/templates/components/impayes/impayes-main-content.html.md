# Composant impayes-main-content.html

## Description
Ce composant affiche le contenu principal des impayés en fonction de la vue actuelle. Il gère l'affichage des différentes vues (par payeur, par facture, par acteur, etc.) et affiche des messages d'erreur ou d'absence de résultats si nécessaire.

## Comportement
- **Affichage conditionnel** : Le composant affiche le contenu en fonction de la vue actuelle définie dans le store `impayesStore`.
- **Gestion des erreurs** : Affiche un message d'erreur si une erreur s'est produite lors du chargement des données.
- **Message d'absence de résultats** : Affiche un message si aucun impayé ne correspond aux critères de recherche.
- **Inclusion de vues** : Inclut les templates spécifiques à chaque vue (par payeur, par facture, par acteur, etc.).

## État Alpine.js
Ce composant gère l'affichage des impayés en fonction de la vue actuelle. Il inclut des fonctionnalités pour gérer les données des impayés, formater les dates et les montants, et calculer les retards de paiement.

### Fonctionnalités
- **store** : Référence au store global pour la gestion des données des impayés.
- **refreshData()** : Rafraîchit les données des impayés.
- **switchView(viewName)** : Change la vue actuelle des impayés.
- **toggleGroupExpansion(groupId)** : Basculer l'expansion d'un groupe.
- **isGroupExpanded(groupId)** : Vérifie si un groupe est expansé.
- **openDetailsDrawer(item)** : Ouvre le tiroir des détails pour un élément.
- **closeDetailsDrawer()** : Ferme le tiroir des détails.
- **formatDate(dateString)** : Formate une date pour l'affichage.
- **formatCurrency(amount)** : Formate un montant en euros.
- **calculateMaxDaysLate(group)** : Calcule le nombre maximum de jours de retard pour un groupe.
- **updateSearchTerm(term)** : Met à jour le terme de recherche.
- **updateSelectedPayeur(payeur)** : Met à jour le payeur sélectionné.
- **updateSortBy(sortField)** : Met à jour le champ de tri.
- **updateStatusFilter(status)** : Met à jour le filtre de statut.

### Comportement
- **Affichage conditionnel** : Affiche le contenu en fonction de la vue actuelle et des états de chargement et d'erreur.
- **Gestion des erreurs** : Affiche un message d'erreur si une erreur s'est produite lors du chargement des données.
- **Message d'absence de résultats** : Affiche un message si aucun impayé ne correspond aux critères de recherche.

## ASCII Render

### Avec des données mockées
```
+---------------------------------------------------------------+
|  Vue par payeur                                              |
|                                                               |
|  +---------------------------------------------------------+  |
|  |  [ ]  📄  Facture #INV-001                               |  |
|  |       Client: Société XYZ                                 |  |
|  |       Montant: 1 250,00 €  │  Reste: 1 250,00 €          |  |
|  |       Date: 15/03/2024  │  Dossier: D-2024-001          |  |
|  |       📍 123 Rue de la Paix, 75000 Paris                 |  |
|  |                                                         |  |
|  |  ⚠️  Retard max: 30 jours                                 |  |
|  |                                                         |  |
|  |  [Voir la facture] [Détails]                             |  |
|  +---------------------------------------------------------+  |
|                                                               |
|  +---------------------------------------------------------+  |
|  |  [ ]  📄  Facture #INV-002                               |  |
|  |       Client: Société ABC                                 |  |
|  |       Montant: 2 500,00 €  │  Reste: 2 500,00 €          |  |
|  |       Date: 20/03/2024  │  Dossier: D-2024-002          |  |
|  |       📍 456 Avenue des Champs, 75000 Paris             |  |
|  |                                                         |  |
|  |  ⚠️  Retard max: 15 jours                                 |  |
|  |                                                         |  |
|  |  [Voir la facture] [Détails]                             |  |
|  +---------------------------------------------------------+  |
|                                                               |
+---------------------------------------------------------------+
```

### Avec les noms des variables
```
+---------------------------------------------------------------+
|  Vue par {{ $store.impayesStore.currentView }}               |
|                                                               |
|  +---------------------------------------------------------+  |
|  |  [ ]  📄  {{ group.refpiece }}                           |  |
|  |       Client: {{ group.client }}                           |  |
|  |       Montant: {{ group.totalttcnet }}  │  Reste: {{ group.resteapayer }}|
|  |       Date: {{ group.datepiece }}  │  Dossier: {{ group.numero }}|
|  |       📍  {{ group.adresse }}                              |  |
|  |                                                         |  |
|  |  ⚠️  Retard max: {{ group.maxDaysLate }} jours              |  |
|  |                                                         |  |
|  |  [Voir la facture] [Détails]                             |  |
|  +---------------------------------------------------------+  |
|                                                               |
+---------------------------------------------------------------+
```

## Props
- **$store.impayesStore.currentView** : Vue actuelle des impayés (`'payeur'`, `'facture'`, `'acteur'`, etc.).
- **$store.impayesStore.isLoading** : État de chargement des données.
- **$store.impayesStore.error** : État d'erreur lors du chargement des données.
- **$store.impayesStore.getFilteredData()** : Retourne les données des impayés filtrées.

## Fonctions

### Affichage conditionnel
@description Affiche le contenu en fonction de la vue actuelle et des états de chargement et d'erreur.
@param {string} currentView - Vue actuelle des impayés.
@returns {void} - Affiche le contenu correspondant à la vue actuelle.

### Gestion des erreurs
@description Affiche un message d'erreur si une erreur s'est produite lors du chargement des données.
@param {string} error - Message d'erreur.
@returns {void} - Affiche le message d'erreur.

### Message d'absence de résultats
@description Affiche un message si aucun impayé ne correspond aux critères de recherche.
@returns {void} - Affiche le message d'absence de résultats.

## Dépendances
- **Alpine.js** : Utilisé pour la réactivité et la gestion des états (`x-show`, `x-for`).
- **impayesStore** : Store global pour la gestion des données des impayés.
- **Font Awesome** : Bibliothèque d'icônes utilisée pour les icônes d'interface.
- **impayes-payeur-view.html** : Composant inclus pour l'affichage des impayés par payeur.
- **impayes-facture-view.html** : Composant inclus pour l'affichage des impayés par facture.
- **impayes-acteur-view.html** : Composant inclus pour l'affichage des impayés par acteur.

## Exemples d'utilisation
- Ce composant est utilisé dans les pages principales de l'application pour afficher le contenu des impayés.
- Il est inclus dans les templates comme `impayes.html` pour afficher les impayés en fonction de la vue actuelle.
