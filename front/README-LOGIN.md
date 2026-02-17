# Documentation - Fonctionnalité de Connexion Sécurisée

## Aperçu

Ce document explique comment utiliser et tester la fonctionnalité de connexion sécurisée implémentée selon la user story US1.1.

## Structure des Fichiers

```
front/
├── src/
│   └── pages/
│       ├── login.astro          # Page de connexion
│       └── api/
│           └── login.js         # API de connexion (proxy Parse)
└── public/
    └── js/
        └── states/
            └── login/
                ├── state-main.js # State Alpine pour la page login
                └── auth.js       # Module d'authentification
```

## Configuration

### Variables d'Environnement

Créez un fichier `.env` à la racine du projet `front/` avec les variables suivantes :

```env
# Configuration Parse REST API
PARSE_SERVER_URL=https://votre-serveur-parse.com
PARSE_APP_ID=votre_application_id
PARSE_JS_KEY=votre_javascript_key
```

## Utilisation

### Scénario 1 : Connexion avec redirection paramétrée

URL : `/login?redirect=/dashboard/clients`

1. Accédez à l'URL ci-dessus
2. Saisissez vos identifiants
3. Cochez "Se souvenir de moi" si vous souhaitez une session persistante
4. Cliquez sur "Connexion"
5. Vous serez redirigé vers `/dashboard/clients` après une authentification réussie

### Scénario 2 : Connexion sans paramètre redirect

URL : `/login`

1. Accédez à l'URL ci-dessus
2. Saisissez vos identifiants
3. Cliquez sur "Connexion"
4. Vous serez redirigé vers `/dashboard` (par défaut) après une authentification réussie

## Stockage des Tokens

- **Session persistante** : Si "Se souvenir de moi" est coché, le token est stocké dans `localStorage`
- **Session temporaire** : Si "Se souvenir de moi" n'est pas coché, le token est stocké dans `sessionStorage`

## Gestion des Erreurs

Le système gère plusieurs types d'erreurs :

- **400 Bad Request** : Paramètres manquants ou invalides
- **401 Unauthorized** : Identifiants incorrects
- **403 Forbidden** : Compte désactivé
- **404 Not Found** : Utilisateur non trouvé
- **500 Server Error** : Erreur serveur

Les erreurs sont affichées à l'utilisateur dans une zone dédiée au-dessus du formulaire.

## Logs de Développement

La fonctionnalité génère des logs détaillés pour le débogage :

```
// Lors du chargement de la page
Page login chargée - URL de redirection: /dashboard/clients
State de la page login initialisé

// Lors de la soumission
Formulaire soumis - Validation: true
Début du processus de login - Username: oswald.bernard
Token stocké dans localStorage
Redirection vers: /dashboard/clients

// En cas d'erreur
Erreur lors du login: Identifiants invalides
```

## Tests

### Checklist de Validation

- [x] Connexion avec identifiants valides redirige vers l'URL spécifiée
- [x] Connexion sans paramètre `redirect` redirige vers `/dashboard`
- [x] Le token est stocké dans `localStorage` lorsque "Se souvenir de moi" est coché
- [x] Le token est stocké dans `sessionStorage` lorsque "Se souvenir de moi" n'est pas coché
- [x] Les erreurs d'authentification sont affichées à l'utilisateur
- [x] Le formulaire est désactivé pendant le chargement
- [x] Tous les logs Alpine.js sont présents et informatifs
- [x] Le design suit le style guide (couleurs, boutons, formulaires)
- [x] Les icônes Lucide sont utilisées pour le loader
- [x] Pas de CSS personnalisé - uniquement Tailwind

## Dépendances

### Frontend

- `alpinejs@3.x.x` - Gestion d'état réactive
- `@fortawesome/astro-fontawesome` - Icônes
- `axios` - Requêtes HTTP (pour l'API proxy)

### Backend

- Parse Server - Backend existant

## Notes Techniques

1. **Sécurité** : Les mots de passe ne sont jamais stockés en clair. Parse gère l'authentification de manière sécurisée.

2. **Accessibilité** :
   - Tous les champs ont des labels
   - Contraste suffisant pour l'accessibilité
   - Navigation clavier supportée

3. **Responsive Design** :
   - Testé sur mobile, tablet et desktop
   - Utilisation des classes Tailwind responsive

4. **Performance** :
   - Chargement différé des scripts Alpine.js
   - Pas de blocage du thread principal

## Ressources

- [Parse REST API Docs](https://docs.parseplatform.org/rest/guide/)
- [Alpine.js Docs](https://alpinejs.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

## Support

Pour toute question ou problème, veuillez consulter les guides du projet :

- `ALPINEJS-STATE-DEVELOPMENT.md`
- `PARSE-AXIOS-REST.md`
- `STYLEGUIDE.md`