/**
 * Script pour la vérification des fichiers de facture avant envoi email
 * Conforme aux règles de développement du projet
 * Implémentation de la US002 - Vérification de l'existence des fichiers de facture
 */

// Configuration FTP (à adapter selon l'environnement)
const FTP_CONFIG = {
  host: process.env.FTP_HOST || 'ftp.example.com',
  port: process.env.FTP_PORT || 21,
  user: process.env.FTP_USER || 'username',
  password: process.env.FTP_PASSWORD || 'password',
  basePath: process.env.FTP_BASE_PATH || '/invoices'
};

// Classe Parse pour les erreurs d'email
let EmailErrors;
if (typeof Parse !== 'undefined') {
  EmailErrors = Parse.Object('EmailErrors');
} else {
  // Mock pour les tests
  EmailErrors = class {
    constructor() {
      this.id = 'mock-' + Math.random().toString(36).substring(2, 9);
      this.attributes = {};
    }
    
    set(key, value) {
      this.attributes[key] = value;
    }
    
    get(key) {
      return this.attributes[key];
    }
    
    save() {
      return Promise.resolve(this);
    }
  };
}

/**
 * Vérifie l'existence d'un fichier de facture sur le serveur FTP
 * @param {string} invoiceId - Identifiant de la facture (ex: "INV-2023-001")
 * @param {string} fileExtension - Extension du fichier (ex: "pdf")
 * @returns {Promise<Object>} - Résultat de la vérification
 */
async function checkInvoiceFileExists(invoiceId, fileExtension) {
  try {
    // Validation des paramètres
    if (!invoiceId || !fileExtension) {
      throw new Error('invoiceId et fileExtension sont requis');
    }

    // Récupérer la configuration FTP (dans une vraie implémentation, cela viendrait de Parse)
    const ftpConfig = await getFtpConfig();
    
    // Connexion FTP
    const ftpClient = await connectFtp(ftpConfig);
    
    // Construire le chemin du fichier
    const filePath = `${ftpConfig.basePath}/${invoiceId}.${fileExtension}`;
    
    // Vérifier l'existence du fichier
    const fileExists = await checkFileExists(ftpClient, filePath);
    
    // Fermer la connexion
    await ftpClient.close();
    
    if (fileExists) {
      return {
        exists: true,
        filePath: filePath,
        error: null
      };
    } else {
      return {
        exists: false,
        filePath: null,
        error: 'Fichier non trouvé'
      };
    }
    
  } catch (error) {
    console.error('Erreur dans checkInvoiceFileExists:', error);
    return {
      exists: false,
      filePath: null,
      error: error.message
    };
  }
}

/**
 * Récupère la configuration FTP depuis Parse Server
 * @returns {Promise<Object>} - Configuration FTP
 */
async function getFtpConfig() {
  try {
    // Dans une vraie implémentation, cela ferait un appel à Parse
    // pour récupérer la configuration depuis une classe dédiée
    // Exemple: const config = await Parse.Cloud.run('getFtpConfig');
    
    // Pour cette démo, nous utilisons la configuration statique
    return FTP_CONFIG;
    
  } catch (error) {
    console.error('Erreur dans getFtpConfig:', error);
    throw new Error('Impossible de récupérer la configuration FTP');
  }
}

/**
 * Établit une connexion FTP
 * @param {Object} config - Configuration FTP
 * @returns {Promise<Object>} - Client FTP connecté
 */
async function connectFtp(config) {
  try {
    // Dans une vraie implémentation, utiliser une bibliothèque comme basic-ftp
    // const ftp = require('basic-ftp');
    // const client = new ftp.Client();
    // await client.access(config);
    
    // Mock pour la démo
    console.log(`Connexion FTP établie à ${config.host}:${config.port}`);
    
    return {
      close: async () => console.log('Connexion FTP fermée'),
      list: async (path) => {
        // Simuler la vérification de fichier
        if (path.includes('INV-2023-001.pdf')) {
          return [{ name: 'INV-2023-001.pdf' }];
        } else if (path.includes('INV-2023-999.pdf')) {
          return [];
        }
        return [];
      }
    };
    
  } catch (error) {
    console.error('Erreur dans connectFtp:', error);
    throw new Error('Impossible de se connecter au serveur FTP');
  }
}

/**
 * Vérifie si un fichier existe sur le serveur FTP
 * @param {Object} client - Client FTP connecté
 * @param {string} filePath - Chemin du fichier à vérifier
 * @returns {Promise<boolean>} - True si le fichier existe
 */
async function checkFileExists(client, filePath) {
  try {
    // Dans une vraie implémentation:
    // const files = await client.list(filePath);
    // return files.length > 0;
    
    // Mock pour la démo
    const files = await client.list(filePath);
    return files.length > 0;
    
  } catch (error) {
    console.error('Erreur dans checkFileExists:', error);
    throw new Error('Impossible de vérifier l\'existence du fichier');
  }
}

/**
 * Génère un lien de téléchargement pour un fichier de facture
 * @param {string} filePath - Chemin complet du fichier sur le serveur FTP
 * @returns {Promise<Object>} - Lien de téléchargement généré
 */
