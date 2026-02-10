// Route Fastify pour récupérer les valeurs distinctes pour les colonnes
// Migration depuis Parse.Cloud.define('getDistinctValues')

import { query } from '../db.js'

export default async function (fastify) {
  
  // GET /api/distinct-values - Récupère les valeurs distinctes pour une colonne
  fastify.get('/api/distinct-values/:columnName', async (request, reply) => {
    try {
      const { columnName } = request.params
      const { limit = 50 } = request.query
      
      if (!columnName) {
        return reply.status(400).send({
          success: false,
          error: 'columnName is required'
        })
      }
      
      // Vérifier que la limite est un nombre valide
      const limitNumber = parseInt(limit)
      if (isNaN(limitNumber) || limitNumber <= 0) {
        return reply.status(400).send({
          success: false,
          error: 'limit must be a positive number'
        })
      }
      
      // Récupérer les valeurs distinctes depuis la base de données
      // Note: Dans Parse Cloud, cela utilisait Parse.Query avec distinct()
      // Ici, nous devons implémenter la logique équivalente pour PostgreSQL
      const distinctQuery = `
        SELECT DISTINCT "${columnName}" as value
        FROM "Impayes"
        WHERE "${columnName}" IS NOT NULL
        LIMIT $1
      `
      
      const result = await query(distinctQuery, [limitNumber])
      
      if (result.rows && result.rows.length > 0) {
        const values = result.rows.map(row => row.value)
        
        return {
          success: true,
          columnName,
          values: [...new Set(values.filter(val => val !== null && val !== undefined))],
          count: result.rows.length
        }
      } else {
        return {
          success: true,
          columnName,
          values: [],
          count: 0,
          message: `Aucune valeur trouvée pour la colonne ${columnName}.`
        }
      }
      
    } catch (error) {
      fastify.log.error(`Erreur dans GET /api/distinct-values/${request.params.columnName}:`, error)
      return reply.status(500).send({
        success: false,
        error: error.message,
        details: error.stack
      })
    }
  })
  
  // POST /api/distinct-values - Alternative avec body JSON (pour compatibilité)
  fastify.post('/api/distinct-values', async (request, reply) => {
    try {
      const { columnName, limit = 50 } = request.body
      
      if (!columnName) {
        return reply.status(400).send({
          success: false,
          error: 'columnName is required'
        })
      }
      
      // Rediriger vers la méthode GET
      return reply.redirect(307, `/api/distinct-values/${columnName}?limit=${limit}`)
      
    } catch (error) {
      fastify.log.error('Erreur dans POST /api/distinct-values:', error)
      return reply.status(500).send({
        success: false,
        error: error.message
      })
    }
  })
  
  // Route de test pour vérifier la migration
  fastify.get('/api/test-distinct-values', async (request, reply) => {
    return {
      message: 'Route getDistinctValues migrée avec succès depuis Parse Cloud',
      originalFunction: 'Parse.Cloud.define("getDistinctValues", ...)',
      newEndpoint: 'GET /api/distinct-values/:columnName',
      example: 'GET /api/distinct-values/clientName?limit=10'
    }
  })
}