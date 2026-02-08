# US1 : Implémentation - Navigation Desktop avec Double Sidebar

## Micro-Étapes

### Étape 1 : Structure de Base du Menu
**Fichiers** :
- `src/components/SideMenu.astro`
- `tests/playwright/F02/US1/1-basic-structure.spec.js`

#### Code
```astro
---
// src/components/SideMenu.astro
import { menuItems } from '../config/menuConfig';
---

<div class="flex h-full">
  <!-- Sidebar des icônes -->
  <div class="w-16 bg-gray-800 text-white flex flex-col">
    {menuItems.map(item => (
      <button class="p-3 hover:bg-gray-700">
        <i class={`lucide ${item.icon}`}></i>
      </button>
    ))}
  </div>
  
  <!-- Sidebar principale (optionnelle) -->
  <div class="w-64 bg-gray-100 border-r flex flex-col">
    <div class="p-4 font-bold">Marki14</div>
    <nav class="flex-1">
      {menuItems.map(item => (
        <div>
          <button class="w-full p-2 hover:bg-gray-200">
            {item.label}
          </button>
          {item.subItems && item.subItems.map(subItem => (
            <button class="w-full p-2 pl-8 hover:bg-gray-200">
              {subItem.label}
            </button>
          ))}
        </div>
      ))}
    </nav>
  </div>
</div>
```

#### Garde-fous
- **Responsive** : Vérifier que le menu s'adapte aux différentes tailles
- **Accessibilité** : Ajouter les attributs ARIA nécessaires
- **Performance** : Éviter les reflows pendant le rendu

#### Test Playwright
```javascript
// tests/playwright/F02/US1/1-basic-structure.spec.js
test('Structure de base du menu', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page.locator('.w-16')).toBeVisible(); // Sidebar icônes
  await expect(page.locator('.w-64')).toBeVisible(); // Sidebar principale
});
```

#### Commit
```bash
git add src/components/SideMenu.astro tests/playwright/F02/US1/1-basic-structure.spec.js
git commit -m "[F02-US1] Étape 1 : Structure de base du menu
- Double sidebar layout
- Intégration des icônes Lucide
- Test de rendu de base"
```

---

### Étape 2 : Gestion d'État avec Alpine.js
**Fichiers** :
- `public/js/components/sideMenuState.js`
- `src/components/SideMenu.astro` (mis à jour)

#### Code
```javascript
// public/js/components/sideMenuState.js
document.addEventListener('alpine:init', () => {
  Alpine.data('sideMenuState', () => ({
    activeSection: 'dashboard',
    openSections: [],
    
    toggleSection(sectionId) {
      if (this.openSections.includes(sectionId)) {
        this.openSections = this.openSections.filter(id => id !== sectionId);
      } else {
        this.openSections.push(sectionId);
      }
      this.saveState();
    },
    
    isSectionOpen(sectionId) {
      return this.openSections.includes(sectionId);
    },
    
    setActiveSection(sectionId) {
      this.activeSection = sectionId;
      this.saveState();
    },
    
    saveState() {
      localStorage.setItem('sideMenuState', JSON.stringify({
        activeSection: this.activeSection,
        openSections: this.openSections
      }));
    },
    
    loadState() {
      const savedState = localStorage.getItem('sideMenuState');
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          this.activeSection = state.activeSection || 'dashboard';
          this.openSections = state.openSections || [];
        } catch (error) {
          console.error('Erreur de chargement de l\'état du menu', error);
        }
      }
    }
  }));
});
```

#### Garde-fous
- **Validation** : Vérifier l'intégrité des données avant chargement
- **Fallback** : État par défaut si les données sont corrompues
- **Performance** : Minimiser les écritures dans localStorage

#### Test Playwright
```javascript
// tests/playwright/F02/US1/2-state-management.spec.js
test('Persistence de l\'état du menu', async ({ page, context }) => {
  await page.goto('/dashboard');
  
  // Ouvrir une section
  await page.click('text=Impayés');
  
  // Recharger la page
  await page.reload();
  
  // Vérifier que la section reste ouverte
  const state = await context.evaluate(() => {
    return JSON.parse(localStorage.getItem('sideMenuState'));
  });
  
  expect(state.openSections).toContain('impayes');
});
```

#### Commit
```bash
git add public/js/components/sideMenuState.js src/components/SideMenu.astro
git commit -m "[F02-US1] Étape 2 : Gestion d\'état Alpine.js
- Persistence dans localStorage
- Méthodes pour ouvrir/fermer les sections
- Chargement et sauvegarde de l\'état"
```

---

### Étape 3 : Animations et Transitions
**Fichiers** :
- `src/components/SideMenu.astro` (mis à jour)
- `tests/playwright/F02/US1/3-animations.spec.js`

