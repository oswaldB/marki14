# F016 - Mise à Jour des Statuts

## Description
Script horaire pour synchroniser les statuts de paiement.

## Fonctionnalités
1. **Synchronisation des Statuts** : Synchroniser les statuts de paiement depuis la base de données externe.
2. **Mise à Jour des Factures** : Mettre à jour les statuts des factures dans la classe `Impayes`.
3. **Mise à Jour des Relances** : Mettre à jour les statuts des relances dans la classe `Relances`.
4. **Planification** : Planifier l'exécution du script toutes les heures.

## User Stories
- **US001** : En tant qu'utilisateur, je veux que les statuts de paiement soient synchronisés automatiquement.
- **US002** : En tant qu'utilisateur, je veux que les factures et relances soient mises à jour en fonction des statuts.

## Critères d'Acceptation
- Les statuts de paiement doivent être synchronisés depuis la base de données externe.
- Les factures et relances doivent être mises à jour en fonction des statuts.
- Le script doit être exécuté toutes les heures.

## Notes
- Le script doit être exécuté via un planificateur de tâches (cron).
- Les erreurs de synchronisation doivent être enregistrées.
