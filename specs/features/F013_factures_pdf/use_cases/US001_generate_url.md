# US001 - Générer une URL pour une Facture PDF

## Description
En tant qu'utilisateur, je veux que l'URL de la facture PDF soit générée automatiquement lors de la récupération des impayés.

## Préconditions
- L'utilisateur est connecté.
- Une facture existe dans la classe `Impayes`.

## Scénario Principal
1. Le système exécute le script de récupération des impayés.
2. Le système construit l'URL de la facture PDF en utilisant le format défini dans `@elements_important/format_url_facture.md`.
3. Le système enregistre l'URL dans la colonne `url_facture` de la classe `Impayes`.
4. Le système affiche un message de succès.

## Scénario Alternatif
- **Échec de Génération** : Si le système ne peut pas générer l'URL, il affiche un message d'erreur et enregistre les détails de l'erreur.



## Postconditions
- L'URL de la facture PDF est générée et enregistrée dans la classe `Impayes`.

## Notes
- L'URL doit être générée selon le format défini dans le dossier `elements_importants`.
- Les accès FTP doivent être configurés dans le fichier `.env`.