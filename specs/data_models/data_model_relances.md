# Data Model: Relances

## Description
Ce modèle représente les relances générées pour les factures impayées. Une relance est un email planifié pour être envoyé à un contact selon une séquence de relance.

## Fields
| Field Name          | Type      | Description                                                                 | Example Value               |
|---------------------|-----------|-----------------------------------------------------------------------------|-----------------------------|
| `id`                | String    | Identifiant unique de la relance.                                          | "REL-001"                 |
| `impaye_id`         | String    | Identifiant de la facture impayée associée.                                 | "IMP-001"                 |
| `contact_id`        | String    | Identifiant du contact destinataire.                                        | "CT-001"                  |
| `template_id`       | String    | Identifiant du template utilisé.                                            | "TEMPL-001"               |
| `sujet`             | String    | Sujet de l'email (avec variables remplacées).                               | "Rappel: Facture FACT-001 en retard" |
| `corps`             | String    | Corps de l'email (avec variables remplacées).                               | "Bonjour Jean Dupont,..."  |
| `date_envoi`        | Date      | Date prévue pour l'envoi de l'email.                                        | "2023-10-15"               |
| `statut`            | String    | Statut de la relance (e.g., "planifié", "envoyé", "échoué").            | "planifié"                |
| `date_envoi_reel`   | Date      | Date réelle d'envoi de l'email.                                            | "2023-10-15T18:00:00"     |
| `pieces_jointes`    | Array     | Liste des URLs des pièces jointes (factures PDF).                          | ["/ftp/factures/FACT-001.pdf"] |

## Relationships
- **Impayé**: Une relance est associée à une facture impayée.
- **Contact**: Une relance est envoyée à un contact.
- **Template**: Une relance utilise un template d'email.

## Example
```json
{
  "id": "REL-001",
  "impaye_id": "IMP-001",
  "contact_id": "CT-001",
  "template_id": "TEMPL-001",
  "sujet": "Rappel: Facture FACT-001 en retard",
  "corps": "Bonjour Jean Dupont,\n\nVotre facture FACT-001 d'un montant de 1500.00 est en retard.\n\nCordialement,",
  "date_envoi": "2023-10-15",
  "statut": "planifié",
  "date_envoi_reel": null,
  "pieces_jointes": ["/ftp/factures/FACT-001.pdf"]
}
```