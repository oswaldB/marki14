# F002 - Gestion des Contacts

## Description
Identifier et enregistrer les contacts (payeurs ou apporteurs d'affaires) dans la classe Parse Contacts.

## Fonctionnalités
1. **Identification des Contacts** : Extraire les informations des contacts à partir des factures importées.
2. **Enregistrement des Contacts** : Stocker les contacts dans la classe `Contacts` de la base de données.
3. **Classification des Contacts** : Classer les contacts en tant que payeurs ou apporteurs d'affaires.
4. **Gestion des Doublons** : Éviter les doublons en vérifiant si un contact existe déjà dans la base de données.

## User Stories
- **US001** : En tant qu'utilisateur, je veux que les contacts soient automatiquement identifiés à partir des résultats de la requête SQL lors de l'import.
- **US002** : En tant qu'utilisateur, je veux que les contacts soient synchronisés avec la classe `Contacts` de Parse.
- **US003** : En tant qu'utilisateur, je veux que les contacts soient enregistrés dans la classe `Impayes` avec les bons pointeurs vers `Contacts` (payeur, propriétaire, apporteur, notaire).
- **US004** : En tant qu'utilisateur, je veux voir les résultats des logs de synchronisation des contacts pour identifier les succès, les échecs et les avertissements.
- **US005** : En tant qu'utilisateur, je veux pouvoir relancer le script de synchronisation des contacts depuis la page des logs.

## Critères d'Acceptation
- Les contacts doivent être correctement identifiés à partir des factures.
- Les contacts doivent être enregistrés dans la classe `Contacts` avec les informations nécessaires.
- Les doublons doivent être évités.
- Les logs de synchronisation doivent être affichés avec les succès, les échecs et les avertissements.
- L'utilisateur doit pouvoir relancer le script de synchronisation depuis la page des logs.

## Notes
- Les contacts doivent inclure des informations telles que le nom, l'email, le téléphone, et le type (payeur, propriétaire, apporteur, notaire).
- Les contacts doivent être liés aux factures correspondantes dans la base de données.
- L'identification des contacts se fait en lisant les colonnes retournées par la requête SQL : `acquéreur`, `apporteur d'affaire`, `payeur`, `propriétaire`, `notaire`, etc.
- Les logs de synchronisation doivent être communs avec ceux de F001 pour une gestion centralisée.

