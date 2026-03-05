# Feature: Gestion des Contacts Sans Email

## Description
Afficher une page spéciale pour les contacts sans email, avec leur montant et le nombre de factures associées. L'utilisateur peut prendre des mesures pour ajouter des emails aux contacts.

## User Flow
```mermaid
graph TD
    A[Utilisateur accède à la page des contacts sans email] --> B[Affichage des contacts sans email]
    B --> C[Sélection d'un contact]
    C --> D[Ajout ou modification de l'email du contact]
    D --> E[Sauvegarde des modifications]
```