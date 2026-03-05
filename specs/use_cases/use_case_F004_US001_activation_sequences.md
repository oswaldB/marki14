# Use Case: Activation des Séquences

## Description
L'utilisateur active une séquence pour une ou plusieurs factures impayées. Le système génère des relances avec les variables remplacées par les vraies valeurs.

## User Flow
```mermaid
graph TD
    A[Utilisateur sélectionne une séquence] --> B[Association de la séquence aux factures impayées]
    B --> C[Génération des relances]
    C --> D[Remplacement des variables par les vraies valeurs]
    D --> E[Planification des relances selon les délais]
    E --> F[Sauvegarde des relances dans la base de données]
```

## ASCII Screen
```
+---------------------------------------------------------------+
|  Activation des Séquences                                     |
|                                                               |
|  Séquence sélectionnée: Relance Standard                      |
|                                                               |
|  Factures associées:                                          |
|  - Facture 001: Jean Dupont                                    |
|  - Facture 002: Marie Martin                                  |
|                                                               |
|  [Activer] [Annuler]                                           |
+---------------------------------------------------------------+
```