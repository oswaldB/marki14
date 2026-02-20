/**
 * Script pour gérer l'envoi d'emails avec factures
 * Conforme aux règles de développement du projet
 */

// Fonction pour vérifier l'existence d'un fichier de facture
async function checkInvoiceFileExists(invoiceId, fileExtension = 'pdf') {
  try {
    // Vérification des paramètres
    if (!invoiceId) {
      throw new Error('invoiceId requis pour checkInvoiceFileExists');
    }

    // Dans une implémentation réelle, cela appellerait un service FTP ou Parse Files
    // Pour cette démo, nous simulons la vérification
    
    // Vérifier si la facture existe dans la classe Impayes
    const Impayes = Parse.Object.extend('Impayes');
    const query = new Parse.Query(Impayes);
    query.equalTo('refpiece', invoiceId);
    
    const results = await query.find();
    
    if (results.length > 0) {
      // Facture trouvée dans Parse
      return {
        exists: true,
        filePath: `/invoices/${invoiceId}.${fileExtension}`,
        invoiceData: results[0]
      };
    } else {
      // Facture non trouvée
      return {
        exists: false,
        filePath: null,
        error: 'Facture non trouvée dans le système'
      };
    }

  } catch (error) {
    console.error('Erreur dans checkInvoiceFileExists:', error);
    throw error;
  }
}

// Fonction pour générer un lien de téléchargement
async function generateDownloadLink(filePath, expiresInHours = 24) {
  try {
    if (!filePath) {
      throw new Error('filePath requis pour generateDownloadLink');
    }

    // Dans une implémentation réelle, cela générerait un token JWT ou similaire
    // Pour cette démo, nous générons un token simple
    
    const token = 'token-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);
    
    // Sauvegarder le token dans Parse pour validation ultérieure
    const DownloadToken = Parse.Object.extend('DownloadToken');
    const tokenObj = new DownloadToken();
    
    tokenObj.set('token', token);
    tokenObj.set('filePath', filePath);
    tokenObj.set('expiresAt', expiresAt);
    tokenObj.set('isUsed', false);
    
    await tokenObj.save();
    
    return {
      downloadLink: `/api/download?token=${token}&file=${encodeURIComponent(filePath)}`,
      token: token,
      expiresAt: expiresAt.toISOString()
    };

  } catch (error) {
    console.error('Erreur dans generateDownloadLink:', error);
    throw error;
  }
}

// Fonction pour envoyer un email avec facture
async function sendInvoiceEmail(invoiceId, recipientEmail, recipientName, emailSubject) {
  try {
    // Vérification des paramètres
    if (!invoiceId || !recipientEmail || !recipientName) {
      throw new Error('Paramètres manquants pour sendInvoiceEmail');
    }

    // Étape 1: Vérifier l'existence de la facture
    const fileCheck = await checkInvoiceFileExists(invoiceId);
    
    if (!fileCheck.exists) {
      // Facture non trouvée - envoyer un email de notification
      await sendInvoiceNotAvailableEmail(invoiceId, recipientEmail, recipientName);
      
      return {
        success: false,
        error: fileCheck.error,
        errorType: 'FILE_NOT_FOUND'
      };
    }

    // Étape 2: Générer un lien de téléchargement
    const downloadLinkData = await generateDownloadLink(fileCheck.filePath);
    
    // Étape 3: Préparer le template d'email
    const emailTemplate = prepareInvoiceEmailTemplate(
      downloadLinkData.downloadLink,
      invoiceId,
      downloadLinkData.expiresAt,
      recipientName
    );
    
    // Étape 4: Envoyer l'email via Parse Server
    // Note: Parse.Cloud.sendEmail n'est disponible que dans les Cloud Functions
    // Pour cette démo, nous simulons l'envoi
    
    // Sauvegarder l'email envoyé dans Parse
    const SentEmail = Parse.Object.extend('SentEmail');
    const emailObj = new SentEmail();
    
    emailObj.set('invoiceId', invoiceId);
    emailObj.set('recipientEmail', recipientEmail);
    emailObj.set('recipientName', recipientName);
    emailObj.set('subject', emailSubject);
    emailObj.set('body', emailTemplate);
    emailObj.set('downloadLink', downloadLinkData.downloadLink);
    emailObj.set('expiresAt', downloadLinkData.expiresAt);
    emailObj.set('isSent', true);
    emailObj.set('sentAt', new Date());
    
    await emailObj.save();
    
    return {
      success: true,
      emailId: emailObj.id,
      downloadLink: downloadLinkData.downloadLink,
      expiresAt: downloadLinkData.expiresAt
    };

  } catch (error) {
    console.error('Erreur dans sendInvoiceEmail:', error);
    throw error;
  }
}

