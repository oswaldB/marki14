# Feature: Identification des Contacts

## Description
Identifier et enregistrer les contacts (payeurs ou apporteurs d'affaires) dans la classe Parse Contacts lors de l'import des factures impayées. Les contacts doivent être associés aux factures correspondantes.

## User Flow
```mermaid
graph TD
    A[Importation des factures impayées] --> B[Analyse des contacts associés]
    B --> C{Contact déjà enregistré?}
    C -->|Oui| D[Association du contact à la facture]
    C -->|Non| E[Enregistrement du contact dans Parse Contacts]
    E --> D
```