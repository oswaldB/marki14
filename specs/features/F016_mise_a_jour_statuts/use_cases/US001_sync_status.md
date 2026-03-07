# US001 - Synchroniser les Statuts de Paiement

## Description
En tant qu'utilisateur, je veux que les statuts de paiement soient synchronisés automatiquement.

## Préconditions
- Le script de synchronisation est configuré.
- La base de données externe est accessible.

## Scénario Principal
1. Le système exécute le script de synchronisation toutes les heures.
2. Le script se connecte à la base de données externe.
3. Le script récupère les statuts de paiement des factures.
4. Le script met à jour les statuts dans la classe `Impayes`.
5. Le script met à jour les statuts dans la classe `Relances`.
6. Le script enregistre les logs de synchronisation.

## Scénario Alternatif
- **Échec de Connexion** : Si le script ne peut pas se connecter à la base de données externe, il enregistre une erreur et envoie une notification.

## Écran ASCII
```
+-----------------------------------------------------+
| Synchronisation des Statuts de Paiement             |
+-----------------------------------------------------+
|                                                     |
| Statuts synchronisés : [Nombre]                      |
| Erreurs : [Nombre]                                  |
|                                                     |
| Historique des Synchronisations :                   |
| - 10/01/2023 10:00 : 50 statuts synchronisés          |
| - 09/01/2023 09:00 : 45 statuts synchronisés          |
|                                                     |
| [Exécuter] [Annuler]                                |
|                                                     |
+-----------------------------------------------------+
```

## Postconditions
- Les statuts de paiement sont synchronisés.
- Les logs de synchronisation sont enregistrés.

## Notes
- Le script doit être exécuté via un planificateur de tâches (cron).
- Les erreurs de synchronisation doivent être enregistrées.
