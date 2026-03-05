# Use Case: Gestion des Délais

## Description
L'utilisateur configure un délai pour les relances. Le système stocke la date d'envoi dans la colonne `date_envoi` de la table Relances.

## User Flow
```mermaid
graph TD
    A[Utilisateur édite une séquence] --> B[Configuration du délai pour les relances]
    B --> C[Sauvegarde du délai]
    C --> D[Calcul de la date d'envoi]
    D --> E[Stockage de la date d'envoi dans la table Relances]
```

## ASCII Screen
```
+---------------------------------------------------------------+
|  Gestion des Délais                                            |
|                                                               |
|  Délai (jours): [____]                                         |
|                                                               |
|  Date d'envoi calculée: 15/10/2023                             |
|                                                               |
|  [Sauvegarder] [Annuler]                                       |
+---------------------------------------------------------------+
```