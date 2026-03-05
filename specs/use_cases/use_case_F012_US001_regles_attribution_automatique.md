# Use Case: Règles d'Attribution Automatique

## Description
L'utilisateur crée des règles pour attribuer automatiquement des séquences aux factures impayées, avec des filtres incluant ou excluant. Le système applique les règles et met à jour les associations.

## User Flow
```mermaid
graph TD
    A[Utilisateur accède à la gestion des règles] --> B[Création ou modification d'une règle]
    B --> C[Configuration des filtres incluant ou excluant]
    C --> D[Application de la règle aux factures sans séquence]
    D --> E[Sauvegarde de la règle]
```

## ASCII Screen
```
+---------------------------------------------------------------+
|  Règles d'Attribution Automatique                             |
|                                                               |
|  Filtres:                                                      |
|  - Inclure: Montant > 1000€                                    |
|  - Exclure: Factures réglées                                    |
|                                                               |
|  [Appliquer] [Sauvegarder] [Annuler]                           |
+---------------------------------------------------------------+
```