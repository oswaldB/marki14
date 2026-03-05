# Feature: Envoi Automatique des Emails

## Description
Envoyer les emails de relance quotidiennement à 18h, avec vérification préalable du statut des factures. Si une facture est réglée, les relances à venir doivent être supprimées.

## User Flow
```mermaid
graph TD
    A[Script d'envoi automatique à 18h] --> B[Vérification du statut des factures]
    B --> C{Facture réglée?}
    C -->|Oui| D[Suppression des relances à venir]
    C -->|Non| E[Envoi des emails de relance]
```