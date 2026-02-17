 - **preparation**: 
   - [] lancer le script: getParseData.sh et ensuite lire le fichier data-model.md.
   - [] lire le contenu du dossier guides/. Tous les fichiers.
  - **action  à faire en RESPECTANT les guides** : ---

## **📋 User Story (US)**
**Titre** : US002 - Édition du profil utilisateur (informations personnelles)
**En tant que** [Utilisateur connecté]
**Je veux** modifier mes informations personnelles (pseudo, email, avatar)
**Afin de** garder mon profil à jour.

### **Critères d'acceptation** (Gherkin)
```gherkin
Scénario 1 : Édition réussie du pseudo
  Étant donné que je suis connecté et sur la page "Mon Profil"
  Quand je modifie mon pseudo (ex: "NouveauPseudo")
    Et que je clique sur "Enregistrer"
  Alors une requête Parse.User.update est envoyée
    Et mon pseudo est mis à jour dans Parse Server
    Et je vois un message de confirmation "Profil mis à jour"

Scénario 2 : Échec - Pseudo déjà utilisé
  Étant donné que je suis connecté et sur la page "Mon Profil"
  Quand je saisis un pseudo déjà utilisé par un autre utilisateur
    Et que je clique sur "Enregistrer"
  Alors je vois un message d'erreur "Ce pseudo est déjà pris"
    Et les modifications ne sont pas enregistrées

Scénario 3 : Upload d'un avatar
  Étant donné que je suis connecté et sur la page "Mon Profil"
  Quand je sélectionne un fichier image (JPEG/PNG < 2Mo)
    Et que je clique sur "Enregistrer"
  Alors le fichier est uploadé vers Parse.File
    Et l'URL de l'avatar est mise à jour dans mon profil Parse
    Et l'image est affichée en prévisualisation (Alpine.js: x-bind:src)
```

---
## **🎨 Écrans ASCII**
### **Écran 1 : Page "Mon Profil"**
```plaintext
+-------------------------------------+
|          MON PROFIL                 |
+-------------------------------------+
|                                     |
| [Avatar] (cercle, taille 100px)     |
| [Bouton: Changer l'avatar]          |
|                                     |
| [Champ: Pseudo] (valeur actuelle)   |
| [Champ: Email] (valeur actuelle)    |
|                                     |
| [Bouton: Enregistrer] (Alpine.js: @click="saveProfile()") |
| [Lien: Changer mon mot de passe]    |
|                                     |
+-------------------------------------+
```
**Notes** :
- Le bouton "Enregistrer" est désactivé si aucun champ n'a été modifié.
- Style Tailwind : `border-gray-300 focus:border-blue-500` pour les champs, `bg-blue-500 hover:bg-blue-700` pour le bouton.

---
## **🔄 Diagramme Mermaid - Flux Complet**
```mermaid
flowchart TD
    A[Page "Mon Profil"] -->|Modification champ| B[Validation locale]
    B -->|Valide| C[Requête Parse.User.update]
    C -->|Succès| D[Mise à jour UI + Message confirmation]
    C -->|Échec| E[Afficher erreur Parse]
    E --> A
    B -->|Invalide| F[Afficher erreur de validation]
    F --> A
    A -->|Upload avatar| G[Parse.File.upload]
    G -->|Succès| H[Mise à jour avatar dans Parse.User]
    H --> D
    G -->|Échec| E
```

---
## **📝 Fonctions à Développer**
### **updateUserProfile**
**Params** :
- `userData` (object) : `{ username?: string, email?: string, avatar?: File }`.

**Description** :
- Met à jour les champs modifiables de l'utilisateur via `Parse.User.current().save()`.
- Gère les erreurs Parse (ex: pseudo déjà utilisé, email invalide).
- Si un avatar est fourni, upload le fichier via `Parse.File` avant de mettre à jour l'URL dans le profil.

**Retour** :
- `{ success: boolean, user: Parse.User | null, error: string | null }`.

---

### **uploadAvatar**
**Params** :
- `file` (File) : Fichier image à uploader.

**Description** :
- Vérifie que le fichier est une image (JPEG/PNG) et < 2Mo.
- Upload le fichier via `Parse.File` et retourne l'URL publique.

**Retour** :
- `{ success: boolean, url: string | null, error: string | null }`.

---

### **validateUsername**
**Params** :
- `username` (string) : Pseudo à valider.

**Description** :
- Vérifie que le pseudo contient entre 3 et 20 caractères alphanumériques.
- Vérifie que le pseudo n'est pas déjà utilisé (sauf par l'utilisateur actuel).

**Retour** :
- `{ isValid: boolean, message: string }`.
