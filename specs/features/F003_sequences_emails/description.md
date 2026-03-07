# F003 - Séquences d'Emails

## Description
Créer et gérer des séquences d'emails avec des templates modifiables via Toast Editor UI et [AlpineFlow](https://github.com/copyfactory/AlpineFlow)

## Fonctionnalités
1. **Création de Séquences** : Permettre aux utilisateurs de créer des séquences d'emails.
2. **Édition de Templates** : Utiliser Toast Editor UI pour modifier les templates d'emails.
3. **Prévisualisation** : Permettre aux utilisateurs de prévisualiser les emails avant envoi.
4. **Gestion des Séquences** : Permettre la suppression, la modification et l'activation/désactivation des séquences.
5. **Création de Délais** : Permettre la définition de délais en jours pour les relances.
6. **Publication de Séquences** : Permettre la publication d'une séquence pour la rendre active. Une séquence publiée ne peut pas être modifiée directement ; il faut créer un duplicata pour la modifier.

## User Stories
- **US001** : En tant qu'utilisateur, je veux créer une séquence d'emails pour automatiser les relances.
- **US002** : En tant qu'utilisateur, je veux modifier les templates d'emails via Toast Editor UI.
- **US003** : En tant qu'utilisateur, je veux prévisualiser les emails avant de les envoyer.
- **US004** : En tant qu'utilisateur, je veux définir des délais en jours pour les relances.
- **US005** : En tant qu'utilisateur, je veux publier une séquence pour la rendre active.
- **US006** : En tant qu'utilisateur, je veux créer un duplicata d'une séquence publiée pour la modifier.
- **US007** : En tant qu'utilisateur, je veux supprimer une séquence.
- **US008** : En tant qu'utilisateur, je veux archiver une séquence.
- **US009** : En tant qu'utilisateur, je veux dépublier une séquence pour la rendre inactive.

## Critères d'Acceptation
- Les séquences doivent être créées et modifiables via l'interface utilisateur.
- Les templates doivent être éditables avec Toast Editor UI.
- Les emails doivent pouvoir être prévisualisés avant envoi.
- Les séquences doivent pouvoir être supprimées, archivées et dépubliées.

## Notes
- Les séquences doivent inclure des informations telles que le sujet, le corps de l'email, et les variables dynamiques.
- Les séquences doivent être liées aux factures impayées pour un envoi automatisé.
- Les factures impayées doivent systématiquement être présentées sous forme de tableau dans les emails, même s'il n'y en a qu'une seule.