// handleManualSequenceAssignment.js - Fonction pour gérer l'association manuelle d'une séquence à un impayé

Parse.Cloud.define('handleManualSequenceAssignment', async (request) => {
  const { impayeId, sequenceId } = request.params;
  
  if (!impayeId) {
    throw new Error('Le paramètre impayeId est requis');
  }
  
  if (!sequenceId) {
    throw new Error('Le paramètre sequenceId est requis');
  }
  
  console.log(`Association manuelle de la séquence ${sequenceId} à l'impayé ${impayeId}`);
  
  try {
    // 1. Récupérer l'impayé
    const Impaye = Parse.Object.extend('Impayes');
    const impayeQuery = new Parse.Query(Impaye);
    const impaye = await impayeQuery.get(impayeId);
    
    if (!impaye) {
      throw new Error(`Impayé avec l'ID ${impayeId} non trouvé`);
    }
    
    console.log(`Impayé trouvé: Facture ${impaye.get('nfacture')}`);
    
    // 2. Récupérer la séquence
    const Sequence = Parse.Object.extend('sequences');
    const sequenceQuery = new Parse.Query(Sequence);
    const sequence = await sequenceQuery.get(sequenceId);
    
    if (!sequence) {
      throw new Error(`Séquence avec l'ID ${sequenceId} non trouvée`);
    }
    
    console.log(`Séquence trouvée: ${sequence.get('nom')}`);
    
    // 3. Vérifier que la séquence est active
    if (!sequence.get('isActif')) {
      console.log('La séquence n\'est pas active, aucune relance ne sera créée');
      return {
        success: true,
        message: 'Séquence associée mais non active - aucune relance créée',
        impayeId: impayeId,
        sequenceId: sequenceId,
        relancesCreated: 0
      };
    }
    
    // 4. Récupérer les actions de la séquence
    const actions = sequence.get('actions') || [];
    
    if (actions.length === 0) {
      console.log('Aucune action trouvée dans la séquence');
      return {
        success: true,
        message: 'Aucune action dans la séquence',
        impayeId: impayeId,
        sequenceId: sequenceId,
        relancesCreated: 0
      };
    }
    
    console.log(`Nombre d'actions dans la séquence: ${actions.length}`);
    
    // 5. Chercher les relances existantes pour cet impayé et cette séquence
    const RelancesClass = Parse.Object.extend('Relances');
    const relanceQuery = new Parse.Query(RelancesClass);
    relanceQuery.equalTo('impaye', impaye);
    relanceQuery.equalTo('sequence', sequence);
    const existingRelances = await relanceQuery.find();
    
    console.log(`Nombre de relances existantes: ${existingRelances.length}`);
    
    // 6. Supprimer les relances non envoyées (is_sent = false)
    const relancesToDelete = existingRelances.filter(r => !r.get('is_sent'));
    
    if (relancesToDelete.length > 0) {
      console.log(`Suppression de ${relancesToDelete.length} relances non envoyées...`);
      for (const relance of relancesToDelete) {
        await relance.destroy();
      }
      console.log('Relances non envoyées supprimées');
    }
    
    // 7. Si aucune relance n'existe (ou toutes ont été supprimées), créer de nouvelles relances
    const remainingRelances = existingRelances.filter(r => r.get('is_sent'));
    
    if (remainingRelances.length === 0) {
      console.log('Création de nouvelles relances...');
      
      // Prendre la première action de la séquence
      const firstAction = actions[0];
      
      if (!firstAction) {
        console.log('Aucune action valide trouvée');
        return {
          success: true,
          message: 'Aucune action valide dans la séquence',
          impayeId: impayeId,
          sequenceId: sequenceId,
          relancesCreated: 0
        };
      }
      
      // Remplacer les valeurs [[ ]] dans les messages
      const emailSubject = replacePlaceholders(firstAction.emailSubject || '', impaye);
      const emailBody = replacePlaceholders(firstAction.emailBody || '', impaye);
      const emailTo = replacePlaceholders(firstAction.emailTo || '', impaye);
      const emailCc = replacePlaceholders(firstAction.emailCc || '', impaye);
      
      console.log(`Création de relance avec sujet: ${emailSubject}`);
      
      // Créer une nouvelle relance
      const newRelance = new RelancesClass();
      newRelance.set('email_sender', firstAction.senderEmail || sequence.get('senderEmail') || '');
      newRelance.set('email_subject', emailSubject);
      newRelance.set('email_body', emailBody);
      newRelance.set('email_to', emailTo);
      newRelance.set('email_cc', emailCc);
      newRelance.set('send_date', new Date());
      newRelance.set('is_sent', false);
      newRelance.set('impaye', impaye);
      newRelance.set('sequence', sequence);
      
      // Créer aussi un pointer vers la classe Relance
      const Relance = Parse.Object.extend('Relance');
      const relanceObj = new Relance();
      relanceObj.set('type', firstAction.type || 'email');
      relanceObj.set('message', emailBody);
      relanceObj.set('date', new Date());
      relanceObj.set('isSent', false);
      relanceObj.set('impaye', impaye);
      relanceObj.set('sequence', sequence);
      
      const savedRelance = await relanceObj.save();
      newRelance.set('relance', savedRelance);
      
      await newRelance.save();
      
      console.log(`Relance créée avec succès (ID: ${newRelance.id})`);
      
      return {
        success: true,
        message: 'Relance créée avec succès',
        impayeId: impayeId,
        sequenceId: sequenceId,
        relanceId: newRelance.id,
        relancesCreated: 1
      };
    } else {
      console.log(`Relances existantes conservées (${remainingRelances.length} relances déjà envoyées)`);
      
      return {
        success: true,
        message: 'Relances existantes conservées',
        impayeId: impayeId,
        sequenceId: sequenceId,
        relancesCreated: 0,
        existingRelances: remainingRelances.length
      };
    }
    
  } catch (error) {
    console.error('Erreur lors du traitement:', error);
    throw error;
  }
});

