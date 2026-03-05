# Feature: Importation des Factures Impayées

## Description
Permettre l'importation des factures impayées via un script ou un upload de fichiers depuis une base de données externe ou un fichier. Les factures importées doivent être validées et stockées dans la base de données.

## User Flow
```mermaid
graph TD
    A[Utilisateur accède à l'écran d'importation] --> B[Choix de la source: script ou upload de fichier]
    B --> C[Validation des données]
    C --> D{Données valides?}
    D -->|Oui| E[Stockage dans la base de données]
    D -->|Non| F[Affichage des erreurs et retour à l'étape B]
```