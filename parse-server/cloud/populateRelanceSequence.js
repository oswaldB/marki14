// populateRelanceSequence.js - Fonction cloud pour peupler les relances d'une séquence

Parse.Cloud.define('populateRelanceSequence', async (request) => {
  const { idSequence } = request.params;
  
  if (!idSequence) {
    throw new Error('Le paramètre idSequence est requis');
  }
  
  // Valider le format de l'ID de séquence
  if (typeof idSequence !== 'string' || idSequence.length < 10) {
    console.error(`Format d'ID de séquence invalide: ${idSequence} (type: ${typeof idSequence})`);
    throw new Error(`Format d'ID de séquence invalide: ${idSequence}`);
  }
  
  console.log(`Début du traitement pour la séquence ${idSequence}`);
  
  // Déclarer les variables de comptage avant le bloc try
  let processedCount = 0;
  let createdCount = 0;
  let updatedCount = 0;
  let sequence = null;
  let impayes = [];
  let actions = [];
  
  try {
    // 1. Utiliser la classe Relances (supposée exister)
    const RelancesClass = Parse.Object.extend('Relances');
    
    // 2. Récupérer la séquence
    console.log(`Recherche de la séquence avec ID: ${idSequence}`);
    const Sequence = Parse.Object.extend('Sequences');
    const sequenceQuery = new Parse.Query(Sequence);
    
    // Vérifier que la classe Sequences existe
    try {
      const sequenceCount = await sequenceQuery.count();
      console.log(`[Étape 3/8] Vérification de la classe Sequences`);
      console.log(`- La classe Sequences existe et contient ${sequenceCount} séquences`);
      if (sequenceCount === 0) {
        console.log(`- Aucune séquence n'est actuellement enregistrée dans la base de données`);
      } else {
        console.log(`- Préparation à la récupération de la séquence spécifique avec ID: ${idSequence}`);
      }
    } catch (classError) {
      console.error(`[ERREUR] Erreur lors de l'accès à la classe Sequences:`, classError);
      console.error(`- Détails: ${classError.message}`);
      console.error(`- Code: ${classError.code}`);
      throw new Error(`La classe Sequences n'est pas accessible: ${classError.message}`);
    }
    
    try {
      console.log(`Tentative de récupération de la séquence avec ID: ${idSequence}`);
      
      // Essayer d'abord avec l'ID directement
      try {
        sequence = await sequenceQuery.get(idSequence);
        
        if (!sequence) {
          console.error(`Séquence avec l'ID ${idSequence} non trouvée`);
          // Vérifier si la séquence existe dans la base de données
          const allSequences = await sequenceQuery.find();
          console.log(`Nombre total de séquences dans la base: ${allSequences.length}`);
          console.log(`IDs des séquences disponibles: ${allSequences.map(s => s.id).join(', ')}`);
          throw new Error(`Séquence avec l'ID ${idSequence} non trouvée`);
        }
      } catch (getError) {
        console.error(`Erreur lors de la récupération directe: ${getError.message}`);
        
        // Essayer de trouver la séquence par son objectId
        console.log(`Tentative de recherche par objectId...`);
        const sequenceQueryByObjectId = new Parse.Query(Sequence);
        sequenceQueryByObjectId.equalTo('objectId', idSequence);
        const sequencesByObjectId = await sequenceQueryByObjectId.find();
        
        if (sequencesByObjectId.length > 0) {
          console.log(`Séquence trouvée par objectId: ${sequencesByObjectId[0].id}`);
          sequence = sequencesByObjectId[0];
        } else {
          console.error(`Aucune séquence trouvée avec l'ID ou objectId: ${idSequence}`);
          throw getError;
        }
      }
      
      console.log(`Séquence trouvée: ${sequence.get('nom')} (ID: ${sequence.id})`);
      console.log(`Statut de la séquence: ${sequence.get('isActif')}`);
      console.log(`Type de séquence: ${sequence.get('isAuto') ? 'Automatique' : 'Manuelle'}`);
      
      // 3. Récupérer tous les impayés qui ont cette séquence
      console.log(`[Étape 3/8] Récupération des impayés associés à la séquence`);
      console.log(`- Recherche des impayés avec la séquence ID: ${sequence.id}`);
      console.log(`- Nom de la séquence: ${sequence.get('nom')}`);
      
      const Impaye = Parse.Object.extend('Impayes');
      const impayeQuery = new Parse.Query(Impaye);
      
      // Utiliser un objet Pointer explicite pour la séquence
      const sequencePointer = {
        __type: "Pointer",
        className: "Sequence",
        objectId: sequence.id
      };
      
      console.log(`- Construction de la requête avec Pointer:`, JSON.stringify(sequencePointer, null, 2));
      impayeQuery.equalTo('sequence', sequencePointer);
      
      console.log(`- Exécution de la requête pour les impayés...`);
      
      impayes = await impayeQuery.find();
      
      console.log(`[Résultat] Nombre d'impayés trouvés pour cette séquence: ${impayes.length}`);
      
      if (impayes.length === 0) {
        console.log(`- Aucun impayé n'est associé à cette séquence`);
      } else {
        console.log(`- Liste des numéros de facture des impayés trouvés: ${impayes.map(i => i.get('nfacture')).join(', ')}`);
        
        // Statistiques supplémentaires sur les impayés
        const totalAmount = impayes.reduce((sum, impaye) => sum + (parseFloat(impaye.get('resteapayer')) || 0), 0);
        console.log(`- Montant total restant à payer: ${totalAmount.toFixed(2)} EUR`);
        
        const uniquePayeurs = new Set(impayes.map(i => i.get('payeur_nom')));
        console.log(`- Nombre de payeurs uniques: ${uniquePayeurs.size}`);
      }
    
    // 4. Récupérer les actions de la séquence
    actions = sequence.get('actions') || [];
    
    if (actions.length === 0) {
      console.log('Aucune action trouvée dans la séquence');
      return { success: true, message: 'Aucune action dans la séquence', processed: 0 };
    }
    
    console.log(`Nombre d'actions dans la séquence: ${actions.length}`);
    console.log('[DEBUG] Structure de la première action:', JSON.stringify(actions[0], null, 2));
    
    // Vérifier les noms des champs dans les actions
    if (actions[0]) {
      const firstActionKeys = Object.keys(actions[0]);
      console.log('[DEBUG] Champs disponibles dans les actions:', firstActionKeys);
    }
    
    // 5. Traiter chaque impayé
    
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
        console.log(`Création de nouvelles relances pour ${actions.length} actions...`);
        
        // Créer une relance pour chaque action de la séquence
        for (let i = 0; i < actions.length; i++) {
          const action = actions[i];
          
          if (!action) {
            console.log(`Action ${i+1} invalide, passage à l'action suivante`);
            continue;
          }
          
          // Remplacer les valeurs [[ ]] dans les messages
          // Essayer différents noms de champs possibles
          const emailSubject = replacePlaceholders(
            action.emailSubject || action.subject || action.objet || action.title || '', 
            impaye
          );
          const emailBody = replacePlaceholders(
            action.emailBody || action.body || action.message || action.contenu || '', 
            impaye
          );
          // Utiliser l'email du payeur par défaut, ou le champ spécifique de l'action si présent
          const emailTo = replacePlaceholders(
            action.emailTo || action.to || action.destinataire || action.destinataires || '', 
            impaye
          ) || impaye.get('payeur_email') || '';
          const emailCc = replacePlaceholders(
            action.emailCc || action.cc || action.copie || action.copies || '', 
            impaye
          );
          
          // Vérifier si l'action est valide (au moins un sujet et un corps)
          if (!emailSubject && !emailBody) {
            console.log(`[AVERTISSEMENT] Action ${i+1} ignorée: sujet et corps vides`);
            continue;
          }
          
          // Vérifier si le payeur a un email valide
          const payeurEmail = impaye.get('payeur_email');
          if (!emailTo && !payeurEmail) {
            console.log(`[AVERTISSEMENT] Action ${i+1} ignorée: le payeur n'a pas d'email (payeur_email: ${payeurEmail})`);
            continue;
          }
          
          // Si emailTo est vide mais que le payeur a un email, utiliser celui-ci
          const finalEmailTo = emailTo || payeurEmail;
          
          console.log(`Création de relance ${i+1}/${actions.length} avec sujet: "${emailSubject}"`);
          console.log(`[INFO] Destinataire: ${finalEmailTo}, Copie: ${emailCc}`);
          
          // Calculer la date d'envoi en fonction du délai
          const sendDate = calculateSendDate(action.delay || action.delai || 0);
          
          // Créer une nouvelle relance
          const newRelance = new RelancesClass();
          
          // Utiliser smtpProfile au lieu de senderEmail
          if (action.smtpProfile && action.smtpProfile.objectId) {
            const SMTPProfile = Parse.Object.extend('SMTPProfile');
            const smtpProfilePointer = Parse.Object.fromJSON({
              __type: 'Pointer',
              className: 'SMTPProfile',
              objectId: action.smtpProfile.objectId
            });
            newRelance.set('smtpProfile', smtpProfilePointer);
          } else if (sequence.get('smtpProfile')) {
            // Utiliser le profil SMTP de la séquence si disponible
            newRelance.set('smtpProfile', sequence.get('smtpProfile'));
          }
          
          newRelance.set('email_subject', emailSubject);
          newRelance.set('email_body', emailBody);
          newRelance.set('email_to', finalEmailTo);
          newRelance.set('email_cc', emailCc);
          newRelance.set('send_date', sendDate);
          newRelance.set('is_sent', false);
          newRelance.set('impaye', impaye);
          newRelance.set('sequence', sequence);
          newRelance.set('action_index', i); // Ajouter l'index de l'action pour référence
          newRelance.set('action_type', action.type || 'email'); // Type d'action
          
          await newRelance.save();
          createdCount++;
          console.log(`Relance ${i+1}/${actions.length} créée avec succès (ID: ${newRelance.id})`);
        }
      } else {
        // Trouver l'action_index maximum parmi les relances déjà envoyées
        const maxActionIndex = Math.max(...remainingRelances.map(r => r.get('action_index')));
        console.log(`Dernière relance envoyée pour l'action_index: ${maxActionIndex}`);
        
        // Créer des relances pour les actions suivantes
        const actionsToCreate = actions.slice(maxActionIndex + 1);
        
        if (actionsToCreate.length > 0) {
          console.log(`Création de nouvelles relances pour ${actionsToCreate.length} actions suivantes...`);
          
          for (let i = 0; i < actionsToCreate.length; i++) {
            const action = actionsToCreate[i];
            const absoluteIndex = maxActionIndex + 1 + i;
            
            if (!action) {
              console.log(`Action ${absoluteIndex+1} invalide, passage à l'action suivante`);
              continue;
            }
            
            // Remplacer les valeurs [[ ]] dans les messages
            const emailSubject = replacePlaceholders(
              action.emailSubject || action.subject || action.objet || action.title || '', 
              impaye
            );
            const emailBody = replacePlaceholders(
              action.emailBody || action.body || action.message || action.contenu || '', 
              impaye
            );
            const emailTo = replacePlaceholders(
              action.emailTo || action.to || action.destinataire || action.destinataires || '', 
              impaye
            ) || impaye.get('payeur_email') || '';
            const emailCc = replacePlaceholders(
              action.emailCc || action.cc || action.copie || action.copies || '', 
              impaye
            );
            
            // Vérifier si l'action est valide
            if (!emailSubject && !emailBody) {
              console.log(`[AVERTISSEMENT] Action ${absoluteIndex+1} ignorée: sujet et corps vides`);
              continue;
            }
            
            const payeurEmail = impaye.get('payeur_email');
            if (!emailTo && !payeurEmail) {
              console.log(`[AVERTISSEMENT] Action ${absoluteIndex+1} ignorée: le payeur n'a pas d'email (payeur_email: ${payeurEmail})`);
              continue;
            }
            
            const finalEmailTo = emailTo || payeurEmail;
            
            console.log(`Création de relance ${absoluteIndex+1}/${actions.length} avec sujet: "${emailSubject}"`);
            console.log(`[INFO] Destinataire: ${finalEmailTo}, Copie: ${emailCc}`);
            
            // Calculer la date d'envoi en fonction du délai
            const sendDate = calculateSendDate(action.delay || action.delai || 0);
            
            // Créer une nouvelle relance
            const newRelance = new RelancesClass();
            
            // Utiliser smtpProfile au lieu de senderEmail
            if (action.smtpProfile && action.smtpProfile.objectId) {
              const SMTPProfile = Parse.Object.extend('SMTPProfile');
              const smtpProfilePointer = Parse.Object.fromJSON({
                __type: 'Pointer',
                className: 'SMTPProfile',
                objectId: action.smtpProfile.objectId
              });
              newRelance.set('smtpProfile', smtpProfilePointer);
            } else if (sequence.get('smtpProfile')) {
              // Utiliser le profil SMTP de la séquence si disponible
              newRelance.set('smtpProfile', sequence.get('smtpProfile'));
            }
            
            newRelance.set('email_subject', emailSubject);
            newRelance.set('email_body', emailBody);
            newRelance.set('email_to', finalEmailTo);
            newRelance.set('email_cc', emailCc);
            newRelance.set('send_date', sendDate);
            newRelance.set('is_sent', false);
            newRelance.set('impaye', impaye);
            newRelance.set('sequence', sequence);
            newRelance.set('action_index', absoluteIndex); // Utiliser l'index absolu
            newRelance.set('action_type', action.type || 'email');
            
            await newRelance.save();
            createdCount++;
            console.log(`Relance ${absoluteIndex+1}/${actions.length} créée avec succès (ID: ${newRelance.id})`);
          }
        } else {
          console.log(`Toutes les actions ont déjà été traitées (dernière action_index: ${maxActionIndex})`);
        }
        
        updatedCount++;
      }
      
      processedCount++;
    }
    
  } catch (sequenceError) {
    console.error('Erreur lors du traitement de la séquence:', sequenceError);
    throw sequenceError;
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

// Fonction pour remplacer les placeholders [[nomColonne]] dans les messages
function replacePlaceholders(template, impaye) {
  if (!template || typeof template !== 'string') {
    return template;
  }
  
  let result = template;
  
  // Utiliser une expression régulière pour trouver tous les placeholders [[nomColonne]]
  // et les remplacer par la valeur correspondante de l'impayé
  result = result.replaceAll(/\{\{\s*([^\}\}]+)\s*\}\}/g, (match, fieldName) => {
    // Extraire le nom du champ entre les doubles accolades {{fieldName}}
    const value = impaye.get(fieldName.trim()) || '';
    
    // Appliquer le formatage approprié pour certains champs
    if (fieldName.trim() === 'datepiece' && value) {
      return formatDate(value);
    } else if ((fieldName.trim() === 'totalttcnet' || fieldName.trim() === 'resteapayer') && value) {
      return formatCurrency(value);
    }
    
    return value;
  });
  
  // Remplacer aussi les placeholders entre doubles crochets [[nomColonne]]
  result = result.replaceAll(/\[\[\s*([^\]\]]+)\s*\]\]/g, (match, fieldName) => {
    // Extraire le nom du champ entre les doubles crochets [[fieldName]]
    const value = impaye.get(fieldName.trim()) || '';
    
    // Appliquer le formatage approprié pour certains champs
    if (fieldName.trim() === 'datepiece' && value) {
      return formatDate(value);
    } else if ((fieldName.trim() === 'totalttcnet' || fieldName.trim() === 'resteapayer') && value) {
      return formatCurrency(value);
    }
    
    return value;
  });
  
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

// Fonction pour calculer la date d'envoi en fonction du délai
function calculateSendDate(delay) {
  const now = new Date();
  
  // Si le délai est un nombre, l'interpréter comme des jours
  if (typeof delay === 'number') {
    const sendDate = new Date(now);
    sendDate.setDate(now.getDate() + delay);
    return sendDate;
  }
  
  // Si le délai est une chaîne, essayer de le parser
  if (typeof delay === 'string') {
    const delayValue = parseInt(delay, 10);
    if (!isNaN(delayValue)) {
      const sendDate = new Date(now);
      sendDate.setDate(now.getDate() + delayValue);
      return sendDate;
    }
  }
  
  // Par défaut, retourner la date actuelle
  return now;
}