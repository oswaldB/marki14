// cloud_functions/relanceFunctions.js
// Fonctions pour la gestion des relances planifiées

/**
 * Récupère toutes les relances planifiées pour une séquence
 * @param {String} sequenceId - ID de la séquence Parse
 * @returns {Promise<Array>} - Tableau d'objets Parse représentant les relances
 */
async function getScheduledRelancesForSequence(sequenceId) {
  const Relance = Parse.Object.extend('Relances');
  const query = new Parse.Query(Relance);
  
  // Filtrer par séquence et statut "scheduled"
  query.equalTo('sequence', {
    __type: 'Pointer',
    className: 'Sequences',
    objectId: sequenceId
  });
  
  // Filtrer par statut "scheduled" (is_sent = false)
  query.equalTo('is_sent', false);
  
  try {
    const results = await query.find();
    return results;
  } catch (error) {
    console.error('Erreur lors de la récupération des relances:', error);
    throw error;
  }
}

/**
 * Met à jour le statut d'une relance
 * @param {String} relanceId - ID de la relance Parse
 * @param {String} newStatus - Nouveau statut ("cancelled" ou "scheduled")
 * @returns {Promise<Object>} - Objet avec succès et message d'erreur éventuel
 */
async function updateRelanceStatus(relanceId, newStatus) {
  const Relance = Parse.Object.extend('Relances');
  const relance = new Relance();
  relance.id = relanceId;
  
  try {
    // Mettre à jour le statut en fonction du newStatus
    if (newStatus === 'cancelled') {
      relance.set('is_sent', true); // Marquer comme envoyé (annulé)
      relance.set('status', 'cancelled'); // Ajouter un champ status si nécessaire
    } else if (newStatus === 'scheduled') {
      relance.set('is_sent', false); // Remettre en planifié
      relance.set('status', 'scheduled');
    }
    
    await relance.save(null, { useMasterKey: true });
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la relance:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Crée un log pour une séquence
 * @param {String} sequenceId - ID de la séquence
 * @param {String} action - Action effectuée (ex: "deactivation")
 * @param {String} details - Détails de l'action
 * @returns {Promise<Object>} - Objet Parse du log créé
 */
async function createSequenceLog(sequenceId, action, details) {
  const SequenceLog = Parse.Object.extend('SequenceLog');
  const log = new SequenceLog();
  
  // Pointer vers la séquence
  const Sequence = Parse.Object.extend('Sequences');
  const sequence = new Sequence();
  sequence.id = sequenceId;
  
  // Récupérer l'utilisateur courant
  const currentUser = Parse.User.current();
  
  log.set('sequence', sequence);
  log.set('action', action);
  log.set('details', details);
  
  if (currentUser) {
    log.set('user', currentUser);
  }
  
  try {
    const result = await log.save(null, { useMasterKey: true });
    return result;
  } catch (error) {
    console.error('Erreur lors de la création du log:', error);
    throw error;
  }
}

/**
 * Fonction principale pour désactiver une séquence et annuler ses relances
 * @param {String} sequenceId - ID de la séquence à désactiver
 * @returns {Promise<Object>} - Objet avec le résultat de l'opération
 */
async function deactivateSequenceAndCancelRelances(sequenceId) {
  let cancelledCount = 0;
  let errorCount = 0;
  const errors = [];
  
  try {
    // 1. Récupérer les relances planifiées
    const scheduledRelances = await getScheduledRelancesForSequence(sequenceId);
    
    if (scheduledRelances.length === 0) {
      // 2. Cas sans relances - créer un log et retourner
      await createSequenceLog(sequenceId, 'deactivation', 'Aucune relance à annuler');
      return {
        success: true,
        cancelledCount: 0,
        errorCount: 0,
        message: 'Aucune relance à annuler'
      };
    }
    
    // 3. Boucle sur chaque relance pour les annuler
    for (const relance of scheduledRelances) {
      try {
        const result = await updateRelanceStatus(relance.id, 'cancelled');
        if (result.success) {
          cancelledCount++;
        } else {
          errorCount++;
          errors.push({ relanceId: relance.id, error: result.error });
        }
      } catch (error) {
        errorCount++;
        errors.push({ relanceId: relance.id, error: error.message });
      }
    }
    
    // 4. Créer le log approprié
    if (errorCount === 0) {
      await createSequenceLog(sequenceId, 'deactivation', `${cancelledCount} relances annulées`);
    } else {
      await createSequenceLog(sequenceId, 'deactivation_error', `${cancelledCount}/${scheduledRelances.length} relances annulées`);
    }
    
    // 5. Désactiver la séquence
    const Sequence = Parse.Object.extend('Sequences');
    const sequence = new Sequence();
    sequence.id = sequenceId;
    sequence.set('isActif', false);
    await sequence.save(null, { useMasterKey: true });
    
    return {
      success: errorCount === 0,
      cancelledCount,
      errorCount,
      errors,
      message: errorCount === 0 
        ? `${cancelledCount} relances annulées avec succès`
        : `${errorCount} relance(s) n'ont pas pu être annulées`
    };
    
  } catch (error) {
    console.error('Erreur globale lors de la désactivation:', error);
    await createSequenceLog(sequenceId, 'deactivation_error', `Erreur globale: ${error.message}`);
    return {
      success: false,
      error: error.message,
      message: 'Erreur lors de la désactivation de la séquence'
    };
  }
}

// Exporter les fonctions pour les rendre disponibles
module.exports = {
  getScheduledRelancesForSequence,
  updateRelanceStatus,
  createSequenceLog,
  deactivateSequenceAndCancelRelances
};