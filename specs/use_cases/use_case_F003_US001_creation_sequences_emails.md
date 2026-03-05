# Use Case: Création de Séquences d'Emails

## Description
L'utilisateur crée une séquence d'emails avec des templates éditables via Toast Editor UI. Les variables (ex: `[[variable]]`) sont intégrées dans les templates.

## User Flow
```mermaid
graph TD
    A[Utilisateur accède à l'éditeur de séquences] --> B[Création d'une séquence]
    B --> C[Ajout de templates d'emails avec variables]
    C --> D[Prévisualisation des templates]
    D --> E{Séquence validée?}
    E -->|Oui| F[Sauvegarde de la séquence]
    E -->|Non| B
```

## ASCII Screen
```
+---------------------------------------------------------------+
|  Création de Séquences d'Emails                              |
|                                                               |
|  Nom de la séquence: [_____________________________________]  |
|                                                               |
|  Templates:                                                    |
|  [Ajouter un template] [Prévisualiser] [Sauvegarder]          |
|                                                               |
|  Variables disponibles: [[nom]], [[montant]], [[date]]        |
+---------------------------------------------------------------+
```