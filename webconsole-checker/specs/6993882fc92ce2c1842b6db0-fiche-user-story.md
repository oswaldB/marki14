 - **preparation**: 
   - [] lancer le script: getParseData.sh et ensuite lire le fichier data-model.md.
   - [] lire le contenu du dossier guides/. Tous les fichiers.
  - **action  à faire en RESPECTANT les guides** : # **📌 [Feature] Édition d'un email planifié avec historique et notifications**

---

## **📋 User Story (US1)**
**Titre** : US001 - Éditer le contenu d'un email planifié (non envoyé)
**En tant que** [Utilisateur avec droits d'édition]
**Je veux** modifier le contenu (objet, corps, destinataires) d'un email planifié non encore envoyé
**Afin de** corriger des erreurs ou mettre à jour les informations avant envoi.

### **Critères d'acceptation** (Gherkin)
```gherkin
Scénario 1 : Édition réussie d'un email planifié
  Étant donné que je suis sur la page de détails d'un email planifié (statut "Brouillon" ou "Planifié")
  Quand je clique sur le bouton "Modifier"
    Et que je modifie l'objet, le corps ou les destinataires
    Et que je clique sur "Enregistrer"
  Alors les modifications sont sauvegardées en base (Parse.Object)
    Et je vois un message de confirmation "Email mis à jour avec succès"
    Et l'historique des modifications est mis à jour (US002)

Scénario 2 : Tentative d'édition d'un email déjà envoyé
  Étant donné que je suis sur la page de détails d'un email avec statut "Envoyé"
  Quand je clique sur le bouton "Modifier"
  Alors le bouton est désactivé (Alpine.js : `x-bind:disabled="email.status === 'Envoyé'"`)
    Et un tooltip affiche "Impossible de modifier un email déjà envoyé"

Scénario 3 : Annulation des modifications
  Étant donné que je suis en mode édition d'un email planifié
  Quand je clique sur "Annuler"
  Alors les champs reviennent à leur état initial
    Et aucune modification n'est sauvegardée
```

---

## **🎨 Écrans ASCII**
### **Écran 1 : Page de détails de l'email (mode lecture)**
```plaintext
+-----------------------------------------------------+
| [← Retour]          EMAIL PLANIFIÉ #123            |
+-----------------------------------------------------+
| Statut : Planifié (envoi le 15/10/2024 à 10:00)     |
| Objet : "Rappel : Réunion d'équipe"                 |
| Destinataires : team@entreprise.com, manager@...    |
| Corps :                                             |
| Bonjour l'équipe,                                   |
| La réunion aura lieu demain à 14h.                  |
| Cordialement,                                       |
| [Moi]                                               |
+-----------------------------------------------------+
| [Bouton: Modifier] (Alpine.js: @click="editMode = true") |
+-----------------------------------------------------+
```

### **Écran 2 : Mode édition (Alpine.js)**
```plaintext
+-----------------------------------------------------+
| [← Retour]          MODIFIER L'EMAIL               |
+-----------------------------------------------------+
| Objet : [Champ: "Rappel : Réunion d'équipe"]       |
| Destinataires : [Champ: team@entreprise.com]        |
| Corps :                                             |
| [Zone de texte riche (Tailwind + Alpine.js)]        |
| Bonjour l'équipe,                                   |
| La réunion aura lieu demain à 14h.                  |
| Cordialement,                                       |
| [Moi]                                               |
+-----------------------------------------------------+
| [Bouton: Enregistrer] (@click="saveChanges()")     |
| [Bouton: Annuler] (@click="editMode = false")      |
+-----------------------------------------------------+
```

---

## **🔄 Diagramme Mermaid - Flux d'édition**
```mermaid
flowchart TD
    A[Page détails email] -->|Clique sur "Modifier"| B[Mode édition]
    B --> C{Champs modifiés ?}
    C -->|Oui| D[Appel API Parse.updateEmail]
    D --> E{Succès ?}
    E -->|Oui| F[Mise à jour UI + Historique (US002) + Notification (US003)]
    E -->|Non| G[Afficher erreur]
    C -->|Non| H[Retour mode lecture]
    F --> H
    G --> B
```

---

## **📝 Fonctions à Développer**

### **1. `updateEmailPlanified`**
**Params** :
- `emailId` (String) : ID du Parse.Object de l'email.
- `updates` (Object) :
  - `subject` (String, optionnel) : Nouveau sujet.
  - `body` (String, optionnel) : Nouveau corps (HTML ou texte).
  - `recipients` (Array<String>, optionnel) : Liste des emails des destinataires.
  - `scheduledAt` (Date, optionnel) : Nouvelle date d'envoi.

**Description** :
- Vérifie que l'email a un statut compatible ("Brouillon" ou "Planifié").
- Met à jour le Parse.Object `Email` avec les nouvelles valeurs.
- Déclenche la création d'une entrée dans l'historique (US002).
- Retourne le Parse.Object mis à jour.

**Retour** :
- `Promise<Parse.Object>` : Objet email mis à jour ou erreur Parse.

---

### **2. `validateEmailFields`**
**Params** :
- `emailData` (Object) :
  - `subject` (String).
  - `body` (String).
  - `recipients` (Array<String>).

**Description** :
- Valide que :
  - Le sujet n'est pas vide.
  - Le corps contient au moins 10 caractères.
  - Au moins un destinataire est présent et valide (format email).
- Utilisée côté frontend (Alpine.js) et backend (Parse Cloud Function).

**Retour** :
- `Object` :
  - `{ isValid: Boolean, errors: Array<String> }`.

---

### **3. `toggleEditMode`**
**Params** :
- `emailId` (String) : ID de l'email.
- `isEditing` (Boolean) : Passe en mode édition ou lecture.

**Description** (Frontend - Alpine.js) :
- Bascule entre les modes "lecture" et "édition" dans l'UI.
- Désactive le bouton "Modifier" si l'email est déjà envoyé.
- Réinitialise les champs en cas d'annulation.

**Retour** :
- Aucun (modifie l'état réactif d'Alpine.js).

---

### **4. `fetchEmailDetails`**
**Params** :
- `emailId` (String) : ID de l'email.

**Description** :
- Récupère les détails d'un email depuis Parse (objet, corps, destinataires, statut, date d'envoi).
- Utilisée pour afficher la page de détails et pré-remplir le formulaire d'édition.

**Retour** :
- `Promise<Parse.Object>` : Objet email complet.

---
