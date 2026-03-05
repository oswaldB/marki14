# Système de Progression d'Implémentation

## Objectif
Organiser la progression des écrans et des features à travers différentes étapes : idées, à implémenter, à coder, à valider par un humain, et implémenté.

## Structure des Fiches d'Implémentation
Chaque fiche d'implémentation doit contenir les sections suivantes :

1. **Lien Epic** : Lien vers l'épic associé dans le système de gestion de projet.
2. **Feature** : Description de la feature.
3. **Data Model** :
   - **State** : Description de l'état de la feature.
   - **Store** : Description du stockage des données.
4. **Vue ASCII** : Représentation visuelle de la feature (si nécessaire).
5. **Implémentation** : Détails techniques sur l'implémentation.

## Processus de Progression

### 1. Idées
- **Description** : Toutes les nouvelles idées sont ajoutées ici.
- **Action** : Discuter et affiner les idées pour les transformer en features potentielles.

### 2. À Implémenter
- **Description** : Features validées et prêtes à être développées.
- **Action** : Prioriser les features et les assigner aux développeurs.

### 3. À Coder
- **Description** : Features en cours de développement.
- **Action** : Développer la feature selon les spécifications.

### 4. À Valider par un Humain
- **Description** : Features développées et prêtes pour la revue.
- **Action** : Revue de code et validation par un pair ou un responsable.

### 5. Implémenté
- **Description** : Features validées et déployées.
- **Action** : Documentation et suivi post-déploiement.

## Exemple de Fiche d'Implémentation

### Lien Epic
- [Lien vers l'épic](#)

### Feature
- **Description** : Ajouter un système de notification pour les utilisateurs.

### Data Model
- **State** :
  - `notifications`: Liste des notifications.
  - `unreadCount`: Nombre de notifications non lues.
- **Store** :
  - Stockage local avec IndexedDB.
  - Synchronisation avec le serveur via API REST.

### Vue ASCII
```
+---------------------+
| Notifications       |
+---------------------+
| [1] Nouvelle message |
| [2] Rappel          |
+---------------------+
```

### Implémentation
- **Frontend** : Utiliser React pour l'interface utilisateur.
- **Backend** : Développer une API REST pour gérer les notifications.
- **Tests** : Écrire des tests unitaires et d'intégration.

## Suivi et Mise à Jour
- **Réunions hebdomadaires** : Revue des fiches et mise à jour des statuts.
- **Outils** : Utiliser des outils comme Jira, Trello, ou GitHub Projects pour suivre les fiches.

## Conclusion
Ce système permet une gestion claire et structurée des features, assurant une progression fluide de l'idée à l'implémentation.