// Fonction pour envoyer un email de notification (facture non disponible)
async function sendInvoiceNotAvailableEmail(invoiceId, recipientEmail, recipientName) {
  try {
    // Préparer le template d'email de notification
    const emailTemplate = `
      <div class="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200">
        <div class="flex items-center mb-4">
          <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
            <i class="las la-exclamation-triangle text-white text-sm"></i>
          </div>
          <h1 class="text-xl font-bold text-gray-800">Facture non disponible</h1>
        </div>
        
        <p class="mb-4 text-gray-700">Bonjour <strong>${recipientName}</strong>,</p>
        
        <p class="mb-4 text-gray-700">Nous regrettons de vous informer que votre facture <strong>${invoiceId}</strong> n'est pas encore disponible pour téléchargement.</p>
        
        <p class="mb-4 text-gray-700">Nous vous informerons dès qu'elle sera disponible.</p>
        
        <div class="mt-6 pt-4 border-t border-gray-200">
          <p class="text-sm text-gray-600">Cordialement,</p>
          <p class="text-sm font-medium text-gray-800">L'équipe [Nom de l'entreprise]</p>
        </div>
      </div>
    `;
    
    // Sauvegarder l'email de notification dans Parse
    const SentEmail = Parse.Object.extend('SentEmail');
    const emailObj = new SentEmail();
    
    emailObj.set('invoiceId', invoiceId);
    emailObj.set('recipientEmail', recipientEmail);
    emailObj.set('recipientName', recipientName);
    emailObj.set('subject', `Votre facture ${invoiceId} n'est pas encore disponible`);
    emailObj.set('body', emailTemplate);
    emailObj.set('isSent', true);
    emailObj.set('sentAt', new Date());
    emailObj.set('isNotification', true);
    
    await emailObj.save();
    
    return {
      success: true,
      emailId: emailObj.id
    };

  } catch (error) {
    console.error('Erreur dans sendInvoiceNotAvailableEmail:', error);
    throw error;
  }
}

// Fonction pour préparer le template d'email (version backend)
function prepareInvoiceEmailTemplate(downloadLink, invoiceId, expiresAt, recipientName) {
  const expiresDate = new Date(expiresAt).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
    <div style="max-width: 600px; margin: 0 auto; padding: 24px; font-family: Arial, sans-serif; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff;">
      <div style="display: flex; align-items: center; margin-bottom: 16px;">
        <div style="width: 32px; height: 32px; background-color: #0ea5e9; border-radius: 9999px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
          <span style="color: white; font-size: 16px;">📄</span>
        </div>
        <h1 style="font-size: 20px; font-weight: 700; color: #1f2937;">Votre facture</h1>
      </div>
      
      <p style="margin-bottom: 16px; color: #374151;">Bonjour <strong>${recipientName}</strong>,</p>
      
      <p style="margin-bottom: 16px; color: #374151;">Votre facture <strong>${invoiceId}</strong> est disponible pour téléchargement.</p>
      
      <div style="margin-bottom: 16px;">
        <a href="${downloadLink}" style="display: inline-flex; align-items: center; padding: 8px 16px; border-radius: 6px; background-color: #0ea5e9; color: white; text-decoration: none; font-weight: 500; font-size: 14px;">
          📥 Télécharger ${invoiceId}.pdf
        </a>
      </div>
      
      <p style="color: #6b7280; font-size: 14px; margin-bottom: 24px;">Ce lien sera valide jusqu'au ${expiresDate}.</p>
      
      <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 24px;">
        <p style="color: #6b7280; font-size: 14px;">Cordialement,</p>
        <p style="color: #1f2937; font-size: 14px; font-weight: 500;">L'équipe [Nom de l'entreprise]</p>
      </div>
    </div>
  `;
}

// Fonction pour journaliser les erreurs d'email
async function logEmailError(invoiceId, recipientEmail, errorType, errorMessage, additionalData = {}) {
  try {
    const EmailError = Parse.Object.extend('EmailError');
    const errorObj = new EmailError();
    
    errorObj.set('invoiceId', invoiceId);
    errorObj.set('recipientEmail', recipientEmail);
    errorObj.set('errorType', errorType);
    errorObj.set('errorMessage', errorMessage);
    errorObj.set('additionalData', additionalData);
    errorObj.set('timestamp', new Date());
    
    await errorObj.save();
    
    return {
      success: true,
      errorId: errorObj.id
    };

  } catch (error) {
    console.error('Erreur dans logEmailError:', error);
    throw error;
  }
}

// Export des fonctions pour utilisation dans d'autres scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    checkInvoiceFileExists,
    generateDownloadLink,
    sendInvoiceEmail,
    sendInvoiceNotAvailableEmail,
    prepareInvoiceEmailTemplate,
    logEmailError
  };
}