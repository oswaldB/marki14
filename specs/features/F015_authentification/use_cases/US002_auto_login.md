# US002 - Rester Connecté Automatiquement

## Description
En tant qu'utilisateur, je veux rester connecté automatiquement.

## Préconditions
- L'utilisateur est connecté.
- L'utilisateur a coché l'option 'Se souvenir de moi'.

## Scénario Principal
1. L'utilisateur se connecte à l'application.
2. L'utilisateur coche l'option 'Se souvenir de moi'.
3. Le système enregistre un cookie de session.
4. Le système maintient l'utilisateur connecté même après la fermeture du navigateur.

## Scénario Alternatif
- **Échec de Connexion Automatique** : Si le cookie de session est invalide, le système demande à l'utilisateur de se connecter à nouveau.



## Postconditions
- L'utilisateur reste connecté automatiquement.

## Notes
- Les cookies de session doivent être sécurisés.
- Les sessions doivent expirer après une période d'inactivité.
