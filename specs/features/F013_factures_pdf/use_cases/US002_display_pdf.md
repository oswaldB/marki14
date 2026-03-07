# US002 - Afficher une Facture PDF

## Description
En tant qu'utilisateur, je veux afficher une facture PDF dans l'interface.

## Préconditions
- L'utilisateur est connecté.
- Une URL de facture PDF est générée.

## Scénario Principal
1. L'utilisateur accède à la page de gestion des factures.
2. L'utilisateur clique sur le lien de la facture PDF.
3. Le système exécute un script pour récupérer le PDF depuis le FTP.
4. Le système convertit le PDF en base64 ou l'affiche directement dans un iframe.
5. Le système ouvre la facture PDF dans un drawer/slider qui fait 50% de l'écran.

## Scénario Alternatif
- **URL Invalide** : Si l'URL est invalide, le système affiche un message d'erreur.

## Écran ASCII
```
+-----------------------------------------------------+
| Affichage de la Facture PDF                         |
+-----------------------------------------------------+
|                                                     |
| [Facture PDF]                                       |
|                                                     |
| [Télécharger] [Fermer]                              |
|                                                     |
+-----------------------------------------------------+
```

## Postconditions
- La facture PDF est affichée dans l'interface.

## Notes
- Les factures PDF doivent être accessibles via les URLs générées.
- Les accès FTP doivent être configurés correctement.