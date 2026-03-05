# Data Model: Variables

## Description
Ce modèle représente les variables disponibles pour être utilisées dans les templates d'emails. Les variables sont dynamiques et sont remplacées par les vraies valeurs lors de l'envoi des emails.

## Fields
| Field Name          | Type      | Description                                                                 | Example Value               |
|---------------------|-----------|-----------------------------------------------------------------------------|-----------------------------|
| `id`                | String    | Identifiant unique de la variable.                                          | "VAR-001"                 |
| `nom`               | String    | Nom de la variable.                                                        | "nom"                     |
| `description`       | String    | Description de la variable.                                                | "Nom du contact."          |
| `type`              | String    | Type de la variable (e.g., "texte", "nombre", "date").                 | "texte"                   |
| `exemple`           | String    | Exemple de valeur pour la variable.                                        | "Jean Dupont"             |
| `date_creation`     | Date      | Date de création de la variable.                                           | "2023-10-01"               |
| `date_modification`  | Date      | Date de la dernière modification de la variable.                           | "2023-10-15"               |

## Relationships
- **Template**: Une variable est utilisée dans un ou plusieurs templates d'emails.

## Example
```json
{
  "id": "VAR-001",
  "nom": "nom",
  "description": "Nom du contact.",
  "type": "texte",
  "exemple": "Jean Dupont",
  "date_creation": "2023-10-01",
  "date_modification": "2023-10-15"
}
```