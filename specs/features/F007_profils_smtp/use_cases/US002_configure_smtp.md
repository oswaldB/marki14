# US002 - Configurer un Profil SMTP

## Description
En tant qu'utilisateur, je veux configurer les paramètres SMTP pour un profil.

## Préconditions
- L'utilisateur est connecté.
- Un profil SMTP existe.

## Scénario Principal
1. L'utilisateur accède à la page de gestion des profils SMTP.
2. L'utilisateur sélectionne un profil SMTP existant.
3. L'utilisateur clique sur le bouton 'Configurer'.
4. L'utilisateur modifie les paramètres SMTP :
   - Serveur SMTP
   - Port
   - Nom d'utilisateur
   - Mot de passe (chiffré)
   - Signature HTML
5. L'utilisateur clique sur un bouton 'Tester' pour envoyer un email de test.
6. Le système demande un email et envoie un email de test en français à cet email.
7. L'utilisateur enregistre les modifications.
8. Le système affiche un message de succès.

## Notes
- Il est aussi possible de créer un profil SMTP depuis l'interface editor de la séquence en cliquant sur un bouton qui ouvre un drawer avec l'include de ce composant.

## Écran ASCII
```
+-----------------------------------------------------+
| Configuration du Profil SMTP                        |
+-----------------------------------------------------+
|                                                     |
| Serveur SMTP : [_______________________________]    |
| Port : [____]                                       |
| Nom d'utilisateur : [_________________________]    |
| Mot de passe : [_______________________________]    |
| Signature HTML : [_____________________________]    |
|                                                     |
| [Tester] [Enregistrer] [Annuler]                    |
|                                                     |
+-----------------------------------------------------+
```

## Scénario Alternatif
- **Échec de Sauvegarde** : Si le système ne peut pas sauvegarder les modifications, il affiche un message d'erreur et demande à l'utilisateur de réessayer.

## Postconditions
- Le profil SMTP est configuré et enregistré dans la base de données.

## Notes
- Les mots de passe doivent être chiffrés.
- Les modifications doivent être validées avant d'être enregistrées.