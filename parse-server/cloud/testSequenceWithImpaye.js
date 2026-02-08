// testSequenceWithImpaye.js - Fonction cloud pour tester une séquence avec un impayé spécifique
// Cette fonction envoie des emails de test en utilisant les données d'un impayé réel
// et remplace toutes les variables dans les templates

Parse.Cloud.define('testSequenceWithImpaye', async (request) => {
  const { testEmail, impayeId, sequenceId } = request.params;
  
  // Validation des paramètres
  if (!testEmail || !impayeId || !sequenceId) {
    throw new Error('Paramètres manquants: testEmail, impayeId et sequenceId sont requis');
  }
  
  try {
    // 1. Récupérer la séquence avec include sur smtpProfile
    const Sequence = Parse.Object.extend('Sequences');
    const sequenceQuery = new Parse.Query(Sequence);
    sequenceQuery.include('smtpProfile');
    const sequence = await sequenceQuery.get(sequenceId);
    
    if (!sequence) {
      throw new Error('Séquence non trouvée');
    }
    
    // 2. Récupérer l'impayé avec include sur smtpProfile
    const Impaye = Parse.Object.extend('Impayes');
    const impayeQuery = new Parse.Query(Impaye);
    impayeQuery.include('smtpProfile');
    const impaye = await impayeQuery.get(impayeId);
    
    if (!impaye) {
      throw new Error('Impayé non trouvé');
    }
    
    // 3. Récupérer les actions de la séquence
    const actions = sequence.get('actions') || [];
    
    if (actions.length === 0) {
      return {
        success: false,
        message: 'Aucune action dans la séquence'
      };
    }
    
    const results = [];
    
    // 4. Configurer le transporteur SMTP
    // D'abord essayer de trouver un profil SMTP dans les actions
    let smtpProfile = null;
    
    // Chercher dans les actions de la séquence
    for (const action of actions) {
      if (action.smtpProfile && action.smtpProfile.objectId) {
        const SMTPProfile = Parse.Object.extend('SMTPProfile');
        const profileQuery = new Parse.Query(SMTPProfile);
        try {
          smtpProfile = await profileQuery.get(action.smtpProfile.objectId);
          if (smtpProfile) break; // Utiliser le premier profil SMTP trouvé
        } catch (error) {
          console.log(`Profil SMTP ${action.smtpProfile.objectId} non trouvé, essai du suivant...`);
        }
      }
    }
    
    // Si aucun profil SMTP dans les actions, essayer celui de la séquence
    if (!smtpProfile) {
      smtpProfile = sequence.get('smtpProfile');
    }
    
    // Si toujours aucun, essayer celui de l'impayé
    if (!smtpProfile) {
      smtpProfile = impaye.get('smtpProfile');
    }
    
    if (!smtpProfile) {
      throw new Error('Aucun profil SMTP disponible dans les actions, la séquence ou l\'impayé');
    }
    
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: smtpProfile.get('host'),
      port: smtpProfile.get('port'),
      secure: smtpProfile.get('useSSL'),
      auth: {
        user: smtpProfile.get('username'),
        pass: smtpProfile.get('password')
      },
      tls: { rejectUnauthorized: false }
    });
    
    // 5. Fonction de remplacement des variables (inspirée de populateRelanceSequence)
    function replacePlaceholders(template, impayeData) {
      if (!template || typeof template !== 'string') {
        return template;
      }
      
      let result = template;
      
      // Remplacer {{fieldName}} et [[fieldName]]
      result = result.replaceAll(/\{\{\s*([^\}\}]+)\s*\}\}/g, (match, fieldName) => {
        return replaceField(fieldName.trim(), impayeData);
      });
      
      result = result.replaceAll(/\[\[\[\s*([^\]\]]+)\s*\]\]/g, (match, fieldName) => {
        return replaceField(fieldName.trim(), impayeData);
      });
      
      return result;
    }
    
    function replaceField(fieldName, impayeData) {
      const value = impayeData.get(fieldName) || '';
      
      // Formatage spécifique comme dans populateRelanceSequence
      if (fieldName === 'datepiece' && value) {
        return formatDate(value);
      } else if ((fieldName === 'totalttcnet' || fieldName === 'resteapayer') && value) {
        return formatCurrency(value);
      }
      
      return value;
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
    
    // 6. Envoyer chaque action de la séquence
    for (const action of actions) {
      try {
        // Remplacer les variables dans le sujet et le message
        let subject = replacePlaceholders(
          action.emailSubject || action.subject || action.objet || action.title || '',
          impaye
        );
        
        let message = replacePlaceholders(
          action.emailBody || action.body || action.message || action.contenu || '',
          impaye
        );
        
        // Remplacer tous les emails CC par celui reçu dans l'appel
        const finalCc = testEmail; // Selon les nouvelles spécifications
        
        // Utiliser l'email du payeur ou celui spécifié dans l'action
        let emailTo = replacePlaceholders(
          action.emailTo || action.to || action.destinataire || action.destinataires || '',
          impaye
        ) || impaye.get('payeur_email') || '';
        
        // Si aucun email spécifié, utiliser l'email de test
        if (!emailTo) {
          emailTo = testEmail;
        }
        
        // Utiliser l'email de l'action si disponible, sinon celui du profil SMTP
        const fromEmail = action.senderEmail || smtpProfile.get('email');
        
        // Envoyer l'email
        const info = await transporter.sendMail({
          from: `"Marki Test" <${fromEmail}>`,
          to: emailTo,
          subject: `[TEST] ${subject}`,
          text: message,
          html: `<p><strong>Ceci est un email de test pour la séquence.</strong></p><p>${message}</p>`
        });
        
        results.push({
          action: action.subject || `Action ${results.length + 1}`,
          success: true,
          messageId: info.messageId,
          delay: action.delay || action.delai || 0,
          to: emailTo,
          cc: finalCc
        });
        
      } catch (error) {
        results.push({
          action: action.subject || `Action ${results.length + 1}`,
          success: false,
          error: error.message,
          delay: action.delay || action.delai || 0
        });
      }
    }
    
    return {
      success: true,
      results: results,
      message: `${results.length} emails de test envoyés`,
      impayeInfo: {
        nfacture: impaye.get('nfacture'),
        payeur: impaye.get('payeur_nom'),
        montant: impaye.get('resteapayer')
      }
    };
    
  } catch (error) {
    console.error('Erreur dans testSequenceWithImpaye:', error);
    throw error;
  }
});