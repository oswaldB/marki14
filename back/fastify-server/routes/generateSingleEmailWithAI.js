// Route Fastify pour générer un seul email avec IA
// Migration depuis Parse.Cloud.define('generateSingleEmailWithAI')

import { generateEmailWithOllama } from '../ollama.js'
import { query } from '../db.js'

export default async function (fastify) {
  
  // POST /api/generate-single-email - Génère un seul email avec IA
  fastify.post('/api/generate-single-email', async (request, reply) => {
    try {
      const { 
        sequenceId, 
        target, 
        tone = 'professionnel', 
        delay = 0 
      } = request.body
      
      // Validation des paramètres
      if (!sequenceId) {
        return reply.status(400).send({
          success: false,
          error: 'sequenceId is required'
        })
      }
      
      if (!target) {
        return reply.status(400).send({
          success: false,
          error: 'target is required'
        })
      }
      
      // Vérifier que la séquence existe (simulation pour Fastify)
      // Note: Dans Parse Cloud, cela utilisait Parse.Query sur la collection Sequences
      // Ici, nous devons implémenter la logique équivalente pour PostgreSQL
      const sequenceQuery = `
        SELECT id, name, actions
        FROM "sequences"
        WHERE id = $1
        LIMIT 1
      `
      
      const sequenceResult = await query(sequenceQuery, [sequenceId])
      
      if (!sequenceResult.rows || sequenceResult.rows.length === 0) {
        return reply.status(404).send({
          success: false,
          error: 'Sequence not found'
        })
      }
      
      const sequence = sequenceResult.rows[0]
      
      // Générer un seul email
      const action = await generateSingleEmailAction(target, tone, delay)
      
      // Ajouter l'action à la séquence existante
      const currentActions = sequence.actions || []
      currentActions.push(action)
      
      // Mettre à jour la séquence dans la base de données
      const updateQuery = `
        UPDATE "sequences"
        SET actions = $1
        WHERE id = $2
        RETURNING *
      `
      
      await query(updateQuery, [JSON.stringify(currentActions), sequenceId])
      
      return {
        success: true,
        message: 'Email généré avec succès et ajouté à la séquence',
        actionGenerated: action
      }
      
    } catch (error) {
      fastify.log.error('Error in POST /api/generate-single-email:', error)
      return reply.status(500).send({
        success: false,
        error: error.message,
        details: error.stack
      })
    }
  })
  
  // Route de test pour vérifier la migration
  fastify.get('/api/test-generate-single-email', async (request, reply) => {
    return {
      message: 'Route generateSingleEmailWithAI migrée avec succès depuis Parse Cloud',
      originalFunction: 'Parse.Cloud.define("generateSingleEmailWithAI", ...)',
      newEndpoint: 'POST /api/generate-single-email',
      example: {
        method: 'POST',
        url: '/api/generate-single-email',
        body: {
          sequenceId: 'SEQ001',
          target: {
            clientName: 'Client Test',
            invoiceNumber: 'FACT001',
            amount: 1500.50,
            dueDate: '2024-01-15'
          },
          tone: 'professionnel',
          delay: 0
        }
      },
      features: [
        'Génération d\'un seul email avec IA',
        'Intégration avec les séquences existantes',
        'Gestion des tons personnalisés',
        'Fallback automatique en cas d\'échec',
        'Mise à jour des séquences en base de données'
      ]
    }
  })
}

// Générer un seul email
async function generateSingleEmailAction(target, tone, delay) {
  // Créer un exemple d'impayé pour la génération
  const sampleImpaye = createSampleImpaye(target)
  
  // Générer le sujet et le message avec l'IA
  const prompt = buildSingleEmailPrompt(target, tone)
  
  try {
    // Utiliser la fonction existante pour générer l'email
    const result = await generateEmailWithOllama({
      impayeData: sampleImpaye,
      sequenceName: 'Email généré par IA',
      actionType: 'email',
      isMultiple: false,
      template: prompt
    })
    
    if (result.success) {
      return {
        type: 'email',
        delay: delay,
        subject: result.subject,
        senderEmail: 'default@example.com', // À configurer
        message: result.body,
        isMultipleImpayes: false
      }
    } else {
      // Utiliser un fallback si l'IA échoue
      const fallbackAction = generateFallbackSingleEmail(target, tone, delay)
      
      // Appliquer le remplacement des placeholders avec les données de l'impayé
      fallbackAction.subject = replacePlaceholders(fallbackAction.subject, sampleImpaye)
      fallbackAction.message = replacePlaceholders(fallbackAction.message, sampleImpaye)
      
      return fallbackAction
    }
    
  } catch (error) {
    console.error('Erreur lors de la génération de l\'email:', error)
    return generateFallbackSingleEmail(target, tone, delay)
  }
}

// Créer un exemple d'impayé
function createSampleImpaye(target) {
  return {
    nfacture: target.invoiceNumber || 'FACT001',
    payeur_nom: target.clientName || 'Client Inconnu',
    payeur_email: target.clientEmail || 'client@example.com',
    resteapayer: target.amount || 0,
    datepiece: target.dueDate || new Date().toISOString(),
    refpiece: target.reference || 'REF001',
    datecre: new Date().toISOString()
  }
}

// Construire le prompt pour un seul email
function buildSingleEmailPrompt(target, tone) {
  let prompt = `Générez un email de relance unique pour ${getTargetDescription(target)}. `
  prompt += `Ton: ${getToneDescription(tone)}. `
  prompt += `Soyez concis, professionnel et axé sur l'action. `
  prompt += `Incluez les informations clés: référence de facture, montant, date d'échéance. `
  prompt += `Proposez une solution ou un arrangement de paiement. `
  prompt += `Utilisez un format HTML simple pour le corps de l'email.`
  
  return prompt
}

// Obtenir la description de la cible
function getTargetDescription(target) {
  if (target.clientName && target.invoiceNumber) {
    return `le client ${target.clientName} concernant la facture ${target.invoiceNumber}`
  } else if (target.clientName) {
    return `le client ${target.clientName}`
  } else {
    return 'un client'
  }
}

// Obtenir la description du ton
function getToneDescription(tone) {
  const toneDescriptions = {
    'professionnel': 'professionnel et courtois',
    'ferme': 'professionnel mais ferme',
    'urgent': 'ferme et urgent',
    'dernier': 'très ferme avec menace de conséquences'
  }
  return toneDescriptions[tone] || 'professionnel et courtois'
}

// Générer un email de fallback
function generateFallbackSingleEmail(target, tone, delay) {
  const sampleImpaye = createSampleImpaye(target)
  
  return {
    type: 'email',
    delay: delay,
    subject: 'Rappel de paiement - Facture {{nfacture}}',
    senderEmail: 'default@example.com',
    message: `Bonjour {{payeur_nom}},

Nous vous rappelons que votre facture n°{{nfacture}} d'un montant de {{resteapayer}} € est actuellement impayée.

Nous vous invitons à procéder au règlement dans les plus brefs délais.

Cordialement,
Votre service comptable`,
    isMultipleImpayes: false
  }
}

// Remplacer les placeholders
function replacePlaceholders(text, impayeData) {
  return text
    .replace(/\{\{nfacture\}\}/g, impayeData.nfacture)
    .replace(/\{\{payeur_nom\}\}/g, impayeData.payeur_nom)
    .replace(/\{\{resteapayer\}\}/g, impayeData.resteapayer)
    .replace(/\{\{datepiece\}\}/g, new Date(impayeData.datepiece).toLocaleDateString('fr-FR'))
}