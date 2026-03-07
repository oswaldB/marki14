# US001 - Se Connecter à l'Application

## Description
En tant qu'utilisateur, je veux me connecter à l'application.

## Préconditions
- L'utilisateur a un compte.

## Scénario Principal
1. L'utilisateur accède à la page de connexion.
2. L'utilisateur entre son nom d'utilisateur et son mot de passe.
3. L'utilisateur clique sur le bouton 'Se connecter'.
4. Le système valide les informations d'identification.
5. Le système connecte l'utilisateur.
6. Le système redirige l'utilisateur vers le dashboard ou la page spécifiée dans le paramètre `redirect`.

## Scénario Alternatif
- **Informations Invalides** : Si les informations d'identification sont invalides, le système affiche un message d'erreur et demande à l'utilisateur de réessayer.

## Écran ASCII
```
+-----------------------------------------------------+
| Connexion à l'Application                          |
+-----------------------------------------------------+
|                                                     |
| Nom d'utilisateur : [_________________________]    |
| Mot de passe : [_______________________________]    |
|                                                     |
| [ ] Se souvenir de moi                              |
|                                                     |
| [Se connecter] [Annuler]                            |
|                                                     |
+-----------------------------------------------------+
```

## Postconditions
- L'utilisateur est connecté.
- L'utilisateur est redirigé vers la page appropriée.

## Notes
- Les mots de passe doivent être chiffrés.
- Les sessions doivent être sécurisées.

