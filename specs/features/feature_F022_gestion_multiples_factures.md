# Feature: Gestion des Multiples Factures

## Description
Gérer les cas où un contact a plusieurs factures impayées. Les emails de relance doivent inclure un tableau des factures impayées.

## User Flow
```mermaid
graph TD
    A[Identification des contacts avec plusieurs factures] --> B[Génération des emails de relance]
    B --> C[Inclusion d'un tableau des factures impayées]
    C --> D[Envoi des emails de relance]
```