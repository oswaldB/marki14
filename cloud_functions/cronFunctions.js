// cloud_functions/cronFunctions.js
// Fonctions pour le mécanisme cron de gestion des relances planifiées

const { createSequenceLog } = require('./relanceFunctions');

/**
 * Récupère les relances planifiées prêtes à être envoyées
 * @returns {Promise<Array>} - Tableau d'objets Parse représentant les relances
 */
async function fetchRelancesPlanifiees() {
  const Relance = Parse.Object.extend('Relances');
  const query = new Parse.Query(Relance);
  
  // Filtrer par statut "scheduled" (is_sent = false)
  query.equalTo('is_sent', false);
  
  // Filtrer par date planifiée inférieure ou égale à maintenant
  const now = new Date();
  query.lessThanOrEqualTo('send_date', now);
  
  // Trier par date planifiée (plus anciennes en premier)
  query.ascending('send_date');
  
  try {
    const results = await query.find();
    return results;
  } catch (error) {
    console.error('Erreur lors de la récupération des relances planifiées:', error);
    throw error;
  }
}

/**
 * Envoie une relance via Parse Server
 * @param {Object} relance - Objet Parse de la relance
 * @param {Number} attempt - Numéro de tentative (1-3)
 * @returns {Promise<Object>} - Objet avec succès et détails
 */
async function sendRelance(relance, attempt = 1) {
  try {
    // Vérifier que la relance a bien un email
    const emailTo = relance.get('email_to');
    if (!emailTo) {
      throw new Error('Adresse email manquante pour la relance');
    }
    
    // Préparer les données pour l'envoi
    const emailData = {
      to: emailTo,
      subject: relance.get('email_subject'),
      body: relance.get('email_body'),
      from: relance.get('email_sender')
    };
    
    // Envoyer via Parse Cloud (simulation - en réalité, Parse gère l'envoi)
    // En production, cela utiliserait Parse.Cloud.run ou un service SMTP
    console.log(`Envoi de la relance ${relance.id} (tentative ${attempt}) à ${emailTo}`);
    
    // Simuler un envoi réussi
    return { success: true, message: 'Relance envoyée avec succès' };
    
  } catch (error) {
    console.error(`Échec de l'envoi de la relance ${relance.id} (tentative ${attempt}):`, error.message);
    
    // Si c'est la dernière tentative, retourner l'erreur
    if (attempt >= 3) {
      return { success: false, error: error.message, finalAttempt: true };
    }
    
    // Sinon, retourner pour réessayer
    return { success: false, error: error.message, finalAttempt: false };
  }
}

/**
 * Met à jour le statut d'une relance après envoi
 * @param {String} relanceId - ID de la relance Parse
 * @param {String} status - Nouveau statut ("sent" ou "failed")
 * @returns {Promise<Object>} - Objet avec succès et message d'erreur éventuel
 */
