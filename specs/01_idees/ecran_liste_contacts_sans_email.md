# Fiche d'Implémentation : Écran de Liste des Contacts Sans Email

## Lien Epic
- À définir

## Feature
- **Description** : Créer un écran qui liste tous les contacts (payeurs et apporteurs d'affaires) qui n'ont pas d'email.

## Data Model
- **State** :
  - `contacts`: Liste des contacts sans email, incluant le nombre de factures et le montant total par acteur.
  - `filtres`: Filtres pour trier ou rechercher des contacts spécifiques.
  - Récupération des données directement via une API REST en mode x-data.

## Vue ASCII
```
+----------------------------------------------------------------------+
| Liste des Contacts Sans Email                                        |
+----------------------------------------------------------------------+
| Filtres: [Tous] [Payeurs] [Apport. Affaires]                        |
+----------------------------------------------------------------------+
| Recherche: [__________________] [Rechercher]                         |
+----------------------------------------------------------------------+
|                                                                      |
| Nom              | Type          | Téléphone      | Factures | Montant |
|------------------|---------------|----------------|----------|---------|
| Dupont Jean       | Payeur        | 0123456789     |    5     | 1250€   |
| Martin Sophie     | Apport. Aff.  | 0987654321     |    2     | 450€    |
| ...              | ...           | ...            |   ...    |  ...    |
|                                                                      |
+----------------------------------------------------------------------+
| [Exporter en CSV]                                                    |
+----------------------------------------------------------------------+
```

## Implémentation
- **Frontend** :
  - Utiliser Alpine.js pour l'interface utilisateur.
  - Intégrer un tableau dynamique pour afficher les contacts.
  - Ajouter des filtres pour distinguer les payeurs et les apporteurs d'affaires.
  - Implémenter une fonctionnalité de recherche.
  - Bouton pour exporter la liste en CSV.
  - Afficher le nombre de factures et le montant total pour chaque contact.

- **Backend** :
  - Développer une API REST pour récupérer les contacts sans email.
  - Filtrer les résultats côté serveur pour optimiser les performances.
  - Assurer la sécurité des données (accès autorisé uniquement).

- **Tests** :
  - Écrire des tests unitaires pour les composants Alpine.js.
  - Tester l'API pour s'assurer qu'elle retourne les bons résultats.
  - Vérifier l'export CSV pour s'assurer que les données sont correctement formatées.

## Suivi et Mise à Jour
- **Priorité** : À définir lors de la réunion de planification.
- **Outils** : Utiliser Jira ou GitHub Projects pour suivre l'avancement.