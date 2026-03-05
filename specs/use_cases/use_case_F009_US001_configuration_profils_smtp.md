# Use Case: Configuration des Profils SMTP

## Description
L'utilisateur configure un profil SMTP pour l'envoi d'emails, incluant la signature email en HTML. Le système stocke les informations SMTP et la signature email.

## User Flow
```mermaid
graph TD
    A[Utilisateur accède à la gestion des profils SMTP] --> B[Création ou modification d'un profil SMTP]
    B --> C[Configuration des informations SMTP]
    C --> D[Ajout de la signature email en HTML]
    D --> E[Sauvegarde du profil SMTP]
```

## ASCII Screen
```
+---------------------------------------------------------------+
|  Configuration des Profils SMTP                                |
|                                                               |
|  Serveur SMTP: [_________________________________________]     |
|  Port: [____]                                                 |
|  Signature email: [_______________________________________]     |
|                                                               |
|  [Sauvegarder] [Annuler]                                       |
+---------------------------------------------------------------+
```