# Feature: Gestion des Séquences d'Emails

## Description
Créer et modifier des séquences d'emails avec des templates éditables via Toast Editor UI. Les séquences doivent inclure des variables dynamiques basées sur les colonnes de la classe Impayés.

## User Flow
```mermaid
graph TD
    A[Utilisateur accède à l'éditeur de séquences] --> B[Création ou modification d'une séquence]
    B --> C[Ajout de templates d'emails avec variables]
    C --> D[Prévisualisation des templates]
    D --> E{Séquence validée?}
    E -->|Oui| F[Sauvegarde de la séquence]
    E -->|Non| B
```