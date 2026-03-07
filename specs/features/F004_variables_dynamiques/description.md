# F004 - Variables Dynamiques

## Description
Utiliser des variables dynamiques (`[[ ]]`) dans les templates pour personnaliser les emails. Ces variables sont récupérées depuis un fichier JSON.

## Fonctionnalités
1. **Définition des Variables** : Permettre la définition de variables dynamiques dans les templates.
2. **Récupération des Variables** : Récupérer les variables depuis un fichier de configuration JSON.
3. **Utilisation des Variables** : Permettre l'utilisation des variables dans les templates d'emails.
4. **Validation des Variables** : Vérifier que les variables sont correctement définies et utilisées.

## User Stories
- **US001** : En tant qu'utilisateur, je veux définir des variables dynamiques pour personnaliser mes emails.
- **US002** : En tant qu'utilisateur, je veux que les variables soient automatiquement remplacées par les valeurs correspondantes.

## Critères d'Acceptation
- Les variables doivent être définies et récupérées depuis un fichier JSON.
- Les variables doivent être utilisables dans les templates d'emails.
- Les variables doivent être validées avant utilisation.

## Notes
- Les variables doivent être définies dans un fichier JSON accessible par l'application.
- Les variables doivent être utilisées pour personnaliser les emails avec des informations spécifiques aux factures et aux contacts.
- Un script utilitaire doit être créé pour récupérer toutes les colonnes de la classe `Impayes` et les sauvegarder dans le fichier `variables.json`.
