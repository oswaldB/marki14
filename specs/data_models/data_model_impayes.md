# Data Model: Impayés

## Description
Ce modèle représente les factures impayées importées dans le système. Il contient les informations nécessaires pour identifier les factures, leurs montants, leurs dates d'échéance, et les contacts associés.

## Fields
| Field Name          | Type      | Description                                                                 | Example Value               |
|---------------------|-----------|-----------------------------------------------------------------------------|-----------------------------|
| `id`                | String    | Identifiant unique de la facture impayée.                                  | "IMP-001"                  |
| `reference`          | String    | Référence de la facture.                                                   | "FACT-2023-001"            |
| `montant`           | Number    | Montant de la facture impayée.                                             | 1500.00                     |
| `date_echeance`     | Date      | Date d'échéance de la facture.                                            | "2023-10-15"               |
| `date_import`       | Date      | Date d'importation de la facture dans le système.                         | "2023-10-01"               |
| `statut`            | String    | Statut de la facture (e.g., "impayé", "partiellement payé", "réglé").  | "impayé"                   |
| `contact_id`        | String    | Identifiant du contact associé (payeur ou apporteur d'affaires).            | "CT-001"                   |
| `payeur_id`         | String    | Identifiant du payeur si différent du contact.                             | "CT-002"                   |
| `apporteur_id`      | String    | Identifiant de l'apporteur d'affaires si applicable.                       | "CT-003"                   |
| `sequence_id`       | String    | Identifiant de la séquence de relance associée.                            | "SEQ-001"                  |
| `facture_pdf_url`   | String    | URL du fichier PDF de la facture stocké sur le FTP.                        | "/ftp/factures/FACT-001.pdf" |
| `notes`             | String    | Notes supplémentaires sur la facture.                                    | "Client contacté le 10/10"  |

## Relationships
- **Contact**: Un impayé est associé à un ou plusieurs contacts (payeur et/ou apporteur d'affaires).
- **Séquence**: Un impayé peut être associé à une séquence de relance.
- **Relance**: Un impayé peut générer plusieurs relances.

## Example
```json
{
  "id": "IMP-001",
  "reference": "FACT-2023-001",
  "montant": 1500.00,
  "date_echeance": "2023-10-15",
  "date_import": "2023-10-01",
  "statut": "impayé",
  "contact_id": "CT-001",
  "payeur_id": "CT-002",
  "apporteur_id": "CT-003",
  "sequence_id": "SEQ-001",
  "facture_pdf_url": "/ftp/factures/FACT-001.pdf",
  "notes": "Client contacté le 10/10"
}
```