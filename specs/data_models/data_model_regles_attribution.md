# Data Model: Règles d'Attribution

## Description
Ce modèle représente les règles d'attribution automatique des séquences aux factures impayées. Les règles permettent de filtrer les factures et d'attribuer des séquences en fonction de critères spécifiques.

## Fields
| Field Name          | Type      | Description                                                                 | Example Value               |
|---------------------|-----------|-----------------------------------------------------------------------------|-----------------------------|
| `id`                | String    | Identifiant unique de la règle.                                             | "RULE-001"                |
| `nom`               | String    | Nom de la règle.                                                            | "Règle Montant Élevé"      |
| `description`       | String    | Description de la règle.                                                    | "Attribuer une séquence aux factures de plus de 1000€." |
| `filtres`           | Array     | Liste des filtres appliqués (incluant ou excluant).                         | ["montant > 1000", "statut = impayé"] |
| `sequence_id`       | String    | Identifiant de la séquence attribuée.                                       | "SEQ-001"                 |
| `date_creation`     | Date      | Date de création de la règle.                                               | "2023-10-01"               |
| `date_modification`  | Date      | Date de la dernière modification de la règle.                               | "2023-10-15"               |
| `actif`             | Boolean   | Indique si la règle est active.                                             | true                        |

## Relationships
- **Séquence**: Une règle est associée à une séquence de relance.
- **Impayé**: Une règle s'applique à des factures impayées.

## Example
```json
{
  "id": "RULE-001",
  "nom": "Règle Montant Élevé",
  "description": "Attribuer une séquence aux factures de plus de 1000€.",
  "filtres": ["montant > 1000", "statut = impayé"],
  "sequence_id": "SEQ-001",
  "date_creation": "2023-10-01",
  "date_modification": "2023-10-15",
  "actif": true
}
```