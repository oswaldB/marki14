# Feature: Authentification et Dashboard

## Description
Créer un écran de login avec un username et un dashboard avec des informations pertinentes. L'utilisateur doit pouvoir se connecter et accéder à un dashboard personnalisé.

## User Flow
```mermaid
graph TD
    A[Utilisateur accède à l'écran de login] --> B[Saisie du username et du mot de passe]
    B --> C[Validation des informations]
    C --> D{Informations valides?}
    D -->|Oui| E[Redirection vers le dashboard]
    D -->|Non| F[Affichage des erreurs et retour à l'étape B]
```