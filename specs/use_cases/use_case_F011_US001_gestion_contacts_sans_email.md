# Use Case: Gestion des Contacts Sans Email

## Description
Le système affiche une page spéciale pour les contacts sans email, avec leur montant et le nombre de factures associées. L'utilisateur peut prendre des mesures pour ajouter des emails aux contacts.

## User Flow
```mermaid
graph TD
    A[Utilisateur accède à la page des contacts sans email] --> B[Affichage des contacts sans email]
    B --> C[Sélection d'un contact]
    C --> D[Ajout ou modification de l'email du contact]
    D --> E[Sauvegarde des modifications]
```

## ASCII Screen
```
+---------------------------------------------------------------+
|  Gestion des Contacts Sans Email                              |
|                                                               |
|  Contacts sans email:                                          |
|  - Jean Dupont - Montant: 1000€ - Factures: 2                  |
|  - Marie Martin - Montant: 1500€ - Factures: 3                |
|                                                               |
|  [Ajouter un email] [Exporter]                                |
+---------------------------------------------------------------+
```