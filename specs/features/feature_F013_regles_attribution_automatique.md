# Feature: Règles d'Attribution Automatique

## Description
Créer des règles pour attribuer automatiquement des séquences aux factures impayées, avec des filtres incluant ou excluant. Les règles doivent être appliquées aux factures sans séquence associée.

## User Flow
```mermaid
graph TD
    A[Utilisateur accède à la gestion des règles] --> B[Création ou modification d'une règle]
    B --> C[Configuration des filtres incluant ou excluant]
    C --> D[Application de la règle aux factures sans séquence]
    D --> E[Sauvegarde de la règle]
```