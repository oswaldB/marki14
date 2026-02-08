# US2 : Implémentation - Gestion de Session et Restauration Automatique

## Micro-Étapes

### Étape 1 : Gestion de Session Basique
**Fichiers** :
- `public/js/pages/loginState.js` (mis à jour)
- `tests/playwright/F01/US2/1-session-storage.spec.js`

#### Code
```javascript
// Ajout à loginState.js
async function handleLogin() {
  // ... code existant de validation
  
  try {
    const user = await Parse.User.logIn(this.email, this.password);
    
    // Gestion de la session
    if (this.remember) {
      localStorage.setItem('parseSessionToken', user.getSessionToken());
      localStorage.setItem('parseUserId', user.id);
    } else {
      sessionStorage.setItem('parseSessionToken', user.getSessionToken());
      sessionStorage.setItem('parseUserId', user.id);
    }
    
    window.location.href = '/dashboard';
  } catch (error) {
    this.error = this.getErrorMessage(error.code);
  } finally {
    this.isLoading = false;
  }
}

function getErrorMessage(code) {
  const messages = {
    101: 'Email ou mot de passe incorrect',
    200: 'Session expirée',
    201: 'Mot de passe requis',
    202: 'Nom d\'utilisateur requis',
    default: 'Erreur de connexion'
  };
  return messages[code] || messages.default;
}
```

#### Garde-fous
- **Storage** : Vérifier la disponibilité de localStorage/sessionStorage
- **Fallback** : Gestion des navigateurs avec storage désactivé
- **Sécurité** : Ne jamais stocker de mot de passe en clair

#### Test Playwright
```javascript
// tests/playwright/F01/US2/1-session-storage.spec.js
test('Session persistante avec "Se souvenir de moi"', async ({ page, context }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.check('input[type="checkbox"]'); // Remember me
  await page.click('button[type="submit"]');
  
  // Vérifier le stockage
  const localStorage = await context.evaluate(() => {
    return { token: localStorage.getItem('parseSessionToken') };
  });
  expect(localStorage.token).toBeTruthy();
});

test('Session temporaire sans "Se souvenir de moi"', async ({ page, context }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');
  // Ne pas cocher "Se souvenir de moi"
  await page.click('button[type="submit"]');
  
  // Vérifier que localStorage est vide
  const localStorage = await context.evaluate(() => {
    return { token: localStorage.getItem('parseSessionToken') };
  });
  expect(localStorage.token).toBeFalsy();
  
  // Vérifier sessionStorage
  const sessionStorage = await context.evaluate(() => {
    return { token: sessionStorage.getItem('parseSessionToken') };
  });
  expect(sessionStorage.token).toBeTruthy();
});
```

#### Commit
```bash
git add public/js/pages/loginState.js
git commit -m "[F01-US2] Étape 1 : Gestion de session basique
- Stockage des tokens dans localStorage/sessionStorage
- Option 'Se souvenir de moi' fonctionnelle
- Messages d'erreur spécifiques par code Parse"
```

---

### Étape 2 : Restauration Automatique de Session
**Fichiers** :
- `src/layouts/BaseLayout.astro` (mis à jour)
- `public/js/sessionManager.js`
- `tests/playwright/F01/US2/2-auto-restore.spec.js`

#### Code
```javascript
// public/js/sessionManager.js
export async function restoreSession() {
  // Vérifier d'abord localStorage, puis sessionStorage
  let token = localStorage.getItem('parseSessionToken');
  let userId = localStorage.getItem('parseUserId');
  
  if (!token || !userId) {
    token = sessionStorage.getItem('parseSessionToken');
    userId = sessionStorage.getItem('parseUserId');
  }
  
  if (token && userId) {
    try {
      const user = await Parse.User.become(token);
      if (user && user.id === userId) {
        return { success: true, user };
      }
    } catch (error) {
      // Session invalide ou expirée
      clearSession();
      return { success: false, error: 'Session expirée' };
    }
  }
  
  return { success: false, error: 'Aucune session' };
}

export function clearSession() {
  localStorage.removeItem('parseSessionToken');
  localStorage.removeItem('parseUserId');
  sessionStorage.removeItem('parseSessionToken');
  sessionStorage.removeItem('parseUserId');
}
```

