# US001 - Planifier l'Envoi des Emails

## Description
En tant qu'utilisateur, je veux que les emails de relance soient envoyés automatiquement à 18h.

## Préconditions
- L'utilisateur est connecté.
- Des relances sont planifiées.

## Scénario Principal
1. Le système exécute un script à 18h chaque jour.
2. Le script exécute le script de mise à jour des statuts.
3. Le script vérifie que les factures ne sont pas réglées.
4. Le script envoie les emails de relance aux contacts concernés.
5. Le script enregistre les logs d'envoi.

## Scénario Alternatif
- **Échec d'Envoi** : Si un email ne peut pas être envoyé, le script enregistre une erreur et continue l'envoi des autres emails.

## Écran ASCII
```
+-----------------------------------------------------+
| Planification des Emails                            |
+-----------------------------------------------------+
|                                                     |
| Heure d'envoi : 18h                                 |
| Emails planifiés : [Nombre]                         |
|                                                     |
| [Exécuter] [Annuler]                                |
|                                                     |
+-----------------------------------------------------+
```

## Postconditions
- Les emails de relance sont envoyés.
- Les logs d'envoi sont enregistrés.

## Notes
- Les emails doivent être envoyés via un profil SMTP configuré.
- Les erreurs d'envoi doivent être enregistrées dans la classe `Relances`.
