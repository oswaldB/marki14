# Fiche d'Implémentation - Authentification US1.1

## Description
Implémentation du système d'authentification avec connexion sécurisée, gestion du token Parse et redirection paramétrée.

## User Story
```
Scénario : Connexion réussie avec redirection paramétrée
  Étant donné que je suis sur "/login?redirect=/dashboard/clients"
  Quand je saisis "oswald.bernard" et mon mot de passe
  Et que je coche "Se souvenir de moi"
  Alors mon token Parse est stocké dans localStorage
  Et je suis redirigé vers "/dashboard/clients"

Scénario : Connexion sans paramètre redirect
  Étant donné que je suis sur "/login"
  Quand je saisis mes identifiants
  Alors je suis redirigé vers "/dashboard" (par défaut)
```

## Modèle de Données Parse
Utilisation de la classe native `_User` avec les champs :
- `username`: String (identifiant de connexion)
- `password`: String (mot de passe hashé)
- `rememberMeToken`: String (optionnel, pour la persistance)

## Architecture Technique

### Frontend (Alpine.js)
- **Fichier**: `front/public/js/pages/loginState.js`
- **Page**: `front/src/pages/login.astro`
- **Layout**: `BaseLayout` avec `withAuth=false`

### Backend
- **Approche**: Parse Cloud Functions (pas de Fastify requis)
- **Authentification**: Parse.User.logIn()
- **Stockage**: localStorage/sessionStorage selon l'option "Se souvenir de moi"

## Todo Liste d'Implémentation

### 1. Création de la Page de Connexion

#### Fichier: `front/src/pages/login.astro`
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout
  title="Connexion"
  withAuth={false}
  Alpinefile="/js/pages/loginState.js"
