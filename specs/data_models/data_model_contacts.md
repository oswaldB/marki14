# Data Model: Contacts

## Description
Ce modèle représente les contacts associés aux factures impayées. Un contact peut être un payeur ou un apporteur d'affaires. Il contient les informations nécessaires pour identifier et contacter les personnes ou entités associées aux factures.

## Fields
| Field Name          | Type      | Description                                                                 | Example Value               |
|---------------------|-----------|-----------------------------------------------------------------------------|-----------------------------|
| `id`                | String    | Identifiant unique du contact.                                              | "CT-001"                  |
| `nom`               | String    | Nom du contact.                                                             | "Jean Dupont"             |
| `email`             | String    | Adresse email du contact.                                                   | "jean.dupont@example.com"  |
| `telephone`         | String    | Numéro de téléphone du contact.                                             | "+33123456789"            |
| `type`              | String    | Type de contact (e.g., "payeur", "apporteur d'affaires").                 | "payeur"                  |
| `adresse`          | String    | Adresse postale du contact.                                                 | "1 Rue de Paris, 75000 Paris" |
| `entreprise`        | String    | Nom de l'entreprise associée au contact.                                    | "Entreprise XYZ"          |
| `date_creation`     | Date      | Date de création du contact dans le système.                                | "2023-10-01"               |
| `notes`             | String    | Notes supplémentaires sur le contact.                                      | "Client régulier"         |

## Relationships
- **Impayé**: Un contact peut être associé à plusieurs factures impayées (en tant que payeur ou apporteur d'affaires).
- **Relance**: Un contact peut recevoir plusieurs relances.

## Example
```json
{
  "id": "CT-001",
  "nom": "Jean Dupont",
  "email": "jean.dupont@example.com",
  "telephone": "+33123456789",
  "type": "payeur",
  "adresse": "1 Rue de Paris, 75000 Paris",
  "entreprise": "Entreprise XYZ",
  "date_creation": "2023-10-01",
  "notes": "Client régulier"
}
```