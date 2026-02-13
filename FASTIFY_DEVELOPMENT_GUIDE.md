# Guide de Développement Fastify pour Marki-Parse

Ce guide explique comment développer avec Fastify dans le projet Marki-Parse, en suivant une approche simple et pragmatique.

## Principes de Développement

1. **Simplicité avant tout** : Chaque route contient le script complet pour une fonctionnalité
2. **Fastify uniquement sur demande** : Utiliser Fastify uniquement lorsqu'il y a une demande explicite dans le prompt
3. **Sinon utiliser Parse/REST/Axios** : Pour les développements sans demande spécifique, continuer avec l'approche existante

## Structure du Projet Fastify

```
back/fastify-server/
├── index.js          # Point d'entrée principal
├── routes/           # Dossier pour les routes (vide actuellement)
├── package.json      # Dépendances et scripts
└── README.md         # Documentation existante
```

## Quand Utiliser Fastify ?

**Utiliser Fastify uniquement si** :
- Il y a une demande explicite pour une nouvelle API Fastify
- Migration spécifique depuis Parse Cloud
- Besoin de performances accrues pour une route critique

**Sinon utiliser** :
- Parse Cloud Functions (approche existante)
- Appels REST avec Axios
- L'architecture actuelle qui fonctionne

## Création d'une Nouvelle Route Fastify

### 1. Créer un fichier de route

Créez un nouveau fichier dans `back/fastify-server/routes/` avec le nom de votre fonctionnalité.

**Exemple** : `routes/maNouvelleFonctionnalite.js`

```javascript
// routes/maNouvelleFonctionnalite.js
export default async function (fastify) {
  // Route GET pour récupérer des données
  fastify.get('/api/ma-fonctionnalite', async (request, reply) => {
    try {
      // Logique complète de la fonctionnalité ici
      const result = await faireQuelqueChose()
      
      return {
        success: true,
        data: result,
        message: 'Opération réussie'
      }
    } catch (error) {
      fastify.log.error('Erreur dans ma-fonctionnalite:', error)
      return reply.code(500).send({
        success: false,
        error: error.message,
        message: 'Erreur serveur'
      })
    }
  })
  
  // Route POST pour créer/modifier des données
  fastify.post('/api/ma-fonctionnalite', async (request, reply) => {
    try {
      const { parametre1, parametre2 } = request.body
      
      // Validation des paramètres
      if (!parametre1 || !parametre2) {
        return reply.code(400).send({
          success: false,
          error: 'Paramètres manquants',
          message: 'parametre1 et parametre2 sont requis'
        })
      }
      
      // Logique complète ici
      const result = await creerOuMettreAJour(parametre1, parametre2)
      
      return {
        success: true,
        data: result,
        message: 'Création/modification réussie'
      }
    } catch (error) {
      fastify.log.error('Erreur dans ma-fonctionnalite POST:', error)
      return reply.code(500).send({
        success: false,
        error: error.message,
        message: 'Erreur serveur'
      })
    }
  })
}

// Fonction helper pour la logique métier
async function faireQuelqueChose() {
  // Implémentation complète ici
  return { data: 'exemple' }
}

async function creerOuMettreAJour(param1, param2) {
  // Implémentation complète ici
  return { id: '123', param1, param2 }
}
```

### 2. Enregistrer la route dans index.js