#### Code
```astro
<!-- Ajout des transitions -->
<div x-data="sideMenuState" x-init="loadState()" class="flex h-full">
  <!-- Sidebar des icônes -->
  <div class="w-16 bg-gray-800 text-white flex flex-col transition-all duration-200">
    {menuItems.map(item => (
      <button 
        class="p-3 hover:bg-gray-700 transition-colors duration-150"
        @click="setActiveSection(item.id)"
      >
        <i class={`lucide ${item.icon}`}></i>
      </button>
    ))}
  </div>
  
  <!-- Sidebar principale avec animations -->
  <div class="w-64 bg-gray-100 border-r flex flex-col transition-all duration-200">
    <div class="p-4 font-bold">Marki14</div>
    <nav class="flex-1">
      {menuItems.map(item => (
        <div>
          <button 
            class="w-full p-2 hover:bg-gray-200 transition-colors duration-150"
            @click="toggleSection(item.id)"
          >
            {item.label}
          </button>
          <div 
            x-show="isSectionOpen(item.id)"
            x-transition:enter="transition ease-out duration-100"
            x-transition:enter-start="opacity-0 transform scale-95"
            x-transition:enter-end="opacity-100 transform scale-100"
            x-transition:leave="transition ease-in duration-75"
            x-transition:leave-start="opacity-100 transform scale-100"
            x-transition:leave-end="opacity-0 transform scale-95"
          >
            {item.subItems && item.subItems.map(subItem => (
              <button class="w-full p-2 pl-8 hover:bg-gray-200 transition-colors duration-150">
                {subItem.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </nav>
  </div>
</div>
```

#### Garde-fous
- **Performance** : Limiter la durée des animations à 200ms max
- **Accessibilité** : Désactiver les animations si préférence utilisateur
- **Fallback** : CSS de base sans animations si nécessaire

#### Test Playwright
```javascript
// tests/playwright/F02/US1/3-animations.spec.js
test('Animations fluides', async ({ page }) => {
  await page.goto('/dashboard');
  
  const startTime = Date.now();
  await page.click('text=Impayés');
  const duration = Date.now() - startTime;
  
  expect(duration).toBeLessThan(300); // Animation + traitement
});
```

#### Commit
```bash
git add src/components/SideMenu.astro
git commit -m "[F02-US1] Étape 3 : Animations et transitions
- Animations fluides pour l\'ouverture/fermeture
- Transitions CSS optimisées
- Gestion des préférences utilisateur"
```

---

### Étape 4 : Intégration avec le Routing
**Fichiers** :
- `src/layouts/BaseLayout.astro` (mis à jour)
- `public/js/components/sideMenuState.js` (mis à jour)

#### Code
```javascript
// Ajout à sideMenuState.js
setActiveSection(sectionId) {
  this.activeSection = sectionId;
  
  // Mettre à jour l'URL en fonction de la section
  const section = menuItems.find(item => item.id === sectionId);
  if (section) {
    if (section.route) {
      window.location.href = section.route;
    } else if (section.subItems && section.subItems.length > 0) {
      // Ouvrir la section mais ne pas naviguer
      if (!this.openSections.includes(sectionId)) {
        this.openSections.push(sectionId);
      }
    }
  }
  
  this.saveState();
}
```

#### Garde-fous
- **Navigation** : Vérifier que les routes existent
- **Histoire** : Gestion de l'historique de navigation
- **Performance** : Éviter les rechargements inutiles

#### Test Playwright
```javascript
// tests/playwright/F02/US1/4-routing.spec.js
test('Navigation entre sections', async ({ page }) => {
  await page.goto('/dashboard');
  
  await page.click('text=Impayés');
  await expect(page).toHaveURL('/impayes');
  
  await page.click('text=Séquences');
  await expect(page).toHaveURL('/sequences');
});
```

#### Commit
```bash
git add public/js/components/sideMenuState.js src/layouts/BaseLayout.astro
git commit -m "[F02-US1] Étape 4 : Intégration avec le routing
- Navigation entre sections
- Mise à jour de l\'URL
- Gestion de l\'historique"
```

---

### Étape 5 : Optimisation et Tests Finaux
**Fichiers** :
- `public/js/components/sideMenuState.js` (optimisé)
- `tests/playwright/F02/US1/5-performance.spec.js`

#### Code
```javascript
// Optimisation de sideMenuState.js
toggleSection(sectionId) {
  const startTime = performance.now();
  
  if (this.openSections.includes(sectionId)) {
    this.openSections = this.openSections.filter(id => id !== sectionId);
  } else {
    this.openSections.push(sectionId);
  }
  
  this.saveState();
  
  const duration = performance.now() - startTime;
  if (duration > 50) {
    console.warn(`Toggle section lent : ${duration}ms`);
  }
}

saveState() {
  // Debounce pour éviter les écritures trop fréquentes
  if (this.saveTimeout) {
    clearTimeout(this.saveTimeout);
  }
  
  this.saveTimeout = setTimeout(() => {
    try {
      localStorage.setItem('sideMenuState', JSON.stringify({
        activeSection: this.activeSection,
        openSections: this.openSections
      }));
    } catch (error) {
      console.error('Erreur de sauvegarde de l\'état', error);
    }
  }, 100);
}
```

#### Garde-fous
- **Performance** : Debounce pour les sauvegardes
- **Erreurs** : Gestion des erreurs de localStorage
- **Logging** : Journalisation des performances

#### Test Playwright
```javascript
// tests/playwright/F02/US1/5-performance.spec.js
test('Performance globale', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/dashboard');
  
  // Ouvrir et fermer plusieurs sections
  for (let i = 0; i < 5; i++) {
    await page.click('text=Impayés');
    await page.click('text=Séquences');
  }
  
  const duration = Date.now() - startTime;
  expect(duration).toBeLessThan(1000); // Moins d'une seconde pour 10 actions
});
```

#### Commit
```bash
git add public/js/components/sideMenuState.js
git commit -m "[F02-US1] Étape 5 : Optimisation et tests finaux
- Debounce pour les sauvegardes
- Journalisation des performances
- Validation complète des critères d\'acceptation"
```