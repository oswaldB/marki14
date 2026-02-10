# Résumé Complet des Cas d'Utilisation et Écrans

## Table des Matières
- [F01 - Connexion Utilisateur](#f01---connexion-utilisateur)
- [F02 - Menu Latéral et Navigation](#f02---menu-latéral-et-navigation)
- [F03 - Composant Dock Mobile](#f03---composant-dock-mobile)
- [F04 - Affichage et Gestion des Séquences](#f04---affichage-et-gestion-des-séquences)
- [F05 - Création de Séquences](#f05---création-de-séquences)
- [F06 - Séquences Automatiques](#f06---séquences-automatiques)
- [F07 - Messages IA](#f07---messages-ia)
- [F08 - Follow-ups](#f08---follow-ups)
- [F09 - Affichage des Factures](#f09---affichage-des-factures)
- [F10 - Liste des Factures](#f10---liste-des-factures)
- [UC01 - Gestion des Impayés sans Email](#uc01---gestion-des-impayés-sans-email)

## F01 - Connexion Utilisateur

### User Stories

#### US1 : Formulaire de Connexion avec Validation
- **Écran** : `/login`
- **Acteurs** : Utilisateur non connecté
- **Fonctionnalités** :
  - Champs email et mot de passe avec validation
  - Bouton de soumission avec état de chargement
  - Option "Se souvenir de moi"
  - Messages d'erreur spécifiques
- **Écran suivant** : `/dashboard` (en cas de succès)

#### US2 : Gestion de Session et Restauration
- **Écran** : Tous les écrans (via layout)
- **Acteurs** : Utilisateur connecté
- **Fonctionnalités** :
  - Session persistante
  - Restauration automatique
  - Déconnexion sécurisée
  - Gestion des tokens
- **Écran suivant** : `/login` (après déconnexion)

## F02 - Menu Latéral et Navigation

### User Stories

#### US1 : Structure du Menu Latéral
- **Écran** : Tous les écrans (via layout)
- **Acteurs** : Utilisateur connecté
- **Fonctionnalités** :
  - Navigation entre sections
  - Indicateurs visuels
  - Gestion d'état
  - Animations fluides
- **Écrans accessibles** : Dashboard, Impayés, Séquences, Paramètres

#### US2 : Navigation Mobile et Tablette
- **Écran** : Tous les écrans (responsive)
- **Acteurs** : Utilisateur mobile
- **Fonctionnalités** :
  - Menu hamburger
  - Overlay de navigation
  - Transitions fluides
  - Adaptation responsive
- **Écrans concernés** : Tous les écrans en mode mobile

#### US3 : Intégration avec le Routing
- **Écran** : Tous les écrans
- **Acteurs** : Développeur, utilisateur
- **Fonctionnalités** :
  - Synchronisation avec l'URL
  - Gestion des paramètres
  - Navigation programmatique
  - Historique de navigation
- **Écrans impactés** : Tous les écrans avec routing

## F03 - Composant Dock Mobile

### User Stories

#### US1 : Structure du Dock Mobile
- **Écran** : Écran mobile (`/impayes`, `/sequences`)
- **Acteurs** : Utilisateur mobile
- **Fonctionnalités** :
  - Barre d'actions flottante
  - Boutons d'action rapide
  - Feedback visuel
  - Positionnement fixe
- **Écran principal** : Écran mobile principal

#### US2 : Gestion d'État et Interactions
- **Écran** : Écran mobile
- **Acteurs** : Utilisateur mobile
- **Fonctionnalités** :
  - Gestion des clics
  - Animations
  - Intégration avec les actions
  - Feedback utilisateur
- **Écran principal** : Écran mobile avec interactions

## F04 - Affichage et Gestion des Séquences

### User Stories

#### US1 : Liste des Séquences
- **Écran** : `/sequences`
- **Acteurs** : Gestionnaire de recouvrement
- **Fonctionnalités** :
  - Liste paginée
  - Filtres et tri
  - Recherche
  - Actions rapides
- **Écran suivant** : `/sequence-detail` (au clic)

#### US2 : Détails d'une Séquence
- **Écran** : `/sequence-detail`
- **Acteurs** : Gestionnaire de recouvrement
- **Fonctionnalités** :
  - Informations détaillées
  - Historique
  - Actions disponibles
  - Navigation entre étapes
- **Écran précédent** : `/sequences`

## F05 - Création de Séquences

### User Stories

#### US1 : Formulaire de Création
- **Écran** : `/sequences/create`
- **Acteurs** : Gestionnaire de recouvrement
- **Fonctionnalités** :
  - Champs de configuration
  - Validation
  - Aperçu
  - Sauvegarde
- **Écran suivant** : `/sequences` (après création)

#### US2 : Gestion des Modèles
- **Écran** : `/sequences/templates`
- **Acteurs** : Administrateur
- **Fonctionnalités** :
  - Liste des modèles
  - Création/édition
  - Import/export
  - Partage
- **Écran suivant** : `/sequences/create` (après sélection)

## F06 - Séquences Automatiques

### User Stories

#### US1 : Configuration des Déclencheurs
- **Écran** : `/sequences/automatic/triggers`
- **Acteurs** : Administrateur
- **Fonctionnalités** :
  - Définition des règles
  - Planification
  - Conditions
  - Tests
- **Écran suivant** : `/sequences` (après configuration)

#### US2 : Surveillance et Logs
- **Écran** : `/sequences/automatic/logs`
- **Acteurs** : Administrateur
- **Fonctionnalités** :
  - Historique des exécutions
  - Statut des séquences
  - Filtrage
  - Export
- **Écran principal** : Tableau de bord des séquences automatiques

## F07 - Messages IA

### User Stories

#### US1 : Génération de Messages
- **Écran** : `/messages/ai-generate`
- **Acteurs** : Gestionnaire de recouvrement
- **Fonctionnalités** :
  - Interface de génération
  - Paramètres de personnalisation
  - Aperçu
  - Envoi
- **Écran suivant** : `/messages` (après génération)

#### US2 : Gestion des Modèles IA
- **Écran** : `/messages/ai-templates`
- **Acteurs** : Administrateur
- **Fonctionnalités** :
  - Liste des modèles
  - Création/édition
  - Tests
  - Partage
- **Écran suivant** : `/messages/ai-generate` (après sélection)

## F08 - Follow-ups

### User Stories

#### US1 : Planification des Follow-ups
- **Écran** : `/followups/schedule`
- **Acteurs** : Gestionnaire de recouvrement
- **Fonctionnalités** :
  - Calendrier
  - Création d'événements
  - Notifications
  - Rappels
- **Écran suivant** : `/followups` (après planification)

#### US2 : Gestion des Follow-ups
- **Écran** : `/followups`
- **Acteurs** : Gestionnaire de recouvrement
- **Fonctionnalités** :
  - Liste des follow-ups
  - Filtres
  - Actions rapides
  - Historique
- **Écran principal** : Tableau de bord des follow-ups

## F09 - Affichage des Factures

### User Stories

#### US1 : Détails d'une Facture
- **Écran** : `/invoices/{id}`
- **Acteurs** : Gestionnaire de recouvrement
- **Fonctionnalités** :
  - Informations de la facture
  - Historique des paiements
  - Actions disponibles
  - Export PDF
- **Écran précédent** : `/invoices`

#### US2 : Actions sur les Factures
- **Écran** : `/invoices/{id}/actions`
- **Acteurs** : Gestionnaire de recouvrement
- **Fonctionnalités** :
  - Envoi de relances
  - Mise à jour du statut
  - Ajout de notes
  - Historique
- **Écran suivant** : `/invoices/{id}` (après action)

## F10 - Liste des Factures

### User Stories

#### US1 : Liste des Factures Impayées
- **Écran** : `/invoices`
- **Acteurs** : Gestionnaire de recouvrement
- **Fonctionnalités** :
  - Liste paginée
  - Filtres avancés
  - Tri
  - Export
- **Écran suivant** : `/invoices/{id}` (au clic)

#### US2 : Recherche et Filtrage
- **Écran** : `/invoices`
- **Acteurs** : Gestionnaire de recouvrement
- **Fonctionnalités** :
  - Recherche full-text
  - Filtres personnalisés
  - Sauvegarde des recherches
  - Partage
- **Écran principal** : Liste des factures avec filtres appliqués

## UC01 - Gestion des Impayés sans Email

### Cas d'Utilisation Spécial

#### Scénario Principal
- **Écran** : `/impayes/sans-email`
- **Acteurs** : Gestionnaire de recouvrement, Service client
- **Fonctionnalités** :
  - Identification automatique
  - Liste dédiée
  - Actions alternatives (SMS, courrier, appel)
  - Mise à jour des informations
- **Écran suivant** : `/impayes/{id}` (après sélection)

#### Scénario Alternatif
- **Écran** : `/impayes/sans-email`
- **Acteurs** : Responsable financier
- **Fonctionnalités** :
  - Escalade des cas complexes
  - Archivage des cas sans solution
  - Reporting spécifique
  - Export des données
- **Écran suivant** : `/impayes/sans-email/archives`

## Matrix des Écrans et Fonctionnalités

| Feature | Écran Principal | Écrans Secondaires | Acteurs Principaux |
|---------|-----------------|-------------------|--------------------|
| F01 | `/login` | - | Utilisateur non connecté |
| F02 | Tous (via layout) | - | Utilisateur connecté |
| F03 | Mobile (`/impayes`, `/sequences`) | - | Utilisateur mobile |
| F04 | `/sequences` | `/sequence-detail` | Gestionnaire |
| F05 | `/sequences/create` | `/sequences/templates` | Gestionnaire, Admin |
| F06 | `/sequences/automatic/triggers` | `/sequences/automatic/logs` | Administrateur |
| F07 | `/messages/ai-generate` | `/messages/ai-templates` | Gestionnaire, Admin |
| F08 | `/followups` | `/followups/schedule` | Gestionnaire |
| F09 | `/invoices/{id}` | `/invoices/{id}/actions` | Gestionnaire |
| F10 | `/invoices` | - | Gestionnaire |
| UC01 | `/impayes/sans-email` | `/impayes/sans-email/archives` | Gestionnaire, Service Client |

## Statistiques

- **Total des User Stories** : 21 (20 US principales + 1 UC spécial)
- **Total des Écrans** : 18 écrans principaux et secondaires
- **Acteurs Identifiés** : 5 types d'acteurs différents
- **Fonctionnalités Couvertes** : 42 fonctionnalités spécifiques

## Légende

- **US** : User Story
- **UC** : Use Case (Cas d'utilisation spécial)
- **Écran Principal** : Écran principal associé à la fonctionnalité
- **Écrans Secondaires** : Écrans supplémentaires liés
- **Acteurs** : Rôles utilisateurs concernés