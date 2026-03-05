# Use Case: Gestion des Utilisateurs

## Description
L'administrateur (`admin=true`) gère les utilisateurs de son équipe. Le système permet de créer, modifier et supprimer des utilisateurs.

## User Flow
```mermaid
graph TD
    A[Administrateur accède à la gestion des utilisateurs] --> B[Choix de l'action: créer, modifier ou supprimer]
    B --> C[Sélection de l'utilisateur si applicable]
    C --> D[Exécution de l'action]
    D --> E[Sauvegarde des modifications]
```

## ASCII Screen
```
+---------------------------------------------------------------+
|  Gestion des Utilisateurs                                     |
|                                                               |
|  Utilisateurs:                                                 |
|  - Jean Dupont: [Modifier] [Supprimer]                         |
|  - Marie Martin: [Modifier] [Supprimer]                        |
|                                                               |
|  [Ajouter un utilisateur] [Exporter]                           |
+---------------------------------------------------------------+
```