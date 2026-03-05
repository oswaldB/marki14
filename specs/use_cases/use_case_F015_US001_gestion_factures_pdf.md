# Use Case: Gestion des Factures PDF

## Description
Le système stocke les factures PDF sur un FTP et construit les URLs des fichiers. L'utilisateur visualise les factures PDF depuis l'écran des factures impayées.

## User Flow
```mermaid
graph TD
    A[Importation des factures impayées] --> B[Construction des URLs des factures PDF]
    B --> C[Stockage des factures PDF sur FTP]
    C --> D[Affichage des factures PDF dans l'écran des factures impayées]
```

## ASCII Screen
```
+---------------------------------------------------------------+
|  Gestion des Factures PDF                                     |
|                                                               |
|  Factures PDF:                                                 |
|  - Facture 001: [Voir] [Télécharger]                           |
|  - Facture 002: [Voir] [Télécharger]                           |
|                                                               |
|  [Exporter]                                                    |
+---------------------------------------------------------------+
```