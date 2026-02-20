 - **preparation**: 
   - [] lancer le script: getParseData.sh et ensuite lire le fichier data-model.md.
   - [] lire le contenu du dossier guides/. Tous les fichiers.
  - **action  à faire en RESPECTANT les guides** : ## **📋 User Story (US2)**
**Titre** : US002 - Consulter l'historique des modifications d'un email planifié
**En tant que** [Utilisateur ou administrateur]
**Je veux** voir l'historique des modifications apportées à un email planifié
**Afin de** tracer les changements et identifier qui a modifié quoi et quand.

### **Critères d'acceptation** (Gherkin)
```gherkin
Scénario 1 : Affichage de l'historique complet
  Étant donné que je suis sur la page de détails d'un email planifié
  Quand je clique sur l'onglet "Historique"
  Alors je vois une liste chronologique des modifications
    Et chaque entrée affiche :
      - La date/heure de la modification
      - L'utilisateur ayant effectué le changement (avatar + nom)
      - Les champs modifiés (ex: "Objet : 'Réunion' → 'Réunion d'équipe'")
      - Un bouton "Voir les détails" pour les changements complexes (corps de l'email)

Scénario 2 : Historique vide
  Étant donné que je consulte un email jamais modifié
  Quand je clique sur l'onglet "Historique"
  Alors je vois un message "Aucune modification enregistrée"

Scénario 3 : Comparaison avant/après pour le corps de l'email
  Étant donné que je consulte l'historique d'un email modifié
  Quand je clique sur "Voir les détails" pour une modification du corps
  Alors une modale s'ouvre avec :
    - La version avant (à gauche, en rouge)
    - La version après (à droite, en vert)
    - Les différences surlignées (diff algorithm)
```

---

## **🎨 Écrans ASCII**
### **Écran 1 : Onglet Historique**
```plaintext
+-----------------------------------------------------+
| [← Retour]          HISTORIQUE #123                |
+-----------------------------------------------------+
| [Onglet: Détails] [Onglet: Historique (actif)]     |
+-----------------------------------------------------+
| 15/10/2024 à 09:30 - Jean Dupont                   |
|   • Objet : "Réunion" → "Réunion d'équipe"          |
|   • Destinataires : +manager@entreprise.com         |
|   [Bouton: Voir les détails]                        |
|                                                     |
| 14/10/2024 à 16:45 - Marie Martin                  |
|   • Corps : [Modification]                          |
|   [Bouton: Voir les détails]                        |
+-----------------------------------------------------+
| [Message si vide] : "Aucune modification enregistrée" |
+-----------------------------------------------------+
```

### **Écran 2 : Modale de comparaison (diff)**
```plaintext
+-----------------------------------------------------+
| COMPARAISON - CORPS DE L'EMAIL                      |
+-----------------------------------------------------+
| [×] Fermer                                          |
+---------------------+-------------------------------+
| AVANT               | APRÈS                        |
+---------------------+-------------------------------+
| Bonjour,            | Bonjour l'équipe,             |
|                     |                               |
| La réunion est      | La réunion aura lieu demain   |
| prévue demain.      | à 14h.                        |
|                     |                               |
| Cordialement,       | Cordialement,                 |
+---------------------+-------------------------------+
| [Bouton: Fermer]                                   |
+-----------------------------------------------------+
```

---

## **🔄 Diagramme Mermaid - Flux Historique**
```mermaid
flowchart TD
    A[Page détails email] -->|Clique onglet "Historique"| B[Requête API fetchHistory]
    B --> C{Historique vide ?}
    C -->|Non| D[Afficher liste des modifications]
    C -->|Oui| E[Afficher message "Aucune modification"]
    D --> F[Clique sur "Voir les détails"]
    F --> G[Requête API getDiff]
    G --> H[Ouvrir modale de comparaison]
```

---

## **📝 Fonctions à Développer**

### **1. `logEmailModification`**
**Params** :
- `emailId` (String) : ID du Parse.Object de l'email.
- `user` (Parse.User) : Utilisateur ayant effectué la modification.
- `changes` (Object) :
  - `subject` (Object, optionnel) : `{ old: String, new: String }`.
  - `body` (Object, optionnel) : `{ old: String, new: String }`.
  - `recipients` (Object, optionnel) : `{ added: Array<String>, removed: Array<String> }`.

**Description** :
- Appelée automatiquement après chaque mise à jour de l'email (via `updateEmailPlanified`).
- Crée un nouveau Parse.Object `EmailHistory` avec :
  - `email` (Pointer vers l'email modifié).
  - `user` (Pointer vers l'utilisateur).
  - `changes` (Object JSON stockant les modifications).
  - `timestamp` (Date de la modification).

**Retour** :
- `Promise<Parse.Object>` : Objet historique créé.

---

### **2. `fetchEmailHistory`**
**Params** :
- `emailId` (String) : ID de l'email.
- `limit` (Number, optionnel) : Nombre max d'entrées à retourner (défaut: 20).

**Description** :
- Récupère la liste des modifications pour un email donné, triées par date décroissante.
- Inclut les données utilisateur (nom, avatar) via `include: ["user"]`.

**Retour** :
- `Promise<Array<Parse.Object>>` : Liste des objets `EmailHistory`.

---

### **3. `getDiffForField`**
**Params** :
- `historyId` (String) : ID de l'entrée d'historique.
- `field` (String) : Champ à comparer ("body", "subject", etc.).

**Description** :
- Récupère les versions avant/après d'un champ spécifique pour une entrée d'historique.
- Pour le champ `body`, utilise un algorithme de diff (ex: `diff-match-patch`) pour générer un HTML avec les différences surlignées.

**Retour** :
- `Promise<Object>` :
  - `{ before: String, after: String, diffHtml: String }`.

---

### **4. `renderHistoryEntry`**
**Params** :
- `historyEntry` (Parse.Object) : Objet `EmailHistory`.

**Description** (Frontend - Alpine.js) :
- Formate une entrée d'historique pour l'affichage dans l'UI :
  - Date/heure formatée.
  - Nom de l'utilisateur + avatar.
  - Liste des champs modifiés (ex: "Objet : X → Y").
  - Bouton "Voir les détails" si le corps a été modifié.

**Retour** :
- `Object` : Données formatées pour l'affichage.

---

### **5. `showDiffModal`**
**Params** :
- `historyId` (String) : ID de l'entrée d'historique.
- `field` (String) : Champ à comparer.

**Description** (Frontend - Alpine.js) :
- Ouvre une modale avec la comparaison avant/après pour un champ donné.
- Récupère les données via `getDiffForField`.
- Affiche le diff HTML généré.

**Retour** :
- Aucun (modifie l'état de la modale).

---
