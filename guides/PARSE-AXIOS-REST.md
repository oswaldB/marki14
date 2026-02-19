# Guide: Faire des appels à Parse avec Axios REST

Ce guide explique comment effectuer des appels REST à Parse en utilisant Axios directement dans les fichiers Alpine.js.

## Prérequis

- Avoir une application Parse configurée
- Avoir installé Axios: `npm install axios` ou `yarn add axios`
- Connaître les clés d'application Parse (Application ID et JavaScript Key)

## Configuration de base

### 1. Installer Axios

```bash
npm install axios
# ou
 yarn add axios
```

### 2. Configurer une instance Axios unique

Dans votre application, créez une instance Axios unique avec les headers nécessaires pour Parse. Cette instance doit être accessible globalement ou importée là où vous en avez besoin.

```javascript
// Dans un fichier accessible globalement (par exemple utils/axios.js)
import axios from 'axios';

const parseAxios = axios.create({
  baseURL: 'https://dev.parse.markidiags.com',
  headers: {
    'X-Parse-Application-Id': 'VOTRE_APPLICATION_ID',
    'X-Parse-Javascript-Key': 'VOTRE_JAVASCRIPT_KEY',
    'Content-Type': 'application/json'
  }
});

export default parseAxios;
```

⚠️ **Important**: Ne créez pas de fichier `parse-api.js`. Utilisez directement cette instance Axios dans vos composants Alpine.js.

## Utilisation dans les composants Alpine.js

### Exemple de composant avec requêtes CRUD

```html
<div x-data="{
  items: [],
  newItem: { name: '', description: '' },
  loading: false,
  error: null,
  
  async fetchItems() {
    this.loading = true;
    this.error = null;
    
    try {
      // Importation directe de l'instance Axios
      const { default: parseAxios } = await import('/utils/axios.js');
      
      const response = await parseAxios.get('/classes/MyClass', {
        params: {
          limit: 10,
          order: '-createdAt'
        }
      });
      
      this.items = response.data.results;
    } catch (error) {
      this.error = error.response?.data?.error || error.message;
      console.error('Erreur:', this.error);
    } finally {
      this.loading = false;
    }
  },
  
  async createItem() {
    this.loading = true;
    this.error = null;
    
    try {
      const { default: parseAxios } = await import('/utils/axios.js');
      
      const response = await parseAxios.post('/classes/MyClass', this.newItem);
      
      this.items.push(response.data);
      this.newItem = { name: '', description: '' };
    } catch (error) {
      this.error = error.response?.data?.error || error.message;
    } finally {
      this.loading = false;
    }
  },
  
  async deleteItem(objectId) {
    this.loading = true;
    this.error = null;
    
    try {
      const { default: parseAxios } = await import('/utils/axios.js');
      
      await parseAxios.delete(`/classes/MyClass/${objectId}`);
      this.items = this.items.filter(item => item.objectId !== objectId);
    } catch (error) {
      this.error = error.response?.data?.error || error.message;
    } finally {
      this.loading = false;
    }
  }
}" x-init="fetchItems()">
  <!-- Votre interface utilisateur ici -->
  <template x-for="item in items" :key="item.objectId">
    <div>
      <span x-text="item.name"></span>
      <button @click="deleteItem(item.objectId)">Supprimer</button>
    </div>
  </template>
  
  <form @submit.prevent="createItem">
    <input type="text" x-model="newItem.name" placeholder="Nom">
    <input type="text" x-model="newItem.description" placeholder="Description">
    <button type="submit" :disabled="loading">Créer</button>
  </form>
  
  <div x-show="error" x-text="error" style="color: red;"></div>
</div>
```

## Opérations CRUD de base

### Créer un objet (Create)

```javascript
// Dans un composant Alpine.js
async function createObject(className, data) {
  try {
    const { default: parseAxios } = await import('/utils/axios.js');
    const response = await parseAxios.post(`/classes/${className}`, data);
    return response.data;
  } catch (error) {
    console.error('Erreur:', error.response?.data || error.message);
    throw error;
  }
}
```

### Lire des objets (Read)

#### Récupérer un objet par son ID

```javascript
async function getObject(className, objectId) {
  try {
    const { default: parseAxios } = await import('/utils/axios.js');
    const response = await parseAxios.get(`/classes/${className}/${objectId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur:', error.response?.data || error.message);
    throw error;
  }
}
```

#### Récupérer plusieurs objets avec une requête

```javascript
async function queryObjects(className, params = {}) {
  try {
    const { default: parseAxios } = await import('/utils/axios.js');
    const response = await parseAxios.get(`/classes/${className}`, { params });
    return response.data.results;
  } catch (error) {
    console.error('Erreur:', error.response?.data || error.message);
    throw error;
  }
}
```

### Mettre à jour un objet (Update)

```javascript
async function updateObject(className, objectId, updates) {
  try {
    const { default: parseAxios } = await import('/utils/axios.js');
    const response = await parseAxios.put(`/classes/${className}/${objectId}`, updates);
    return response.data;
  } catch (error) {
    console.error('Erreur:', error.response?.data || error.message);
    throw error;
  }
}
```

### Supprimer un objet (Delete)

```javascript
async function deleteObject(className, objectId) {
  try {
    const { default: parseAxios } = await import('/utils/axios.js');
    const response = await parseAxios.delete(`/classes/${className}/${objectId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur:', error.response?.data || error.message);
    throw error;
  }
}
```

## Bonnes pratiques

1. **Instance unique**: Utilisez toujours la même instance Axios configurée pour éviter les duplications
2. **Pas de fichier parse-api**: Ne créez pas de fichier séparé pour les requêtes Parse
3. **Requêtes dans Alpine.js**: Faites les requêtes directement dans vos composants Alpine.js
4. **Gestion des erreurs**: Implémentez toujours une gestion d'erreurs appropriée
5. **Chargement dynamique**: Utilisez `import()` dynamique pour éviter les problèmes de chargement
6. **Sécurité**: Ne jamais exposer vos clés Parse dans le code côté client en production

## Ressources supplémentaires

- [Documentation officielle Parse REST API](https://docs.parseplatform.org/rest/guide/)
- [Documentation Axios](https://axios-http.com/docs/intro)
- [Documentation Alpine.js](https://alpinejs.dev/)

Ce guide montre comment utiliser Axios REST directement dans les composants Alpine.js sans créer de fichiers intermédiaires. Pour des fonctionnalités avancées, consultez la documentation officielle Parse.