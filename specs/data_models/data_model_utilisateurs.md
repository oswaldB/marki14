# Data Model: Utilisateurs

## Description
Ce modèle représente les utilisateurs du système. Les utilisateurs peuvent être des administrateurs ou des membres de l'équipe, avec des permissions spécifiques.

## Fields
| Field Name          | Type      | Description                                                                 | Example Value               |
|---------------------|-----------|-----------------------------------------------------------------------------|-----------------------------|
| `id`                | String    | Identifiant unique de l'utilisateur.                                        | "USER-001"                |
| `username`          | String    | Nom d'utilisateur pour la connexion.                                        | "jdupont"                 |
| `nom`               | String    | Nom complet de l'utilisateur.                                               | "Jean Dupont"             |
| `email`             | String    | Adresse email de l'utilisateur.                                            | "jean.dupont@example.com"  |
| `mot_de_passe`      | String    | Mot de passe chiffré de l'utilisateur.                                      | "encrypted_password"      |
| `admin`             | Boolean   | Indique si l'utilisateur est un administrateur.                            | true                        |
| `date_creation`     | Date      | Date de création de l'utilisateur.                                          | "2023-10-01"               |
| `date_modification`  | Date      | Date de la dernière modification de l'utilisateur.                         | "2023-10-15"               |

## Relationships
- **Utilisateur**: Un administrateur peut gérer d'autres utilisateurs.

## Example
```json
{
  "id": "USER-001",
  "username": "jdupont",
  "nom": "Jean Dupont",
  "email": "jean.dupont@example.com",
  "mot_de_passe": "encrypted_password",
  "admin": true,
  "date_creation": "2023-10-01",
  "date_modification": "2023-10-15"
}
```