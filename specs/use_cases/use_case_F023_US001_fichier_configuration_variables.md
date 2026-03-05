# Use Case: Fichier de Configuration des Variables

## Description
Le système utilise un fichier `/static/configs/variables.json` pour les variables disponibles. Les variables doivent être accessibles et copiables pour être utilisées dans les templates d'emails.

## User Flow
```mermaid
graph TD
    A[Utilisateur accède à l'éditeur de templates] --> B[Ouverture du fichier de configuration des variables]
    B --> C[Copie des variables disponibles]
    C --> D[Insertion des variables dans les templates]
```

## ASCII Screen
```
+---------------------------------------------------------------+
|  Fichier de Configuration des Variables                       |
|                                                               |
|  Variables disponibles:                                        |
|  - [[nom]]                                                     |
|  - [[montant]]                                                 |
|  - [[date]]                                                    |
|                                                               |
|  [Copier] [Fermer]                                             |
+---------------------------------------------------------------+
```