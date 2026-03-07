# US003 - Modifier un Message de Relance

## Description
En tant qu'utilisateur, je veux modifier les messages de relance de manière unitaire.

## Préconditions
- L'utilisateur est connecté.
- Une relance existe.

## Scénario Principal
1. L'utilisateur accède à la page du tableau des relances ou calendrier.
2. L'utilisateur sélectionne une relance.
3. L'utilisateur clique sur le bouton 'Modifier le message'.
4. Le système affiche le message actuel de la relance avec sujet, profil smtp, et objet etc. La même expérience que si on ouvrait le noeud email dans alpineFlow de la page editor sequence. On y voit aussi le bouton editer avec l'ia, on y voit aussi les variables et les liens de paiement.
5. L'utilisateur modifie le message.
6. L'utilisateur enregistre les modifications.
7. Le système affiche un message de succès.

## Scénario Alternatif
- **Échec de Sauvegarde** : Si le système ne peut pas sauvegarder les modifications, il affiche un message d'erreur et demande à l'utilisateur de réessayer.

## Écran ASCII
```
+-----------------------------------------------------+
| Modifier le Message de Relance                      |
+-----------------------------------------------------+
|                                                     |
| Sujet : [_______________________________________]    |
| Profil SMTP : [_______________________________]    |
| Objet : [_______________________________________]   |
|                                                     |
| Message :                                            |
| [_________________________________________________] |
| [_________________________________________________] |
| [_________________________________________________] |
|                                                     |
| [Editer avec l'IA] [Enregistrer] [Annuler]          |
|                                                     |
+-----------------------------------------------------+
```

## Postconditions
- Le message de la relance est modifié et enregistré dans la base de données.

## Notes
- Les modifications doivent être validées avant d'être enregistrées.
- Les messages modifiés doivent être prêts pour l'envoi.
