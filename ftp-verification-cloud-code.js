// Parse Cloud Code for FTP Invoice File Verification
// Implements US002 - Vérification de l'existence des fichiers de facture avant envoi email

// Import required modules
const Parse = require('parse/node');
const Client = require('ssh2-sftp-client');

// Initialize Parse
Parse.initialize("marki", "javascript-key-here", "Shaky4-Exception6");
Parse.serverURL = 'https://dev.parse.markidiags.com/parse';

/**
 * getFtpConfig - Retrieves FTP configuration from environment variables
 * @returns {Object} FTP configuration object
 */
function getFtpConfig() {
  return {
    host: process.env.FTP_HOST,
    port: parseInt(process.env.FTP_PORT) || 2222,
    username: process.env.FTP_USERNAME,
    password: process.env.FTP_PASSWORD
  };
}

/**
 * checkInvoiceFileExists - Checks if an invoice file exists on the FTP server
 * @param {string} invoiceId - Invoice ID (e.g., "INV-2023-001")
 * @param {string} fileExtension - File extension (e.g., "pdf")
 * @returns {Promise<Object>} - { exists: boolean, filePath?: string, error?: string }
 */
async function checkInvoiceFileExists(invoiceId, fileExtension = 'pdf') {
  // Validate parameters
  if (!invoiceId) {
    throw new Error('invoiceId is required');
  }

  const ftpConfig = getFtpConfig();
  
  // Validate FTP configuration
  if (!ftpConfig.host || !ftpConfig.username || !ftpConfig.password) {
    return {
      exists: false,
      error: 'FTP configuration is incomplete or invalid'
    };
  }

  const sftp = new Client();
  const fileName = `${invoiceId}.${fileExtension}`;
  const filePath = `/invoices/${fileName}`;

  try {
    console.log(`🔌 Connecting to FTP server: ${ftpConfig.host}`);
    
    await sftp.connect({
      host: ftpConfig.host,
      port: ftpConfig.port,
      username: ftpConfig.username,
      password: ftpConfig.password,
      strictHostKeyChecking: false,
      readyTimeout: 20000,
      keepaliveInterval: 10000,
      keepaliveCountMax: 3
    });

    console.log('✅ FTP connection established');
    
    // Check if file exists
    try {
      const fileInfo = await sftp.stat(filePath);
      console.log(`📋 File found: ${fileInfo.size} bytes`);
      
      return {
        exists: true,
        filePath: filePath
      };
    } catch (statError) {
      console.log(`❌ File not found: ${filePath}`);
      return {
        exists: false,
        filePath: filePath,
        error: `File not found: ${statError.message}`
      };
    }
    
  } catch (error) {
    console.error('❌ FTP connection error:', error.message);
    return {
      exists: false,
      error: `FTP connection failed: ${error.message}`
    };
  } finally {
    try {
      await sftp.end();
      console.log('🔌 FTP connection closed');
    } catch (endError) {
      console.error('❌ Error closing FTP connection:', endError.message);
    }
  }
}

/**
 * generateDownloadLink - Generates a signed download link for an invoice file
 * @param {string} filePath - Complete file path on FTP server
 * @returns {Promise<Object>} - { downloadLink: string, expiresAt: Date }
 */
async function generateDownloadLink(filePath) {
  if (!filePath) {
    throw new Error('filePath is required');
  }

  // Generate a unique token (in production, use a proper crypto library)
  const token = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);

  // Calculate expiration date (24 hours from now)
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  // Store the token in Parse Server (DownloadTokens class)
  const DownloadTokens = Parse.Object.extend('DownloadTokens');
  const downloadToken = new DownloadTokens();

  downloadToken.set('token', token);
  downloadToken.set('filePath', filePath);
  downloadToken.set('expiresAt', expiresAt);
  downloadToken.set('isUsed', false);

  try {
    await downloadToken.save(null, { useMasterKey: true });
    
    // Generate the download link
    const downloadLink = `/api/download?token=${token}&file=${encodeURIComponent(filePath)}`;
    
    return {
      downloadLink: downloadLink,
      expiresAt: expiresAt
    };
  } catch (error) {
    console.error('❌ Error saving download token:', error);
    throw new Error(`Failed to generate download link: ${error.message}`);
  }
}

/**
 * logEmailError - Logs an email error in Parse Server
 * @param {string} invoiceId - Invoice ID
 * @param {string} errorType - Error type (e.g., "FILE_NOT_FOUND", "FTP_CONNECTION_FAILED")
 * @param {string} details - Error details
 * @returns {Promise<Object>} - { success: boolean, error?: string }
 */
async function logEmailError(invoiceId, errorType, details) {
  if (!invoiceId || !errorType || !details) {
    throw new Error('invoiceId, errorType, and details are required');
  }

  const EmailErrors = Parse.Object.extend('EmailErrors');
  const emailError = new EmailErrors();

  emailError.set('invoiceId', invoiceId);
  emailError.set('errorType', errorType);
  emailError.set('details', details);
  emailError.set('timestamp', new Date());
  emailError.set('status', 'BLOCKED'); // Default status

  try {
    await emailError.save(null, { useMasterKey: true });
    console.log(`📝 Email error logged for invoice ${invoiceId}: ${errorType}`);
    
    return {
      success: true
    };
  } catch (error) {
    console.error('❌ Error logging email error:', error);
    return {
      success: false,
      error: `Failed to log email error: ${error.message}`
    };
  }
}

// Export functions for Parse Cloud Code
module.exports = {
  checkInvoiceFileExists,
  generateDownloadLink,
  logEmailError,
  getFtpConfig
};

// Register functions with Parse Cloud
Parse.Cloud.define('checkInvoiceFileExists', async (request) => {
  const { invoiceId, fileExtension } = request.params;
  return await checkInvoiceFileExists(invoiceId, fileExtension);
});

Parse.Cloud.define('generateDownloadLink', async (request) => {
  const { filePath } = request.params;
  return await generateDownloadLink(filePath);
});

Parse.Cloud.define('logEmailError', async (request) => {
  const { invoiceId, errorType, details } = request.params;
  return await logEmailError(invoiceId, errorType, details);
});

console.log('🚀 FTP Verification Cloud Code initialized');