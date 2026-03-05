# Feature: Intégration avec ChatGPT

## Description
Utiliser ChatGPT pour générer des séquences d'emails ou des emails individuels. L'utilisateur peut copier un prompt spécifique et coller la réponse JSON pour intégrer les emails dans les templates.

## User Flow
```mermaid
graph TD
    A[Utilisateur clique sur "Demander à ChatGPT"] --> B[Popup avec prompt à copier]
    B --> C[Utilisateur copie le prompt dans ChatGPT]
    C --> D[Utilisateur copie la réponse JSON dans la popup]
    D --> E[Intégration des emails dans le Toast UI]
```