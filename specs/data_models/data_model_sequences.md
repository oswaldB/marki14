# Data Model: Séquences

## Description
Ce modèle représente les séquences de relance utilisées pour envoyer des emails aux contacts associés aux factures impayées. Une séquence contient plusieurs templates d'emails avec des variables dynamiques.

## Fields
| Field Name          | Type      | Description                                                                 | Example Value               |
|---------------------|-----------|-----------------------------------------------------------------------------|-----------------------------|
| `id`                | String    | Identifiant unique de la séquence.                                          | "SEQ-001"                 |
| `nom`               | String    | Nom de la séquence.                                                         | "Relance Standard"        |
| `description`       | String    | Description de la séquence.                                                | "Séquence de relance standard pour les factures impayées." |
| `templates`         | Array     | Liste des templates d'emails associés à la séquence.                        | ["TEMPL-001", "TEMPL-002"] |
| `delai`            | Number    | Délai en jours avant l'envoi de la première relance.                      | 7                           |
| `date_creation`     | Date      | Date de création de la séquence.                                           | "2023-10-01"               |
| `date_modification`  | Date      | Date de la dernière modification de la séquence.                           | "2023-10-15"               |
| `smtp_profile_id`    | String    | Identifiant du profil SMTP utilisé pour envoyer les emails.                | "SMTP-001"                |
| `lien_paiement`      | String    | Lien de paiement associé à la séquence.                                   | "https://paiement.example.com/?ref=[[reference]]" |
| `actif`             | Boolean   | Indique si la séquence est active.                                         | true                        |

## Relationships
- **Template**: Une séquence contient plusieurs templates d'emails.
- **Impayé**: Une séquence peut être associée à plusieurs factures impayées.
- **Relance**: Une séquence génère plusieurs relances.
- **Profil SMTP**: Une séquence utilise un profil SMTP pour l'envoi des emails.

## Example
```json
{
  "id": "SEQ-001",
  "nom": "Relance Standard",
  "description": "Séquence de relance standard pour les factures impayées.",
  "templates": ["TEMPL-001", "TEMPL-002"],
  "delai": 7,
  "date_creation": "2023-10-01",
  "date_modification": "2023-10-15",
  "smtp_profile_id": "SMTP-001",
  "lien_paiement": "https://paiement.example.com/?ref=[[reference]]",
  "actif": true
}
```