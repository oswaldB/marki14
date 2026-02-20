/**
 * Route handler pour les appels liés à l'envoi d'emails avec factures
 * Conforme aux règles de développement du projet
 */

const express = require('express');
const router = express.Router();
const { 
  checkInvoiceFileExists, 
  generateDownloadLink, 
  sendInvoiceEmail,
  sendInvoiceNotAvailableEmail,
  logEmailError 
} = require('./invoiceEmail');

// Middleware pour vérifier l'authentification
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Non autorisé' });
  }
  next();
};

// Route pour vérifier l'existence d'un fichier de facture
router.get('/check-invoice-file', requireAuth, async (req, res) => {
  try {
    const { invoiceId, fileExtension = 'pdf' } = req.query;

    if (!invoiceId) {
      return res.status(400).json({ success: false, error: 'invoiceId requis' });
    }

    const result = await checkInvoiceFileExists(invoiceId, fileExtension);
    
    res.json({ 
      success: true, 
      result: result
    });

  } catch (error) {
    console.error('Erreur dans /check-invoice-file:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route pour générer un lien de téléchargement
router.get('/generate-download-link', requireAuth, async (req, res) => {
  try {
    const { filePath, expiresInHours = 24 } = req.query;

    if (!filePath) {
      return res.status(400).json({ success: false, error: 'filePath requis' });
    }

    const result = await generateDownloadLink(filePath, parseInt(expiresInHours));
    
    res.json({ 
      success: true,
      downloadLink: result.downloadLink,
      expiresAt: result.expiresAt
    });

  } catch (error) {
    console.error('Erreur dans /generate-download-link:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route pour envoyer un email avec facture
router.get('/send-invoice-email', requireAuth, async (req, res) => {
  try {
    const { invoiceId, recipientEmail, recipientName, emailSubject } = req.query;

    if (!invoiceId || !recipientEmail || !recipientName) {
      return res.status(400).json({ success: false, error: 'Paramètres manquants' });
    }

    const result = await sendInvoiceEmail(invoiceId, recipientEmail, recipientName, emailSubject);
    
    if (result.success) {
      res.json({ 
        success: true,
        emailId: result.emailId,
        downloadLink: result.downloadLink,
        expiresAt: result.expiresAt
      });
    } else {
      res.status(404).json({ 
        success: false,
        error: result.error,
        errorType: result.errorType
      });
    }

  } catch (error) {
    console.error('Erreur dans /send-invoice-email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route pour envoyer un email de notification (facture non disponible)
router.get('/send-notification-email', requireAuth, async (req, res) => {
  try {
    const { invoiceId, recipientEmail, recipientName } = req.query;

    if (!invoiceId || !recipientEmail || !recipientName) {
      return res.status(400).json({ success: false, error: 'Paramètres manquants' });
    }

    const result = await sendInvoiceNotAvailableEmail(invoiceId, recipientEmail, recipientName);
    
    res.json({ 
      success: true,
      emailId: result.emailId
    });

  } catch (error) {
    console.error('Erreur dans /send-notification-email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route pour journaliser une erreur d'email
router.post('/log-email-error', requireAuth, async (req, res) => {
  try {
    const { invoiceId, recipientEmail, errorType, errorMessage, additionalData } = req.body;

    if (!invoiceId || !recipientEmail || !errorType || !errorMessage) {
      return res.status(400).json({ success: false, error: 'Paramètres manquants' });
    }

    const result = await logEmailError(invoiceId, recipientEmail, errorType, errorMessage, additionalData);
    
    res.json({ 
      success: true,
      errorId: result.errorId
    });

  } catch (error) {
    console.error('Erreur dans /log-email-error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route générique pour les appels depuis le frontend (via /script/)
router.get('/', requireAuth, async (req, res) => {
  try {
    const { action } = req.query;

    switch (action) {
      case 'checkInvoiceFile':
        const { invoiceId, fileExtension = 'pdf' } = req.query;
        const checkResult = await checkInvoiceFileExists(invoiceId, fileExtension);
        res.json({ success: true, result: checkResult });
        break;

      case 'generateDownloadLink':
        const { filePath, expiresInHours = 24 } = req.query;
        const generateResult = await generateDownloadLink(filePath, parseInt(expiresInHours));
        res.json({ success: true, downloadLink: generateResult.downloadLink, expiresAt: generateResult.expiresAt });
        break;

      case 'sendInvoiceEmail':
        const { invoiceId: invId, recipientEmail: recEmail, recipientName: recName, emailSubject: subj } = req.query;
        const sendResult = await sendInvoiceEmail(invId, recEmail, recName, subj);
        
        if (sendResult.success) {
          res.json({ success: true, emailId: sendResult.emailId, downloadLink: sendResult.downloadLink, expiresAt: sendResult.expiresAt });
        } else {
          res.status(404).json({ success: false, error: sendResult.error, errorType: sendResult.errorType });
        }
        break;

      default:
        res.status(400).json({ success: false, error: 'Action non valide' });
    }

  } catch (error) {
    console.error('Erreur dans la route générique:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;