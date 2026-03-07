# US001 - Voir les Factures d'un Contact

## Description
En tant qu'utilisateur, je veux voir toutes les factures impayées d'un contact.

## Préconditions
- L'utilisateur est connecté.
- Un contact existe avec plusieurs factures impayées.

## Scénario Principal
1. L'utilisateur accède à la page de gestion des contacts.
2. L'utilisateur sélectionne un contact.
3. Le système affiche toutes les factures impayées du contact sous forme de tableau, en distinguant :
   - Les factures où le contact est le payeur.
   - Les factures où le contact est l'apporteur.
4. L'utilisateur peut voir les détails de chaque facture.

## Scénario Alternatif
- **Aucune Facture** : Si le contact n'a aucune facture impayée, le système affiche un message d'information.

## Écran ASCII
```
+-----------------------------------------------------+
| Factures du Contact                                 |
+-----------------------------------------------------+
|                                                     |
| [Search Bar]                                        |
|                                                     |
| [Filtres]                                           |
| [Payeur] [Apporteur]                                |
|                                                     |
| [Facture 1] [Facture 2] [Facture 3]                |
|                                                     |
+-----------------------------------------------------+
```

## Postconditions
- Les factures du contact sont affichées sous forme de tableau.

## Notes
- Les factures doivent être présentées sous forme de tableau, même s'il n'y en a qu'une seule.
- Les détails des factures doivent être accessibles.
- Je peux voir celles où il est le payeur et celles où il est l'apporteur.