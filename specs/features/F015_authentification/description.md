# F015 - Authentification et Dashboard

## Description
Écran de login et dashboard avec gestion des utilisateurs (admin vs non-admin).

## Fonctionnalités
1. **Authentification** : Permettre aux utilisateurs de se connecter avec un nom d'utilisateur et un mot de passe.
2. **Gestion des Utilisateurs** : Permettre aux administrateurs de gérer les utilisateurs.
3. **Dashboard** : Afficher un tableau de bord avec des informations pertinentes.
4. **Rôles et Permissions** : Gérer les rôles et permissions des utilisateurs.
5. **Connexion Automatique** : Permettre aux utilisateurs de rester connectés automatiquement.
6. **Redirection après Connexion** : Permettre la redirection vers une page spécifique après une connexion réussie.

## User Stories
- **US001** : En tant qu'utilisateur, je veux me connecter à l'application.
- **US002** : En tant qu'administrateur, je veux gérer les utilisateurs.
- **US003** : En tant qu'utilisateur, je veux voir un dashboard avec des informations pertinentes.
- **US004** : En tant qu'utilisateur, je veux rester connecté automatiquement.
- **US005** : En tant qu'utilisateur, je veux être redirigé vers une page spécifique après la connexion si un paramètre `redirect` est présent dans l'URL.

## Critères d'Acceptation
- Les utilisateurs doivent pouvoir se connecter avec un nom d'utilisateur et un mot de passe.
- Les administrateurs doivent pouvoir gérer les utilisateurs.
- Le dashboard doit afficher des informations pertinentes.

## Notes
- Les mots de passe doivent être chiffrés.
- Les rôles et permissions doivent être gérés via la base de données.
