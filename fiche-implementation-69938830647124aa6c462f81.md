 - **preparation**: 
   - [] lancer le script: getParseData.sh et ensuite lire le fichier data-model.md.
   - [] lire le contenu du dossier guides/. Tous les fichiers.
  - **action  à faire en RESPECTANT les guides** : ## **📋 User Story (US3)**
**Titre** : US003 - Notifier les équipiers en cas de modification d'un email planifié
**En tant que** [Utilisateur éditant un email]
**Je veux** que les membres de mon équipe soient notifiés automatiquement quand je modifie un email planifié
**Afin de** les informer des changements et éviter les malentendus.

### **Critères d'acceptation** (Gherkin)
```gherkin
Scénario 1 : Notification envoyée aux équipiers
  Étant donné que je modifie un email planifié
    Et que l'email est partagé avec mon équipe (champ `team` dans Parse.Object)
  Quand je clique sur "Enregistrer"
  Alors une notification est envoyée à tous les membres de l'équipe (sauf moi)
    Et la notification contient :
      - Mon nom
      - Le nom de l'email modifié
      - Un résumé des changements (ex: "Objet modifié")
      - Un lien vers la page de détails de l'email

Scénario 2 : Pas de notification si l'email n'est pas partagé
  Étant donné que je modifie un email planifié
    Et que l'email n'est pas associé à une équipe
  Quand je clique sur "Enregistrer"
  Alors aucune notification n'est envoyée

Scénario 3 : Notification en temps réel (WebSocket ou Parse LiveQuery)
  Étant donné que je suis un membre de l'équipe concernée
    Et que je suis connecté à l'application
  Quand un autre utilisateur modifie l'email
  Alors je reçois une notification en temps réel dans l'UI
    Et une bannière s'affiche en haut de l'écran avec :
      - "Jean a modifié l'email 'Réunion d'équipe'"
      - [Bouton: Voir les changements]
      - [Bouton: Fermer]

Scénario 4 : Notification par email si l'utilisateur est hors ligne
  Étant donné que je suis un membre de l'équipe concernée
    Et que je ne suis pas connecté à l'application
  Quand un email planifié est modifié
  Alors je reçois un email de notification avec :
    - Le nom de l'utilisateur ayant modifié l'email
    - Le résumé des changements
    - Un lien pour voir les détails
```

---

## **🎨 Écrans ASCII**
### **Écran 1 : Notification en temps réel (UI)**
```plaintext
+-----------------------------------------------------+
| 🔔 Jean a modifié l'email "Réunion d'équipe"        |
|   • Objet : "Réunion" → "Réunion d'équipe"          |
|   • Destinataires : +manager@entreprise.com         |
|                                                     |
| [Bouton: Voir les changements] [Bouton: Fermer]     |
+-----------------------------------------------------+
```

### **Écran 2 : Email de notification**
```plaintext
Objet : [Notification] L'email "Réunion d'équipe" a été modifié

Bonjour Marie,

Jean Dupont a modifié l'email planifié "Réunion d'équipe" le 15/10/2024 à 09:30.

Changements apportés :
- Objet : "Réunion" → "Réunion d'équipe"
- Destinataires : +manager@entreprise.com

[Voir les détails] (lien vers l'application)
```

---

## **🔄 Diagramme Mermaid - Flux de Notification**
```mermaid
flowchart TD
    A[Modification email] --> B{Email associé à une équipe ?}
    B -->|Oui| C[Récupérer membres de l'équipe]
    C --> D[Exclure l'utilisateur courant]
    D --> E[Envoyer notifications]
    E --> F1[Notifications en temps réel (LiveQuery)]
    E --> F2[Emails pour utilisateurs hors ligne]
    B -->|Non| G[Fin du flux]
    F1 --> H[Afficher bannière dans l'UI]
    F2 --> I[Envoyer email via Parse Cloud Code]
```

---

## **📝 Fonctions à Développer**

### **1. `notifyTeamMembers`**
**Params** :
- `emailId` (String) : ID de l'email modifié.
- `user` (Parse.User) : Utilisateur ayant effectué la modification.
- `changesSummary` (String) : Résumé des changements (ex: "Objet et destinataires modifiés").

**Description** :
- Récupère l'équipe associée à l'email (champ `team` dans Parse.Object `Email`).
- Exclut l'utilisateur courant de la liste des destinataires.
- Pour chaque membre :
  - Si l'utilisateur est en ligne (via Parse LiveQuery), envoie une notification en temps réel.
  - Sinon, envoie un email via Parse Cloud Code.
- Stocke les notifications dans Parse.Object `Notification` pour historique.

**Retour** :
- `Promise<Array<Parse.Object>>` : Liste des objets `Notification` créés.

---

### **2. `getTeamMembers`**
**Params** :
- `teamId` (String) : ID de l'équipe (Parse.Object `Team`).

**Description** :
- Récupère tous les membres d'une équipe via une relation Parse (ex: `team.members`).
- Exclut les utilisateurs désactivés ou sans email valide.

**Retour** :
- `Promise<Array<Parse.User>>` : Liste des utilisateurs membres de l'équipe.

---

### **3. `sendRealTimeNotification`**
**Params** :
- `userIds` (Array<String>) : IDs des utilisateurs à notifier.
- `notificationData` (Object) :
  - `title` (String) : Titre de la notification.
  - `message` (String) : Message détaillé.
  - `emailId` (String) : ID de l'email concerné.
  - `changes` (Object) : Résumé des changements.

**Description** :
- Utilise Parse LiveQuery pour envoyer une notification en temps réel aux utilisateurs connectés.
- La notification est affichée dans l'UI via Alpine.js (bannière en haut de l'écran).

**Retour** :
- `Promise<Array<Parse.LiveQuery.Subscription>>` : Souscriptions LiveQuery créées.

---

### **4. `sendEmailNotification`**
**Params** :
- `userEmails` (Array<String>) : Emails des utilisateurs à notifier.
- `notificationData` (Object) : Même structure que `sendRealTimeNotification`.

**Description** (Parse Cloud Function) :
- Génère un email HTML avec :
  - Le nom de l'utilisateur ayant modifié l'email.
  - Le résumé des changements.
  - Un lien vers la page de détails de l'email (ex: `https://app.com/emails/123`).
- Envoie l'email via un service tiers (ex: SendGrid, Mailgun) ou Parse Email Adapter.

**Retour** :
- `Promise<Boolean>` : `true` si l'email a été envoyé avec succès.

---

### **5. `showNotificationBanner`**
**Params** :
- `notification` (Object) : Données de la notification reçue via LiveQuery.

**Description** (Frontend - Alpine.js) :
- Affiche une bannière de notification en haut de l'écran avec :
  - Le titre et le message.
  - Un bouton "Voir les changements" (redirige vers la page de détails de l'email).
  - Un bouton "Fermer" (supprime la bannière).
- La bannière disparaît automatiquement après 10 secondes.

**Retour** :
- Aucun (modifie l'état réactif d'Alpine.js).

---

### **6. `subscribeToEmailNotifications`**
**Params** :
- `emailId` (String) : ID de l'email à surveiller.

**Description** (Frontend - Alpine.js + Parse LiveQuery) :
- Souscrit aux modifications de l'email via Parse LiveQuery.
- Met à jour l'UI en temps réel si une notification est reçue.

**Retour** :
- `Parse.LiveQuery.Subscription` : Objet de souscription LiveQuery.