async function generateDownloadLink(filePath) {
  try {
    // Validation du chemin
    if (!filePath) {
      throw new Error('filePath requis');
    }

    // Générer un token de signature (dans une vraie implémentation)
    const token = generateSecureToken();
    
    // Créer l'objet DownloadToken dans Parse (avec fallback pour les tests)
    let downloadToken;
    if (typeof Parse !== 'undefined') {
      downloadToken = new Parse.Object('DownloadTokens');
    } else {
      // Mock pour les tests
      downloadToken = new EmailErrors();
    }
    
    downloadToken.set('filePath', filePath);
    downloadToken.set('token', token);
    downloadToken.set('expiresAt', new Date(Date.now() + 24 * 60 * 60 * 1000)); // 24h
    
    await downloadToken.save();
    
    // Construire le lien de téléchargement
    const downloadLink = `/api/download?token=${token}&file=${encodeURIComponent(filePath)}`;
    
    return {
      downloadLink: downloadLink,
      expiresAt: downloadToken.get('expiresAt')
    };
    
  } catch (error) {
    console.error('Erreur dans generateDownloadLink:', error);
    throw new Error('Impossible de générer le lien de téléchargement');
  }
}

/**
 * Génère un token sécurisé (simplifié pour la démo)
 * @returns {string} - Token généré
 */
function generateSecureToken() {
  // Dans une vraie implémentation, utiliser crypto.randomBytes()
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Journalise une erreur d'email dans Parse Server
 * @param {string} invoiceId - Identifiant de la facture
 * @param {string} errorType - Type d'erreur
 * @param {string} details - Détails de l'erreur
 * @returns {Promise<Object>} - Résultat de l'opération
 */
async function logEmailError(invoiceId, errorType, details) {
  try {
    // Validation des paramètres
    if (!invoiceId || !errorType || !details) {
      throw new Error('invoiceId, errorType et details sont requis');
    }

    // Créer l'objet EmailErrors
    const emailError = new EmailErrors();
    emailError.set('invoiceId', invoiceId);
    emailError.set('errorType', errorType);
    emailError.set('details', details);
    emailError.set('timestamp', new Date());
    emailError.set('status', 'BLOCKED');
    
    // Sauvegarder dans Parse
    await emailError.save();
    
    return {
      success: true,
      objectId: emailError.id
    };
    
  } catch (error) {
    console.error('Erreur dans logEmailError:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Fonction principale pour vérifier et générer un lien de téléchargement
 * @param {string} invoiceId - Identifiant de la facture
 * @param {string} fileExtension - Extension du fichier
 * @returns {Promise<Object>} - Résultat complet
 */
async function verifyAndGenerateDownloadLink(invoiceId, fileExtension) {
  try {
    // Étape 1: Vérifier l'existence du fichier
    const verificationResult = await checkInvoiceFileExists(invoiceId, fileExtension);
    
    if (!verificationResult.exists) {
      // Journaliser l'erreur
      await logEmailError(invoiceId, 'FILE_NOT_FOUND', 
        `Fichier ${invoiceId}.${fileExtension} introuvable sur le serveur FTP`);
      
      return {
        success: false,
        error: 'Fichier non trouvé',
        errorType: 'FILE_NOT_FOUND'
      };
    }
    
    // Étape 2: Générer le lien de téléchargement
    const downloadResult = await generateDownloadLink(verificationResult.filePath);
    
    return {
      success: true,
      downloadLink: downloadResult.downloadLink,
      expiresAt: downloadResult.expiresAt,
      filePath: verificationResult.filePath
    };
    
  } catch (error) {
    console.error('Erreur dans verifyAndGenerateDownloadLink:', error);
    
    // Journaliser l'erreur
    await logEmailError(invoiceId, 'PROCESSING_ERROR', error.message);
    
    return {
      success: false,
      error: error.message,
      errorType: 'PROCESSING_ERROR'
    };
  }
}

// Export des fonctions pour utilisation dans d'autres scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    checkInvoiceFileExists,
    generateDownloadLink,
    logEmailError,
    verifyAndGenerateDownloadLink,
    handle_request
  };
}

// Pour les tests
if (typeof window !== 'undefined') {
  window.invoiceVerification = {
    checkInvoiceFileExists,
    generateDownloadLink,
    logEmailError,
    verifyAndGenerateDownloadLink
  };
}

/**
 * Fonction handle_request pour compatibilité avec script_bp.py
 * @param {Object} request - Objet request Express/Flask
 * @returns {Object} - Réponse JSON
 */
async function handle_request(request) {
  try {
    const action = request.query.action || request.body.action;
    
    switch (action) {
      case 'checkInvoiceFile':
        const { invoiceId, fileExtension } = request.query;
        const result = await checkInvoiceFileExists(invoiceId, fileExtension);
        return {
          success: true,
          result: result
        };
        
      case 'generateDownloadLink':
        const { filePath } = request.query;
        const downloadResult = await generateDownloadLink(filePath);
        return {
          success: true,
          ...downloadResult
        };
        
      case 'verifyAndGenerateLink':
        const { invoiceId: invId, fileExtension: ext } = request.query;
        const verifyResult = await verifyAndGenerateDownloadLink(invId, ext);
        return {
          success: verifyResult.success,
          ...verifyResult
        };
        
      default:
        return {
          success: false,
          error: 'Action non valide'
        };
    }
    
  } catch (error) {
    console.error('Erreur dans handle_request:', error);
    return {
      success: false,
      error: error.message
    };
  }
}