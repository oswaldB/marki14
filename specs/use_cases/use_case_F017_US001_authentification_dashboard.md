# Use Case: Authentification et Dashboard

## Description
L'utilisateur se connecte avec un username et accède au dashboard. Le système affiche des informations pertinentes sur le dashboard.

## User Flow
```mermaid
graph TD
    A[Utilisateur accède à l'écran de login] --> B[Saisie du username et du mot de passe]
    B --> C[Validation des informations]
    C --> D{Informations valides?}
    D -->|Oui| E[Redirection vers le dashboard]
    D -->|Non| F[Affichage des erreurs et retour à l'étape B]
```

## ASCII Screen
```
+---------------------------------------------------------------+
|  Authentification                                              |
|                                                               |
|  Username: [_______________________________________________]  |
|  Mot de passe: [___________________________________________]  |
|                                                               |
|  [Se connecter] [Mot de passe oublié?]                        |
|                                                               |
|  Messages:                                                     |
|  - Connexion réussie.                                          |
|  - Erreur: Username ou mot de passe incorrect.                |
+---------------------------------------------------------------+
```