# Use Case: Pièces Jointes des Factures

## Description
Le système joint les factures PDF aux emails de relance. Les factures PDF doivent être incluses dans les emails envoyés.

## User Flow
```mermaid
graph TD
    A[Génération des emails de relance] --> B[Récupération des factures PDF associées]
    B --> C[Ajout des factures PDF en pièces jointes]
    C --> D[Envoi des emails avec les pièces jointes]
```

## ASCII Screen
```
+---------------------------------------------------------------+
|  Pièces Jointes des Factures                                  |
|                                                               |
|  Email de relance:                                             |
|  - Destinataire: jean.dupont@example.com                       |
|  - Pièces jointes: Facture_001.pdf                            |
|                                                               |
|  [Envoyer] [Annuler]                                           |
+---------------------------------------------------------------+
```