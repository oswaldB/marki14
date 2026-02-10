// Route Fastify pour synchroniser les impayés
// Migration depuis Parse.Cloud.define('syncImpayes')
// Note: Cette route est une version simplifiée pour la compatibilité frontend

import { query } from '../db.js'

export default async function (fastify) {
  
  // POST /api/sync-impayes - Synchronise les impayés (version mock pour le développement)
  fastify.post('/api/sync-impayes', async (request, reply) => {
    try {
      // Cette route est une version simplifiée pour permettre au frontend de fonctionner
      // pendant la migration. Dans une vraie implémentation, cette route devrait:
      // 1. Se connecter à la source de données externe
      // 2. Récupérer les nouveaux impayés
      // 3. Les synchroniser avec la base de données locale
      // 4. Mettre à jour les séquences et relances
      
      console.log('🔄 Synchronisation des impayés - Version de développement')
      
      // Pour l'instant, nous retournons une réponse mock pour permettre au frontend
      // de fonctionner pendant la migration
      return {
        success: true,
        message: 'Synchronisation des impayés - Version de développement (mock)',
        synchronizedCount: 0,
        newImpayes: 0,
        updatedImpayes: 0,
        timestamp: new Date().toISOString(),
        status: 'mocked'
      }
      
    } catch (error) {
      fastify.log.error('Error in POST /api/sync-impayes:', error)
      return reply.status(500).send({
        success: false,
        error: error.message,
        details: error.stack
      })
    }
  })
  
  // Route de test pour vérifier la migration
  fastify.get('/api/test-sync-impayes', async (request, reply) => {
    return {
      message: 'Route syncImpayes - Version de développement pour la compatibilité frontend',
      originalFunction: 'Parse.Cloud.define("syncImpayes", ...)',
      newEndpoint: 'POST /api/sync-impayes',
      status: 'mocked',
      note: 'Cette route doit être implémentée avec la logique réelle de synchronisation'
    }
  })
}