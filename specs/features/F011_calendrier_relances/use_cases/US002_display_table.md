# US002 - Afficher les Relances dans un Tableau

## Description
En tant qu'utilisateur, je veux afficher les relances dans un tableau.

## Préconditions
- L'utilisateur est connecté.
- Des relances existent.

## Scénario Principal
1. L'utilisateur accède à la page du tableau des relances.
2. Le système affiche les relances dans un tableau.
3. L'utilisateur peut utiliser une barre de recherche pour filtrer les relances.
4. L'utilisateur peut appliquer des filtres pour afficher :
   - Les emails envoyés.
   - Les emails non envoyés.
   - Les factures payées.
   - Les factures non payées.
5. L'utilisateur peut trier et filtrer les relances.
6. L'utilisateur peut cliquer sur une relance pour voir les détails.

## Scénario Alternatif
- **Aucune Relance** : Si aucune relance n'est disponible, le système affiche un message d'information.

## Écran ASCII
```
+-----------------------------------------------------+
| Tableau des Relances                                |
+-----------------------------------------------------+
|                                                     |
| [Search Bar]                                        |
|                                                     |
| [Filtres]                                           |
| [Emails envoyés] [Emails non envoyés]               |
| [Factures payées] [Factures non payées]             |
|                                                     |
| [Tri par date] [Tri par statut] [Tri par montant]   |
|                                                     |
| [Relance 1] [Relance 2] [Relance 3]                |
|                                                     |
+-----------------------------------------------------+
```

## Postconditions
- Les relances sont affichées dans un tableau.

## Notes
- Les relances doivent être affichées avec des informations pertinentes (date, heure, statut, message).
- Les options de tri et de filtrage doivent être disponibles.
- On va rajouter des options de filtres avec une search bar, on peut ne montrer que les emails envoyés, ceux non envoyés, les factures payées, non payées.