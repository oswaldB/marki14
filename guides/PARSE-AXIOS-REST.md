# Guide: Faire des appels à Parse avec Axios REST

Ce guide explique comment effectuer des appels REST à Parse en utilisant Axios dans une application JavaScript/TypeScript.

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

### 2. Configurer Axios pour Parse

Créez un fichier de configuration pour Axios avec les headers nécessaires pour Parse:

```javascript
// parse-api.js
import axios from 'axios';

const parseApi = axios.create({
  baseURL: 'https://votre-serveur-parse.com/parse',
  headers: {
    'X-Parse-Application-Id': 'VOTRE_APPLICATION_ID',
    'X-Parse-Javascript-Key': 'VOTRE_JAVASCRIPT_KEY',
    'Content-Type': 'application/json'
  }
});

export default parseApi;
```

## Opérations CRUD de base

### Créer un objet (Create)

```javascript
import parseApi from './parse-api';

async function createObject(className, data) {
  try {
    const response = await parseApi.post('/classes/' + className, data);
    console.log('Objet créé:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création:', error.response?.data || error.message);
    throw error;
  }
}

// Exemple d'utilisation
createObject('MaClasse', {
  nom: 'Exemple',
  description: 'Un exemple de création'
});
```

### Lire des objets (Read)

#### Récupérer un objet par son ID

```javascript
async function getObject(className, objectId) {
  try {
    const response = await parseApi.get(`/classes/${className}/${objectId}`);
    console.log('Objet récupéré:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération:', error.response?.data || error.message);
    throw error;
  }
}

// Exemple d'utilisation
getObject('MaClasse', 'ID_DE_L_OBJET');
```

#### Récupérer plusieurs objets avec une requête

```javascript
async function queryObjects(className, params = {}) {
  try {
    const response = await parseApi.get(`/classes/${className}`, { params });
    console.log('Objets trouvés:', response.data.results);
    return response.data.results;
  } catch (error) {
    console.error('Erreur lors de la requête:', error.response?.data || error.message);
    throw error;
  }
}

// Exemples d'utilisation
// 1. Récupérer tous les objets
queryObjects('MaClasse');

// 2. Avec une condition where
queryObjects('MaClasse', {
  where: JSON.stringify({
    nom: 'Exemple'
  })
});

// 3. Avec limite et tri
queryObjects('MaClasse', {
  limit: 10,
  order: '-createdAt'
});
```

### Mettre à jour un objet (Update)

```javascript
async function updateObject(className, objectId, updates) {
  try {
    const response = await parseApi.put(`/classes/${className}/${objectId}`, updates);
    console.log('Objet mis à jour:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error.response?.data || error.message);
    throw error;
  }
}

// Exemple d'utilisation
updateObject('MaClasse', 'ID_DE_L_OBJET', {
  description: 'Description mise à jour'
});
```

### Supprimer un objet (Delete)

```javascript
async function deleteObject(className, objectId) {
  try {
    const response = await parseApi.delete(`/classes/${className}/${objectId}`);
    console.log('Objet supprimé:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression:', error.response?.data || error.message);
    throw error;
  }
}

// Exemple d'utilisation
deleteObject('MaClasse', 'ID_DE_L_OBJET');
```

## Requêtes avancées

### Requêtes avec conditions complexes

```javascript
// Requête avec plusieurs conditions
queryObjects('MaClasse', {
  where: JSON.stringify({
    age: { $gt: 18 },
    nom: { $regex: '^Exemple' },
    $or: [
      { statut: 'actif' },
      { statut: 'en_attente' }
    ]
  })
});
```

### Requêtes avec inclusion de relations

```javascript
// Inclure des objets liés
queryObjects('MaClasse', {
  include: 'relationField',
  where: JSON.stringify({
    relationField: { $exists: true }
  })
});
```

### Requêtes avec comptage

```javascript
async function countObjects(className, params = {}) {
  try {
    const response = await parseApi.get(`/classes/${className}`, { 
      params: { 
        ...params, 
        count: 1,
        limit: 0
      } 
    });
    console.log('Nombre d\'objets:', response.data.count);
    return response.data.count;
  } catch (error) {
    console.error('Erreur lors du comptage:', error.response?.data || error.message);
    throw error;
  }
}

// Exemple d'utilisation
countObjects('MaClasse', {
  where: JSON.stringify({
    statut: 'actif'
  })
});
```

## Gestion des erreurs

Parse retourne des codes d'erreur spécifiques que vous pouvez gérer:

```javascript
async function safeParseOperation(operation) {
  try {
    return await operation();
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      
      switch(status) {
        case 400:
          console.error('Requête invalide:', data.error);
          break;
        case 401:
          console.error('Non autorisé - vérifiez vos clés Parse');
          break;
        case 403:
          console.error('Accès refusé');
          break;
        case 404:
          console.error('Objet non trouvé');
          break;
        default:
          console.error('Erreur Parse:', status, data);
      }
    } else {
      console.error('Erreur réseau:', error.message);
    }
    
    throw error;
  }
}

// Utilisation
safeParseOperation(() => createObject('MaClasse', { nom: 'Test' }));
```

## Bonnes pratiques

1. **Sécurité**: Ne jamais exposer vos clés Parse dans le code côté client
2. **Gestion des erreurs**: Toujours implémenter une gestion d'erreurs robuste
3. **Pagination**: Utiliser `limit` et `skip` pour les grandes collections
4. **Cache**: Envisager de cacher les résultats des requêtes fréquentes
5. **Logging**: Logger les requêtes et réponses pour le débogage

## Exemple complet

```javascript
import parseApi from './parse-api';

class ParseService {
  constructor(className) {
    this.className = className;
  }

  async create(data) {
    return parseApi.post(`/classes/${this.className}`, data);
  }

  async get(id) {
    return parseApi.get(`/classes/${this.className}/${id}`);
  }

  async query(params = {}) {
    return parseApi.get(`/classes/${this.className}`, { params });
  }

  async update(id, data) {
    return parseApi.put(`/classes/${this.className}/${id}`, data);
  }

  async delete(id) {
    return parseApi.delete(`/classes/${this.className}/${id}`);
  }
}

// Utilisation
export const UserService = new ParseService('User');
export const ProductService = new ParseService('Product');
```

## Ressources supplémentaires

- [Documentation officielle Parse REST API](https://docs.parseplatform.org/rest/guide/)
- [Documentation Axios](https://axios-http.com/docs/intro)
- [Parse Server Guide](https://github.com/parse-community/parse-server)

Ce guide couvre les bases pour interagir avec Parse via Axios. Pour des fonctionnalités plus avancées comme les Cloud Functions, les fichiers, ou les sessions utilisateur, consultez la documentation officielle Parse.