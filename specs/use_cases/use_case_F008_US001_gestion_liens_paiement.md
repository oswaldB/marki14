# Use Case: Gestion des Liens de Paiement

## Description
L'utilisateur crée et édite un lien de paiement avec des variables via un drawer/slider. Le système stocke le lien de paiement et permet de le copier-coller.

## User Flow
```mermaid
graph TD
    A[Utilisateur accède à l'éditeur de liens de paiement] --> B[Création ou modification d'un lien de paiement]
    B --> C[Insertion de variables dynamiques]
    C --> D[Prévisualisation du lien]
    D --> E[Sauvegarde du lien de paiement]
```

## ASCII Screen
```
+---------------------------------------------------------------+
|  Gestion des Liens de Paiement                                |
|                                                               |
|  Lien de paiement: [_____________________________________]  |
|                                                               |
|  Variables disponibles: [[montant]], [[reference]]            |
|                                                               |
|  [Prévisualiser] [Copier] [Sauvegarder]                       |
+---------------------------------------------------------------+
```