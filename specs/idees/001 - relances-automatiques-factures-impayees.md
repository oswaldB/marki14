# 001 - Relances Automatiques Factures Impayées

## Brief Description
On va créer une application de relances automatiques de factures impayées. Ces factures impayées doivent provenir d'un script qui va les peupler à partir d'une base de données externes ou bien par upload de fichiers. Ensuite, une fois que l'on a les impayés, il est intéressant d'identifier les contacts car certains sont payeurs, d'autres apporteurs d'affaires. Quand on identifie un contact dans l'import, alors on l'enregistre dans la classe Parse Contacts. Ensuite, il existe des séquences qui sont des objets représentant une succession de templates d'email que l'utilisateur peut prévisualiser avec Toast Editor UI et modifier aussi. Les variables disponibles dans cet éditeur de séquence sont les colonnes de la classe Impayés. Les variables sont enregistrées avec un `[[ ]]`. Quand on active une séquence, alors on cherche tous les impayés associés à cette séquence via un script et on peuple la classe Relance avec les emails dont les variables ont été changées par les vraies valeurs. Il existe dans l'édition des séquences un champ délai qui prend le nombre de jours à partir duquel on crée les relances. Ce délai devient dans la table Relances la valeur de la colonne `date_envoi`. Il est possible d'attribuer une séquence à un impayé depuis l'écran Impayés de façon unitaire ou groupée, par exemple par payeur. La page Impayés affiche tous les impayés de façon unitaire mais aussi de façon groupée par payeur ou groupée par Contact, où l'on peut voir les impayés directs du contact et aussi ceux pour lesquels il est apporteur d'affaire. Dans l'édition des séquences, il est possible de mettre un lien de paiement. Le lien de paiement est éditable depuis un espace où un utilisateur peut dans un drawer/slider construire son lien de paiement en utilisant les variables `[[ ]]`. Dans l'écran d'édition, il est possible de copier-coller l'ensemble des variables disponibles. Les variables disponibles le sont dans un fichier `/static/configs/variables.json`. Le lien de paiement est alors facile à copier-coller. Dans les séquences, il est possible de créer des profils SMTP. Ces profils contiennent les informations nécessaires pour envoyer un email avec un serveur SMTP et également la signature email en HTML. S'il n'y en a pas, alors on propose à l'utilisateur d'en créer un. Depuis un espace, l'utilisateur peut modifier ces éléments. Sur la page d'édition des séquences, au début, il existe un bouton "Générer par IA". S'ouvre alors une popup qui explique la procédure : cliquer sur un bouton pour copier un prompt qui contient l'objectif de rédiger 5 emails de relances et uniquement eux en markdown, ainsi que la liste de toutes les variables et liens de paiement disponibles. La réponse de ChatGPT ne peut être que et uniquement du JSON avec toutes les informations demandées. Ensuite, l'utilisateur ouvre ChatGPT, colle le prompt, et copie la réponse JSON qu'il met dans un textarea dans cette popup. Un bouton "Valider" synchronise ce JSON avec la base de données classe Sequence et recharge la page. On doit y voir les nouveaux emails. Il existe également un autre bouton "Demander à ChatGPT" qui cette fois-ci est dans le bloc d'édition de l'email et ouvre une popup qui permet de copier un prompt qui retourne l'objectif, les précédents emails, et la liste de toutes les variables disponibles, liens de paiements inclus. L'utilisateur le colle dans ChatGPT et, ensuite, en le collant dans la zone de texte, cela l'intègre dans le Toast UI. Il faut gérer le cas des contacts qui n'ont pas d'emails. Dans ce cas, on crée une page spéciale qui affiche les contacts qui n'ont pas d'email avec leur montant et le nombre de factures associées. De plus, il est possible de créer des règles d'attribution automatique à une séquence en s'appuyant sur les variables. On peut construire des filtres qui affichent en live qui est concerné ou pas. Ces filtres sont incluant ou excluant. La fonction qui permet d'attribuer à une séquence s'applique sur les impayés qui n'ont pas de séquence associée et cela à la fin de la création des impayés par le script qui va les chercher dans la base de données. Il existe un écran Relances qui affiche soit dans un calendrier soit dans un tableau toutes les relances qui vont avoir lieu. Il est possible de modifier les messages et les objets avant envoi. Un script d'envoi tourne quotidiennement à 18h et permet d'envoyer les emails. Avant tout envoi de chaque email, le script vérifie que dans la classe Impayés l'impayé n'est pas réglé. S'il est réglé, toutes les relances à venir sont supprimées. Si non payé, alors on envoie l'email. Cas où il y a plusieurs factures : s'il y a plusieurs factures pour un même contact, c'est la raison pour laquelle dans l'édition des séquences, il est précisé que c'est un tableau qui obligatoirement doit présenter les impayés. Important aussi : les emails de relances envoyées ont la ou les factures concernées en pièce jointe. Il est aussi possible de voir dans un drawer les factures PDF depuis l'écran Impayés. Pour avoir ces factures en PDF, elles sont stockées dans un FTP où les accès sont dans le `.env` et l'URL du fichier est construite lors de l'import de l'Impayé. Enfin, il existe une page `impaye/id` qui permet d'afficher toutes les informations et toutes les actions qui ont été faites pour tenter de régler cet impayé. Il doit exister un écran de login avec un username et pas un email de login, ainsi qu'un écran dashboard avec des informations pertinentes. Enfin, un écran permet de gérer des utilisateurs de son équipe, mais uniquement si le user a l'attribut `admin=true`.

