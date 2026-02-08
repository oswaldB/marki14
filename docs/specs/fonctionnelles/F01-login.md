# F01 : Fonctionnalité de Connexion Utilisateur

## Contexte
Permettre aux utilisateurs authentifiés d'accéder à l'application Marki14 avec gestion de session persistante et restauration automatique.

## Acteurs
- **Utilisateurs authentifiés** : Accès complet à l'application
- **Administrateurs** : Gestion des utilisateurs et des sessions
- **Visiteurs non connectés** : Redirection vers la page de login

## Fonctionnalités Clés

### 1. Formulaire de Connexion
- Champs email et mot de passe obligatoires
- Bouton de soumission avec état de chargement
- Option "Se souvenir de moi" pour session persistante
- Lien vers récupération de mot de passe (futur)

### 2. Validation et Authentification
- Validation des champs obligatoires
- Appel à Parse.User.logIn()
- Gestion des erreurs d'authentification
- Messages d'erreur spécifiques par code Parse

### 3. Gestion de Session
- Stockage du token dans localStorage (si "Se souvenir de moi")
- Stockage du token dans sessionStorage (session temporaire)
- Restauration automatique de session au chargement
- Redirection vers la page demandée ou dashboard

### 4. États et Feedback
- État de chargement pendant l'authentification
- Messages d'erreur clairs et spécifiques
- Feedback visuel pour les champs invalides
- Redirection automatique après connexion réussie

## Critères d'Acceptation

### Performance
- Temps de réponse < 2 secondes
- Temps de chargement de page < 1 seconde
- Restauration de session < 500ms

### Fonctionnel
- Connexion réussie avec credentials valides
- Messages d'erreur appropriés pour credentials invalides
- Session persistante fonctionnelle avec "Se souvenir de moi"
- Déconnexion automatique après fermeture (session temporaire)
- Restauration automatique de session valide

### Sécurité
- Token de session sécurisé
- Pas de stockage de mot de passe en clair
- Gestion sécurisée des erreurs d'authentification

### UX/UI
- Formulaire accessible (navigation clavier, labels)
- Design responsive (mobile, tablet, desktop)
- Feedback visuel clair pour toutes les actions
- Messages d'erreur compréhensibles

### Robustesse
- Gestion des erreurs réseau
- Fallback en cas d'indisponibilité de Parse
- Validation côté client et serveur

## Cas d'Usage

### Cas 1: Connexion réussie avec session persistante
1. Utilisateur arrive sur /login
2. Entre email et mot de passe valides
3. Coche "Se souvenir de moi"
4. Clique sur "Se connecter"
5. Système valide les credentials via Parse
6. Token stocké dans localStorage
7. Redirection vers /dashboard
8. Session restaurée automatiquement aux visites suivantes

### Cas 2: Connexion échouée (mot de passe incorrect)
1. Utilisateur arrive sur /login
2. Entre email valide et mot de passe incorrect
3. Clique sur "Se connecter"
4. Système tente l'authentification via Parse
5. Reçoit erreur code 101
6. Affiche message "Email ou mot de passe incorrect"
7. Utilisateur peut réessayer

### Cas 3: Restauration de session automatique
1. Utilisateur a une session valide en localStorage
2. Accède à n'importe quelle page de l'application
3. Système détecte le token de session
4. Valide le token via Parse.User.become()
5. Redirige vers la page demandée
6. Pas de passage par l'écran de login

### Cas 4: Session expirée
1. Utilisateur a un token expiré
2. Accède à une page protégée
3. Système tente de restaurer la session
4. Parse retourne une erreur d'authentification
5. Token supprimé du storage
6. Redirection vers /login avec message approprié

## Exemples de Données

### Requête de Connexion Réussie
```json
{
  "email": "utilisateur@example.com",
  "password": "motdepasse123",
  "remember": true
}
```

### Réponse Parse (Succès)
```json
{
  "username": "utilisateur@example.com",
  "objectId": "abc123def456",
  "sessionToken": "r:abc123...",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### Stockage de Session
```json
{
  "parseSessionToken": "r:abc123...",
  "parseUserId": "abc123def456"
}
```

### Erreur Parse (Code 101)
```json
{
  "code": 101,
  "error": "Invalid login credentials."
}
```

## Priorité et Complexité
- **Priorité**: Haute (fonctionnalité critique)
- **Complexité**: Moyenne
- **Effort estimé**: 8-12 heures
- **Dépendances**: Parse SDK, Alpine.js, Tailwind CSS
