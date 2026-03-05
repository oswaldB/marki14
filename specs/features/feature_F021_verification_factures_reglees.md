# Feature: Vérification des Factures Réglées

## Description
Vérifier si une facture est réglée avant l'envoi des relances. Si la facture est réglée, les relances à venir doivent être supprimées.

## User Flow
```mermaid
graph TD
    A[Script d'envoi des emails de relance] --> B[Vérification du statut des factures]
    B --> C{Facture réglée?}
    C -->|Oui| D[Suppression des relances à venir]
    C -->|Non| E[Envoi des emails de relance]
```