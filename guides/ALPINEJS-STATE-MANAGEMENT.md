# Guide: Développement d'un State Alpine.js et Découpage en Modules

Ce guide explique comment développer un système de state management avec Alpine.js et comment le découper en modules lorsque le fichier devient trop volumineux.

## Table des matières

1. [Introduction au State Management avec Alpine.js](#introduction)
2. [Création d'un Store de Base](#store-de-base)
3. [Utilisation du Store dans les Composants](#utilisation-dans-composants)
4. [Découpage en Modules](#decoupage-en-modules)
5. [Communication entre Modules](#communication-entre-modules)
6. [Bonnes Pratiques](#bonnes-pratiques)
7. [Exemple Complet](#exemple-complet)

<a name="introduction"></a>
## 1. Introduction au State Management avec Alpine.js

Alpine.js offre plusieurs approches pour gérer l'état global de votre application :

- **Alpine.store()** : Le système intégré pour le state management global
- **Alpine.data()** : Pour des composants réutilisables avec leur propre état
- **Custom Stores** : Pour une organisation modulaire avancée

<a name="store-de-base"></a>
## 2. Création d'un Store de Base

### Store Simple

```javascript
// Dans votre fichier principal (ex: main.js ou app.js)
document.addEventListener('alpine:init', () => {
  Alpine.store('app', {
    // State
    count: 0,
    user: null,
    items: [],
    
    // Getters (computed properties)
    get isAuthenticated() {
      return !!this.user;
    },
    
    get itemCount() {
      return this.items.length;
    },
    
    // Actions
    increment() {
      this.count++;
    },
    
    decrement() {
      this.count--;
    },
    
    login(userData) {
      this.user = userData;
      localStorage.setItem('user', JSON.stringify(userData));
    },
    
    logout() {
      this.user = null;
      localStorage.removeItem('user');
    },
    
    async fetchItems() {
      try {
        const response = await fetch('/api/items');
        this.items = await response.json();
      } catch (error) {
        console.error('Failed to fetch items:', error);
      }
    }
  });
});
```

### Store avec Persistance

```javascript
Alpine.store('settings', {
  theme: localStorage.getItem('theme') || 'light',
  language: localStorage.getItem('language') || 'fr',
  
  init() {
    // Charger l'état initial
    this.loadFromLocalStorage();
    
    // Écouter les changements pour persister
    this.$watch('theme', (value) => {
      localStorage.setItem('theme', value);
      this.applyTheme();
    });
    
    this.$watch('language', (value) => {
      localStorage.setItem('language', value);
    });
  },
  
  loadFromLocalStorage() {
    const savedTheme = localStorage.getItem('theme');
    const savedLanguage = localStorage.getItem('language');
    
    if (savedTheme) this.theme = savedTheme;
    if (savedLanguage) this.language = savedLanguage;
  },
  
  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.theme);
  },
  
  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
  }
});
```

<a name="utilisation-dans-composants"></a>
## 3. Utilisation du Store dans les Composants

### Accéder au Store

```html
<div x-data>
  <!-- Accès direct -->
  <p>Count: <span x-text="$store.app.count"></span></p>
  
  <!-- Avec réactivité -->
  <button @click="$store.app.increment()">Increment</button>
  <button @click="$store.app.decrement()">Decrement</button>
  
  <!-- Utilisation dans des expressions -->
  <div x-show="$store.app.isAuthenticated">
    Welcome, <span x-text="$store.app.user?.name"></span>!
  </div>
</div>
```

### Utilisation avec Alpine.data()

```javascript
// Définir un composant réutilisable
Alpine.data('counter', () => ({
  localCount: 0,
  
  incrementBoth() {
    this.localCount++;
    this.$store.app.increment(); // Accès au store global
  }
}));

<!-- Utilisation dans le HTML -->
<div x-data="counter">
  <p>Local: <span x-text="localCount"></span></p>
  <p>Global: <span x-text="$store.app.count"></span></p>
  <button @click="incrementBoth()">Increment Both</button>
</div>
```

<a name="decoupage-en-modules"></a>
## 4. Découpage en Modules

Lorsque votre store devient trop gros, il est temps de le découper en modules.

### Approche 1: Stores Séparés par Domaine

```javascript
// stores/userStore.js
export function createUserStore() {
  return {
    user: null,
    
    get isAuthenticated() {
      return !!this.user;
    },
    
    login(userData) {
      this.user = userData;
    },
    
    logout() {
      this.user = null;
    }
  };
}

// stores/cartStore.js
export function createCartStore() {
  return {
    items: [],
    
    get total() {
      return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
    
    addItem(item) {
      const existingItem = this.items.find(i => i.id === item.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        this.items.push({ ...item, quantity: 1 });
      }
    },
    
    removeItem(itemId) {
      this.items = this.items.filter(item => item.id !== itemId);
    }
  };
}

// Dans votre fichier principal
document.addEventListener('alpine:init', () => {
  Alpine.store('user', createUserStore());
  Alpine.store('cart', createCartStore());
});
```

### Approche 2: Store Modulaire avec Composition

```javascript
// stores/baseStore.js - Fonctions utilitaires de base
export function createBaseStore(initialState = {}) {
  return {
    ...initialState,
    
    // Méthodes utilitaires communes
    reset() {
      Object.assign(this, initialState);
    },
    
    hydrate(newState) {
      Object.assign(this, newState);
    }
  };
}

// stores/apiModule.js - Module pour les appels API
export function createApiModule() {
  return {
    loading: false,
    error: null,
    
    async fetch(url, options = {}) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error('Request failed');
        return await response.json();
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    }
  };
}

// stores/mainStore.js - Store principal composé
document.addEventListener('alpine:init', () => {
  Alpine.store('app', {
    ...createBaseStore({
      count: 0,
      theme: 'light'
    }),
    
    ...createApiModule(),
    
    // Méthodes spécifiques
    increment() {
      this.count++;
    }
  });
});
```

### Approche 3: Dynamic Imports pour le Lazy Loading

```javascript
// stores/lazyStore.js
let userStore = null;

export async function getUserStore() {
  if (!userStore) {
    const module = await import('./userStore.js');
    userStore = module.createUserStore();
    Alpine.store('user', userStore);
  }
  return userStore;
}

// Utilisation
// <button @click="await getUserStore(); $store.user.login({...})">
```

<a name="communication-entre-modules"></a>
## 5. Communication entre Modules

### Événements Custom

```javascript
// Dans un store
Alpine.store('notifications', {
  messages: [],
  
  add(message) {
    this.messages.push(message);
    
    // Dispatch un événement
    document.dispatchEvent(new CustomEvent('notification-added', {
      detail: { message }
    }));
  },
  
  remove(index) {
    this.messages.splice(index, 1);
  }
});

// Dans un autre store ou composant
document.addEventListener('notification-added', (e) => {
  console.log('New notification:', e.detail.message);
  // Peut déclencher d'autres actions
});
```

### Références Croisées

```javascript
// storeA.js
Alpine.store('storeA', {
  value: 'Hello from A',
  
  updateFromB() {
    // Accès direct à un autre store
    this.value = `Updated by B: ${Alpine.store('storeB').data}`;
  }
});

// storeB.js
Alpine.store('storeB', {
  data: 'Data from B',
  
  notifyA() {
    Alpine.store('storeA').updateFromB();
  }
});
```

### Pattern Pub/Sub

```javascript
// stores/eventBus.js
const listeners = {};

export const eventBus = {
  subscribe(event, callback) {
    if (!listeners[event]) {
      listeners[event] = [];
    }
    listeners[event].push(callback);
  },
  
  publish(event, data) {
    if (listeners[event]) {
      listeners[event].forEach(callback => callback(data));
    }
  }
};

// Dans un store
Alpine.store('cart', {
  items: [],
  
  init() {
    // S'abonner aux événements
    eventBus.subscribe('product-added', (product) => {
      this.addItem(product);
    });
  },
  
  addItem(product) {
    this.items.push(product);
    eventBus.publish('cart-updated', this.items);
  }
});
```

<a name="bonnes-pratiques"></a>
## 6. Bonnes Pratiques

### 1. Nommage des Stores

- Utilisez des noms descriptifs et cohérents
- Préférez les noms courts mais explicites: `user`, `cart`, `ui` plutôt que `userStore`, `cartStore`
- Pour les stores complexes, utilisez des noms composés: `productCatalog`, `orderManagement`

### 2. Organisation des Fichiers

```
project/
├── stores/
│   ├── index.js          # Point d'entrée principal
│   ├── user.js           # Store utilisateur
│   ├── cart.js           # Store panier
│   ├── products.js       # Store produits
│   ├── ui.js             # Store UI/UX
│   └── utils/            # Utilitaires partagés
│       ├── api.js        # Module API
│       ├── localStorage.js # Gestion persistence
│       └── events.js     # Gestion événements
└── main.js               # Initialisation
```

### 3. Typage (avec TypeScript ou JSDoc)

```javascript
/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string[]} roles
 */

/**
 * @type {import('alpinejs').AlpineStore<'user', {
 *   currentUser: User|null,
 *   isAuthenticated: boolean,
 *   login: (credentials: {email: string, password: string}) => Promise<User>,
 *   logout: () => void
 * }>}
 */
Alpine.store('user', {
  currentUser: null,
  
  get isAuthenticated() {
    return !!this.currentUser;
  },
  
  /**
   * @param {{email: string, password: string}} credentials
   * @returns {Promise<User>}
   */
  async login(credentials) {
    // ...
  },
  
  logout() {
    this.currentUser = null;
  }
});
```

### 4. Gestion des Effets de Bord

```javascript
Alpine.store('products', {
  products: [],
  
  async fetchProducts() {
    this.products = []; // Réinitialisation
    
    try {
      const response = await fetch('/api/products');
      this.products = await response.json();
    } catch (error) {
      // Gérer l'erreur sans casser le store
      console.error('Failed to fetch products:', error);
      // Optionnel: stocker l'erreur pour l'UI
      this.error = error.message;
    }
  }
});
```

### 5. Optimisation des Performances

- **Éviter les calculs coûteux dans les getters** qui sont appelés fréquemment
- **Utiliser $watch avec parcimonie** pour éviter les boucles de rendus
- **Débouncer les mises à jour** pour les champs de recherche ou les entrées utilisateur

```javascript
Alpine.store('search', {
  query: '',
  results: [],
  
  init() {
    this.$watch('query', this.debouncedSearch);
  },
  
  debouncedSearch: _.debounce(function(query) {
    if (query.length > 2) {
      this.search(query);
    } else {
      this.results = [];
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
stores/
├── index.js          # Initialisation principale
├── user.js           # Gestion utilisateur
├── cart.js           # Gestion panier
├── products.js       # Catalogue produits
├── orders.js         # Commandes
└── ui.js             # État UI (modales, loaders, etc.)
```

### stores/index.js

```javascript
import { createUserStore } from './user';
import { createCartStore } from './cart';
import { createProductsStore } from './products';
import { createOrdersStore } from './orders';
import { createUiStore } from './ui';

document.addEventListener('alpine:init', () => {
  // Initialiser tous les stores
  Alpine.store('user', createUserStore());
  Alpine.store('cart', createCartStore());
  Alpine.store('products', createProductsStore());
  Alpine.store('orders', createOrdersStore());
  Alpine.store('ui', createUiStore());
  
  // Configuration des dépendances entre stores
  const cart = Alpine.store('cart');
  const ui = Alpine.store('ui');
  
  // Exemple: montrer un toast quand le panier est mis à jour
  cart.$watch('items', () => {
    if (cart.itemCount > 0) {
      ui.showToast(`Panier mis à jour: ${cart.itemCount} articles`);
    }
  }, { deep: true });
});
```

### stores/user.js

```javascript
export function createUserStore() {
  return {
    user: JSON.parse(localStorage.getItem('user')) || null,
    
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

### stores/cart.js

```javascript
export function createCartStore() {
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

### stores/ui.js

```javascript
export function createUiStore() {
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

### Utilisation dans les Composants

```html
<div x-data>
  <!-- Header avec panier -->
  <header>
    <div class="cart-indicator" @click="$store.ui.showModal('cart')">
      🛒 <span x-text="$store.cart.itemCount"></span>
    </div>
    
    <template x-if="$store.user.isAuthenticated">
      <span x-text="$store.user.user.name"></span>
      <button @click="$store.user.logout()">Logout</button>
    </template>
  </header>
  
  <!-- Modal Panier -->
  <div x-show="$store.ui.modal === 'cart'" @click.away="$store.ui.hideModal()">
    <div class="modal">
      <h2>Your Cart</h2>
      
      <template x-for="item in $store.cart.items" :key="item.id">
        <div class="cart-item">
          <span x-text="item.name"></span>
          <span x-text="item.price"></span>
          <input 
            type="number" 
            x-model="item.quantity" 
            @change="$store.cart.updateQuantity(item.id, $event.target.value)" 
            min="1"
          >
        </div>
      </template>
      
      <div>Total: <span x-text="$store.cart.total.toFixed(2)"></span></div>
      <button @click="checkout()">Checkout</button>
    </div>
  </div>
  
  <!-- Toasts -->
  <div class="toast-container">
    <template x-for="toast in $store.ui.toasts" :key="toast.id">
      <div class="toast" :class="toast.type">
        <span x-text="toast.message"></span>
      </div>
    </template>
  </div>
  
  <!-- Loader global -->
  <div x-show="$store.ui.loading" class="loader-overlay">
    Loading...
  </div>
</div>
```

## Conclusion

Le développement d'un système de state management avec Alpine.js suit ces principes clés :

1. **Commencez simple** avec `Alpine.store()` pour les petits projets
2. **Découpez en modules** lorsque la complexité augmente, en séparant par domaines fonctionnels
3. **Utilisez la composition** pour partager du code entre les stores
4. **Gérez les dépendances** entre stores avec soin, en utilisant des événements ou des références directes
5. **Documentez votre état** avec JSDoc ou TypeScript pour une meilleure maintenabilité

Cette approche modulaire vous permet de scalaire votre application Alpine.js tout en gardant un code organisé et maintenable.