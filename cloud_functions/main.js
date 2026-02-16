// cloud_functions/main.js
// Point d'entrée pour les fonctions cloud de gestion des séquences

const {
  getScheduledRelancesForSequence,
  updateRelanceStatus,
  createSequenceLog,
  deactivateSequenceAndCancelRelances
} = require('./relanceFunctions');

// Fonction principale exposée pour la désactivation de séquence
Parse.Cloud.define('deactivateSequence', async (request) => {
  const { sequenceId } = request.params;
  
  if (!sequenceId) {
    throw new Error('sequenceId est requis');
  }
  
  try {
    const result = await deactivateSequenceAndCancelRelances(sequenceId);
    
    if (!result.success && result.errorCount > 0) {
      return {
        success: false,
        message: result.message,
        cancelledCount: result.cancelledCount,
        errorCount: result.errorCount,
        errors: result.errors
      };
    }
    
    return {
      success: true,
      message: result.message,
      cancelledCount: result.cancelledCount
    };
    
  } catch (error) {
    console.error('Erreur dans deactivateSequence:', error);
    throw new Error(error.message);
  }
});

// Fonction pour récupérer les relances planifiées d'une séquence
Parse.Cloud.define('getScheduledRelances', async (request) => {
  const { sequenceId } = request.params;
  
  if (!sequenceId) {
    throw new Error('sequenceId est requis');
  }
  
  try {
    const relances = await getScheduledRelancesForSequence(sequenceId);
    return relances.map(r => ({
      objectId: r.id,
      send_date: r.get('send_date'),
      email_to: r.get('email_to'),
      email_subject: r.get('email_subject'),
      status: r.get('is_sent') ? 'sent' : 'scheduled'
    }));
  } catch (error) {
    console.error('Erreur dans getScheduledRelances:', error);
    throw new Error(error.message);
  }
});

// Fonction pour annuler manuellement une relance
Parse.Cloud.define('cancelRelance', async (request) => {
  const { relanceId } = request.params;
  
  if (!relanceId) {
    throw new Error('relanceId est requis');
  }
  
  try {
    const result = await updateRelanceStatus(relanceId, 'cancelled');
    
    if (!result.success) {
      throw new Error(result.error || 'Échec de l\'annulation de la relance');
    }
    
    return { success: true, message: 'Relance annulée avec succès' };
  } catch (error) {
    console.error('Erreur dans cancelRelance:', error);
    throw new Error(error.message);
  }
});

console.log('Fonctions cloud de gestion des relances chargées avec succès');