Ajoutez le nom de votre route (sans l'extension .js) à la liste des routes dans `index.js`:

```javascript
const routes = [
  'example',
  'initCollections',
  'maNouvelleFonctionnalite',  // Ajoutez votre route ici
  // ... autres routes
]
```

### 3. Redémarrer le serveur

```bash
# En développement (avec rechargement automatique)
npm run dev

# En production
npm start
```

## Exemple Complet : Route de Gestion des Utilisateurs

Voici un exemple complet pour une route de gestion des utilisateurs :

```javascript
// routes/userManagement.js
export default async function (fastify) {
  // GET /api/users - Récupérer tous les utilisateurs
  fastify.get('/api/users', async (request, reply) => {
    try {
      // Logique complète pour récupérer les utilisateurs
      const users = await getAllUsersFromDatabase()
      
      return {
        success: true,
        count: users.length,
        data: users,
        message: 'Liste des utilisateurs récupérée'
      }
    } catch (error) {
      fastify.log.error('Erreur récupération utilisateurs:', error)
      return reply.code(500).send({
        success: false,
        error: error.message,
        message: 'Erreur serveur'
      })
    }
  })
  
  // GET /api/users/:id - Récupérer un utilisateur spécifique
  fastify.get('/api/users/:id', async (request, reply) => {
    try {
      const { id } = request.params
      
      const user = await getUserById(id)
      
      if (!user) {
        return reply.code(404).send({
          success: false,
          error: 'Utilisateur non trouvé',
          message: `Aucun utilisateur avec l'ID ${id}`
        })
      }
      
      return {
        success: true,
        data: user,
        message: 'Utilisateur récupéré'
      }
    } catch (error) {
      fastify.log.error(`Erreur récupération utilisateur ${request.params.id}:`, error)
      return reply.code(500).send({
        success: false,
        error: error.message,
        message: 'Erreur serveur'
      })
    }
  })
  
  // POST /api/users - Créer un nouvel utilisateur
  fastify.post('/api/users', async (request, reply) => {
    try {
      const { name, email, role } = request.body
      
      // Validation
      if (!name || !email || !role) {
        return reply.code(400).send({
          success: false,
          error: 'Champs manquants',
          message: 'name, email et role sont requis'
        })
      }
      
      // Vérification email valide
      if (!isValidEmail(email)) {
        return reply.code(400).send({
          success: false,
          error: 'Email invalide',
          message: 'Format d\'email incorrect'
        })
      }
      
      // Création de l'utilisateur
      const newUser = await createUser({ name, email, role })
      
      return {
        success: true,
        data: newUser,
        message: 'Utilisateur créé avec succès'
      }
    } catch (error) {
      fastify.log.error('Erreur création utilisateur:', error)
      return reply.code(500).send({
        success: false,
        error: error.message,
        message: 'Erreur serveur'
      })
    }
  })
  
  // PUT /api/users/:id - Mettre à jour un utilisateur
  fastify.put('/api/users/:id', async (request, reply) => {
    try {
      const { id } = request.params
      const updateData = request.body
      
      // Vérification que l'utilisateur existe
      const existingUser = await getUserById(id)
      if (!existingUser) {
        return reply.code(404).send({
          success: false,
          error: 'Utilisateur non trouvé',
          message: `Aucun utilisateur avec l'ID ${id}`
        })
      }
      
      // Mise à jour
      const updatedUser = await updateUser(id, updateData)
      
      return {
        success: true,
        data: updatedUser,
        message: 'Utilisateur mis à jour avec succès'
      }
    } catch (error) {
      fastify.log.error(`Erreur mise à jour utilisateur ${id}:`, error)
      return reply.code(500).send({
        success: false,
        error: error.message,
        message: 'Erreur serveur'
      })
    }
  })
  
  // DELETE /api/users/:id - Supprimer un utilisateur
  fastify.delete('/api/users/:id', async (request, reply) => {
    try {
      const { id } = request.params
      
      // Vérification que l'utilisateur existe
      const existingUser = await getUserById(id)
      if (!existingUser) {
        return reply.code(404).send({
          success: false,
          error: 'Utilisateur non trouvé',
          message: `Aucun utilisateur avec l'ID ${id}`
        })
      }
      
      // Suppression
      await deleteUser(id)
      
      return {
        success: true,
        message: 'Utilisateur supprimé avec succès'
      }
    } catch (error) {
      fastify.log.error(`Erreur suppression utilisateur ${id}:`, error)
      return reply.code(500).send({
        success: false,
        error: error.message,
        message: 'Erreur serveur'
      })
    }
  })
}

// Fonctions helpers pour la logique métier
async function getAllUsersFromDatabase() {
  // Implémentation réelle ici - exemple avec base de données
  // return await db.query('SELECT * FROM users')
  return [] // Mock pour l'exemple
}

async function getUserById(id) {
  // Implémentation réelle ici
  // return await db.query('SELECT * FROM users WHERE id = ?', [id])
  return null // Mock pour l'exemple
}

async function createUser(userData) {
  // Implémentation réelle ici
  // const result = await db.query('INSERT INTO users SET ?', userData)
  // return { ...userData, id: result.insertId }
  return { ...userData, id: 'generated-id' } // Mock pour l'exemple
}

