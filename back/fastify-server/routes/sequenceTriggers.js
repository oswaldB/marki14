// sequenceTriggers.js - Endpoints pour gérer les triggers de séquences (migration depuis Parse Cloud)
const { getSequenceById, updateSequence } = require('../models/sequence');
const { getImpayeById, updateImpaye } = require('../models/impaye');

// Note: Ces endpoints remplacent les triggers Parse Cloud
// Le frontend doit les appeler explicitement après les opérations CRUD

/**
 * Endpoint pour gérer l'activation/désactivation d'une séquence
 * Remplace Parse.Cloud.afterSave('Sequences')
 */
async function handleSequenceStatusChange(request, reply) {
  const { sequenceId, isActif } = request.body;
  
  try {
    const sequence = await getSequenceById(sequenceId);
    if (!sequence) {
      return reply.status(404).send({ error: 'Séquence non trouvée' });
    }
    
    console.log(`Séquence ${sequence.nom} - changement de statut: isActif=${isActif}`);
    
    if (isActif) {
      // Séquence activée - peupler les relances
      console.log(`Séquence ${sequence.nom} activée, lancement de populateRelanceSequence...`);
      
      const populateResult = await require('./populateRelanceSequence').populateRelanceSequence(sequenceId);
      
      return reply.send({
        success: true,
        message: 'Séquence activée et relances peuplées',
        data: {
          processed: populateResult.processed,
          created: populateResult.created,
          updated: populateResult.updated
        }
      });
      
    } else {
      // Séquence désactivée - nettoyer les relances
      console.log(`Séquence ${sequence.nom} désactivée, lancement de cleanupRelancesOnDeactivate...`);
      
      const cleanupResult = await require('./cleanupRelancesOnDeactivate').cleanupRelancesOnDeactivate(sequenceId);
      
      return reply.send({
        success: true,
        message: 'Séquence désactivée et relances nettoyées',
        data: {
          deleted: cleanupResult.deleted,
          kept: cleanupResult.kept
        }
      });
    }
    
  } catch (error) {
    console.error(`Erreur dans handleSequenceStatusChange pour la séquence ${sequenceId}:`, error);
    return reply.status(500).send({
      error: 'Erreur lors du traitement du changement de statut',
      details: error.message
    });
  }
}

/**
 * Endpoint pour gérer l'association manuelle d'une séquence à un impayé
 * Remplace Parse.Cloud.afterSave('Impayes')
 */
async function handleImpayeSequenceAssignment(request, reply) {
  const { impayeId, sequenceId } = request.body;
  
  try {
    const impaye = await getImpayeById(impayeId);
    if (!impaye) {
      return reply.status(404).send({ error: 'Impayé non trouvé' });
    }
    
    console.log(`Association de la séquence ${sequenceId} à l'impayé ${impaye.nfacture}`);
    
    // Appeler la fonction handleManualSequenceAssignment
    const result = await require('./handleManualSequenceAssignment').handleManualSequenceAssignment(impayeId, sequenceId);
    
    return reply.send({
      success: true,
      message: 'Association de séquence traitée',
      data: {
        relancesCreated: result.relancesCreated
      }
    });
    
  } catch (error) {
    console.error(`Erreur dans handleImpayeSequenceAssignment pour l'impayé ${impayeId}:`, error);
    return reply.status(500).send({
      error: 'Erreur lors du traitement de l\'association de séquence',
      details: error.message
    });
  }
}

/**
 * Endpoint pour gérer la suppression d'une séquence
 * Remplace Parse.Cloud.beforeDelete('Sequences')
 */
async function handleSequenceDeletion(request, reply) {
  const { sequenceId } = request.body;
  
  try {
    const sequence = await getSequenceById(sequenceId);
    if (!sequence) {
      return reply.status(404).send({ error: 'Séquence non trouvée' });
    }
    
    console.log(`Suppression de la séquence ${sequence.nom} (ID: ${sequenceId})`);
    
    // Optionnel: Nettoyer les relances associées
    // Cela dépend des besoins métiers - actuellement désactivé
    // const cleanupResult = await cleanupSequenceRelances(sequenceId);
    
    return reply.send({
      success: true,
      message: 'Prêt pour la suppression de la séquence',
      warning: 'Les relances associées ne sont pas automatiquement supprimées (à discuter)'
    });
    
  } catch (error) {
    console.error(`Erreur dans handleSequenceDeletion pour la séquence ${sequenceId}:`, error);
    return reply.status(500).send({
      error: 'Erreur lors de la préparation de la suppression',
      details: error.message
    });
  }
}

// Exporter les endpoints pour Fastify
module.exports = async function (fastify, options) {
  // Endpoint pour le changement de statut de séquence
  fastify.post('/sequence-status-change', {
    schema: {
      body: {
        type: 'object',
        required: ['sequenceId', 'isActif'],
        properties: {
          sequenceId: { type: 'string' },
          isActif: { type: 'boolean' }
        }
      }
    }
  }, handleSequenceStatusChange);

  // Endpoint pour l'association manuelle de séquence
  fastify.post('/impaye-sequence-assignment', {
    schema: {
      body: {
        type: 'object',
        required: ['impayeId', 'sequenceId'],
        properties: {
          impayeId: { type: 'string' },
          sequenceId: { type: 'string' }
        }
      }
    }
  }, handleImpayeSequenceAssignment);

  // Endpoint pour la suppression de séquence
  fastify.post('/sequence-deletion', {
    schema: {
      body: {
        type: 'object',
        required: ['sequenceId'],
        properties: {
          sequenceId: { type: 'string' }
        }
      }
    }
  }, handleSequenceDeletion);

  console.log('Sequence triggers endpoints registered');
};