#### Garde-fous
- **Performance** : Limiter le temps de restauration à 500ms max
- **Erreurs** : Gestion des sessions expirées ou invalides
- **Sécurité** : Vérification de l'intégrité du token et userId

#### Test Playwright
```javascript
// tests/playwright/F01/US2/2-auto-restore.spec.js
test('Restauration automatique de session valide', async ({ page, context }) => {
  // Créer une session valide
  await context.evaluate(([token, userId]) => {
    localStorage.setItem('parseSessionToken', token);
    localStorage.setItem('parseUserId', userId);
  }, ['valid-token', 'user123']);
  
  await page.goto('/dashboard');
  
  // Vérifier la redirection ou l'accès
  await expect(page).toHaveURL('/dashboard');
});

test('Gestion de session expirée', async ({ page, context }) => {
  // Créer une session expirée
  await context.evaluate(([token, userId]) => {
    localStorage.setItem('parseSessionToken', token);
    localStorage.setItem('parseUserId', userId);
  }, ['expired-token', 'user123']);
  
  // Mock Parse.User.become pour simuler une erreur
  await page.route('**/parse/users/me', route => {
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ code: 200, error: 'Session expirée' })
    });
  });
  
  await page.goto('/dashboard');
  
  // Vérifier la redirection vers login
  await expect(page).toHaveURL('/login');
  
  // Vérifier que la session est effacée
  const localStorage = await context.evaluate(() => {
    return {
      token: localStorage.getItem('parseSessionToken'),
      userId: localStorage.getItem('parseUserId')
    };
  });
  expect(localStorage.token).toBeFalsy();
  expect(localStorage.userId).toBeFalsy();
});
```

#### Commit
```bash
git add public/js/sessionManager.js src/layouts/BaseLayout.astro
git commit -m "[F01-US2] Étape 2 : Restauration automatique de session
- Vérification des tokens au chargement
- Gestion des sessions expirées
- Nettoyage automatique des sessions invalides"
```

---

### Étape 3 : Intégration dans le Layout Principal
**Fichiers** :
- `src/layouts/BaseLayout.astro` (mis à jour)
- `tests/playwright/F01/US2/3-layout-integration.spec.js`

#### Code
```astro
---
// src/layouts/BaseLayout.astro
import { restoreSession } from '../public/js/sessionManager.js';
---

<script>
  // Vérifier la session au chargement
  document.addEventListener('DOMContentLoaded', async () => {
    const { success, error } = await restoreSession();
    
    if (!success && !window.location.pathname.includes('/login')) {
      // Rediriger vers login si pas de session et pas sur page de login
      if (error === 'Session expirée') {
        // Optionnel : afficher un message
        localStorage.setItem('loginMessage', 'Votre session a expiré. Veuillez vous reconnecter.');
      }
      window.location.href = '/login';
    }
  });
</script>

<html lang="fr">
  <!-- Contenu existant -->
</html>
```

#### Garde-fous
- **Performance** : Ne pas bloquer le rendu initial
- **Boucles** : Éviter les redirections infinies
- **Messages** : Afficher des messages appropriés pour les sessions expirées

#### Test Playwright
```javascript
// tests/playwright/F01/US2/3-layout-integration.spec.js
test('Redirection vers login sans session', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL('/login');
});

test('Accès direct à login sans redirection', async ({ page }) => {
  await page.goto('/login');
  await expect(page).toHaveURL('/login');
  await expect(page.locator('h1')).toHaveText('Connexion à Marki14');
});

test('Message de session expirée', async ({ page, context }) => {
  // Créer une session expirée
  await context.evaluate(() => {
    localStorage.setItem('parseSessionToken', 'expired-token');
    localStorage.setItem('parseUserId', 'user123');
  });
  
  await page.goto('/dashboard');
  
  // Vérifier le message
  await expect(page).toHaveURL('/login');
  const message = await context.evaluate(() => {
    return localStorage.getItem('loginMessage');
  });
  expect(message).toContain('session a expiré');
});
```

