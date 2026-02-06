// populateRelanceSequence.js - Fonction cloud pour peupler les relances d'une séquence

Parse.Cloud.define('populateRelanceSequence', async (request) => {
  const { idSequence } = request.params;
  
  if (!idSequence) {
    throw new Error('Le paramètre idSequence est requis');
  }
  
  console.log(`Début du traitement pour la séquence ${idSequence}`);
  
  try {
    // 1. Utiliser la classe Relances (supposée exister)
    const RelancesClass = Parse.Object.extend('Relances');
    
    // 2. Récupérer la séquence
    console.log(`Recherche de la séquence avec ID: ${idSequence}`);
    const Sequence = Parse.Object.extend('Sequences');
    const sequenceQuery = new Parse.Query(Sequence);
    
    try {
      const sequence = await sequenceQuery.get(idSequence);
      
      if (!sequence) {
        console.error(`Séquence avec l'ID ${idSequence} non trouvée`);
        throw new Error(`Séquence avec l'ID ${idSequence} non trouvée`);
      }
      
      console.log(`Séquence trouvée: ${sequence.get('nom')} (ID: ${sequence.id})`);
      console.log(`Statut de la séquence: ${sequence.get('isActif')}`);
      console.log(`Type de séquence: ${sequence.get('isAuto') ? 'Automatique' : 'Manuelle'}`);
      
      // Continuer avec le reste du code...
    
    // 3. Récupérer tous les impayés qui ont cette séquence
    const Impaye = Parse.Object.extend('Impayes');
    const impayeQuery = new Parse.Query(Impaye);
    impayeQuery.equalTo('sequence', sequence);
    const impayes = await impayeQuery.find();
    
    console.log(`Nombre d'impayés trouvés pour cette séquence: ${impayes.length}`);
    
    // 4. Récupérer les actions de la séquence
    const actions = sequence.get('actions') || [];
    
    if (actions.length === 0) {
      console.log('Aucune action trouvée dans la séquence');
      return { success: true, message: 'Aucune action dans la séquence', processed: 0 };
    }
    
    console.log(`Nombre d'actions dans la séquence: ${actions.length}`);
    
    // 5. Traiter chaque impayé
    let processedCount = 0;
    let createdCount = 0;
    let updatedCount = 0;
    
    for (const impaye of impayes) {
      console.log(`\nTraitement de l'impayé ${impaye.get('nfacture')} (ID: ${impaye.id})`);
      
      // 6. Chercher les relances existantes pour cet impayé
      const relanceQuery = new Parse.Query(RelancesClass);
      relanceQuery.equalTo('impaye', impaye);
      relanceQuery.equalTo('sequence', sequence);
      const existingRelances = await relanceQuery.find();
      
      console.log(`Nombre de relances existantes: ${existingRelances.length}`);
      
      // 7. Supprimer les relances non envoyées (is_sent = false)
      const relancesToDelete = existingRelances.filter(r => !r.get('is_sent'));
      
      if (relancesToDelete.length > 0) {
        console.log(`Suppression de ${relancesToDelete.length} relances non envoyées...`);
        for (const relance of relancesToDelete) {
          await relance.destroy();
        }
        console.log('Relances non envoyées supprimées');
      }
      
      // 8. Si aucune relance n'existe (ou toutes ont été supprimées), créer de nouvelles relances
      const remainingRelances = existingRelances.filter(r => r.get('is_sent'));
      
      if (remainingRelances.length === 0) {
        console.log('Création de nouvelles relances...');
        
        // Prendre la première action de la séquence
        const firstAction = actions[0];
        
        if (!firstAction) {
          console.log('Aucune action valide trouvée');
          continue;
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
        
        // Si une classe Relance existe, créer aussi un pointer vers elle
        // Note: La classe Relance doit être créée manuellement avant utilisation
        const Relance = Parse.Object.extend('Relance');
        const relanceObj = new Relance();
        relanceObj.set('type', firstAction.type || 'email');
        relanceObj.set('message', emailBody);
        relanceObj.set('date', new Date());
        relanceObj.set('isSent', false);
        
        const savedRelance = await relanceObj.save();
        newRelance.set('relance', savedRelance);
        
        await newRelance.save();
        createdCount++;
        console.log(`Relance créée avec succès (ID: ${newRelance.id})`);
      } else {
        console.log(`Relances existantes conservées (${remainingRelances.length} relances déjà envoyées)`);
        updatedCount++;
      }
      
      processedCount++;
    }
    
    console.log(`\nTraitement terminé:`);
    console.log(`- Impayés traités: ${processedCount}`);
    console.log(`- Nouvelles relances créées: ${createdCount}`);
    console.log(`- Relances existantes conservées: ${updatedCount}`);
    
    return {
      success: true,
      message: 'Relances peuplées avec succès',
      processed: processedCount,
      created: createdCount,
      updated: updatedCount
    };
    
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