# US001 - Afficher les Contacts Sans Email

## Description
En tant qu'utilisateur, je veux afficher les contacts sans email pour les gérer.

## Préconditions
- L'utilisateur est connecté.
- Des contacts existent dans la classe `Contacts`.

## Scénario Principal
1. L'utilisateur accède à l'écran 'Contacts sans email'.
2. Le système exécute une requête à Parse pour récupérer les contacts sans email.
3. Le système affiche la liste des contacts sans email.
4. Le système explique à l'utilisateur qu'il faut modifier les informations de contacts dans Analyse Immo et revenir à la prochaine heure pile.

## Scénario Alternatif
- **Aucun Contact Sans Email** : Si aucun contact sans email n'est trouvé, le système affiche un message d'information.

## Écran ASCII
```
+-----------------------------------------------------+
| Contacts Sans Email                                 |
+-----------------------------------------------------+
|                                                     |
| Liste des contacts sans email :                     |
| [Nom du Contact 1] - 5 impayés - 1500€              |
| [Nom du Contact 2] - 3 impayés - 900€               |
| [Nom du Contact 3] - 2 impayés - 600€               |
|                                                     |
| Message :                                           |
| "Modifiez les informations dans Analyse Immo et    |
|  revenez à la prochaine heure pile."                |
|                                                     |
+-----------------------------------------------------+
```

## Postconditions
- Les contacts sans email sont affichés et accessibles pour une gestion ultérieure.

## Notes
- L'affichage doit être simple et clair.
- Les contacts doivent être facilement identifiables.