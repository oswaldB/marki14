// Route Fastify pour nettoyer les relances lors de la désactivation d'une séquence
// Migration depuis Parse.Cloud.define('cleanupRelancesOnDeactivate')

import { query } from '../db.js'

export default async function (fastify) {
  
  // POST /api/cleanup-relances - Nettoie les relances lors de la désactivation d'une séquence
  fastify.post('/api/cleanup-relances', async (request, reply) => {
    try {
      const { idSequence } = request.body
      
      // Validation des paramètres
      if (!idSequence) {
        return reply.status(400).send({
          success: false,
          error: 'Le paramètre idSequence est requis'
        })
      }
      
      console.log(`Début du nettoyage des relances pour la séquence ${idSequence}`)
      
      // 1. Récupérer la séquence
      const sequenceQuery = `
        SELECT id, nom
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
      
      const sequence = sequenceResult.rows[0]
      console.log(`Séquence trouvée: ${sequence.nom}`)
      
      // 2. Récupérer tous les impayés qui ont cette séquence
      const impayeQuery = `
        SELECT id, "nfacture"
        FROM "Impayes"
        WHERE "sequenceId" = $1
      `
      
      const impayesResult = await query(impayeQuery, [idSequence])
      
      let impayes = []
      if (impayesResult.rows && impayesResult.rows.length > 0) {
        impayes = impayesResult.rows
        console.log(`Nombre d'impayés trouvés pour cette séquence: ${impayes.length}`)
      } else {
        console.log('Aucun impayé trouvé pour cette séquence')
        return {
          success: true,
          message: 'Aucun impayé trouvé pour cette séquence, rien à nettoyer',
          deleted: 0,
          kept: 0
        }
      }
      
      // 3. Pour chaque impayé, supprimer les relances non envoyées
      let deletedCount = 0
      let keptCount = 0
      
      for (const impaye of impayes) {
        console.log(`\nTraitement de l'impayé ${impaye.nfacture} (ID: ${impaye.id})`)
        
        // 4. Chercher les relances pour cet impayé et cette séquence
        const relanceQuery = `
          SELECT id, "is_sent"
          FROM "Relances"
          WHERE "impayeId" = $1
          AND "sequenceId" = $2
        `
        
        const relancesResult = await query(relanceQuery, [impaye.id, idSequence])
        
        let relances = []
        if (relancesResult.rows && relancesResult.rows.length > 0) {
          relances = relancesResult.rows
          console.log(`Nombre de relances trouvées: ${relances.length}`)
        } else {
          console.log('Aucune relance trouvée pour cet impayé')
          continue
        }
        
        // 5. Supprimer uniquement les relances non envoyées (is_sent = false)
        const relancesToDelete = relances.filter(r => !r.is_sent)
        const relancesToKeep = relances.filter(r => r.is_sent)
        
        if (relancesToDelete.length > 0) {
          console.log(`Suppression de ${relancesToDelete.length} relances non envoyées...`)
          
          // Supprimer les relances non envoyées
          for (const relance of relancesToDelete) {
            const deleteQuery = `
              DELETE FROM "Relances"
              WHERE id = $1
            `
            await query(deleteQuery, [relance.id])
            deletedCount++
          }
          
          console.log('Relances non envoyées supprimées avec succès')
        } else {
          console.log('Aucune relance non envoyée à supprimer')
        }
        
        if (relancesToKeep.length > 0) {
          console.log(`Conservation de ${relancesToKeep.length} relances déjà envoyées`)
          keptCount += relancesToKeep.length
        }
      }
      
      console.log(`\nNettoyage terminé:`)
      console.log(`- Relances non envoyées supprimées: ${deletedCount}`)
      console.log(`- Relances envoyées conservées: ${keptCount}`)
      
      return {
        success: true,
        message: 'Nettoyage des relances terminé avec succès',
        deleted: deletedCount,
        kept: keptCount,
        sequenceId: idSequence,
        sequenceName: sequence.nom,
        timestamp: new Date().toISOString()
      }
      
    } catch (error) {
      fastify.log.error('Error in POST /api/cleanup-relances:', error)
      return reply.status(500).send({
        success: false,
        error: error.message,
        details: error.stack
      })
    }
  })
  
  // Route de test pour vérifier la migration
  fastify.get('/api/test-cleanup-relances', async (request, reply) => {
    return {
      message: 'Route cleanupRelancesOnDeactivate migrée avec succès depuis Parse Cloud',
      originalFunction: 'Parse.Cloud.define("cleanupRelancesOnDeactivate", ...)',
      newEndpoint: 'POST /api/cleanup-relances',
      example: {
        method: 'POST',
        url: '/api/cleanup-relances',
        body: {
          idSequence: 'SEQ001'
        }
      },
      features: [
        'Nettoyage des relances non envoyées',
        'Conservation des relances déjà envoyées',
        'Gestion des erreurs complète',
        'Statistiques détaillées du nettoyage',
        'Journalisation complète des opérations'
      ]
    }
  })
}