# F021 - Gestion des Contacts avec Plusieurs Factures

## Description
Prendre en compte qu'un contact peut avoir plusieurs factures impayées.

## Fonctionnalités
1. **Identification des Factures** : Identifier toutes les factures associées à un contact.
2. **Affichage Groupé** : Afficher les factures d'un contact de manière groupée.
3. **Gestion des Factures** : Permettre la gestion des factures pour un contact.
4. **Notifications** : Notifier l'utilisateur en cas de plusieurs factures impayées pour un contact.

## User Stories
- **US001** : En tant qu'utilisateur, je veux voir toutes les factures impayées d'un contact.
- **US002** : En tant qu'utilisateur, je veux gérer les factures d'un contact de manière groupée.
- **US003** : En tant qu'utilisateur, je veux être notifié en cas de plusieurs factures impayées pour un contact.

## Critères d'Acceptation
- Les factures d'un contact doivent être identifiées et affichées.
- Les factures doivent être gérables de manière groupée.
- Les notifications doivent être envoyées en cas de plusieurs factures impayées.

## Notes
- Les factures doivent être liées à un contact dans la base de données.
- Dans toutes les générations, les factures impayées et les informations relatives doivent être présentées sous forme de tableau, même s'il n'y a qu'une seule facture.