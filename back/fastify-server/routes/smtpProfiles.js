// Migration des fonctions SMTP depuis Parse Cloud vers Fastify
import { SMTPProfile } from '../models/smtpProfile.js'

export default async function (fastify) {
  
  // GET /api/smtp-profiles - Récupérer tous les profils SMTP
  fastify.get('/api/smtp-profiles', async (request, reply) => {
    try {
      const profiles = await SMTPProfile.findAll()
      return {
        success: true,
        data: profiles,
        count: profiles.length
      }
    } catch (error) {
      fastify.log.error('Erreur dans GET /api/smtp-profiles:', error)
      return reply.status(500).send({
        success: false,
        error: error.message
      })
    }
  })

  // GET /api/smtp-profiles/:id - Récupérer un profil SMTP spécifique
  fastify.get('/api/smtp-profiles/:id', async (request, reply) => {
    try {
      const { id } = request.params
      const profile = await SMTPProfile.findById(id)
      
      if (!profile) {
        return reply.status(404).send({
          success: false,
          error: 'SMTP profile not found'
        })
      }
      
      return {
        success: true,
        data: profile
      }
    } catch (error) {
      fastify.log.error('Erreur dans GET /api/smtp-profiles/:id:', error)
      return reply.status(500).send({
        success: false,
        error: error.message
      })
    }
  })

  // POST /api/smtp-profiles - Créer un nouveau profil SMTP
  fastify.post('/api/smtp-profiles', async (request, reply) => {
    try {
      const { name, host, port, username, password, email, useSSL, useTLS } = request.body
      
      // Validation des paramètres
      if (!name || !host || !port || !email) {
        return reply.status(400).send({
          success: false,
          error: 'Name, host, port and email are required'
        })
      }
      
      const newProfile = await SMTPProfile.create({
        name,
        host,
        port,
        username: username || '',
        password: password || '',
        email,
        useSSL: useSSL || false,
        useTLS: useTLS || false,
        isActive: true,
        isArchived: false
      })
      
      return {
        success: true,
        data: newProfile,
        message: 'SMTP profile created successfully'
      }
    } catch (error) {
      fastify.log.error('Erreur dans POST /api/smtp-profiles:', error)
      return reply.status(500).send({
        success: false,
        error: error.message
      })
    }
  })

  // PUT /api/smtp-profiles/:id - Mettre à jour un profil SMTP
  fastify.put('/api/smtp-profiles/:id', async (request, reply) => {
    try {
      const { id } = request.params
      const updateData = request.body
      
      const updatedProfile = await SMTPProfile.update(id, updateData)
      
      if (!updatedProfile) {
        return reply.status(404).send({
          success: false,
          error: 'SMTP profile not found'
        })
      }
      
      return {
        success: true,
        data: updatedProfile,
        message: 'SMTP profile updated successfully'
      }
    } catch (error) {
      fastify.log.error('Erreur dans PUT /api/smtp-profiles/:id:', error)
      return reply.status(500).send({
        success: false,
        error: error.message
      })
    }
  })

  // POST /api/smtp-profiles/:id/archive - Archiver un profil SMTP
  fastify.post('/api/smtp-profiles/:id/archive', async (request, reply) => {
    try {
      const { id } = request.params
      
      const archivedProfile = await SMTPProfile.archive(id)
      
      if (!archivedProfile) {
        return reply.status(404).send({
          success: false,
          error: 'SMTP profile not found'
        })
      }
      
      return {
        success: true,
        data: archivedProfile,
        message: 'SMTP profile archived successfully'
      }
    } catch (error) {
      fastify.log.error('Erreur dans POST /api/smtp-profiles/:id/archive:', error)
      return reply.status(500).send({
        success: false,
        error: error.message
      })
    }
  })

  // DELETE /api/smtp-profiles/:id - Supprimer un profil SMTP
  fastify.delete('/api/smtp-profiles/:id', async (request, reply) => {
    try {
      const { id } = request.params
      
      const result = await SMTPProfile.delete(id)
      
      if (!result) {
        return reply.status(404).send({
          success: false,
          error: 'SMTP profile not found'
        })
      }
      
      return {
        success: true,
        message: 'SMTP profile deleted successfully'
      }
    } catch (error) {
      fastify.log.error('Erreur dans DELETE /api/smtp-profiles/:id:', error)
      return reply.status(500).send({
        success: false,
        error: error.message
      })
    }
  })

  // POST /api/smtp-profiles/:id/test - Tester un profil SMTP
  fastify.post('/api/smtp-profiles/:id/test', async (request, reply) => {
    try {
      const { id } = request.params
      const { testEmail } = request.body
      
      if (!testEmail) {
        return reply.status(400).send({
          success: false,
          error: 'Test email is required'
        })
      }
      
      const result = await SMTPProfile.test(id, testEmail)
      
      return {
        success: true,
        data: result,
        message: 'SMTP profile test completed'
      }
    } catch (error) {
      fastify.log.error('Erreur dans POST /api/smtp-profiles/:id/test:', error)
      return reply.status(500).send({
        success: false,
        error: error.message
      })
    }
  })
}