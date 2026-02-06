# Parse Server Cloud Functions - Synchronisation des Impayés

Ce dossier contient les fonctions cloud pour Parse Server, incluant la fonction de synchronisation des impayés.

## Structure

- `main.js` : Point d'entrée principal des fonctions cloud
- `syncImpayes.js` : Fonction de synchronisation des impayés avec PostgreSQL et Parse Server
- `package.json` : Dépendances nécessaires pour les fonctions cloud
- `.env.example` : Exemple de configuration des variables d'environnement

## Configuration

### Variables d'environnement

Copiez le fichier `.env.example` en `.env` et configurez les variables suivantes :

```env
# Configuration pour la base de données PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=votre_utilisateur
DB_PASSWORD=votre_mot_de_passe
DB_NAME=votre_base_de_donnees
```

### Installation des dépendances

```bash
cd parse-server/cloud
npm install
```

## Utilisation

### Appel de la fonction cloud

La fonction `syncImpayes` peut être appelée depuis un client Parse de la manière suivante :

```javascript
// Depuis un client JavaScript/TypeScript
const result = await Parse.Cloud.run('syncImpayes');

console.log(result);
```

### Réponse de la fonction

La fonction retourne un objet avec les informations suivantes :

- `success` : Booléen indiquant si la synchronisation a réussi
- `message` : Message descriptif
- `inserted` : Nombre de nouvelles entrées insérées
- `updated` : Nombre d'entrées mises à jour
- `skipped` : Nombre d'entrées inchangées
- `total` : Nombre total d'entrées traitées
- `error` : Message d'erreur (si applicable)
- `details` : Détails de l'erreur (si applicable)

### Exemple de réponse réussie

```json
{
  "success": true,
  "message": "Synchronisation terminée avec succès",
  "inserted": 5,
  "updated": 2,
  "skipped": 10,
  "total": 17
}
```

### Exemple de réponse en cas d'erreur

```json
{
  "success": false,
  "message": "Erreur lors de la synchronisation",
  "error": "Timeout: La requête PostgreSQL a dépassé le temps d'exécution maximum de 10 secondes.",
  "details": { ... }
}
```

## Fonctionnement

1. **Connexion à PostgreSQL** : La fonction se connecte à la base de données PostgreSQL en utilisant les informations de connexion fournies.

2. **Exécution de la requête** : Une requête SQL complexe est exécutée pour récupérer les factures impayées avec toutes les informations nécessaires.

3. **Récupération des données existantes** : Les données existantes dans Parse Server sont récupérées pour comparaison.

4. **Synchronisation** : Les données sont comparées et synchronisées :
   - Les nouvelles factures sont insérées
   - Les factures existantes avec des modifications sont mises à jour
   - Les factures inchangées sont ignorées

5. **Fermeture des connexions** : Les connexions à PostgreSQL sont correctement fermées.

## Gestion des erreurs

La fonction gère plusieurs types d'erreurs :

- Erreurs de connexion à PostgreSQL
- Timeouts de requêtes (10 secondes)
- Erreurs de validation des données
- Erreurs lors de l'insertion ou de la mise à jour des données

## Journalisation

La fonction fournit une journalisation détaillée dans les logs du serveur Parse, ce qui permet de suivre le processus de synchronisation et d'identifier les problèmes.

## Notes

- Assurez-vous que les variables d'environnement sont correctement configurées avant d'exécuter la fonction.
- La fonction utilise un timeout de 10 secondes pour les requêtes PostgreSQL afin d'éviter les blocages.
- Les mots de passe et informations sensibles sont masqués dans les logs.
- La fonction valide les types de données avant l'insertion ou la mise à jour dans Parse Server.