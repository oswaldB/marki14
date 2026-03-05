# Feature: Affichage des Relances

## Description
Afficher les relances dans un calendrier ou un tableau, avec possibilité de modifier les messages avant envoi. Les relances doivent être visualisées et modifiées avant leur envoi.

## User Flow
```mermaid
graph TD
    A[Utilisateur accède à l'écran des relances] --> B[Choix du mode d'affichage: calendrier ou tableau]
    B --> C[Sélection d'une relance]
    C --> D[Modification du message ou de l'objet]
    D --> E[Sauvegarde des modifications]
```