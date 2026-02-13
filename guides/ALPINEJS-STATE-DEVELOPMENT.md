# Guide: Développement d'un State Alpine.js avec Modularisation

Ce guide explique comment développer un système de state management avec Alpine.js pour des applications multi-pages, avec un state dédié par page, et comment le modulariser lorsque le fichier devient trop volumineux.

## Table des matières

1. [Introduction au State Management avec Alpine.js](#introduction)
2. [Création d'un State de Base pour une Page](#state-de-base)
3. [Modularisation du State](#modularisation)
4. [Fusion des Modules](#fusion-des-modules)
5. [Bonnes Pratiques](#bonnes-pratiques)
6. [Exemple Complet](#exemple-complet)

<a name="introduction"></a>
## 1. Introduction au State Management avec Alpine.js

Dans notre approche, chaque page de l'application a son propre state dédié. Alpine.js nous permet de gérer l'état de manière modulaire :

- **Alpine.state()** : Pour créer un state global accessible dans toute l'application
- **Fichiers JS modulaires** : Pour organiser le code par page et par fonctionnalité
- **Un state par page** : Chaque page a son propre state, modularisé si nécessaire

<a name="state-de-base"></a>
## 2. Création d'un State de Base pour une Page

### State Simple pour une Page

Créez un fichier `state.js` dédié à une page spécifique :

```javascript
// public/js/states/dashboard-state.js
document.addEventListener('alpine:init', () => {
  Alpine.state('dashboard', {
    // State spécifique à la page dashboard
    stats: null,
    loading: false,
    error: null,
    
    // Getters (computed properties)
    get hasData() {
      return this.stats !== null;
    },
    
    // Actions spécifiques à la page
    async loadStats() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await fetch('/api/dashboard/stats');
        this.stats = await response.json();
      } catch (error) {
        console.error('Failed to load stats:', error);
        this.error = 'Failed to load statistics';
      } finally {
        this.loading = false;
      }
    },
    
    refresh() {
      this.loadStats();
    }
  });
});
```

### State pour une Page de Produits

```javascript
// public/js/states/products-state.js
document.addEventListener('alpine:init', () => {
  Alpine.state('products', {
    // State spécifique aux produits
    products: [],
    filter: '',
    loading: false,
    
    // Getters
    get filteredProducts() {
      if (!this.filter) return this.products;
      return this.products.filter(p => 
        p.name.toLowerCase().includes(this.filter.toLowerCase())
      );
    },
    
    // Actions
    async loadProducts() {
      this.loading = true;
      try {
        const response = await fetch('/api/products');
        this.products = await response.json();
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        this.loading = false;
      }
    },
    
    setFilter(filter) {
      this.filter = filter;
    }
  });
});
```







<a name="modularisation"></a>
## 4. Modularisation du State

Lorsque votre fichier state devient trop gros, il est temps de le découper en modules.

### Structure Recommandée

```
public/
└── js/
    └── states/
        ├── state-main.js       # Point d'entrée principal
        ├── user.js             # Module utilisateur
        ├── cart.js             # Module panier
        ├── products.js         # Module produits
        └── ui.js               # Module UI
```

### Création de Modules Individuels

#### user.js

```javascript
// public/js/states/user.js
export function createUserModule() {
  return {
    user: JSON.parse(localStorage.getItem('user')) || null,
    
    get isAuthenticated() {
      return !!this.user;
    },
    
    get isAdmin() {
      return this.user?.roles?.includes('admin');
    },
    
    async login(credentials) {
      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) throw new Error('Login failed');
      
      this.user = await response.json();
      localStorage.setItem('user', JSON.stringify(this.user));
      return this.user;
    },
    
    logout() {
      this.user = null;
      localStorage.removeItem('user');
    }
  };
}
```

#### cart.js

```javascript
// public/js/states/cart.js
export function createCartModule() {
  return {
    items: JSON.parse(localStorage.getItem('cart')) || [],
    
    get itemCount() {
      return this.items.reduce((sum, item) => sum + item.quantity, 0);
    },
    
    get total() {
      return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    
    addItem(product, quantity = 1) {
      const existingItem = this.items.find(item => item.id === product.id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        this.items.push({ ...product, quantity });
      }
      
      this.saveToLocalStorage();
    },
    
    removeItem(productId) {
      this.items = this.items.filter(item => item.id !== productId);
      this.saveToLocalStorage();
    },
    
    updateQuantity(productId, quantity) {
      const item = this.items.find(item => item.id === productId);
      if (item) {
        item.quantity = Math.max(1, quantity);
        this.saveToLocalStorage();
      }
    },
    
    clear() {
      this.items = [];
      this.saveToLocalStorage();
    },
    
    saveToLocalStorage() {
      localStorage.setItem('cart', JSON.stringify(this.items));
    }
  };
}
```

#### ui.js

```javascript
// public/js/states/ui.js
export function createUiModule() {
  return {
    modal: null,
    toasts: [],
    loading: false,
    
    showModal(name) {
      this.modal = name;
    },
    
    hideModal() {
      this.modal = null;
    },
    
    showToast(message, type = 'info') {
      const id = Date.now();
      this.toasts.push({ id, message, type });
      
      setTimeout(() => {
        this.toasts = this.toasts.filter(toast => toast.id !== id);
      }, 3000);
    },
    
    setLoading(isLoading) {
      this.loading = isLoading;
    }
  };
}
```

<a name="fusion-des-modules"></a>
## 5. Fusion des Modules dans state-main.js

### Approche 1: Fusion Simple

```javascript
// public/js/states/state-main.js
import { createUserModule } from './user';
import { createCartModule } from './cart';
import { createUiModule } from './ui';

document.addEventListener('alpine:init', () => {
  // Créer le state principal en fusionnant tous les modules
  Alpine.state('app', {
    // Fusionner tous les modules
    ...createUserModule(),
    ...createCartModule(),
    ...createUiModule(),
    
    // Vous pouvez ajouter des propriétés/méthodes spécifiques au state principal ici
    initialized: true,
    
    init() {
      console.log('State principal initialisé');
      
      // Configuration des dépendances entre modules
      this.$watch('items', () => {
        if (this.itemCount > 0) {
          this.showToast(`Panier mis à jour: ${this.itemCount} articles`);
        }
      }, { deep: true });
    }
  });
});
```



<a name="bonnes-pratiques"></a>
## 6. Bonnes Pratiques

### 1. Organisation des Fichiers

```
public/
└── js/
    ├── states/
    │   ├── state-main.js       # Point d'entrée principal
    │   ├── user.js             # Module utilisateur
    │   ├── cart.js             # Module panier
    │   ├── products.js         # Module produits
    │   ├── ui.js               # Module UI
    │   └── utils/              # Utilitaires partagés
    │       ├── api.js           # Fonctions API
    │       └── helpers.js       # Fonctions utilitaires
    └── components/             # Composants Alpine.js
        ├── counter.js
        └── modal.js
```

### 2. Nommage des Modules

- Utilisez des noms descriptifs pour les modules: `user.js`, `cart.js`, `ui.js`
- Pour les fonctions de création, utilisez le préfixe `create`: `createUserModule()`
- Le fichier principal doit s'appeler `state-main.js` pour une identification facile
- Tout est géré comme du state

### 3. Gestion des Dépendances

```javascript
// Dans state-main.js
document.addEventListener('alpine:init', () => {
  const app = Alpine.state('app');
  
  // Exemple: vider le panier lors de la déconnexion
  app.$watch('user', (newUser, oldUser) => {
    if (!newUser && oldUser) {
      app.clear();
    }
  });
});
```

### 4. Typage avec JSDoc

```javascript
/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string[]} roles
 */

/**
 * Crée un module utilisateur
 * @returns {Object} Le module utilisateur
 */
export function createUserModule() {
  return {
    /** @type {User|null} */
    user: null,
    
    /**
     * Vérifie si l'utilisateur est authentifié
     * @returns {boolean}
     */
    get isAuthenticated() {
      return !!this.user;
    }
    // ...
  };
}
```

### 5. Optimisation des Performances

- **Éviter les calculs coûteux** dans les getters
- **Utiliser $watch avec parcimonie** pour éviter les boucles de rendus
- **Débouncer les mises à jour** pour les champs de recherche

```javascript
// Dans un module
Alpine.state('app', {
  searchQuery: '',
  searchResults: [],
  
  init() {
    this.$watch('searchQuery', this.debouncedSearch);
  },
  
  debouncedSearch: _.debounce(function(query) {
    if (query.length > 2) {
      this.search(query);
    } else {
      this.searchResults = [];
    }
  }, 300),
  
  async search(query) {
    // Appel API
  }
});
```

<a name="exemple-complet"></a>
## 7. Exemple Complet: Application eCommerce

### Structure des Fichiers

```
public/
└── js/
    └── states/
        ├── state-main.js       # Point d'entrée
        ├── user.js             # Module utilisateur
        ├── cart.js             # Module panier
        ├── products.js         # Module produits
        └── ui.js               # Module UI
```

### user.js

```javascript
export function createUserModule() {
  return {
    user: JSON.parse(localStorage.getItem('user')) || null,
    
    get isAuthenticated() {
      return !!this.user;
    },
    
    get isAdmin() {
      return this.user?.roles?.includes('admin');
    },
    
    async login(credentials) {
      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) throw new Error('Login failed');
      
      this.user = await response.json();
      localStorage.setItem('user', JSON.stringify(this.user));
      return this.user;
    },
    
    logout() {
      this.user = null;
      localStorage.removeItem('user');
    }
  };
}
```

### cart.js

```javascript
export function createCartModule() {
  return {
    items: JSON.parse(localStorage.getItem('cart')) || [],
    
    get itemCount() {
      return this.items.reduce((sum, item) => sum + item.quantity, 0);
    },
    
    get total() {
      return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    
    addItem(product, quantity = 1) {
      const existingItem = this.items.find(item => item.id === product.id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        this.items.push({ ...product, quantity });
      }
      
      this.saveToLocalStorage();
    },
    
    removeItem(productId) {
      this.items = this.items.filter(item => item.id !== productId);
      this.saveToLocalStorage();
    },
    
    updateQuantity(productId, quantity) {
      const item = this.items.find(item => item.id === productId);
      if (item) {
        item.quantity = Math.max(1, quantity);
        this.saveToLocalStorage();
      }
    },
    
    clear() {
      this.items = [];
      this.saveToLocalStorage();
    },
    
    saveToLocalStorage() {
      localStorage.setItem('cart', JSON.stringify(this.items));
    }
  };
}
```

### ui.js

```javascript
export function createUiModule() {
  return {
    modal: null,
    toasts: [],
    loading: false,
    
    showModal(name) {
      this.modal = name;
    },
    
    hideModal() {
      this.modal = null;
    },
    
    showToast(message, type = 'info') {
      const id = Date.now();
      this.toasts.push({ id, message, type });
      
      setTimeout(() => {
        this.toasts = this.toasts.filter(toast => toast.id !== id);
      }, 3000);
    },
    
    setLoading(isLoading) {
      this.loading = isLoading;
    }
  };
}
```

### state-main.js

```javascript
import { createUserModule } from './user';
import { createCartModule } from './cart';
import { createUiModule } from './ui';

document.addEventListener('alpine:init', () => {
  // Créer les modules
  const userModule = createUserModule();
  const cartModule = createCartModule();
  const uiModule = createUiModule();
  
  // Initialiser le state principal en fusionnant les modules
  Alpine.state('app', {
    ...userModule,
    ...cartModule,
    ...uiModule,
    
    // Propriétés globales
    appName: 'Mon Application',
    version: '1.0.0',
    
    // Méthodes globales
    init() {
      console.log(`${this.appName} v${this.version} initialisé`);
      
      // Configuration des dépendances
      this.$watch('items', () => {
        if (this.itemCount > 0) {
          this.showToast(`Panier: ${this.itemCount} articles`);
        }
      }, { deep: true });
      
      // Vider le panier à la déconnexion
      this.$watch('user', (newUser, oldUser) => {
        if (!newUser && oldUser) {
          this.clear();
        }
      });
    },
    
    // Méthode pour réinitialiser toute l'application
    resetApp() {
      this.logout();
      this.clear();
      this.hideModal();
      this.showToast('Application réinitialisée', 'warning');
    }
  });
  
  // Initialiser le state
  Alpine.state('app').init();
});
```

### Utilisation dans les Composants

```html
<!-- Header avec état global -->
<div x-data>
  <header>
    <h1 x-text="$state.app.appName"></h1>
    
    <div class="cart-indicator" @click="$state.app.showModal('cart')">
      🛒 <span x-text="$state.app.itemCount"></span>
    </div>
    
    <template x-if="$state.app.isAuthenticated">
      <span x-text="$state.app.user.name"></span>
      <button @click="$state.app.logout()">Déconnexion</button>
    </template>
    
    <template x-if="!$state.app.isAuthenticated">
      <button @click="$state.app.showModal('login')">Connexion</button>
    </template>
  </header>
  
  <!-- Modal Panier -->
  <div x-show="$state.app.modal === 'cart'" @click.away="$state.app.hideModal()">
    <div class="modal">
      <h2>Votre Panier</h2>
      
      <template x-for="item in $state.app.items" :key="item.id">
        <div class="cart-item">
          <span x-text="item.name"></span>
          <span x-text="item.price.toFixed(2) + ' €'"></span>
          <input 
            type="number" 
            x-model="item.quantity" 
            @change="$state.app.updateQuantity(item.id, $event.target.value)" 
            min="1"
          >
        </div>
      </template>
      
      <div class="cart-total">
        Total: <span x-text="$state.app.total.toFixed(2) + ' €'"></span>
      </div>
      
      <button 
        @click="checkout()"
        :disabled="!$state.app.itemCount"
        x-bind:class="!$state.app.itemCount ? 'disabled' : ''"
      >
        Payer
      </button>
    </div>
  </div>
  
  <!-- Toasts -->
  <div class="toast-container">
    <template x-for="toast in $state.app.toasts" :key="toast.id">
      <div class="toast" :class="toast.type">
        <span x-text="toast.message"></span>
      </div>
    </template>
  </div>
  
  <!-- Loader global -->
  <div x-show="$state.app.loading" class="loader-overlay">
    <div class="loader"></div>
  </div>
</div>
```

## Conclusion

Le développement d'un système de state management avec Alpine.js suit ces principes clés :

1. **Commencez simple** avec un seul fichier `state.js` pour les petits projets
2. **Modularisez** lorsque le fichier devient trop gros en créant des modules séparés
3. **Fusionnez les modules** dans un fichier `state-main.js` pour une initialisation centralisée
4. **Gérez les dépendances** entre modules avec soin
5. **Documentez votre état** avec JSDoc pour une meilleure maintenabilité

Cette approche vous permet de scalaire votre application Alpine.js tout en gardant un code organisé et maintenable, même pour des applications complexes.