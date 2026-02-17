 - **preparation**: 
   - [] lancer le script: getParseData.sh et ensuite lire le fichier data-model.md.
   - [] lire le contenu du dossier guides/. Tous les fichiers.
  - **action  à faire en RESPECTANT les guides** : ---

## **📋 User Story (US)**
**Titre** : US003 - Visualisation du profil public d'un utilisateur
**En tant que** [Utilisateur (connecté ou non)]
**Je veux** consulter le profil public d'un autre utilisateur (pseudo, avatar, date d'inscription)
**Afin de** voir ses informations et ses activités.

### **Critères d'acceptation** (Gherkin)
```gherkin
Scénario 1 : Affichage d'un profil public existant
  Étant donné que je suis sur la page d'accueil
  Quand je clique sur le pseudo d'un utilisateur (ex: "@JeanDupont")
  Alors je suis redirigé vers `/profil/@JeanDupont`
    Et je vois son avatar, son pseudo, sa date d'inscription
    Et je vois un bouton "Envoyer un message" (si connecté)

Scénario 2 : Profil introuvable
  Étant donné que je suis sur la page `/profil/@UtilisateurInexistant`
  Quand la page charge
  Alors je vois un message "Utilisateur introuvable"
    Et un bouton "Retour à l'accueil"

Scénario 3 : Affichage des activités récentes (si connecté)
  Étant donné que je suis connecté et sur `/profil/@JeanDupont`
  Quand JeanDupont a des activités récentes (ex: posts, commentaires)
  Alors je vois une section "Activités récentes" avec les 5 dernières entrées
    Et chaque entrée affiche le titre, la date et un lien vers l'activité
```

---
## **🎨 Écrans ASCII**
### **Écran 1 : Page Profil Public**
```plaintext
+-------------------------------------+
|          PROFIL DE @JeanDupont      |
+-------------------------------------+
|                                     |
| [Avatar] (cercle, taille 150px)     |
| Pseudo: @JeanDupont                 |
| Membre depuis: 12/05/2023           |
|                                     |
| [Bouton: Envoyer un message] (si connecté) |
|                                     |
| --- ACTIVITÉS RÉCENTES ---          |
| 1. [Post] "Mon dernier article"     |
|    Publié le 01/10/2023             |
| 2. [Commentaire] "Sur le post X"    |
|    Le 28/09/2023                    |
|                                     |
+-------------------------------------+
```
**Notes** :
- Style Tailwind : `bg-gray-100` pour la section activités, `text-gray-600` pour les dates.
- Le bouton "Envoyer un message" est masqué si l'utilisateur n'est pas connecté (Alpine.js : `x-show`).

---
## **🔄 Diagramme Mermaid - Flux Complet**
```mermaid
flowchart TD
    A[Page Profil Public] -->|Chargement| B[Requête Parse.Query pour l'utilisateur]
    B -->|Utilisateur trouvé| C[Afficher profil]
    C --> D[Requête Parse.Query pour activités récentes]
    D -->|Activités trouvées| E[Afficher activités]
    D -->|Aucune activité| F[Afficher "Aucune activité récente"]
    B -->|Utilisateur introuvable| G[Afficher message d'erreur]
    G --> H[Bouton "Retour à l'accueil"]
```

---
## **📝 Fonctions à Développer**
### **getPublicUserProfile**
**Params** :
- `username` (string) : Pseudo de l'utilisateur à récupérer.

**Description** :
- Effectue une requête `Parse.Query` pour récupérer l'utilisateur avec le pseudo donné.
- Exclut les champs sensibles (ex: email, mot de passe).
- Retourne les données publiques (pseudo, avatar, date de création).

**Retour** :
- `{ success: boolean, user: object | null, error: string | null }`.

---

### **getUserRecentActivities**
**Params** :
- `userId` (string) : ID de l'utilisateur Parse.
- `limit` (number) : Nombre maximal d'activités à retourner (défaut: 5).

**Description** :
- Effectue une requête `Parse.Query` pour récupérer les activités récentes de l'utilisateur (ex: posts, commentaires).
- Trie les résultats par date décroissante.
- Formate les données pour l'affichage (titre, date, type, lien).

**Retour** :
- `{ success: boolean, activities: array | null, error: string | null }`.

---

### **sendMessageToUser**
**Params** :
- `recipientId` (string) : ID de l'utilisateur destinataire.
- `message` (string) : Contenu du message.

**Description** :
- Vérifie que l'utilisateur actuel est connecté.
- Crée un nouvel objet `Message` dans Parse avec :
  - `sender`: Parse.User.current().
  - `recipient`: ID du destinataire.
  - `content`: message.
  - `read`: false.
- Envoie une notification (si configuré).

**Retour** :
- `{ success: boolean, messageId: string | null, error: string | null }`.
