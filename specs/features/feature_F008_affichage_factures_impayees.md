# Feature: Affichage des Factures Impayées

## Description
Afficher les factures impayées de manière unitaire ou groupée (par payeur ou contact), incluant les détails des contacts et les actions associées.

## User Flow
```mermaid
graph TD
    A[Utilisateur accède à l'écran des factures impayées] --> B[Choix du mode d'affichage: unitaire ou groupé]
    B --> C{Affichage groupé?}
    C -->|Oui| D[Sélection du critère de groupement: payeur ou contact]
    C -->|Non| E[Affichage des factures de manière unitaire]
    D --> E
```