async function updateRelanceAfterSend(relanceId, status) {
  const Relance = Parse.Object.extend('Relances');
  const relance = new Relance();
  relance.id = relanceId;
  
  try {
    if (status === 'sent') {
      relance.set('is_sent', true);
      relance.set('status', 'sent');
      relance.set('sent_date', new Date());
    } else if (status === 'failed') {
      relance.set('status', 'failed');
      relance.set('last_attempt_date', new Date());
      // Incrémenter le compteur de tentatives
      const currentAttempts = relance.get('attempts') || 0;
      relance.set('attempts', currentAttempts + 1);
    }
    
    await relance.save(null, { useMasterKey: true });
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la relance:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Planifie à nouveau une relance qui a échoué
 * @param {Object} relance - Objet Parse de la relance échouée
 * @returns {Promise<Object>} - Objet avec succès et nouvelle date
 */
async function replanifyFailedRelance(relance) {
  try {
    const currentAttempts = relance.get('attempts') || 0;
    
    if (currentAttempts >= 3) {
      // Après 3 tentatives, marquer comme définitivement échouée
      await updateRelanceAfterSend(relance.id, 'failed');
      return { success: false, error: 'Trop de tentatives échouées' };
    }
    
    // Calculer la nouvelle date (1 heure plus tard pour la prochaine tentative)
    const now = new Date();
    const retryDate = new Date(now.getTime() + (60 * 60 * 1000));
    
    relance.set('send_date', retryDate);
    relance.set('attempts', currentAttempts + 1);
    
    await relance.save(null, { useMasterKey: true });
    
    return {
      success: true,
      retryDate: retryDate,
      nextAttempt: currentAttempts + 2
    };
  } catch (error) {
    console.error('Erreur lors de la replanification de la relance:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Crée un log pour l'exécution du cron
 * @param {Object} executionResult - Résultat de l'exécution
 * @returns {Promise<Object>} - Objet Parse du log créé
 */
async function logCronResult(executionResult) {
  const CronLog = Parse.Object.extend('CronLog');
  const log = new CronLog();
  
  // Récupérer l'utilisateur courant (s'il y en a un)
  const currentUser = Parse.User.current();
  
  log.set('executionDate', new Date());
  log.set('relancesProcessed', executionResult.processedCount);
  log.set('relancesSent', executionResult.sentCount);
  log.set('relancesFailed', executionResult.failedCount);
  log.set('relancesReplanified', executionResult.replanifiedCount);
  log.set('details', JSON.stringify(executionResult.details));
  
  if (currentUser) {
    log.set('user', currentUser);
  }
  
  try {
    const result = await log.save(null, { useMasterKey: true });
    return result;
  } catch (error) {
    console.error('Erreur lors de la création du log cron:', error);
    throw error;
  }
}

/**
 * Fonction principale pour déclencher le cron de relances
 * @returns {Promise<Object>} - Objet avec le résultat de l'exécution
 */
async function triggerRelanceCron() {
  const startTime = new Date();
  let processedCount = 0;
  let sentCount = 0;
  let failedCount = 0;
  let replanifiedCount = 0;
  const details = [];
  
  try {
    console.log('Début de l\'exécution du cron de relances...');
    
    // 1. Récupérer les relances planifiées
    const scheduledRelances = await fetchRelancesPlanifiees();
    
    if (scheduledRelances.length === 0) {
      console.log('Aucune relance planifiée à traiter.');
      const logResult = await logCronResult({
        processedCount: 0,
        sentCount: 0,
        failedCount: 0,
        replanifiedCount: 0,
        details: ['Aucune relance à traiter']
      });
      
      return {
        success: true,
        message: 'Aucune relance à traiter',
        processedCount: 0,
        sentCount: 0,
        failedCount: 0,
        replanifiedCount: 0,
        logId: logResult.id
      };
    }
    
    console.log(`Trouvé ${scheduledRelances.length} relance(s) à traiter.`);
    
    // 2. Traiter chaque relance
    for (const relance of scheduledRelances) {
      processedCount++;
      const relanceId = relance.id;
      const emailTo = relance.get('email_to');
      
      console.log(`Traitement de la relance ${relanceId} pour ${emailTo}`);
      
      // 3. Essayer d'envoyer la relance (avec 3 tentatives max)
      let sendAttempt = 1;
      let sendSuccess = false;
      let finalError = null;
      
      while (sendAttempt <= 3 && !sendSuccess) {
        const sendResult = await sendRelance(relance, sendAttempt);
        
        if (sendResult.success) {
          sendSuccess = true;
          // Mettre à jour le statut comme envoyé
          await updateRelanceAfterSend(relanceId, 'sent');
          sentCount++;
          details.push({ relanceId, status: 'sent', email: emailTo });
          console.log(`Relance ${relanceId} envoyée avec succès`);
          break;
        } else {
          finalError = sendResult.error;
          
          if (sendResult.finalAttempt) {
            // Dernière tentative échouée
            const updateResult = await updateRelanceAfterSend(relanceId, 'failed');
            
            if (updateResult.success) {
              failedCount++;
              details.push({ relanceId, status: 'failed', email: emailTo, error: finalError });
              console.log(`Relance ${relanceId} marquée comme échouée après 3 tentatives`);
            } else {
              failedCount++;
              details.push({ 
                relanceId, 
                status: 'failed', 
                email: emailTo, 
                error: `Mise à jour échouée: ${updateResult.error}` 
              });
              console.log(`Relance ${relanceId} échouée et mise à jour impossible`);
            }
            break;
          } else {
            // Tentative intermédiaire échouée, continuer la boucle
            sendAttempt++;
            console.log(`Nouvelle tentative (${sendAttempt}/3) pour la relance ${relanceId}`);
          }
        }
      }
    }
    
    // 4. Créer le log d'exécution
    const executionResult = {
      processedCount,
      sentCount,
      failedCount,
      replanifiedCount,
      details,
      startTime,
      endTime: new Date()
    };
    
    const logResult = await logCronResult(executionResult);
    
    const executionDuration = (executionResult.endTime - startTime) / 1000;
    console.log(`Cron terminé: ${sentCount} relances envoyées, ${failedCount} échouées en ${executionDuration.toFixed(2)} secondes`);
    
    return {
      success: true,
      message: `Cron exécuté avec succès: ${sentCount} relances envoyées, ${failedCount} échouées`,
      processedCount,
      sentCount,
      failedCount,
      replanifiedCount,
      executionDuration,
      logId: logResult.id,
      details
    };
    
  } catch (error) {
    console.error('Erreur globale lors de l\'exécution du cron:', error);
    
    // Créer un log d'erreur
    const logResult = await logCronResult({
      processedCount,
      sentCount,
      failedCount,
      replanifiedCount,
      details: [`Erreur globale: ${error.message}`]
    });
    
    return {
      success: false,
      error: error.message,
      message: 'Erreur lors de l\'exécution du cron de relances',
      processedCount,
      sentCount,
      failedCount,
      replanifiedCount,
      logId: logResult.id
    };
  }
}

// Exporter les fonctions pour les rendre disponibles
module.exports = {
  fetchRelancesPlanifiees,
  sendRelance,
  updateRelanceAfterSend,
  replanifyFailedRelance,
  logCronResult,
  triggerRelanceCron
};