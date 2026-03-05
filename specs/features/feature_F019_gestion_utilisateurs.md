# Feature: Gestion des Utilisateurs

## Description
Permettre aux administrateurs (`admin=true`) de gérer les utilisateurs de leur équipe. Les administrateurs doivent pouvoir créer, modifier et supprimer des utilisateurs.

## User Flow
```mermaid
graph TD
    A[Administrateur accède à la gestion des utilisateurs] --> B[Choix de l'action: créer, modifier ou supprimer]
    B --> C[Sélection de l'utilisateur si applicable]
    C --> D[Exécution de l'action]
    D --> E[Sauvegarde des modifications]
```