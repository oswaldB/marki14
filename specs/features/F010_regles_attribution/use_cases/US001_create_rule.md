# US001 - Créer une Règle d'Attribution Automatique

## Description
En tant qu'utilisateur, je veux créer une règle d'attribution automatique directement depuis l'interface editor de la séquence.

## Préconditions
- L'utilisateur est connecté.
- L'utilisateur a accès à l'interface editor de la séquence.

## Scénario Principal
1. L'utilisateur accède à l'interface editor de la séquence.
2. Dans le premier nœud AlpineFlow, l'utilisateur accède au nœud de filtre.
3. L'utilisateur configure les critères de la règle :
   - Filtres basés sur les variables du fichier `config/variables.json`.
   - Conditions (par exemple, montant > 1000, date < 30 jours).
   - Règles incluses ou exclues.
4. L'utilisateur enregistre la règle.
5. Le système enregistre la règle dans la colonne `rules` de Parse.
6. Le système affiche un message de succès.

## Scénario Alternatif
- **Règle Invalide** : Si la règle est invalide, le système affiche un message d'erreur et demande à l'utilisateur de la corriger.

## Écran ASCII
```
+-----------------------------------------------------+
| Création d'une Règle d'Attribution                 |
+-----------------------------------------------------+
|                                                     |
| Groupes :                                           |
| [ADD] [OR]                                          |
|                                                     |
| Filtres :                                           |
| [Champ] [Opérateur] [Valeur]                        |
| Opérateurs : contient, ne contient pas, commence  |
| par, ne commence pas par, fini par, ne fini pas    |
| par, est, plus grand, égal, plus petit, avant date, |
| après date, entre date 1 et date 2                 |
|                                                     |
| Conditions :                                        |
| [Inclure] [Exclure]                                 |
|                                                     |
| [Enregistrer] [Annuler]                             |
|                                                     |
+-----------------------------------------------------+
```

## Postconditions
- La règle est créée et enregistrée dans la base de données.
- La règle est disponible pour une application automatique.

## Notes
- Les règles doivent être basées sur les variables du fichier `config/variables.json`.
- Les règles doivent être validées avant d'être enregistrées.