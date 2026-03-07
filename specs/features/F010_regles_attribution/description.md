# F010 - Règles d'Attribution Automatique

## Description
Créer des règles pour attribuer automatiquement des séquences aux factures impayées via des filtres.

## Fonctionnalités
1. **Création de Règles** : Permettre la création de règles d'attribution automatique.
2. **Configuration des Filtres** : Permettre la configuration de filtres basés sur les colonnes de la classe `Impayes`.
3. **Application des Règles** : Appliquer les règles pour attribuer automatiquement des séquences.
4. **Gestion des Règles** : Permettre la modification et la suppression des règles.

## User Stories
- **US001** : En tant qu'utilisateur, je veux créer une règle d'attribution automatique.
- **US002** : En tant qu'utilisateur, je veux configurer des filtres pour une règle.
- **US003** : En tant qu'utilisateur, je veux appliquer une règle pour attribuer des séquences.

## Critères d'Acceptation
- Les règles doivent être créables et configurables.
- Les filtres doivent être basés sur les colonnes de la classe `Impayes`.
- Les règles doivent être applicables pour une attribution automatique.

## Notes
- Les règles doivent être stockées dans la base de données.
- Les règles doivent être applicables via l'interface utilisateur ou un script.
- Pour les filtres, utiliser une librairie externe comme `AlpineFlow` ou s'appuyer sur le fichier `variables.json` pour définir les filtres possibles.
