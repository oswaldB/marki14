# US002 - Appliquer une Règle d'Attribution

## Description
En tant qu'utilisateur, je veux que les règles d'attribution soient appliquées automatiquement.

## Préconditions
- L'utilisateur est connecté.
- Une règle d'attribution existe.

## Scénario Principal
1. Le système applique automatiquement la règle à la publication d'une séquence.
2. Le système applique automatiquement la règle à la fin de chaque import d'impayés.
3. Le système attribue la séquence aux factures filtrées.
4. Le système enregistre les attributions dans la base de données.
5. Le système affiche un message de succès.

## Scénario Alternatif
- **Aucune Facture Correspondante** : Si aucune facture ne correspond aux critères de la règle, le système affiche un message d'information.

## Écran ASCII
```
+-----------------------------------------------------+
| Application de la Règle d'Attribution              |
+-----------------------------------------------------+
|                                                     |
| Règle appliquée : [Nom de la Règle]                |
| Factures correspondantes : [Nombre]                |
|                                                     |
| Historique des Attributions :                       |
| - 10/01/2023 : 5 factures attribuées                |
| - 09/01/2023 : 3 factures attribuées                |
|                                                     |
| [Appliquer] [Annuler]                               |
|                                                     |
+-----------------------------------------------------+
```

## Postconditions
- La règle est appliquée et les séquences sont attribuées aux factures correspondantes.

## Notes
- Les règles doivent être applicables automatiquement.
- Les attributions doivent être enregistrées dans la classe `Impayes`.