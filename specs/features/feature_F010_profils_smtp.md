# Feature: Profils SMTP

## Description
Configurer et gérer des profils SMTP pour l'envoi d'emails, incluant la signature email en HTML. Les profils SMTP doivent être utilisés pour envoyer les emails de relance.

## User Flow
```mermaid
graph TD
    A[Utilisateur accède à la gestion des profils SMTP] --> B[Création ou modification d'un profil SMTP]
    B --> C[Configuration des informations SMTP]
    C --> D[Ajout de la signature email en HTML]
    D --> E[Sauvegarde du profil SMTP]
```