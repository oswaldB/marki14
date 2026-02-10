// Route Fastify pour gérer l'association manuelle d'une séquence à un impayé
// Migration depuis Parse.Cloud.define('handleManualSequenceAssignment')

import { query } from '../db.js'

export default async function (fastify) {
  
  // POST /api/assign-sequence - Associe manuellement une séquence à un impayé
  fastify.post('/api/assign-sequence', async (request, reply) => {
    try {
      const { impayeId, sequenceId } = request.body
      
      // Validation des paramètres
      if (!impayeId) {
        return reply.status(400).send({
          success: false,
          error: 'Le paramètre impayeId est requis'
        })
      }
      
      if (!sequenceId) {
        return reply.status(400).send({
          success: false,
          error: 'Le paramètre sequenceId est requis'
        })
      }
      
      console.log(`Association manuelle de la séquence ${sequenceId} à l'impayé ${impayeId}`)
      
      // 1. Récupérer l'impayé
      const impayeQuery = `
        SELECT *
        FROM "Impayes"
        WHERE id = $1
        LIMIT 1
      `
      
      const impayeResult = await query(impayeQuery, [impayeId])
      
      if (!impayeResult.rows || impayeResult.rows.length === 0) {
        return reply.status(404).send({
          success: false,
          error: `Impayé avec l'ID ${impayeId} non trouvé`
        })
      }
      
      const impaye = impayeResult.rows[0]
      console.log(`Impayé trouvé: Facture ${impaye.nfacture}`)
      
      // 2. Récupérer la séquence
      const sequenceQuery = `
        SELECT *
        FROM "sequences"
        WHERE id = $1
        LIMIT 1
      `
      
      const sequenceResult = await query(sequenceQuery, [sequenceId])
      
      if (!sequenceResult.rows || sequenceResult.rows.length === 0) {
        return reply.status(404).send({
          success: false,
          error: `Séquence avec l'ID ${sequenceId} non trouvée`
        })
      }
      
      const sequence = sequenceResult.rows[0]
      console.log(`Séquence trouvée: ${sequence.nom}`)
      
      // 3. Vérifier que la séquence est active
      if (!sequence.isActif) {
        console.log('La séquence n\'est pas active, aucune relance ne sera créée')
        return {
          success: true,
          message: 'Séquence associée mais non active - aucune relance créée',
          impayeId: impayeId,
          sequenceId: sequenceId,
          relancesCreated: 0
        }
      }
      
      // 4. Récupérer les actions de la séquence
      const actions = sequence.actions || []
      
      if (actions.length === 0) {
        console.log('Aucune action trouvée dans la séquence')
        return {
          success: true,
          message: 'Aucune action dans la séquence',
          impayeId: impayeId,
          sequenceId: sequenceId,
          relancesCreated: 0
        }
      }
      
      console.log(`Nombre d'actions dans la séquence: ${actions.length}`)
      
      // 5. Chercher les relances existantes pour cet impayé et cette séquence
      const relanceQuery = `
        SELECT *
        FROM "Relances"
        WHERE "impayeId" = $1
        AND "sequenceId" = $2
      `
      
      const relancesResult = await query(relanceQuery, [impayeId, sequenceId])
      
      let existingRelances = []
      if (relancesResult.rows && relancesResult.rows.length > 0) {
        existingRelances = relancesResult.rows
        console.log(`Nombre de relances existantes: ${existingRelances.length}`)
      }
      
      // 6. Supprimer les relances non envoyées (is_sent = false)
      const relancesToDelete = existingRelances.filter(r => !r.is_sent)
      
      if (relancesToDelete.length > 0) {
        console.log(`Suppression de ${relancesToDelete.length} relances non envoyées...`)
        
        for (const relance of relancesToDelete) {
          const deleteQuery = `
            DELETE FROM "Relances"
            WHERE id = $1
          `
          await query(deleteQuery, [relance.id])
        }
        
        console.log('Relances non envoyées supprimées')
      }
      
      // 7. Si aucune relance n'existe (ou toutes ont été supprimées), créer de nouvelles relances
      const remainingRelances = existingRelances.filter(r => r.is_sent)
      
      if (remainingRelances.length === 0) {
        console.log('Création de nouvelles relances...')
        
        // Prendre la première action de la séquence
        const firstAction = actions[0]
        
        if (!firstAction) {
          console.log('Aucune action valide trouvée')
          return {
            success: true,
            message: 'Aucune action valide dans la séquence',
            impayeId: impayeId,
            sequenceId: sequenceId,
            relancesCreated: 0
          }
        }
        
        // Remplacer les valeurs [[ ]] dans les messages
        const emailSubject = replacePlaceholders(firstAction.emailSubject || '', impaye)
        const emailBody = replacePlaceholders(firstAction.emailBody || '', impaye)
        const emailTo = replacePlaceholders(firstAction.emailTo || '', impaye)
        const emailCc = replacePlaceholders(firstAction.emailCc || '', impaye)
        
        console.log(`Création de relance avec sujet: ${emailSubject}`)
        
        // Créer une nouvelle relance
        const insertRelanceQuery = `
          INSERT INTO "Relances" 
          ("email_sender", "email_subject", "email_body", "email_to", "email_cc", "send_date", "is_sent", "impayeId", "sequenceId", "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, $5, NOW(), false, $6, $7, NOW(), NOW())
          RETURNING *
        `
        
        const newRelanceResult = await query(insertRelanceQuery, [
          firstAction.senderEmail || sequence.senderEmail || '',
          emailSubject,
          emailBody,
          emailTo,
          emailCc,
          impayeId,
          sequenceId
        ])
        
        const newRelance = newRelanceResult.rows[0]
        
        // Créer aussi un enregistrement dans la table Relance
        const insertRelanceObjQuery = `
          INSERT INTO "Relance" 
          ("type", "message", "date", "isSent", "impayeId", "sequenceId", "createdAt", "updatedAt")
          VALUES ($1, $2, NOW(), false, $3, $4, NOW(), NOW())
          RETURNING *
        `
        
        const relanceObjResult = await query(insertRelanceObjQuery, [
          firstAction.type || 'email',
          emailBody,
          impayeId,
          sequenceId
        ])
        
        const relanceObj = relanceObjResult.rows[0]
        
        console.log(`Relance créée avec succès (ID: ${newRelance.id})`)
        
        return {
          success: true,
          message: 'Relance créée avec succès',
          impayeId: impayeId,
          sequenceId: sequenceId,
          relanceId: newRelance.id,
          relanceObjId: relanceObj.id,
          relancesCreated: 1
        }
      } else {
        console.log(`Relances existantes conservées (${remainingRelances.length} relances déjà envoyées)`)
        
        return {
          success: true,
          message: 'Relances existantes conservées',
          impayeId: impayeId,
          sequenceId: sequenceId,
          relancesCreated: 0,
          existingRelances: remainingRelances.length
        }
      }
      
    } catch (error) {
      fastify.log.error('Error in POST /api/assign-sequence:', error)
      return reply.status(500).send({
        success: false,
        error: error.message,
        details: error.stack
      })
    }
  })
  
  // Route de test pour vérifier la migration
  fastify.get('/api/test-assign-sequence', async (request, reply) => {
    return {
      message: 'Route handleManualSequenceAssignment migrée avec succès depuis Parse Cloud',
      originalFunction: 'Parse.Cloud.define("handleManualSequenceAssignment", ...)',
      newEndpoint: 'POST /api/assign-sequence',
      example: {
        method: 'POST',
        url: '/api/assign-sequence',
        body: {
          impayeId: 'IMP001',
          sequenceId: 'SEQ001'
        }
      },
      features: [
        'Association manuelle de séquences aux impayés',
        'Gestion des relances existantes',
        'Création de nouvelles relances si nécessaire',
        'Remplacement des placeholders dans les messages',
        'Gestion des erreurs complète',
        'Journalisation détaillée'
      ]
    }
  })
}

