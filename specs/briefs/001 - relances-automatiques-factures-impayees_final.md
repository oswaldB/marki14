# 001 - Relances Automatiques Factures Impayées - Final

## Brief Description
Création d'une application de relances automatiques de factures impayées. Les factures impayées proviennent d'un script ou d'un upload de fichiers. L'application identifie les contacts, gère des séquences d'emails, permet l'édition de templates, et envoie des relances automatiques.

## Identified Features
1. **F001 - Importation des Factures Impayées**: Permettre l'importation des factures impayées via un script ou un upload de fichiers (PDF uniquement).
2. **F002 - Gestion des Contacts**: Identifier et enregistrer les contacts (payeurs ou apporteurs d'affaires) dans la classe Parse Contacts.
3. **F003 - Séquences d'Emails**: Créer et gérer des séquences d'emails avec des templates modifiables via Toast Editor UI.
4. **F004 - Variables Dynamiques**: Utiliser des variables dynamiques (`[[ ]]`) dans les templates pour personnaliser les emails. Ces variables sont récupérées depuis un fichier JSON.
5. **F005 - Attribution des Séquences**: Attribuer des séquences aux factures impayées de manière unitaire ou groupée.
6. **F006 - Lien de Paiement**: Intégrer des liens de paiement personnalisables dans les séquences, avec des variables dynamiques.
7. **F007 - Profils SMTP**: Gérer les profils SMTP pour l'envoi des emails.
8. **F008 - Génération par IA**: Générer des séquences d'emails via une intégration avec ChatGPT.
9. **F009 - Gestion des Contacts Sans Email**: Identifier et afficher les contacts sans email, avec le montant et le nombre de factures impactées.
10. **F010 - Règles d'Attribution Automatique**: Créer des règles pour attribuer automatiquement des séquences aux factures impayées via des filtres.
11. **F011 - Calendrier des Relances**: Afficher les relances dans un calendrier ou un tableau.
12. **F012 - Envoi des Emails**: Envoyer les emails de relance quotidiennement à 18h.
13. **F013 - Gestion des Factures PDF**: Stocker et afficher les factures PDF via FTP, avec une URL générée dynamiquement.
14. **F014 - Page Détails de l'Impayé**: Afficher les détails et les actions pour chaque facture impayée.
15. **F015 - Authentification et Dashboard**: Écran de login et dashboard avec gestion des utilisateurs (admin vs non-admin).
16. **F016 - Mise à Jour des Statuts**: Script horaire pour synchroniser les statuts de paiement.
17. **F017 - Gestion des Erreurs**: Colonnes `error` et `error_details` dans la classe `Relances` pour gérer les erreurs d'envoi.
18. **F018 - Notifications**: Système de notifications pour alerter les utilisateurs (ex : factures impayées).
19. **F019 - Rapports et Statistiques**: Fonctionnalité de rapport et de statistiques sur les relances (ex : taux de succès).
20. **F020 - Historique des Actions**: Historique des actions effectuées sur les factures impayées.
21. **F021 - Gestion des Contacts avec Plusieurs Factures**: Prendre en compte qu'un contact peut avoir plusieurs factures impayées.
22. **F022 - Affichage Groupé des Factures**: Afficher les factures impayées en mode groupé par contact, mais avec chaque facture unique.

## Questions pour Validation
1. Faut-il ajouter une fonctionnalité pour exporter les données des relances (CSV, Excel) ? **Non**
2. Souhaitez-vous intégrer un système de notifications pour les utilisateurs (ex : alertes pour les factures impayées) ? **Oui**
3. Doit-on prévoir une fonctionnalité de rapport ou de statistiques sur les relances (ex : taux de succès) ? **Oui**
4. Faut-il ajouter un historique des actions effectuées sur les factures impayées ? **Oui**
5. Souhaitez-vous une intégration avec d'autres outils (ex : CRM, comptabilité) ? **Non**