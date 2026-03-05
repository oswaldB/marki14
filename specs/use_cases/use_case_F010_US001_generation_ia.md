# Use Case: Génération par IA

## Description
L'utilisateur génère des séquences d'emails via une intégration avec ChatGPT en utilisant un prompt spécifique. Le système synchronise les séquences générées avec la base de données et recharge la page.

## User Flow
```mermaid
graph TD
    A[Utilisateur clique sur "Générer par IA"] --> B[Popup avec prompt à copier]
    B --> C[Utilisateur copie le prompt dans ChatGPT]
    C --> D[Utilisateur copie la réponse JSON dans la popup]
    D --> E[Validation et synchronisation avec la base de données]
    E --> F[Rechargement de la page avec les nouvelles séquences]
```

## ASCII Screen
```
+---------------------------------------------------------------+
|  Génération par IA                                            |
|                                                               |
|  Prompt à copier:                                              |
|  "Génère 5 emails de relance en markdown avec les variables..."
|                                                               |
|  Réponse JSON:                                                 |
|  [_________________________________________________________]  |
|                                                               |
|  [Valider] [Annuler]                                           |
+---------------------------------------------------------------+
```