# Data Model: Templates

## Description
Ce modèle représente les templates d'emails utilisés dans les séquences de relance. Chaque template contient un sujet, un corps d'email, et des variables dynamiques.

## Fields
| Field Name          | Type      | Description                                                                 | Example Value               |
|---------------------|-----------|-----------------------------------------------------------------------------|-----------------------------|
| `id`                | String    | Identifiant unique du template.                                              | "TEMPL-001"               |
| `nom`               | String    | Nom du template.                                                             | "Premier Rappel"           |
| `sujet`             | String    | Sujet de l'email.                                                           | "Rappel: Facture [[reference]] en retard" |
| `corps`             | String    | Corps de l'email en format HTML ou Markdown.                                | "Bonjour [[nom]],..."      |
| `variables`         | Array     | Liste des variables utilisées dans le template.                             | ["[[nom]]", "[[montant]]"] |
| `date_creation`     | Date      | Date de création du template.                                               | "2023-10-01"               |
| `date_modification`  | Date      | Date de la dernière modification du template.                               | "2023-10-15"               |
| `sequence_id`       | String    | Identifiant de la séquence à laquelle le template appartient.              | "SEQ-001"                 |

## Relationships
- **Séquence**: Un template appartient à une séquence de relance.
- **Relance**: Un template est utilisé pour générer des relances.

## Example
```json
{
  "id": "TEMPL-001",
  "nom": "Premier Rappel",
  "sujet": "Rappel: Facture [[reference]] en retard",
  "corps": "Bonjour [[nom]],\n\nVotre facture [[reference]] d'un montant de [[montant]] est en retard.\n\nCordialement,",
  "variables": ["[[nom]]", "[[montant]]", "[[reference]]"],
  "date_creation": "2023-10-01",
  "date_modification": "2023-10-15",
  "sequence_id": "SEQ-001"
}
```