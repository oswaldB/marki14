# US002 - Voir l'Historique des Actions

## Description
En tant qu'utilisateur, je veux voir l'historique des actions sur une facture.

## Préconditions
- L'utilisateur est connecté.
- Une facture impayée existe.

## Scénario Principal
1. L'utilisateur accède à la page de détails d'une facture.
2. L'utilisateur clique sur l'onglet 'Historique des actions'.
3. Le système affiche l'historique des actions :
   - Date de l'action
   - Type d'action
   - Utilisateur responsable
   - Détails de l'action

## Scénario Alternatif
- **Aucune Action** : Si aucune action n'est enregistrée, le système affiche un message d'information.

## Écran ASCII
```
+-----------------------------------------------------+
| Historique des Actions                               |
+-----------------------------------------------------+
|                                                     |
| [Search Bar]                                        |
|                                                     |
| [Tri par date] [Tri par type] [Tri par utilisateur] |
|                                                     |
| [Action 1] [Action 2] [Action 3]                    |
|                                                     |
+-----------------------------------------------------+
```

## Postconditions
- L'historique des actions est affiché.

## Notes
- L'historique doit être complet et détaillé.
- Les actions doivent être triables et filtrables.
