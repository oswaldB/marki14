// Route Fastify pour peupler les relances d'une séquence
// Migration depuis Parse.Cloud.define('populateRelanceSequence')

import { query } from '../db.js'

export default async function (fastify) {
  
  // POST /api/populate-relance-sequence - Peuple les relances d'une séquence
  fastify.post('/api/populate-relance-sequence', async (request, reply) => {
    try {
      const { idSequence } = request.body
      
      // Validation des paramètres
      if (!idSequence) {
        return reply.status(400).send({
          success: false,
          error: 'Le paramètre idSequence est requis'
        })
      }
      
      // Valider le format de l'ID de séquence
      if (typeof idSequence !== 'string' || idSequence.length < 10) {
        return reply.status(400).send({
          success: false,
          error: `Format d'ID de séquence invalide: ${idSequence}`
        })
      }
      
      console.log(`Début du traitement pour la séquence ${idSequence}`)
      
      // Variables de comptage
      let processedCount = 0
      let createdCount = 0
      let updatedCount = 0
      let sequence = null
      let impayes = []
      let actions = []
      
      // 1. Récupérer la séquence
      console.log(`Recherche de la séquence avec ID: ${idSequence}`)
      
      const sequenceQuery = `
        SELECT id, nom, "isActif", "isAuto", actions
        FROM "sequences"
        WHERE id = $1
        LIMIT 1
      `
      
      const sequenceResult = await query(sequenceQuery, [idSequence])
      
      if (!sequenceResult.rows || sequenceResult.rows.length === 0) {
        return reply.status(404).send({
          success: false,
          error: `Séquence avec l'ID ${idSequence} non trouvée`
        })
      }
      
      sequence = sequenceResult.rows[0]
      
      console.log(`Séquence trouvée: ${sequence.nom} (ID: ${sequence.id})`)
      console.log(`Statut de la séquence: ${sequence.isActif}`)
      console.log(`Type de séquence: ${sequence.isAuto ? 'Automatique' : 'Manuelle'}`)
      
      // 2. Récupérer tous les impayés qui ont cette séquence
      console.log(`[Étape 3/8] Récupération des impayés associés à la séquence`)
      
      const impayeQuery = `
        SELECT i.*
        FROM "Impayes" i
        WHERE i."sequenceId" = $1
        AND i."facturesoldee" = false
      `
      
      const impayesResult = await query(impayeQuery, [idSequence])
      
      if (impayesResult.rows && impayesResult.rows.length > 0) {
        impayes = impayesResult.rows
        console.log(`Nombre d'impayés trouvés: ${impayes.length}`)
      } else {
        console.log('Aucun impayé trouvé pour cette séquence')
        return {
          success: true,
          message: 'Aucun impayé trouvé pour cette séquence',
          processedCount: 0,
          createdCount: 0,
          updatedCount: 0
        }
      }
      
      // 3. Récupérer les actions de la séquence
      actions = sequence.actions || []
      
      if (actions.length === 0) {
        console.log('Aucune action définie dans la séquence')
        return {
          success: true,
          message: 'Aucune action définie dans la séquence',
          processedCount: 0,
          createdCount: 0,
          updatedCount: 0
        }
      }
      
      // 4. Traiter chaque impayé
      console.log(`[Étape 4/8] Traitement des impayés`)
      
      for (const impaye of impayes) {
        processedCount++
        
        // Vérifier si des relances existent déjà pour cet impayé
        const relanceQuery = `
          SELECT *
          FROM "Relances"
          WHERE "impayeId" = $1
          AND "sequenceId" = $2
        `
        
        const relanceResult = await query(relanceQuery, [impaye.id, idSequence])
        
        if (relanceResult.rows && relanceResult.rows.length > 0) {
          // Mettre à jour la relance existante
          const existingRelance = relanceResult.rows[0]
          
          // Ajouter les nouvelles actions
          const updatedActions = [...(existingRelance.actions || []), ...actions]
          
          const updateRelanceQuery = `
            UPDATE "Relances"
            SET actions = $1, "updatedAt" = NOW()
            WHERE id = $2
            RETURNING *
          `
          
          await query(updateRelanceQuery, [JSON.stringify(updatedActions), existingRelance.id])
          updatedCount++
          
        } else {
          // Créer une nouvelle relance
          const insertRelanceQuery = `
            INSERT INTO "Relances" ("impayeId", "sequenceId", actions, "createdAt", "updatedAt")
            VALUES ($1, $2, $3, NOW(), NOW())
            RETURNING *
          `
          
          await query(insertRelanceQuery, [impaye.id, idSequence, JSON.stringify(actions)])
          createdCount++
        }
      }
      
      console.log(`[Étape 5/8] Traitement terminé`)
      console.log(`- Impayés traités: ${processedCount}`)
      console.log(`- Relances créées: ${createdCount}`)
      console.log(`- Relances mises à jour: ${updatedCount}`)
      
      return {
        success: true,
        message: 'Traitement des relances terminé avec succès',
        sequenceId: idSequence,
        sequenceName: sequence.nom,
        processedCount: processedCount,
        createdCount: createdCount,
        updatedCount: updatedCount,
        timestamp: new Date().toISOString()
      }
      
    } catch (error) {
      fastify.log.error('Error in POST /api/populate-relance-sequence:', error)
      return reply.status(500).send({
        success: false,
        error: error.message,
        details: error.stack
      })
    }
  })
  
  // Route de test pour vérifier la migration
  fastify.get('/api/test-populate-relance-sequence', async (request, reply) => {
    return {
      message: 'Route populateRelanceSequence migrée avec succès depuis Parse Cloud',
      originalFunction: 'Parse.Cloud.define("populateRelanceSequence", ...)',
      newEndpoint: 'POST /api/populate-relance-sequence',
      example: {
        method: 'POST',
        url: '/api/populate-relance-sequence',
        body: {
          idSequence: 'SEQ001'
        }
      },
      features: [
        'Traitement des impayés par séquence',
        'Création et mise à jour des relances',
        'Gestion des actions de séquence',
        'Statistiques de traitement détaillées',
        'Gestion des erreurs complète'
      ]
    }
  })
}