async function updateUser(id, updateData) {
  // Implémentation réelle ici
  // await db.query('UPDATE users SET ? WHERE id = ?', [updateData, id])
  // return await getUserById(id)
  return { id, ...updateData } // Mock pour l'exemple
}

async function deleteUser(id) {
  // Implémentation réelle ici
  // await db.query('DELETE FROM users WHERE id = ?', [id])
  return true // Mock pour l'exemple
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
```

## Bonnes Pratiques

### 1. Structure des Réponses

Toujours retourner un objet JSON structuré :
```javascript
{
  success: boolean,      // Indique si l'opération a réussi
  data: any,             // Données retournées (si applicable)
  message: string,       // Message descriptif
  error: string,         // Détails de l'erreur (si applicable)
  count: number          // Nombre d'éléments (pour les listes)
}
```

### 2. Gestion des Erreurs

- Utiliser les codes HTTP appropriés
- Toujours logger les erreurs avec `fastify.log.error()`
- Ne jamais exposer les détails techniques sensibles

### 3. Validation des Données

Valider toujours les entrées :
```javascript
if (!parametreRequis) {
  return reply.code(400).send({
    success: false,
    error: 'Paramètre manquant',
    message: 'Le paramètre X est requis'
  })
}
```

### 4. Logging

Utiliser le logger Fastify pour le débogage :
```javascript
fastify.log.info('Opération réussie')
fastify.log.error('Erreur critique:', error)
fastify.log.debug('Détails de débogage:', details)
```

### 5. Sécurité

- Toujours valider les entrées utilisateur
- Utiliser les paramètres de requête plutôt que la concaténation SQL
- Implémenter l'authentification lorsque nécessaire

## Migration depuis Parse Cloud

### Exemple de Migration

**Ancien code Parse Cloud** :
```javascript
Parse.Cloud.define('getUserData', async (request) => {
  const user = await new Parse.Query('User').get(request.params.userId)
  return user.toJSON()
})
```

**Nouveau code Fastify** :
```javascript
fastify.get('/api/users/:userId', async (request, reply) => {
  try {
    const { userId } = request.params
    const user = await getUserFromDatabase(userId)
    
    if (!user) {
      return reply.code(404).send({
        success: false,
        error: 'User not found'
      })
    }
    
    return {
      success: true,
      data: user,
      message: 'User data retrieved'
    }
  } catch (error) {
    fastify.log.error('Error getting user:', error)
    return reply.code(500).send({
      success: false,
      error: 'Server error'
    })
  }
})
```

## Déploiement et Test

### Test Local

```bash
# Démarrer le serveur en mode développement
cd back/fastify-server
npm run dev

# Tester avec curl
curl http://localhost:3000/api/health
curl -X POST http://localhost:3000/api/users -H "Content-Type: application/json" -d '{"name":"Test","email":"test@example.com","role":"user"}'
```

### Test avec Frontend

Le serveur est configuré avec CORS pour permettre les requêtes depuis :
- `https://dev.markidiags.com`
- `http://localhost:3000`
- `http://localhost:5173`

### Déploiement

Le serveur écoute sur le port 3000 et est configuré pour fonctionner avec Caddy :

```
dev.markidiags.com/api {
    reverse_proxy 192.168.1.239:3000
}
```

## Quand NE PAS Utiliser Fastify

1. **Pour des modifications mineures** : Si une fonctionnalité existe déjà dans Parse Cloud et fonctionne bien
2. **Pour des prototypes rapides** : Utiliser l'approche existante pour les tests rapides
3. **Sans demande explicite** : Continuer avec Parse/REST/Axios sauf si Fastify est spécifiquement demandé
4. **Pour des fonctionnalités simples** : Si Axios ou Parse Cloud suffit, pas besoin de migrer

## Ressources

- [Documentation Fastify officielle](https://www.fastify.io/docs/latest/)
- [Guide des bonnes pratiques Fastify](https://www.fastify.io/docs/latest/Guides/)
- [Exemples de plugins Fastify](https://www.fastify.io/ecosystem/)

## Support

Pour toute question sur le développement Fastify dans ce projet :
- Consulter le canal #backend dans Slack
- Voir la documentation existante dans `back/fastify-server/README.md`
- Demander une revue de code avant de merger des changements majeurs