# Feature: Attribution des Séquences

## Description
Attribuer des séquences aux factures impayées de manière unitaire ou groupée (par payeur ou contact). Les séquences doivent être associées aux factures pour générer les relances.

## User Flow
```mermaid
graph TD
    A[Utilisateur accède à l'écran des factures impayées] --> B[Sélection des factures]
    B --> C[Choix de l'attribution unitaire ou groupée]
    C --> D[Association de la séquence aux factures sélectionnées]
    D --> E[Sauvegarde des associations]
```