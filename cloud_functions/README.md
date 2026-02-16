# Fonctions Cloud pour la Gestion des Relances Planifiées

Ce dossier contient l'implémentation des fonctions cloud pour gérer les relances planifiées lors de la désactivation d'une séquence, conformément à la user story US002.

## Structure du Projet

```
cloud_functions/
├── relanceFunctions.js  # Fonctions principales de gestion des relances
├── main.js             # Point d'entrée des fonctions cloud Parse
├── test.js             # Tests unitaires
├── package.json        # Configuration du projet
└── README.md           # Documentation
```

## Fonctions Implémentées

### 1. `getScheduledRelancesForSequence(sequenceId)`
- **Description** : Récupère toutes les relances planifiées pour une séquence
- **Paramètres** : `sequenceId` (String) - ID de la séquence Parse
- **Retour** : Promise<Array> - Tableau d'objets Parse représentant les relances
- **Fonctionnement** :
  - Filtre les relances par séquence
  - Filtre par statut "scheduled" (is_sent = false)
  - Retourne les résultats

### 2. `updateRelanceStatus(relanceId, newStatus)`
- **Description** : Met à jour le statut d'une relance
- **Paramètres** :
  - `relanceId` (String) - ID de la relance Parse
  - `newStatus` (String) - Nouveau statut ("cancelled" ou "scheduled")
- **Retour** : Promise<Object> - Objet avec succès et message d'erreur éventuel
- **Fonctionnement** :
  - Met à jour le champ `is_sent` et `status`
  - Utilise `useMasterKey: true` pour les permissions
  - Gère les erreurs de sauvegarde

### 3. `createSequenceLog(sequenceId, action, details)`
- **Description** : Crée un log pour une séquence
- **Paramètres** :
  - `sequenceId` (String) - ID de la séquence
  - `action` (String) - Action effectuée (ex: "deactivation")
  - `details` (String) - Détails de l'action
- **Retour** : Promise<Object> - Objet Parse du log créé
- **Fonctionnement** :
  - Crée un pointer vers la séquence
  - Ajoute l'utilisateur courant si disponible
  - Sauvegarde dans la classe `SequenceLog`

### 4. `deactivateSequenceAndCancelRelances(sequenceId)`
- **Description** : Fonction principale pour désactiver une séquence et annuler ses relances
- **Paramètres** : `sequenceId` (String) - ID de la séquence à désactiver
- **Retour** : Promise<Object> - Objet avec le résultat de l'opération
- **Fonctionnement** :
  1. Récupère les relances planifiées
  2. Si aucune relance : crée un log et retourne
  3. Boucle sur chaque relance pour les annuler
  4. Gère les erreurs partielles
  5. Crée le log approprié
  6. Désactive la séquence
  7. Retourne le résultat

## Fonctions Cloud Exposées

### `deactivateSequence(sequenceId)`
- **Endpoint** : `/functions/deactivateSequence`
- **Méthode** : POST
- **Paramètres** : `{ "sequenceId": "ID_DE_LA_SEQUENCE" }`
- **Retour** : 
  - Succès : `{ success: true, message: "X relances annulées avec succès", cancelledCount: X }`
  - Échec partiel : `{ success: false, message: "X relance(s) n'ont pas pu être annulées", cancelledCount: Y, errorCount: Z, errors: [...] }`
  - Erreur : Lance une exception

### `getScheduledRelances(sequenceId)`
- **Endpoint** : `/functions/getScheduledRelances`
- **Méthode** : POST
- **Paramètres** : `{ "sequenceId": "ID_DE_LA_SEQUENCE" }`
- **Retour** : Tableau des relances avec leurs informations

### `cancelRelance(relanceId)`
- **Endpoint** : `/functions/cancelRelance`
- **Méthode** : POST
- **Paramètres** : `{ "relanceId": "ID_DE_LA_RELANCE" }`
- **Retour** : `{ success: true, message: "Relance annulée avec succès" }` ou erreur

## Scénarios d'Acceptation Implémentés

### ✅ Scénario 1 : Désactivation avec relances planifiées
- Récupère les relances planifiées
- Annule chaque relance (met à jour le statut)
- Crée un log avec le nombre de relances annulées
- Désactive la séquence

### ✅ Scénario 2 : Désactivation sans relances planifiées
- Vérifie qu'il n'y a aucune relance planifiée
- Crée un log indiquant "Aucune relance à annuler"
- Désactive la séquence

### ✅ Scénario 3 : Échec de l'annulation des relances
- Gère les erreurs partielles lors de l'annulation
- Continue avec les autres relances
- Crée un log avec le compte des succès/échecs
- Retourne les détails des erreurs
- Affiche un message approprié à l'utilisateur

## Intégration avec l'Interface Utilisateur

Pour utiliser ces fonctions depuis l'interface Alpine.js :

```javascript
// Dans votre state Alpine.js
async function deactivateSequence(sequenceId) {
  try {
    this.loading = true;
    this.error = null;
    
    const response = await Parse.Cloud.run('deactivateSequence', { sequenceId });
    
    if (response.success) {
      this.showToast(response.message, 'success');
      // Rafraîchir les données
      await this.loadSequences();
    } else {
      this.showToast(response.message, 'warning');
      // Afficher les détails des erreurs si nécessaire
      if (response.errors && response.errors.length > 0) {
        console.error('Erreurs détaillées:', response.errors);
      }
    }
  } catch (error) {
    console.error('Erreur:', error);
    this.showToast(error.message || 'Erreur lors de la désactivation', 'error');
  } finally {
    this.loading = false;
  }
}
```

## Tests Unitaires

Le fichier `test.js` contient des tests complets pour toutes les fonctions :

- Tests pour `getScheduledRelancesForSequence`
- Tests pour `updateRelanceStatus`
- Tests pour `createSequenceLog`
- Tests pour `deactivateSequenceAndCancelRelances` (incluant les 3 scénarios)

Pour exécuter les tests :

```bash
cd cloud_functions
npm install
npm test
```

## Déploiement

1. Copier les fichiers dans le dossier `cloud/` de votre serveur Parse :
   ```bash
   cp cloud_functions/*.js parse-server/cloud/
   ```

2. Redémarrer votre serveur Parse pour charger les nouvelles fonctions cloud.

3. Vérifier que les fonctions sont disponibles via l'API Parse.

## Journalisation

Toutes les actions sont journalisées dans la classe `SequenceLog` avec :
- `sequence` : Pointer vers la séquence concernée
- `action` : Type d'action ("deactivation", "deactivation_error")
- `details` : Détails spécifiques à l'action
- `user` : Utilisateur ayant effectué l'action (si connecté)
- `createdAt` : Date de création automatique

## Gestion des Erreurs

- Les erreurs sont capturées et journalisées
- Les erreurs partielles sont gérées sans bloquer l'ensemble du processus
- Des messages clairs sont retournés à l'utilisateur
- Les détails techniques sont disponibles dans les logs

## Sécurité

- Utilisation de `useMasterKey: true` pour les opérations sensibles
- Validation des paramètres d'entrée
- Gestion des permissions via Parse Server

## Performances

- Requêtes optimisées avec filtres Parse Query
- Traitement en boucle avec gestion des erreurs individuelles
- Pas de requêtes N+1 (toutes les données sont chargées en une fois)

## Évolution Possible

- Ajouter des notifications par email aux responsables
- Implémenter un système de réessai pour les échecs
- Ajouter des métriques et monitoring
- Implémenter un système de restauration des relances annulées