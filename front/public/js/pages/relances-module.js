/**
 * Module pour la gestion des relances planifiées
 * Contient les fonctions pour gérer les relances lors de la désactivation des séquences
 */

// Configuration de Parse
const PARSE_APP_ID = 'markidiagsAppId';
const PARSE_JS_KEY = 'markidiagsJavaScriptKey';
const PARSE_SERVER_URL = 'https://dev.markidiags.com/parse';

/**
 * Récupère toutes les relances planifiées pour une séquence donnée
 * @param {string} sequenceId - ID de la séquence
 * @returns {Promise<Array>} Liste des relances planifiées
 */
async function getScheduledRelancesForSequence(sequenceId) {
  console.log(`getScheduledRelancesForSequence appelé pour la séquence ${sequenceId}`);
  
  try {
    // Créer la requête pour récupérer les relances planifiées
    const query = {
      where: {
        sequence: {
          __type: 'Pointer',
          className: 'Sequences',
          objectId: sequenceId
        },
        status: 'scheduled'
      }
    };
    
    const response = await fetch(`${PARSE_SERVER_URL}/classes/Relances?${new URLSearchParams({
      where: JSON.stringify(query.where)
    })}`, {
      headers: {
        'X-Parse-Application-Id': PARSE_APP_ID,
        'X-Parse-Javascript-Key': PARSE_JS_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des relances: ${response.status}`);
    }
    
    const data = await response.json();
    const relances = data.results || [];
    
    console.log(`Relances planifiées pour la séquence ${sequenceId}:`, relances);
    return relances;
    
  } catch (error) {
    console.error(`Erreur dans getScheduledRelancesForSequence pour la séquence ${sequenceId}:`, error);
    throw error;
  }
}

/**
 * Met à jour le statut d'une relance
 * @param {string} relanceId - ID de la relance
 * @param {string} newStatus - Nouveau statut ('cancelled' ou 'scheduled')
 * @returns {Promise<Object>} Résultat de la mise à jour
 */
async function updateRelanceStatus(relanceId, newStatus) {
  console.log(`updateRelanceStatus appelé pour la relance ${relanceId} avec le statut ${newStatus}`);
  
  try {
    const response = await fetch(`${PARSE_SERVER_URL}/classes/Relances/${relanceId}`, {
      method: 'PUT',
      headers: {
        'X-Parse-Application-Id': PARSE_APP_ID,
        'X-Parse-Javascript-Key': PARSE_JS_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: newStatus
      })
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la mise à jour de la relance: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Relance ${relanceId} mise à jour avec succès`, data);
    return { success: true, data };
    
  } catch (error) {
    console.error(`Erreur dans updateRelanceStatus pour la relance ${relanceId}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Crée un log dans la classe SequenceLog
 * @param {string} sequenceId - ID de la séquence
 * @param {string} action - Action effectuée ('deactivation', 'deactivation_error', etc.)
 * @param {string} details - Détails de l'action
 * @returns {Promise<Object>} Résultat de la création du log
 */
async function createSequenceLog(sequenceId, action, details) {
  console.log(`createSequenceLog appelé pour la séquence ${sequenceId} avec l'action ${action}`);
  
  try {
    const response = await fetch(`${PARSE_SERVER_URL}/classes/SequenceLog`, {
      method: 'POST',
      headers: {
        'X-Parse-Application-Id': PARSE_APP_ID,
        'X-Parse-Javascript-Key': PARSE_JS_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sequence: {
          __type: 'Pointer',
          className: 'Sequences',
          objectId: sequenceId
        },
        action: action,
        details: details,
        user: {
          __type: 'Pointer',
          className: '_User',
          objectId: 'CURRENT_USER_ID' // À remplacer par l'ID de l'utilisateur courant
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la création du log: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Log créé avec succès pour la séquence ${sequenceId}`, data);
    return { success: true, data };
    
  } catch (error) {
    console.error(`Erreur dans createSequenceLog pour la séquence ${sequenceId}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Désactive une séquence et annule ses relances planifiées
 * @param {string} sequenceId - ID de la séquence à désactiver
 * @returns {Promise<Object>} Résultat de la désactivation
 */
async function deactivateSequence(sequenceId) {
  console.log(`deactivateSequence appelé pour la séquence ${sequenceId}`);
  
  try {
    // 1. Récupérer les relances planifiées
    const scheduledRelances = await getScheduledRelancesForSequence(sequenceId);
    
    let cancelledCount = 0;
    let errors = [];
    
    // 2. Mettre à jour chaque relance
    for (const relance of scheduledRelances) {
      const result = await updateRelanceStatus(relance.objectId, 'cancelled');
      
      if (result.success) {
        cancelledCount++;
      } else {
        errors.push({
          relanceId: relance.objectId,
          error: result.error
        });
      }
    }
    
    // 3. Créer un log
    if (errors.length === 0) {
      await createSequenceLog(sequenceId, 'deactivation', `${cancelledCount} relances annulées`);
    } else {
      await createSequenceLog(sequenceId, 'deactivation_error', `${cancelledCount}/${scheduledRelances.length} relances annulées`);
    }
    
    // 4. Désactiver la séquence
    const deactivateResponse = await fetch(`${PARSE_SERVER_URL}/classes/Sequences/${sequenceId}`, {
      method: 'PUT',
      headers: {
        'X-Parse-Application-Id': PARSE_APP_ID,
        'X-Parse-Javascript-Key': PARSE_JS_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        isActif: false
      })
    });
    
    if (!deactivateResponse.ok) {
      throw new Error(`Erreur lors de la désactivation de la séquence: ${deactivateResponse.status}`);
    }
    
    console.log(`Séquence ${sequenceId} désactivée avec succès`);
    
    return {
      success: true,
      cancelledCount,
      totalRelances: scheduledRelances.length,
      errors
    };
    
  } catch (error) {
    console.error(`Erreur dans deactivateSequence pour la séquence ${sequenceId}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Exporter les fonctions pour qu'elles soient disponibles globalement
if (typeof window !== 'undefined') {
  window.getScheduledRelancesForSequence = getScheduledRelancesForSequence;
  window.updateRelanceStatus = updateRelanceStatus;
  window.createSequenceLog = createSequenceLog;
  window.deactivateSequence = deactivateSequence;
}