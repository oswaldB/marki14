# Feature: Gestion des Liens de Paiement

## Description
Créer et éditer des liens de paiement avec des variables, accessibles via un drawer/slider. Les liens de paiement doivent être intégrés dans les templates d'emails.

## User Flow
```mermaid
graph TD
    A[Utilisateur accède à l'éditeur de liens de paiement] --> B[Création ou modification d'un lien de paiement]
    B --> C[Insertion de variables dynamiques]
    C --> D[Prévisualisation du lien]
    D --> E[Sauvegarde du lien de paiement]
```