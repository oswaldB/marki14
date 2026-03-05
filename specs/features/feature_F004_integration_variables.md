# Feature: Intégration des Variables

## Description
Utiliser des variables (ex: `[[variable]]`) dans les templates d'emails, basées sur les colonnes de la classe Impayés. Les variables doivent être remplacées par les vraies valeurs lors de l'envoi des emails.

## User Flow
```mermaid
graph TD
    A[Utilisateur édite un template d'email] --> B[Insertion de variables dynamiques]
    B --> C[Sauvegarde du template]
    C --> D[Activation de la séquence]
    D --> E[Remplacement des variables par les vraies valeurs]
    E --> F[Envoi de l'email]
```