// Fonction pour remplacer les placeholders [[champ]] dans les messages
function replacePlaceholders(template, impaye) {
  if (!template || typeof template !== 'string') {
    return template
  }
  
  // Remplacer les placeholders courants
  let result = template
    .replace(/\{\{\s*impaye\.nfacture\s*\}\}/gi, impaye.nfacture || '')
    .replace(/\{\{\s*impaye\.datepiece\s*\}\}/gi, formatDate(impaye.datepiece))
    .replace(/\{\{\s*impaye\.totalttcnet\s*\}\}/gi, formatCurrency(impaye.totalttcnet))
    .replace(/\{\{\s*impaye\.resteapayer\s*\}\}/gi, formatCurrency(impaye.resteapayer))
    .replace(/\{\{\s*impaye\.payeur_nom\s*\}\}/gi, impaye.payeur_nom || '')
    .replace(/\{\{\s*impaye\.payeur_email\s*\}\}/gi, impaye.payeur_email || '')
    .replace(/\{\{\s*impaye\.payeur_telephone\s*\}\}/gi, impaye.payeur_telephone || '')
    .replace(/\{\{\s*impaye\.proprietaire_nom\s*\}\}/gi, impaye.proprietaire_nom || '')
    .replace(/\{\{\s*impaye\.proprietaire_email\s*\}\}/gi, impaye.proprietaire_email || '')
    .replace(/\{\{\s*impaye\.proprietaire_telephone\s*\}\}/gi, impaye.proprietaire_telephone || '')
  
  // Remplacer aussi le format [[champ]] comme mentionné dans la todo
  result = result
    .replace(/\[\[\s*nfacture\s*\]\]/gi, impaye.nfacture || '')
    .replace(/\[\[\s*datepiece\s*\]\]/gi, formatDate(impaye.datepiece))
    .replace(/\[\[\s*totalttcnet\s*\]\]/gi, formatCurrency(impaye.totalttcnet))
    .replace(/\[\[\s*resteapayer\s*\]\]/gi, formatCurrency(impaye.resteapayer))
    .replace(/\[\[\s*payeur_nom\s*\]\]/gi, impaye.payeur_nom || '')
    .replace(/\[\[\s*payeur_email\s*\]\]/gi, impaye.payeur_email || '')
    .replace(/\[\[\s*payeur_telephone\s*\]\]/gi, impaye.payeur_telephone || '')
    .replace(/\[\[\s*proprietaire_nom\s*\]\]/gi, impaye.proprietaire_nom || '')
    .replace(/\[\[\s*proprietaire_email\s*\]\]/gi, impaye.proprietaire_email || '')
    .replace(/\[\[\s*proprietaire_telephone\s*\]\]/gi, impaye.proprietaire_telephone || '')
  
  return result
}

function formatDate(date) {
  if (!date) return ''
  
  if (date instanceof Date) {
    return date.toLocaleDateString('fr-FR')
  }
  
  if (typeof date === 'string') {
    const parsedDate = new Date(date)
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toLocaleDateString('fr-FR')
    }
  }
  
  return date
}

function formatCurrency(value) {
  if (value === null || value === undefined) return ''
  
  const numericValue = parseFloat(value)
  if (isNaN(numericValue)) return value
  
  return numericValue.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}