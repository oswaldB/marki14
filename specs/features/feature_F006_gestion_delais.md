# Feature: Gestion des Délais

## Description
Configurer des délais pour les relances, stockés dans la colonne `date_envoi` de la table Relances. Les délais déterminent quand les emails de relance doivent être envoyés.

## User Flow
```mermaid
graph TD
    A[Utilisateur édite une séquence] --> B[Configuration du délai pour les relances]
    B --> C[Sauvegarde du délai]
    C --> D[Calcul de la date d'envoi]
    D --> E[Stockage de la date d'envoi dans la table Relances]
```