# Documentation Technique : impayesStore.js

## Description
Ce fichier JavaScript définit le store global pour la gestion des impayés dans l'application. Il utilise Alpine.js pour gérer les états et les interactions avec l'interface utilisateur. Ce store est accessible globalement dans toute l'application et est utilisé pour centraliser la gestion des données des impayés.

## Comportement
- **Gestion des états** : Utilise Alpine.js pour gérer les états de l'interface utilisateur.
- **Interactions** : Permet de gérer les interactions avec les impayés.
- **Données dynamiques** : Charge et gère les données dynamiques pour les impayés.
- **Centralisation** : Centralise la logique métier liée aux impayés pour une réutilisation dans toute l'application.

## Fonctions

### Initialisation du store
@description Initialise le store global pour les impayés.
@param {Object} data - Données initiales pour le store.
@returns {Object} - Retourne le store initialisé.
@example
// Exemple d'utilisation dans un composant Alpine.js
document.addEventListener('alpine:init', () => {
    Alpine.store('impayesStore', impayesStore());
});

### Chargement des données
@description Charge les données pour les impayés depuis Parse Server.
@param {Function} callback - Fonction de rappel pour traiter les données chargées.
@returns {void} - Charge les données et appelle le callback.
@example
// Exemple d'utilisation pour charger les données
loadImpayes((data) => {
    console.log('Données chargées:', data);
});

### Mise à jour des données
@description Met à jour les données pour les impayés.
@param {Object} newData - Nouvelles données à mettre à jour.
@returns {void} - Met à jour les données.
@example
// Exemple d'utilisation pour mettre à jour les données
updateImpayes({ key: 'value' });

## Dépendances
- **Alpine.js** : Utilisé pour la gestion des états et la réactivité.
- **Axios** : Utilisé pour les requêtes HTTP.
- **Parse Server** : Utilisé pour la gestion des données backend.

## Exemples d'utilisation
- Ce fichier est utilisé pour gérer les états des impayés dans toute l'application.
- Il peut être inclus dans les pages de gestion des impayés pour gérer les interactions et les données dynamiques.

## Notes
- Ce store est enregistré globalement et peut être utilisé dans n'importe quel template ou composant Alpine.js via `Alpine.store('impayesStore')`.
- Il est initialisé automatiquement lors du chargement de la page et se synchronise avec Parse Server pour récupérer les données des impayés.
