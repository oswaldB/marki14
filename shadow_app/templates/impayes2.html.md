# Documentation Technique : impayes2.html

## Description
Ce template est responsable de l'affichage de la liste des impayés dans une vue alternative. Il permet de visualiser les impayés sous un format différent de la vue principale, avec des options de filtrage et de tri.

## Comportement
- **Affichage conditionnel** : Affiche la liste des impayés uniquement si les données sont chargées et qu'il n'y a pas d'erreur.
- **Gestion des états** : Utilise `x-show` pour contrôler l'affichage en fonction de l'état du store (`isLoading`, `error`, etc.).
- **Filtrage et tri** : Permet de filtrer et trier les impayés en fonction de différents critères.

## ASCII Render

### Avec des données mockées
```
+---------------------------------------------------------------+
|  📊 Liste des Impayés (Vue Alternative)                        |
|  +---------------------------------------------------------+  |
|  |  📄 Facture #INV-001                                    |  |
|  |  👤 Client: Société XYZ                                 |  |
|  |  💰 Montant: 1 250,00 €                                  |  |
|  |  ⏳ Retard: 30 jours                                     |  |
|  +---------------------------------------------------------+  |
|  |  📄 Facture #INV-002                                    |  |
|  |  👤 Client: Entreprise ABC                              |  |
|  |  💰 Montant: 850,00 €                                    |  |
|  |  ⏳ Retard: 15 jours                                     |  |
|  +---------------------------------------------------------+  |
+---------------------------------------------------------------+
```

### Avec les noms des variables
```
+---------------------------------------------------------------+
|  📊 Liste des Impayés (Vue Alternative)                        |
|  +---------------------------------------------------------+  |
|  |  📄 {{ impaye.refpiece }}                                |  |
|  |  👤 {{ impaye.client }}                                 |  |
|  |  💰 {{ impaye.montant }} €                                |  |
|  |  ⏳ {{ impaye.daysLate }} jours                           |  |
|  +---------------------------------------------------------+  |
|  |  📄 {{ impaye.refpiece }}                                |  |
|  |  👤 {{ impaye.client }}                                 |  |
|  |  💰 {{ impaye.montant }} €                                |  |
|  |  ⏳ {{ impaye.daysLate }} jours                           |  |
|  +---------------------------------------------------------+  |
+---------------------------------------------------------------+
```

## Props
- **$store.impayesStore.isLoading** : État de chargement des données.
- **$store.impayesStore.error** : État d'erreur lors du chargement des données.
- **$store.impayesStore.getImpayes()** : Retourne la liste des impayés.

## Fonctions

### Affichage des impayés
@description Affiche la liste des impayés en utilisant les données du store. Utilise une boucle `x-for` pour itérer sur les impayés et affiche leurs informations dans un format alternatif.
@param {Array} impayes - Tableau d'impayés retourné par `getImpayes()`.
@returns {void} - Affiche les impayés dans l'interface utilisateur.
@example
<!-- Exemple d'utilisation dans un template HTML -->
<div x-show="!$store.impayesStore.isLoading && !$store.impayesStore.error">
    <template x-for="impaye in $store.impayesStore.getImpayes()">
        <div class="impaye-card">
            <span>📄 <span x-text="impaye.refpiece"></span></span>
            <span>👤 <span x-text="impaye.client"></span></span>
            <span>💰 <span x-text="impaye.montant"></span> €</span>
            <span>⏳ <span x-text="impaye.daysLate"></span> jours</span>
        </div>
    </template>
</div>

## Dépendances
- **Alpine.js** : Utilisé pour la réactivité et la gestion des états (`x-show`, `x-for`).
- **impayesStore** : Store global pour la gestion des données des impayés (chargé depuis `base-app.html`).
- **Font Awesome** : Bibliothèque d'icônes utilisée pour les icônes d'interface.

## Exemples d'utilisation
- Ce template est utilisé pour afficher une vue alternative des impayés.
- Il peut être utilisé en combinaison avec des filtres pour affiner les résultats.
