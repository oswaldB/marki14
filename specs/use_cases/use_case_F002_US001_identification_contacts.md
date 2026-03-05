# Use Case: Identification des Contacts

## Description
Le système identifie les contacts (payeurs ou apporteurs d'affaires) dans les factures importées. Les contacts sont enregistrés dans la classe Parse Contacts.

## User Flow
```mermaid
graph TD
    A[Importation des factures impayées] --> B[Analyse des contacts associés]
    B --> C{Contact déjà enregistré?}
    C -->|Oui| D[Association du contact à la facture]
    C -->|Non| E[Enregistrement du contact dans Parse Contacts]
    E --> D
```

## ASCII Screen
```
+---------------------------------------------------------------+
|  Identification des Contacts                                  |
|                                                               |
|  Contacts identifiés:                                          |
|  - Payeur: Jean Dupont                                         |
|  - Apporteur d'affaires: Marie Martin                         |
|                                                               |
|  [Enregistrer] [Annuler]                                       |
+---------------------------------------------------------------+
```