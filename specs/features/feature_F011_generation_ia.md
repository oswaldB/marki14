# Feature: Génération par IA

## Description
Générer des séquences d'emails via une intégration avec ChatGPT, avec synchronisation automatique. L'utilisateur peut copier un prompt spécifique et coller la réponse JSON pour synchroniser les séquences.

## User Flow
```mermaid
graph TD
    A[Utilisateur clique sur "Générer par IA"] --> B[Popup avec prompt à copier]
    B --> C[Utilisateur copie le prompt dans ChatGPT]
    C --> D[Utilisateur copie la réponse JSON dans la popup]
    D --> E[Validation et synchronisation avec la base de données]
    E --> F[Rechargement de la page avec les nouvelles séquences]
```