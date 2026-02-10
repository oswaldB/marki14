// Exemple de route migrée depuis Parse Cloud vers Fastify

// Fonction utilitaire pour simuler une base de données (à remplacer par une vraie connexion)
const mockDatabase = {
  users: [
    { id: '1', name: 'Admin', email: 'admin@marki.com' },
    { id: '2', name: 'User', email: 'user@marki.com' }
  ],
  
  getUserById: async (id) => {
    return mockDatabase.users.find(user => user.id === id)
  },
  
  getAllUsers: async () => {
    return mockDatabase.users
  }
}

// Route migrée
export default async function (fastify) {
  
  // GET /api/users - Récupère tous les utilisateurs
  fastify.get('/api/users', async (request, reply) => {
    try {
      const users = await mockDatabase.getAllUsers()
      return {
        success: true,
        data: users,
        count: users.length
      }
    } catch (error) {
      fastify.log.error('Erreur dans GET /api/users:', error)
      return reply.status(500).send({
        success: false,
        error: error.message
      })
    }
  })

  // GET /api/users/:id - Récupère un utilisateur spécifique
  fastify.get('/api/users/:id', async (request, reply) => {
    try {
      const { id } = request.params
      const user = await mockDatabase.getUserById(id)
      
      if (!user) {
        return reply.status(404).send({
          success: false,
          error: 'User not found'
        })
      }
      
      return {
        success: true,
        data: user
      }
    } catch (error) {
      fastify.log.error('Erreur dans GET /api/users/:id:', error)
      return reply.status(500).send({
        success: false,
        error: error.message
      })
    }
  })

  // POST /api/users - Crée un nouvel utilisateur (exemple)
  fastify.post('/api/users', async (request, reply) => {
    try {
      const { name, email } = request.body
      
      if (!name || !email) {
        return reply.status(400).send({
          success: false,
          error: 'Name and email are required'
        })
      }
      
      // Simuler la création (dans une vraie implémentation, on sauvegarderait en base)
      const newUser = {
        id: String(mockDatabase.users.length + 1),
        name,
        email
      }
      
      mockDatabase.users.push(newUser)
      
      return {
        success: true,
        data: newUser,
        message: 'User created successfully'
      }
    } catch (error) {
      fastify.log.error('Erreur dans POST /api/users:', error)
      return reply.status(500).send({
        success: false,
        error: error.message
      })
    }
  })

  // Route de test pour montrer la migration depuis Parse Cloud
  fastify.get('/api/hello', async (request, reply) => {
    // Équivalent à: Parse.Cloud.define('hello', async (request) => {
    //   return 'Hello, world!'
    // })
    return {
      message: 'Hello from Fastify!',
      originalParseCloud: 'Cette route était auparavant Parse.Cloud.define("hello", ...)'
    }
  })
}