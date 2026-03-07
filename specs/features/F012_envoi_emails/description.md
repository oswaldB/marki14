# F012 - Envoi des Emails

## Description
Envoyer les emails de relance quotidiennement à 18h.

## Fonctionnalités
1. **Planification des Envois** : Planifier l'envoi des emails à 18h chaque jour.
2. **Vérification des Factures** : Vérifier que les factures ne sont pas réglées avant l'envoi.
3. **Exécution du Script de Mise à Jour** : Exécuter le script de mise à jour des statuts avant l'envoi des emails.
4. **Envoi des Emails** : Envoyer les emails de relance aux contacts concernés.
5. **Gestion des Erreurs** : Gérer les erreurs d'envoi et les enregistrer dans la base de données.

## User Stories
- **US001** : En tant qu'utilisateur, je veux que les emails de relance soient envoyés automatiquement à 18h.
- **US002** : En tant qu'utilisateur, je veux que les factures soient vérifiées avant l'envoi.
- **US003** : En tant qu'utilisateur, je veux être informé en cas d'erreur d'envoi.

## Critères d'Acceptation
- Les emails doivent être envoyés automatiquement à 18h.
- Les factures doivent être vérifiées avant l'envoi.
- Les erreurs d'envoi doivent être enregistrées et signalées.

## Notes
- Les emails doivent être envoyés via un profil SMTP configuré.
- Les erreurs d'envoi doivent être enregistrées dans la classe `Relances`.