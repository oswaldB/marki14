// Route Fastify pour générer des emails avec Ollama
// Migration depuis Parse.Cloud.define('generateEmailWithOllama')

import { generateEmailWithOllama } from '../ollama.js'

export default async function (fastify) {
  
  // POST /api/generate-email - Génère un email avec Ollama
  fastify.post('/api/generate-email', async (request, reply) => {
    try {
      const { impayeData, sequenceName, actionType, isMultiple = false, template = '' } = request.body
      
      // Validation des paramètres
      if (!impayeData) {
        return reply.status(400).send({
          success: false,
          error: 'impayeData is required'
        })
      }
      
      if (!sequenceName) {
        return reply.status(400).send({
          success: false,
          error: 'sequenceName is required'
        })
      }
      
      if (!actionType) {
        return reply.status(400).send({
          success: false,
          error: 'actionType is required'
        })
      }
      
      // Appeler la fonction de génération d'email
      const result = await generateEmailWithOllama(impayeData, sequenceName, actionType, isMultiple, template)
      
      if (result.success) {
        // Set CORS headers for successful response
        reply.header('Access-Control-Allow-Origin', 'https://dev.markidiags.com')
        reply.header('Access-Control-Allow-Credentials', 'true')
        
        return {
          success: true,
          subject: result.subject,
          body: result.body,
          fullResponse: result.fullResponse,
          modelUsed: result.modelUsed,
          timestamp: new Date().toISOString()
        }
      } else {
        // Set CORS headers for fallback response
        reply.header('Access-Control-Allow-Origin', 'https://dev.markidiags.com')
        reply.header('Access-Control-Allow-Credentials', 'true')
        
        // Retourner le fallback si Ollama a échoué
        return {
          success: false,
          error: result.error,
          fallback: result.fallback,
          message: 'Ollama generation failed, using fallback email'
        }
      }
      
    } catch (error) {
      fastify.log.error('Error in POST /api/generate-email:', error)
      // Set CORS headers even for error responses
      reply.header('Access-Control-Allow-Origin', 'https://dev.markidiags.com')
      reply.header('Access-Control-Allow-Credentials', 'true')
      return reply.status(500).send({
        success: false,
        error: error.message,
        details: error.stack
      })
    }
  })
  
  // Route de test pour vérifier la migration
  fastify.get('/api/test-generate-email', async (request, reply) => {
    return {
      message: 'Route generateEmailWithOllama migrée avec succès depuis Parse Cloud',
      originalFunction: 'Parse.Cloud.define("generateEmailWithOllama", ...)',
      newEndpoint: 'POST /api/generate-email',
      example: {
        method: 'POST',
        url: '/api/generate-email',
        body: {
          impayeData: {
            nfacture: 'FACT001',
            payeur_nom: 'Client Test',
            payeur_email: 'client@test.com',
            resteapayer: 1500.50,
            datepiece: '2024-01-15',
            refpiece: 'REF001'
          },
          sequenceName: 'Relance Standard',
          actionType: 'email',
          isMultiple: false,
          template: ''
        }
      },
      features: [
        'Génération d\'emails avec IA (Ollama)',
        'Support pour les impayés simples et multiples',
        'Gestion des templates personnalisés',
        'Fallback automatique en cas d\'échec',
        'Gestion des erreurs complète'
      ]
    }
  })
}