## Identified Features
1. **F001 - Importation des Factures Impayées**: Permettre l'importation des factures impayées via un script ou un upload de fichiers depuis une base de données externe ou un fichier.
2. **F002 - Identification des Contacts**: Identifier et enregistrer les contacts (payeurs ou apporteurs d'affaires) dans la classe Parse Contacts lors de l'import.
3. **F003 - Gestion des Séquences d'Emails**: Créer et modifier des séquences d'emails avec des templates éditables via Toast Editor UI, incluant des variables dynamiques.
4. **F004 - Intégration des Variables**: Utiliser des variables (ex: `[[variable]]`) dans les templates d'emails, basées sur les colonnes de la classe Impayés.
5. **F005 - Activation des Séquences**: Associer des séquences aux factures impayées et générer des relances avec des variables remplacées par les vraies valeurs.
6. **F006 - Gestion des Délais**: Configurer des délais pour les relances, stockés dans la colonne `date_envoi` de la table Relances.
7. **F007 - Attribution des Séquences**: Attribuer des séquences aux factures impayées de manière unitaire ou groupée (par payeur ou contact).
8. **F008 - Affichage des Factures Impayées**: Afficher les factures impayées de manière unitaire ou groupée (par payeur ou contact), incluant les détails des contacts.
9. **F009 - Gestion des Liens de Paiement**: Créer et éditer des liens de paiement avec des variables, accessibles via un drawer/slider.
10. **F010 - Profils SMTP**: Configurer et gérer des profils SMTP pour l'envoi d'emails, incluant la signature email en HTML.
11. **F011 - Génération par IA**: Générer des séquences d'emails via une intégration avec ChatGPT, avec synchronisation automatique.
12. **F012 - Gestion des Contacts Sans Email**: Afficher une page spéciale pour les contacts sans email, avec leur montant et le nombre de factures associées.
13. **F013 - Règles d'Attribution Automatique**: Créer des règles pour attribuer automatiquement des séquences aux factures impayées, avec des filtres incluant ou excluant.
14. **F014 - Affichage des Relances**: Afficher les relances dans un calendrier ou un tableau, avec possibilité de modifier les messages avant envoi.
15. **F015 - Envoi Automatique des Emails**: Envoyer les emails de relance quotidiennement à 18h, avec vérification préalable du statut des factures.
16. **F016 - Gestion des Factures PDF**: Stocker et afficher les factures PDF via un FTP, avec construction des URLs lors de l'import.
17. **F017 - Page Détails des Factures Impayées**: Afficher toutes les informations et actions pour une facture impayée, incluant l'historique.
18. **F018 - Authentification et Dashboard**: Créer un écran de login avec un username et un dashboard avec des informations pertinentes.
19. **F019 - Gestion des Utilisateurs**: Permettre aux administrateurs (`admin=true`) de gérer les utilisateurs de leur équipe.
20. **F020 - Pièces Jointes des Factures**: Joindre les factures PDF aux emails de relance.
21. **F021 - Vérification des Factures Réglées**: Supprimer les relances si une facture est réglée avant l'envoi.
22. **F022 - Gestion des Multiples Factures**: Gérer les cas où un contact a plusieurs factures impayées.
23. **F023 - Intégration avec ChatGPT**: Utiliser ChatGPT pour générer des séquences d'emails ou des emails individuels.
24. **F024 - Fichier de Configuration des Variables**: Utiliser un fichier `/static/configs/variables.json` pour les variables disponibles.

## Use Cases
1. **F001-US001 - Importation des Factures Impayées**:
   - L'utilisateur importe des factures impayées via un script ou un upload de fichiers depuis une base de données externe ou un fichier.
   - Le système valide et stocke les factures dans la base de données.

2. **F002-US001 - Identification des Contacts**:
   - Le système identifie les contacts (payeurs ou apporteurs d'affaires) dans les factures importées.
   - Les contacts sont enregistrés dans la classe Parse Contacts.

3. **F003-US001 - Création de Séquences d'Emails**:
   - L'utilisateur crée une séquence d'emails avec des templates éditables via Toast Editor UI.
   - Les variables (ex: `[[variable]]`) sont intégrées dans les templates.

4. **F004-US001 - Activation des Séquences**:
   - L'utilisateur active une séquence pour une ou plusieurs factures impayées.
   - Le système génère des relances avec les variables remplacées par les vraies valeurs.

5. **F005-US001 - Gestion des Délais**:
   - L'utilisateur configure un délai pour les relances.
   - Le système stocke la date d'envoi dans la colonne `date_envoi` de la table Relances.

6. **F006-US001 - Attribution des Séquences**:
   - L'utilisateur attribue une séquence à une facture impayée de manière unitaire ou groupée (par payeur ou contact).
   - Le système met à jour les associations dans la base de données.

7. **F007-US001 - Affichage des Factures Impayées**:
   - L'utilisateur visualise les factures impayées de manière unitaire ou groupée (par payeur ou contact).
   - Le système affiche les détails des factures et les actions associées.

8. **F008-US001 - Gestion des Liens de Paiement**:
   - L'utilisateur crée et édite un lien de paiement avec des variables via un drawer/slider.
   - Le système stocke le lien de paiement et permet de le copier-coller.

9. **F009-US001 - Configuration des Profils SMTP**:
   - L'utilisateur configure un profil SMTP pour l'envoi d'emails, incluant la signature email en HTML.
   - Le système stocke les informations SMTP et la signature email.

10. **F010-US001 - Génération par IA**:
    - L'utilisateur génère des séquences d'emails via une intégration avec ChatGPT en utilisant un prompt spécifique.
    - Le système synchronise les séquences générées avec la base de données et recharge la page.

11. **F011-US001 - Gestion des Contacts Sans Email**:
    - Le système affiche une page spéciale pour les contacts sans email, avec leur montant et le nombre de factures associées.
    - L'utilisateur prend des mesures pour ajouter des emails aux contacts.

12. **F012-US001 - Règles d'Attribution Automatique**:
    - L'utilisateur crée des règles pour attribuer automatiquement des séquences aux factures impayées, avec des filtres incluant ou excluant.
    - Le système applique les règles et met à jour les associations.

13. **F013-US001 - Affichage des Relances**:
    - L'utilisateur visualise les relances dans un calendrier ou un tableau.
    - Le système affiche les détails des relances et permet de modifier les messages avant envoi.

14. **F014-US001 - Envoi Automatique des Emails**:
    - Le système envoie les emails de relance quotidiennement à 18h.
    - Avant l'envoi, le système vérifie si les factures sont réglées et supprime les relances si nécessaire.

15. **F015-US001 - Gestion des Factures PDF**:
    - Le système stocke les factures PDF sur un FTP et construit les URLs des fichiers.
    - L'utilisateur visualise les factures PDF depuis l'écran des factures impayées.

16. **F016-US001 - Page Détails des Factures Impayées**:
    - L'utilisateur visualise toutes les informations et actions pour une facture impayée.
    - Le système affiche les détails et l'historique des actions.

17. **F017-US001 - Authentification et Dashboard**:
    - L'utilisateur se connecte avec un username et accède au dashboard.
    - Le système affiche des informations pertinentes sur le dashboard.

18. **F018-US001 - Gestion des Utilisateurs**:
    - L'administrateur (`admin=true`) gère les utilisateurs de son équipe.
    - Le système permet de créer, modifier et supprimer des utilisateurs.

19. **F019-US001 - Pièces Jointes des Factures**:
    - Le système joint les factures PDF aux emails de relance.
    - L'utilisateur visualise les factures PDF dans les emails envoyés.

20. **F020-US001 - Vérification des Factures Réglées**:
    - Le système vérifie si une facture est réglée avant l'envoi des relances.
    - Si la facture est réglée, les relances à venir sont supprimées.

21. **F021-US001 - Gestion des Multiples Factures**:
    - Le système gère les cas où un contact a plusieurs factures impayées.
    - Les emails de relance incluent un tableau des factures impayées.

22. **F022-US001 - Intégration avec ChatGPT**:
    - L'utilisateur utilise ChatGPT pour générer des séquences d'emails ou des emails individuels.
    - Le système intègre les réponses de ChatGPT dans les templates.

23. **F023-US001 - Fichier de Configuration des Variables**:
    - Le système utilise un fichier `/static/configs/variables.json` pour les variables disponibles.
    - L'utilisateur copie et colle les variables dans les templates.

## Usage Scenarios
1. **Scénario 1 - Importation et Relance**:
   - L'utilisateur importe des factures impayées via un script ou un upload de fichiers.
   - Le système identifie les contacts (payeurs ou apporteurs d'affaires) et les enregistre dans la classe Parse Contacts.
   - L'utilisateur crée une séquence d'emails avec des variables dynamiques et active la séquence pour les factures importées.
   - Le système génère des relances avec les variables remplacées et les envoie automatiquement à 18h.

2. **Scénario 2 - Gestion des Contacts Sans Email**:
   - Le système identifie des contacts sans email et les affiche dans une page spéciale avec leur montant et le nombre de factures associées.
   - L'utilisateur ajoute des emails aux contacts ou prend des mesures alternatives pour les contacter.

3. **Scénario 3 - Génération par IA**:
   - L'utilisateur clique sur le bouton "Générer par IA" pour créer une séquence d'emails.
   - Le système ouvre une popup avec un prompt à copier dans ChatGPT.
   - L'utilisateur copie la réponse JSON de ChatGPT dans la popup et valide pour synchroniser les séquences avec la base de données.

4. **Scénario 4 - Attribution Automatique des Séquences**:
   - L'utilisateur crée des règles d'attribution automatique basées sur des filtres (incluant ou excluant).
   - Le système applique ces règles aux factures impayées sans séquence associée et met à jour les associations.

5. **Scénario 5 - Gestion des Relances**:
   - L'utilisateur visualise les relances dans un calendrier ou un tableau.
   - Le système permet de modifier les messages et les objets avant l'envoi.
   - Le script d'envoi vérifie le statut des factures et supprime les relances si les factures sont réglées.

6. **Scénario 6 - Gestion des Factures PDF**:
   - Le système stocke les factures PDF sur un FTP et construit les URLs des fichiers.
   - L'utilisateur visualise les factures PDF depuis l'écran des factures impayées et les joint aux emails de relance.

## Dependencies
- Base de données externe pour l'importation des factures impayées.
- FTP pour le stockage des factures PDF, avec accès configurés dans le fichier `.env`.
- Intégration avec ChatGPT pour la génération de séquences d'emails et d'emails individuels.
- Bibliothèque Toast Editor UI pour l'édition des templates d'emails.
- Serveur SMTP pour l'envoi des emails, avec gestion des profils SMTP.
- Fichier de configuration `/static/configs/variables.json` pour les variables disponibles.
- Système de gestion des utilisateurs avec authentification et autorisations (`admin=true`).
- Script d'envoi automatique des emails tournant quotidiennement à 18h.
