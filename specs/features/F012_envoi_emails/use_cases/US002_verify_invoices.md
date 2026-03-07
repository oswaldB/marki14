# US002 - Vérifier les Factures avant Envoi

## Description
En tant qu'utilisateur, je veux que les factures soient vérifiées avant l'envoi des emails.

## Préconditions
- L'utilisateur est connecté.
- Des relances sont planifiées.

## Scénario Principal
1. Le système vérifie que les factures ne sont pas réglées.
2. Le système met à jour les statuts des factures.
3. Le système met à jour la date de paiement dans la classe `Impayes`.
4. Le système supprime les relances pour les factures réglées.
5. Le système enregistre les logs de vérification.

## Scénario Alternatif
- **Facture Réglée** : Si une facture est réglée, le système supprime toutes les relances associées.

## Écran ASCII
```
+-----------------------------------------------------+
| Vérification des Factures                           |
+-----------------------------------------------------+
|                                                     |
| Factures vérifiées : [Nombre]                       |
| Factures réglées : [Nombre]                         |
|                                                     |
| [Mettre à jour] [Annuler]                            |
|                                                     |
+-----------------------------------------------------+
```

## Postconditions
- Les factures sont vérifiées et mises à jour.
- Les relances pour les factures réglées sont supprimées.

## Notes
- Les vérifications doivent être effectuées avant chaque envoi d'email.
- Les logs doivent être enregistrés pour un suivi ultérieur.
- On va rajouter aussi une maj dans la classe Impayes pour dire la date de paiement.