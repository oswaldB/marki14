# Guide pour Créer une Nouvelle Page avec Alpine.js

Ce guide explique comment créer une nouvelle page dans le projet Marki en utilisant le système Alpine.js intégré.

## Structure de Base

Toutes les pages doivent utiliser le composant `BaseLayout` comme layout principal. Voici la structure de base :

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout 
  title="Titre de la Page"
  withAuth={true|false}  // true si la page nécessite une authentification
  hideSidebar={true|false}  // true pour masquer la sidebar
  Alpinefile="/js/chemin/vers/votre/composant.js"  // optionnel: chemin vers votre composant Alpine.js
>
  <!-- Contenu de votre page ici -->
</BaseLayout>
```

## Utilisation du Prop Alpinefile

Le prop `Alpinefile` permet d'importer automatiquement un composant Alpine.js dans votre page. Le script sera chargé en bas de la page, juste après le script d'authentification.

### Exemple avec Alpine.js

1. **Créez votre composant Alpine.js** dans `front/public/js/` (par exemple `front/public/js/pages/maPageState.js`) :

```javascript
/**
 * État Alpine.js pour ma page
 */

// Vérifier que le code s'exécute côté client uniquement
if (typeof document !== 'undefined') {
  document.addEventListener('alpine:init', () => {
    Alpine.data('maPageState', () => ({
      
      // État du composant
      message: 'Bonjour depuis Alpine.js!',
      count: 0,
      
      // Méthodes
      increment() {
        this.count++;
      },
      
      // Cycle de vie
      init() {
        console.log('Composant Alpine.js initialisé');
      }
    }));
  });
}
```

2. **Créez votre page Astro** dans `front/src/pages/` (par exemple `front/src/pages/ma-page.astro`) :

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout 
  title="Ma Page"
  withAuth={true}
  Alpinefile="/js/pages/maPageState.js"
>
  <div class="container mx-auto px-4 py-8" x-data="maPageState()">
    <h1 class="text-3xl font-bold text-gray-900 mb-4">Ma Page</h1>
    
    <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <p class="text-gray-600 mb-4" x-text="message"></p>
      
      <div class="flex items-center space-x-4">
        <button 
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          @click="increment()"
        >
          Compteur: <span x-text="count"></span>
        </button>
      </div>
    </div>
  </div>
</BaseLayout>
```

## Cas d'Usage

### 1. Page avec Authentification

```astro
<BaseLayout 
  title="Tableau de Bord"
  withAuth={true}
  Alpinefile="/js/pages/dashboardState.js"
>
  <!-- Contenu sécurisé -->
</BaseLayout>
```

### 2. Page sans Authentification

```astro
<BaseLayout 
  title="Page Publique"
  withAuth={false}
  Alpinefile="/js/pages/publicState.js"
>
  <!-- Contenu public -->
</BaseLayout>
```

### 3. Page sans Alpine.js

Si vous n'avez pas besoin d'Alpine.js, omettez simplement le prop :

```astro
<BaseLayout 
  title="Page Simple"
  withAuth={false}
>
  <!-- Contenu sans Alpine.js -->
</BaseLayout>
```

## Bonnes Pratiques

1. **Nommage des fichiers** : Utilisez le suffixe `State.js` pour les composants Alpine.js (ex: `dashboardState.js`)

2. **Emplacement** : Placez vos composants Alpine.js dans `front/public/js/pages/` pour les pages spécifiques

3. **Structure** : Organisez votre code Alpine.js avec :
   - État initial
   - Méthodes
   - Cycle de vie (init, etc.)

4. **Sécurité** : Toujours vérifier `typeof document !== 'undefined'` pour éviter les erreurs SSR

5. **Performance** : Utilisez `x-data` pour isoler la portée de vos composants

## Exemples Existants

- `front/src/pages/dashboard.astro` - Utilise `dashboardState.js`
- `front/src/pages/login.astro` - Utilise `loginState.js`
- `front/src/pages/test-alpinefile.astro` - Page de test

## Dépannage

Si votre composant Alpine.js ne se charge pas :

1. Vérifiez que le chemin dans `Alpinefile` est correct
2. Assurez-vous que le fichier JS existe dans `front/public/js/`
3. Vérifiez la console pour les erreurs JavaScript
4. Assurez-vous que le composant est bien enregistré avec `Alpine.data()`

## Structure des Dossiers

```
front/
├── public/
│   └── js/
│       ├── pages/          # Composants Alpine.js pour les pages
│       ├── components/     # Composants réutilisables
│       └── stores/         # Stores globaux
└── src/
    └── pages/            # Pages Astro
```