>
  <div class="container mx-auto px-4 py-8 max-w-md">
    <div class="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
      <h1 class="text-2xl font-bold text-gray-900 mb-6 text-center">Connexion</h1>
      
      <form
        x-data="loginState()"
        @submit.prevent="login()"
        class="space-y-4"
      >
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700 mb-1">Identifiant</label>
          <input
            type="text"
            id="username"
            x-model="username"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#007ACE] focus:border-transparent"
            placeholder="Votre identifiant"
            required
          >
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
          <input
            type="password"
            id="password"
            x-model="password"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#007ACE] focus:border-transparent"
            placeholder="••••••••"
            required
          >
        </div>
        
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              type="checkbox"
              id="remember"
              x-model="rememberMe"
              class="h-4 w-4 text-[#007ACE] focus:ring-[#007ACE] border-gray-300 rounded"
            >
            <label for="remember" class="ml-2 block text-sm text-gray-700">Se souvenir de moi</label>
          </div>
          
          <a href="/mot-de-passe-oublie" class="text-sm text-[#007ACE] hover:text-[#006BCE]">
            Mot de passe oublié ?
          </a>
        </div>
        
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-[#007ACE] text-white py-2 px-4 rounded-md hover:bg-[#006BCE] transition-colors focus:outline-none focus:ring-2 focus:ring-[#007ACE] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span x-show="!loading">Connexion</span>
          <span x-show="loading" class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Connexion en cours...
          </span>
        </button>
        
        <div x-show="error" class="bg-red-50 border border-red-200 rounded-md p-3">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-red-800">Erreur</p>
              <p class="text-sm text-red-700" x-text="error"></p>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</BaseLayout>
```

### 2. Implémentation du State Alpine.js

#### Fichier: `front/public/js/pages/loginState.js`
```javascript
/**
 * État Alpine.js pour la page de connexion
 * Gère l'authentification, le stockage du token et la redirection
 */

if (typeof document !== 'undefined') {
  document.addEventListener('alpine:init', () => {
    Alpine.data('loginState', () => ({
      // État initial
      username: '',
      password: '',
      rememberMe: false,
      loading: false,
      error: null,
      
      // Méthode de connexion
      async login() {
        this.loading = true;
        this.error = null;
        
        try {
          // Appel à Parse pour l'authentification
          const user = await Parse.User.logIn(this.username, this.password);
          
          // Récupération du token de session
          const sessionToken = user.getSessionToken();
          const userId = user.id;
          
          // Stockage du token selon l'option "Se souvenir de moi"
          const tokenData = {
            parseToken: sessionToken,
            userId: userId,
            username: this.username
          };
          
          if (this.rememberMe) {
            localStorage.setItem('parseAuth', JSON.stringify(tokenData));
          } else {
            sessionStorage.setItem('parseAuth', JSON.stringify(tokenData));
          }
          
          // Redirection selon le paramètre URL ou par défaut
          const urlParams = new URLSearchParams(window.location.search);
          const redirectUrl = urlParams.get('redirect') || '/dashboard';
          
          window.location.href = redirectUrl;
          
        } catch (error) {
          console.error('Erreur de connexion:', error);
          this.error = 'Identifiant ou mot de passe incorrect. Veuillez réessayer.';
          
          // Effacer les champs sensibles
          this.password = '';
        } finally {
          this.loading = false;
        }
      },
      
      // Initialisation
      init() {
        // Vérifier si l'utilisateur est déjà connecté
        const storedAuth = localStorage.getItem('parseAuth') || sessionStorage.getItem('parseAuth');
        
        if (storedAuth) {
          // Rediriger vers le dashboard si déjà connecté
          window.location.href = '/dashboard';
        }
      }
    }));
  });
}
```

### 3. Configuration Parse

#### Fichier: `front/public/js/parse-config.js`
```javascript
// Configuration de Parse pour le frontend
Parse.initialize("VOTRE_APPLICATION_ID");
Parse.serverURL = 'https://votre-serveur-parse.com/parse';
```

### 4. Middleware d'Authentification (Optionnel)

#### Fichier: `front/src/middleware/auth.js` (si nécessaire)
```javascript
// Middleware pour vérifier l'authentification sur les pages protégées
export function checkAuth() {
  const auth = localStorage.getItem('parseAuth') || sessionStorage.getItem('parseAuth');
  
  if (!auth) {
    // Rediriger vers la page de login avec paramètre de redirection
    const currentPath = window.location.pathname;
    window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
    return false;
  }
  
  return JSON.parse(auth);
}
```

### 5. Tests Unitaires

#### Fichier: `tests/login.test.js`
```javascript
// Tests unitaires pour la fonction de login
describe('Login State', () => {
  let loginState;
  
  beforeEach(() => {
    // Mock de Parse.User.logIn
    global.Parse = {
      User: {
        logIn: jest.fn().mockResolvedValue({
          getSessionToken: () => 'mock-token',
          id: 'user-123'
        })
      }
    };
    
    // Initialisation du state
    loginState = loginState();
  });
  
  test('should store token in localStorage when rememberMe is true', async () => {
    loginState.username = 'test';
    loginState.password = 'password';
    loginState.rememberMe = true;
    
    await loginState.login();
    
    const storedAuth = JSON.parse(localStorage.getItem('parseAuth'));
    expect(storedAuth.parseToken).toBe('mock-token');
    expect(storedAuth.userId).toBe('user-123');
  });
  
  test('should store token in sessionStorage when rememberMe is false', async () => {
    loginState.username = 'test';
    loginState.password = 'password';
    loginState.rememberMe = false;
    
    await loginState.login();
    
    const storedAuth = JSON.parse(sessionStorage.getItem('parseAuth'));
    expect(storedAuth.parseToken).toBe('mock-token');
  });
  
  test('should redirect to default dashboard when no redirect param', async () => {
    // Mock de window.location
    delete window.location;
    window.location = { href: '', search: '' };
    
    loginState.username = 'test';
    loginState.password = 'password';
    
    await loginState.login();
    
    expect(window.location.href).toBe('/dashboard');
  });
  
  test('should redirect to specified URL when redirect param exists', async () => {
    delete window.location;
    window.location = { href: '', search: '?redirect=/dashboard/clients' };
    
    loginState.username = 'test';
    loginState.password = 'password';
    
    await loginState.login();
    
    expect(window.location.href).toBe('/dashboard/clients');
  });
});
```

## Vérification des Guides

### ✅ Conformité avec ALPINEJS-STATE-DEVELOPMENT.md
- Utilisation de `Alpine.data()` pour le state
- Structure modulaire avec état, méthodes et cycle de vie
- Gestion des erreurs et états de chargement
- Validation côté client

### ✅ Conformité avec STYLEGUIDE.md
- Utilisation des couleurs primaires (#007ACE)
- Composants UI standard (boutons, formulaires, alertes)
- Structure responsive avec Tailwind
- Icônes et états visuels cohérents

### ✅ Conformité avec PARSE-AXIOS-REST.md
- Utilisation de Parse.User.logIn() pour l'authentification
- Gestion des tokens de session
- Structure des réponses et gestion des erreurs

### ✅ Conformité avec FASTIFY_DEVELOPMENT_GUIDE.md
- Pas de Fastify requis (pas de demande explicite)
- Utilisation de l'approche Parse existante
- Architecture simple et maintenable

### ✅ Conformité avec CREATE-A-NEWPAGE.md
- Utilisation de BaseLayout
- Prop Alpinefile correctement utilisé
- Structure de page standard
- Intégration Alpine.js propre

### ✅ Conformité avec POLITIQUE-DE-TESTS.md
- Tests unitaires uniquement (pas de tests e2e)
- Tests isolés avec mocks
- Tests rapides et déterministes
- Couverture des cas principaux

## Validation du Modèle de Données

### Utilisation de _User
- ✅ Champ `username` utilisé pour l'identifiant
- ✅ Champ `password` utilisé pour l'authentification
- ✅ Token de session géré par Parse
- ✅ Stockage conforme aux bonnes pratiques

### Stockage des Tokens
```json
{
  "parseToken": "r:abc123xyz456",
  "userId": "k7X9pLmN2",
  "username": "oswald.bernard"
}
```

## Points d'Attention

1. **Sécurité**: Toujours utiliser HTTPS pour éviter l'interception des tokens
2. **Expiration**: Les tokens Parse ont une durée de vie limitée (configurable côté serveur)
3. **Déconnexion**: Implémenter un mécanisme de déconnexion qui efface le storage
4. **Rafraîchissement**: Prévoir un mécanisme pour rafraîchir le token si nécessaire

## Dépendances

- Parse SDK (déjà intégré au projet)
- Alpine.js (déjà intégré au projet)
- Tailwind CSS (déjà intégré au projet)

## Étapes de Déploiement

1. Créer les fichiers selon la structure décrite
2. Tester localement avec différents scénarios
3. Vérifier la compatibilité mobile
4. Déployer sur l'environnement de staging
5. Valider les tests d'intégration
6. Déployer en production

## Validation

- [ ] Page de login créée avec formulaire complet
- [ ] State Alpine.js implémenté avec gestion des tokens
- [ ] Redirection paramétrée fonctionnelle
- [ ] Stockage des tokens selon l'option "Se souvenir de moi"
- [ ] Gestion des erreurs et états de chargement
- [ ] Tests unitaires passés
- [ ] Conformité avec tous les guides du projet
- [ ] Intégration avec le système d'authentification existant

## Temps Estimé

- Développement: 4-6 heures
- Tests: 2-3 heures
- Intégration: 1-2 heures
- Total: 7-11 heures

## Responsables

- Développement Frontend: Équipe Alpine.js
- Intégration Parse: Équipe Backend
- Tests: Équipe QA
- Déploiement: Équipe DevOps

## Notes Supplémentaires

Cette implémentation suit les meilleures pratiques du projet et respecte l'architecture existante. Aucune modification majeure n'est requise côté backend Parse, ce qui minimise les risques et facilite la maintenance.

La solution est conçue pour être extensible et permettre l'ajout futur de fonctionnalités comme:
- Authentification à deux facteurs
- Récupération de mot de passe
- Connexion avec réseaux sociaux
- Journalisation des tentatives de connexion
