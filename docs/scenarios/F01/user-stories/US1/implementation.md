# US1 : Implémentation - Formulaire de Connexion avec Validation

## Micro-Étapes

### Étape 1 : Page de Login Basique
**Fichiers** :
- `src/pages/login.astro`
- `tests/playwright/F01/US1/1-basic-page.spec.js`

#### Code
```astro
---
// src/pages/login.astro
---
<html>
  <body>
    <h1>Connexion à Marki14</h1>
    <form id="loginForm">
      <input type="email" placeholder="Email" required>
      <input type="password" placeholder="Mot de passe" required>
      <button type="submit">Se connecter</button>
    </form>
  </body>
</html>
```

#### Garde-fous
- **Route** : Vérifier que `/login` est accessible (test 404 si manquante)
- **Fallback** : Prévoir un message d'erreur si Astro échoue à rendre la page
- **Accessibilité** : Balises appropriées pour les champs de formulaire

#### Test Playwright
```javascript
// tests/playwright/F01/US1/1-basic-page.spec.js
test('Affichage de la page de login', async ({ page }) => {
  await page.goto('/login');
  await expect(page.locator('h1')).toHaveText('Connexion à Marki14');
  await expect(page.locator('form')).toBeVisible();
});
```

#### Commit
```bash
git add src/pages/login.astro tests/playwright/F01/US1/1-basic-page.spec.js
git commit -m "[F01-US1] Étape 1 : Page de login basique
- Structure HTML de base
- Test d'affichage minimal
- Garde-fou : Gestion des erreurs de routage"
```

---

### Étape 2 : Intégration de BaseLayout
**Fichiers** :
- `src/layouts/BaseLayout.astro`
- `src/pages/login.astro` (mis à jour)

#### Code
```astro
---
// src/layouts/BaseLayout.astro
---
<html lang="fr">
  <head>
    <title>Marki14 - {title}</title>
  </head>
  <body class="min-h-screen flex flex-col">
    <header class="bg-blue-500 text-white p-4">Marki14</header>
    <main class="flex-grow p-4"><slot /></main>
    <footer class="bg-gray-800 text-white p-4 text-center">© 2024 Marki14</footer>
  </body>
</html>
```

#### Garde-fous
- **Tailwind** : Vérifier que les classes CSS sont purgées correctement
- **Accessibilité** : Contraste suffisant (ratio 4.5:1 pour le texte)
- **Responsive** : Design adapté à mobile, tablet, desktop

#### Commit
```bash
git add src/layouts/BaseLayout.astro src/pages/login.astro
git commit -m "[F01-US1] Étape 2 : Intégration BaseLayout
- Layout responsive avec Tailwind
- Validation des contrastes (WCAG 2.1)
- Structure commune pour toutes les pages"
```

---

### Étape 3 : Gestion d'État avec Alpine.js
**Fichiers** :
- `public/js/pages/loginState.js`
- `src/pages/login.astro` (mis à jour)

#### Code
```javascript
// public/js/pages/loginState.js
document.addEventListener('alpine:init', () => {
  Alpine.data('loginState', () => ({
    email: '',
    password: '',
    remember: false,
    isLoading: false,
    error: '',
    
    validateForm() {
      if (!this.email) return 'Email obligatoire';
      if (!this.password) return 'Mot de passe obligatoire';
      if (!/^[^@]+@[^@]+\.[^@]+$/.test(this.email)) return 'Email invalide';
      return '';
    }
  }));
});
```

#### Garde-fous
- **Alpine.js** : Vérifier que Alpine est disponible avant utilisation
- **Validation** : Expressions régulières robustes pour l'email
- **Fallback** : Messages d'erreur clairs et spécifiques

#### Test Playwright
```javascript
// tests/playwright/F01/US1/3-validation.spec.js
test('Validation des champs obligatoires', async ({ page }) => {
  await page.goto('/login');
  await page.click('button[type="submit"]');
  await expect(page.locator('text=Email obligatoire')).toBeVisible();
  await expect(page.locator('text=Mot de passe obligatoire')).toBeVisible();
});
```

#### Commit
```bash
git add public/js/pages/loginState.js src/pages/login.astro
git commit -m "[F01-US1] Étape 3 : Gestion d'état Alpine.js
- Validation des champs
- Messages d'erreur dynamiques
- Gestion de l'état de chargement"
```

---

### Étape 4 : Intégration avec Parse SDK
**Fichiers** :
- `public/js/parse-utils.js`
- `public/js/pages/loginState.js` (mis à jour)

#### Code
```javascript
// public/js/parse-utils.js
let parseInitialized = false;
export function initParse() {
  if (parseInitialized) return;
  Parse.initialize("YOUR_APP_ID", "YOUR_JS_KEY");
  Parse.serverURL = 'https://your-parse-server.com/parse';
  parseInitialized = true;
}

// Ajout à loginState.js
async function handleLogin() {
  const validationError = this.validateForm();
  if (validationError) {
    this.error = validationError;
    return;
  }
  
  this.isLoading = true;
  this.error = '';
  
  try {
    const user = await Parse.User.logIn(this.email, this.password);
    // Gestion de la session à implémenter dans US2
    window.location.href = '/dashboard';
  } catch (error) {
    this.error = this.getErrorMessage(error.code);
  } finally {
    this.isLoading = false;
  }
}
```

#### Garde-fous
- **Parse** : Singleton pour empêcher les initialisations multiples
- **Erreurs** : Gestion des erreurs spécifiques de Parse
- **Sécurité** : Ne jamais exposer les clés Parse dans le code frontend

#### Test Playwright
```javascript
// tests/playwright/F01/US1/4-parse-integration.spec.js
test('Connexion réussie', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});

test('Connexion échouée', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'wrongpassword');
  await page.click('button[type="submit"]');
  await expect(page.locator('text=Email ou mot de passe incorrect')).toBeVisible();
});
```

#### Commit
```bash
git add public/js/parse-utils.js public/js/pages/loginState.js
git commit -m "[F01-US1] Étape 4 : Intégration Parse SDK
- Authentification via Parse.User.logIn
- Gestion des erreurs spécifiques
- Tests de connexion réussie/échouée"
```