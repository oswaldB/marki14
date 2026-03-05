# Data Model: Profils SMTP

## Description
Ce modèle représente les profils SMTP utilisés pour envoyer les emails de relance. Chaque profil contient les informations nécessaires pour se connecter à un serveur SMTP et envoyer des emails.

## Fields
| Field Name          | Type      | Description                                                                 | Example Value               |
|---------------------|-----------|-----------------------------------------------------------------------------|-----------------------------|
| `id`                | String    | Identifiant unique du profil SMTP.                                          | "SMTP-001"                |
| `nom`               | String    | Nom du profil SMTP.                                                         | "Profil Principal"         |
| `serveur`           | String    | Adresse du serveur SMTP.                                                    | "smtp.example.com"         |
| `port`              | Number    | Port du serveur SMTP.                                                       | 587                         |
| `utilisateur`       | String    | Nom d'utilisateur pour l'authentification SMTP.                             | "user@example.com"        |
| `mot_de_passe`      | String    | Mot de passe pour l'authentification SMTP (chiffré).                        | "encrypted_password"      |
| `signature_html`    | String    | Signature email en HTML.                                                   | "<p>Cordialement,<br>L'équipe de relance</p>" |
| `date_creation`     | Date      | Date de création du profil SMTP.                                            | "2023-10-01"               |
| `date_modification`  | Date      | Date de la dernière modification du profil SMTP.                           | "2023-10-15"               |

## Relationships
- **Séquence**: Un profil SMTP est utilisé par une ou plusieurs séquences de relance.

## Example
```json
{
  "id": "SMTP-001",
  "nom": "Profil Principal",
  "serveur": "smtp.example.com",
  "port": 587,
  "utilisateur": "user@example.com",
  "mot_de_passe": "encrypted_password",
  "signature_html": "<p>Cordialement,<br>L'équipe de relance</p>",
  "date_creation": "2023-10-01",
  "date_modification": "2023-10-15"
}
```