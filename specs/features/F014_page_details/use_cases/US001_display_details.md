# US001 - Afficher les Détails d'une Facture

## Description
En tant qu'utilisateur, je veux afficher les détails d'une facture impayée.

## Préconditions
- L'utilisateur est connecté.
- Une facture impayée existe.

## Scénario Principal
1. L'utilisateur accède à la page de gestion des factures.
2. L'utilisateur sélectionne une facture impayée.
3. Le système affiche les détails de la facture :
   - Numéro de facture
   - Date
   - Montant
   - Statut
   - Détails du contact
   - Historique des actions
   - Relances associées
   et toutes les autres informations que l'on a.

## Scénario Alternatif
- **Facture Introuvable** : Si la facture n'est pas trouvée, le système affiche un message d'erreur.

## Écran ASCII
```
+-----------------------------------------------------+
| Détails de la Facture                               |
+-----------------------------------------------------+
|                                                     |
| Numéro de facture : [Numéro]                        |
| Date : [Date]                                       |
| Montant : [Montant]                                 |
| Statut : [Statut]                                   |
| Détails du contact : [Détails]                      |
| Historique des actions : [Historique]               |
| Relances associées : [Relances]                    |
|                                                     |
| Facture :                                           |
| [Lien vers la facture PDF]                         |
|                                                     |
+-----------------------------------------------------+
```

## Postconditions
- Les détails de la facture sont affichés.

## Notes
- Les détails doivent inclure toutes les informations pertinentes de la facture.
- Les actions et les relances doivent être accessibles.
