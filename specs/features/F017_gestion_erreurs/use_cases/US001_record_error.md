# US001 - Enregistrer une Erreur d'Envoi

## Description
En tant qu'utilisateur, je veux être informé des erreurs d'envoi.

## Préconditions
- Une relance est planifiée.
- Une erreur d'envoi se produit.

## Scénario Principal
1. Le système détecte une erreur lors de l'envoi d'un email.
2. Le système enregistre l'erreur dans la classe `Relances` :
   - `error` : true
   - `error_details` : détails de l'erreur
3. Le système affiche un message d'erreur dans l'interface utilisateur.

## Scénario Alternatif
- **Erreur Non Critique** : Si l'erreur n'est pas critique, le système continue l'envoi des autres emails.

## Écran ASCII
```
+-----------------------------------------------------+
| Enregistrement d'une Erreur d'Envoi                |
+-----------------------------------------------------+
|                                                     |
| Erreur détectée : [Détails de l'erreur]             |
|                                                     |
| [Enregistrer] [Annuler]                             |
|                                                     |
+-----------------------------------------------------+
```

## Postconditions
- L'erreur est enregistrée dans la classe `Relances`.
- L'utilisateur est informé de l'erreur.

## Notes
- Les erreurs doivent être enregistrées avec des détails pour un diagnostic facile.
- Les erreurs doivent être affichées dans l'interface utilisateur.
