// Migration des fonctions de gestion des utilisateurs depuis Parse Cloud vers Fastify
import { User } from '../models/user.js'

export default async function (fastify) {
  
  // POST /api/users - Créer un nouvel utilisateur
  fastify.post('/api/users', async (request, reply) => {
    try {
      const { firstName, lastName, email, password, is_admin } = request.body
      
      // Validation des paramètres
      if (!firstName || !lastName || !email || !password) {
        return reply.status(400).send({
          success: false,
          error: 'Tous les champs sont requis (sauf is_admin)'
        })
      }
      
      const result = await User.create({
        firstName,
        lastName,
        email,
        password,
        is_admin: is_admin || false
      })
      
      return {
        success: true,
        message: 'Utilisateur créé avec succès',
        userId: result.userId
      }
    } catch (error) {
      fastify.log.error('Erreur dans POST /api/users:', error)
      return reply.status(500).send({
        success: false,
        error: error.message
      })
    }
  })

  // PUT /api/users/:id - Mettre à jour un utilisateur existant
  fastify.put('/api/users/:id', async (request, reply) => {
    try {
      const { id } = request.params
      const { firstName, lastName, email, password, is_admin } = request.body
      
      // Validation des paramètres
      if (!firstName || !lastName || !email) {
        return reply.status(400).send({
          success: false,
          error: 'Les champs firstName, lastName et email sont requis'
        })
      }
      
      const result = await User.update(id, {
        firstName,
        lastName,
        email,
        password,
        is_admin: is_admin || false
      })
      
      if (!result) {
        return reply.status(404).send({
          success: false,
          error: 'Utilisateur non trouvé'
        })
      }
      
      return {
        success: true,
        message: 'Utilisateur mis à jour avec succès',
        userId: result.userId
      }
    } catch (error) {
      fastify.log.error('Erreur dans PUT /api/users/:id:', error)
      return reply.status(500).send({
        success: false,
        error: error.message
      })
    }
  })

  // GET /api/users - Récupérer tous les utilisateurs
  fastify.get('/api/users', async (request, reply) => {
    try {
      const users = await User.findAll()
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

  // GET /api/users/:id - Récupérer les détails d'un utilisateur spécifique
  fastify.get('/api/users/:id', async (request, reply) => {
    try {
      const { id } = request.params
      const user = await User.findById(id)
      
      if (!user) {
        return reply.status(404).send({
          success: false,
          error: 'Utilisateur non trouvé'
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

  // DELETE /api/users/:id - Supprimer un utilisateur
  fastify.delete('/api/users/:id', async (request, reply) => {
    try {
      const { id } = request.params
      
      const result = await User.delete(id)
      
      if (!result) {
        return reply.status(404).send({
          success: false,
          error: 'Utilisateur non trouvé'
        })
      }
      
      return {
        success: true,
        message: 'Utilisateur supprimé avec succès'
      }
    } catch (error) {
      fastify.log.error('Erreur dans DELETE /api/users/:id:', error)
      return reply.status(500).send({
        success: false,
        error: error.message
      })
    }
  })

  // GET /api/users/current - Récupérer l'utilisateur actuel
  fastify.get('/api/users/current', async (request, reply) => {
    try {
      // Dans une implémentation réelle, nous aurions l'utilisateur connecté
      // Pour cette version mock, nous retournons un utilisateur par défaut
      const currentUser = {
        objectId: 'current-user-id',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        is_admin: false,
        is_active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      return {
        success: true,
        data: currentUser
      }
    } catch (error) {
      fastify.log.error('Erreur dans GET /api/users/current:', error)
      return reply.status(500).send({
        success: false,
        error: error.message
      })
    }
  })

  // POST /api/users/:id/change-password - Changer le mot de passe d'un utilisateur
  fastify.post('/api/users/:id/change-password', async (request, reply) => {
    try {
      const { id } = request.params
      const { newPassword } = request.body
      
      if (!newPassword) {
        return reply.status(400).send({
          success: false,
          error: 'Le nouveau mot de passe est requis'
        })
      }
      
      const result = await User.changePassword(id, newPassword)
      
      if (!result) {
        return reply.status(404).send({
          success: false,
          error: 'Utilisateur non trouvé'
        })
      }
      
      return {
        success: true,
        message: 'Mot de passe changé avec succès'
      }
    } catch (error) {
      fastify.log.error('Erreur dans POST /api/users/:id/change-password:', error)
      return reply.status(500).send({
        success: false,
        error: error.message
      })
    }
  })

  // POST /api/users/:id/set-active - Activer ou désactiver un utilisateur
  fastify.post('/api/users/:id/set-active', async (request, reply) => {
    try {
      const { id } = request.params
      const { is_active } = request.body
      
      if (typeof is_active !== 'boolean') {
        return reply.status(400).send({
          success: false,
          error: 'Le statut est requis'
        })
      }
      
      const result = await User.setActiveStatus(id, is_active)
      
      if (!result) {
        return reply.status(404).send({
          success: false,
          error: 'Utilisateur non trouvé'
        })
      }
      
      return {
        success: true,
        message: `Utilisateur ${is_active ? 'activé' : 'désactivé'} avec succès`
      }
    } catch (error) {
      fastify.log.error('Erreur dans POST /api/users/:id/set-active:', error)
      return reply.status(500).send({
        success: false,
        error: error.message
      })
    }
  })

  // GET /api/users/search - Rechercher des utilisateurs
  fastify.get('/api/users/search', async (request, reply) => {
    try {
      const { searchTerm } = request.query
      
      const users = await User.search(searchTerm)
      
      return {
        success: true,
        data: users,
        count: users.length
      }
    } catch (error) {
      fastify.log.error('Erreur dans GET /api/users/search:', error)
      return reply.status(500).send({
        success: false,
        error: error.message
      })
    }
  })

  // GET /api/users/current/full-info - Obtenir les informations complètes de l'utilisateur courant
  fastify.get('/api/users/current/full-info', async (request, reply) => {
    try {
      // Dans une implémentation réelle, nous aurions l'utilisateur connecté
      // Pour cette version mock, nous retournons un utilisateur par défaut
      const currentUser = {
        objectId: 'current-user-id',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        username: 'john.doe@example.com',
        is_admin: false,
        is_active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sessionToken: 'mock-session-token'
      }
      
      return {
        success: true,
        data: currentUser
      }
    } catch (error) {
      fastify.log.error('Erreur dans GET /api/users/current/full-info:', error)
      return reply.status(500).send({
        success: false,
        error: error.message
      })
    }
  })
}