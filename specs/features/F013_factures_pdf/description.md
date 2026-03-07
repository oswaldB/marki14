# F013 - Gestion des Factures PDF

## Description
Stocker et afficher les factures PDF via FTP, avec une URL générée dynamiquement.

## Fonctionnalités
1. **Génération des URLs** : Générer dynamiquement les URLs des factures PDF.
2. **Affichage des Factures** : Permettre l'affichage des factures PDF dans l'interface utilisateur.
3. **Téléchargement des Factures** : Permettre le téléchargement des factures PDF.
4. **Gestion des Accès** : Gérer les accès aux factures PDF via FTP.

## User Stories
- **US001** : En tant qu'utilisateur, je veux générer une URL pour une facture PDF.
- **US002** : En tant qu'utilisateur, je veux afficher une facture PDF dans l'interface.
- **US003** : En tant qu'utilisateur, je veux télécharger une facture PDF.

## Critères d'Acceptation
- Les URLs des factures PDF doivent être générées dynamiquement lors de la création de l'Impayé dans la classe Impayes.
- Les factures PDF doivent être affichables dans l'interface.
- Les factures PDF doivent être téléchargeables.

## Notes
- Les URLs doivent être générées selon un format spécifique.
- Les accès FTP doivent être configurés dans le fichier `.env`.
