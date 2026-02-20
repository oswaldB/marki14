/**
 * Route handler pour les appels liés à la vérification des fichiers de facture
 * Conforme aux règles de développement du projet
 */

const express = require('express');
const router = express.Router();
const { 
  checkInvoiceFileExists, 
  generateDownloadLink, 
  logEmailError, 
  verifyAndGenerateDownloadLink 
} = require('./invoiceVerification.cjs');

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
    const { invoiceId, fileExtension } = req.query;
    
    if (!invoiceId || !fileExtension) {
      return res.status(400).json({ 
        success: false, 
        error: 'invoiceId et fileExtension sont requis' 
      });
    }
    
    const result = await checkInvoiceFileExists(invoiceId, fileExtension);
    
    res.json({ 
      success: true, 
      result: result 
    });
    
  } catch (error) {
    console.error('Erreur dans /check-invoice-file:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Route pour générer un lien de téléchargement
router.post('/generate-download-link', requireAuth, async (req, res) => {
  try {
    const { filePath } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ 
        success: false, 
        error: 'filePath requis' 
      });
    }
    
    const result = await generateDownloadLink(filePath);
    
    res.json({ 
      success: true, 
      downloadLink: result.downloadLink,
      expiresAt: result.expiresAt 
    });
    
  } catch (error) {
    console.error('Erreur dans /generate-download-link:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Route pour journaliser une erreur d'email
router.post('/log-email-error', requireAuth, async (req, res) => {
  try {
    const { invoiceId, errorType, details } = req.body;
    
    if (!invoiceId || !errorType || !details) {
      return res.status(400).json({ 
        success: false, 
        error: 'invoiceId, errorType et details sont requis' 
      });
    }
    
    const result = await logEmailError(invoiceId, errorType, details);
    
    res.json({ 
      success: result.success,
      error: result.error,
      objectId: result.objectId 
    });
    
  } catch (error) {
    console.error('Erreur dans /log-email-error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Route pour vérifier et générer un lien de téléchargement (processus complet)
router.post('/verify-and-generate-link', requireAuth, async (req, res) => {
  try {
    const { invoiceId, fileExtension } = req.body;
    
    if (!invoiceId || !fileExtension) {
      return res.status(400).json({ 
        success: false, 
        error: 'invoiceId et fileExtension sont requis' 
      });
    }
    
    const result = await verifyAndGenerateDownloadLink(invoiceId, fileExtension);
    
    if (result.success) {
      res.json({ 
        success: true,
        downloadLink: result.downloadLink,
        expiresAt: result.expiresAt,
        filePath: result.filePath 
      });
    } else {
      res.status(404).json({ 
        success: false,
        error: result.error,
        errorType: result.errorType 
      });
    }
    
  } catch (error) {
    console.error('Erreur dans /verify-and-generate-link:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Route générique pour les appels depuis le frontend (via /script/)
router.get('/', requireAuth, async (req, res) => {
  try {
    const { action } = req.query;
    
    switch (action) {
      case 'checkInvoiceFile':
        const { invoiceId, fileExtension } = req.query;
        const checkResult = await checkInvoiceFileExists(invoiceId, fileExtension);
        res.json({ success: true, result: checkResult });
        break;
        
      case 'generateDownloadLink':
        const { filePath } = req.query;
        const generateResult = await generateDownloadLink(filePath);
        res.json({ success: true, ...generateResult });
        break;
        
      case 'verifyAndGenerateLink':
        const { invoiceId: invId, fileExtension: ext } = req.query;
        const verifyResult = await verifyAndGenerateDownloadLink(invId, ext);
        res.json({ success: verifyResult.success, ...verifyResult });
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