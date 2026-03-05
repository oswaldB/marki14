# Use Case: Intégration avec ChatGPT

## Description
L'utilisateur utilise ChatGPT pour générer des séquences d'emails ou des emails individuels. Le système intègre les réponses de ChatGPT dans les templates.

## User Flow
```mermaid
graph TD
    A[Utilisateur clique sur "Demander à ChatGPT"] --> B[Popup avec prompt à copier]
    B --> C[Utilisateur copie le prompt dans ChatGPT]
    C --> D[Utilisateur copie la réponse JSON dans la popup]
    D --> E[Intégration des emails dans le Toast UI]
```

## ASCII Screen
```
+---------------------------------------------------------------+
|  Intégration avec ChatGPT                                      |
|                                                               |
|  Prompt à copier:                                              |
|  "Génère un email de relance en markdown avec les variables..."
|                                                               |
|  Réponse JSON:                                                 |
|  [_________________________________________________________]  |
|                                                               |
|  [Intégrer] [Annuler]                                          |
+---------------------------------------------------------------+
```