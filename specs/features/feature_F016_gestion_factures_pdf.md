# Feature: Gestion des Factures PDF

## Description
Stocker et afficher les factures PDF via un FTP, avec construction des URLs lors de l'import. Les factures PDF doivent être accessibles depuis l'écran des factures impayées.

## User Flow
```mermaid
graph TD
    A[Importation des factures impayées] --> B[Construction des URLs des factures PDF]
    B --> C[Stockage des factures PDF sur FTP]
    C --> D[Affichage des factures PDF dans l'écran des factures impayées]
```