#### Commit
```bash
git add src/layouts/BaseLayout.astro
git commit -m "[F01-US2] Étape 3 : Intégration dans le layout principal
- Vérification de session au chargement
- Redirection automatique vers login
- Gestion des messages de session expirée"
```

---

### Étape 4 : Optimisation et Tests Finaux
**Fichiers** :
- `public/js/sessionManager.js` (optimisé)
- `tests/playwright/F01/US2/4-performance.spec.js`

#### Code
```javascript
// Optimisation de sessionManager.js
export async function restoreSession() {
  const startTime = Date.now();
  
  try {
    // Vérifier d'abord localStorage, puis sessionStorage
    let token = localStorage.getItem('parseSessionToken');
    let userId = localStorage.getItem('parseUserId');
    let storageType = 'local';
    
    if (!token || !userId) {
      token = sessionStorage.getItem('parseSessionToken');
      userId = sessionStorage.getItem('parseUserId');
      storageType = 'session';
    }
    
    if (token && userId) {
      const user = await Parse.User.become(token);
      
      // Vérifier que le token correspond à l'utilisateur
      if (user && user.id === userId) {
        // Rafraîchir le token si nécessaire
        if (storageType === 'local') {
          localStorage.setItem('parseSessionToken', user.getSessionToken());
        } else {
          sessionStorage.setItem('parseSessionToken', user.getSessionToken());
        }
        
        return { success: true, user };
      }
    }
  } catch (error) {
    clearSession();
    return { success: false, error: 'Session expirée' };
  } finally {
    const duration = Date.now() - startTime;
    if (duration > 500) {
      console.warn(`Restauration de session lente : ${duration}ms`);
    }
  }
  
  return { success: false, error: 'Aucune session' };
}
```

#### Garde-fous
- **Timeout** : Limiter à 500ms maximum
- **Logging** : Journalisation des performances
- **Rafraîchissement** : Mise à jour des tokens si nécessaire

#### Test Playwright
```javascript
// tests/playwright/F01/US2/4-performance.spec.js
test('Performance de restauration de session', async ({ page, context }) => {
  // Créer une session valide
  await context.evaluate(([token, userId]) => {
    localStorage.setItem('parseSessionToken', token);
    localStorage.setItem('parseUserId', userId);
  }, ['valid-token', 'user123']);
  
  const startTime = Date.now();
  await page.goto('/dashboard');
  const duration = Date.now() - startTime;
  
  expect(duration).toBeLessThan(1000); // Moins d'une seconde pour le chargement complet
});

test('Gestion des erreurs réseau', async ({ page, context }) => {
  // Simuler une erreur réseau
  await page.route('**/parse/users/me', route => route.abort());
  
  await context.evaluate(() => {
    localStorage.setItem('parseSessionToken', 'valid-token');
    localStorage.setItem('parseUserId', 'user123');
  });
  
  await page.goto('/dashboard');
  
  // Doit rediriger vers login et effacer la session
  await expect(page).toHaveURL('/login');
  
  const localStorage = await context.evaluate(() => {
    return {
      token: localStorage.getItem('parseSessionToken'),
      userId: localStorage.getItem('parseUserId')
    };
  });
  expect(localStorage.token).toBeFalsy();
});
```

#### Commit
```bash
git add public/js/sessionManager.js
git commit -m "[F01-US2] Étape 4 : Optimisation et tests finaux
- Optimisation des performances
- Gestion des erreurs réseau
- Rafraîchissement des tokens
- Validation complète des critères d'acceptation"
```