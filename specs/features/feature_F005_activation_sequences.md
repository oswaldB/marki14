# Feature: Activation des Séquences

## Description
Associer des séquences aux factures impayées et générer des relances avec des variables remplacées par les vraies valeurs. Les relances doivent être planifiées selon les délais configurés.

## User Flow
```mermaid
graph TD
    A[Utilisateur sélectionne une séquence] --> B[Association de la séquence aux factures impayées]
    B --> C[Génération des relances]
    C --> D[Remplacement des variables par les vraies valeurs]
    D --> E[Planification des relances selon les délais]
    E --> F[Sauvegarde des relances dans la base de données]
```