// Fonction pour remplacer les placeholders [[champ]] dans les messages
function replacePlaceholders(template, impaye) {
  if (!template || typeof template !== 'string') {
    return template;
  }
  
  // Remplacer les placeholders courants
  let result = template
    .replace(/\{\{\s*impaye\.nfacture\s*\}\}/gi, impaye.get('nfacture') || '')
    .replace(/\{\{\s*impaye\.datepiece\s*\}\}/gi, formatDate(impaye.get('datepiece')))
    .replace(/\{\{\s*impaye\.totalttcnet\s*\}\}/gi, formatCurrency(impaye.get('totalttcnet')))
    .replace(/\{\{\s*impaye\.resteapayer\s*\}\}/gi, formatCurrency(impaye.get('resteapayer')))
    .replace(/\{\{\s*impaye\.payeur_nom\s*\}\}/gi, impaye.get('payeur_nom') || '')
    .replace(/\{\{\s*impaye\.payeur_email\s*\}\}/gi, impaye.get('payeur_email') || '')
    .replace(/\{\{\s*impaye\.payeur_telephone\s*\}\}/gi, impaye.get('payeur_telephone') || '')
    .replace(/\{\{\s*impaye\.proprietaire_nom\s*\}\}/gi, impaye.get('proprietaire_nom') || '')
    .replace(/\{\{\s*impaye\.proprietaire_email\s*\}\}/gi, impaye.get('proprietaire_email') || '')
    .replace(/\{\{\s*impaye\.proprietaire_telephone\s*\}\}/gi, impaye.get('proprietaire_telephone') || '');
  
  // Remplacer aussi le format [[champ]] comme mentionné dans la todo
  result = result
    .replace(/\[\[\s*nfacture\s*\]\]/gi, impaye.get('nfacture') || '')
    .replace(/\[\[\s*datepiece\s*\]\]/gi, formatDate(impaye.get('datepiece')))
    .replace(/\[\[\s*totalttcnet\s*\]\]/gi, formatCurrency(impaye.get('totalttcnet')))
    .replace(/\[\[\s*resteapayer\s*\]\]/gi, formatCurrency(impaye.get('resteapayer')))
    .replace(/\[\[\s*payeur_nom\s*\]\]/gi, impaye.get('payeur_nom') || '')
    .replace(/\[\[\s*payeur_email\s*\]\]/gi, impaye.get('payeur_email') || '')
    .replace(/\[\[\s*payeur_telephone\s*\]\]/gi, impaye.get('payeur_telephone') || '')
    .replace(/\[\[\s*proprietaire_nom\s*\]\]/gi, impaye.get('proprietaire_nom') || '')
    .replace(/\[\[\s*proprietaire_email\s*\]\]/gi, impaye.get('proprietaire_email') || '')
    .replace(/\[\[\s*proprietaire_telephone\s*\]\]/gi, impaye.get('proprietaire_telephone') || '');
  
  return result;
}

function formatDate(date) {
  if (!date) return '';
  
  if (date instanceof Date) {
    return date.toLocaleDateString('fr-FR');
  }
  
  if (typeof date === 'string') {
    const parsedDate = new Date(date);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toLocaleDateString('fr-FR');
    }
  }
  
  return date;
}

function formatCurrency(value) {
  if (value === null || value === undefined) return '';
  
  const numericValue = parseFloat(value);
  if (isNaN(numericValue)) return value;
  
  return numericValue.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}