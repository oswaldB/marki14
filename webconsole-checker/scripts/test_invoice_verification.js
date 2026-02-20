/**
 * Tests pour la vérification des fichiers de facture
 * Conforme aux règles de développement du projet
 */

// Mock de Parse pour les tests
const Parse = {
  Object: function(className) {
    return function() {
      this.id = 'mock-' + Math.random().toString(36).substring(2, 9);
      this.attributes = {};
      
      this.set = function(key, value) {
        this.attributes[key] = value;
      };
      
      this.get = function(key) {
        return this.attributes[key];
      };
      
      this.save = function() {
        return Promise.resolve(this);
      };
    };
  }
};

// Mock de basic-ftp
const ftp = {
  Client: class {
    async access(config) {
      this.config = config;
      return this;
    }
    
    async list(path) {
      // Simuler la vérification de fichier
      if (path.includes('INV-2023-001.pdf')) {
        return [{ name: 'INV-2023-001.pdf' }];
      } else if (path.includes('INV-2023-999.pdf')) {
        return [];
      }
      return [];
    }
    
    async close() {
      return;
    }
  }
};

// Charger le module à tester (après avoir défini les mocks)
global.Parse = Parse;
global.ftp = ftp;
const invoiceVerification = require('./invoiceVerification.cjs');

// Tests
async function runTests() {
  console.log('=== Tests de vérification des fichiers de facture ===\n');
  
  // Test 1: Vérification d'un fichier existant
  console.log('Test 1: Vérification d\'un fichier existant');
  try {
    const result = await invoiceVerification.checkInvoiceFileExists('INV-2023-001', 'pdf');
    console.log('Résultat:', result);
    console.log('✓ Test 1 passé:', result.exists === true);
  } catch (err) {
    console.error('✗ Test 1 échoué:', err.message);
  }
  
  // Test 2: Vérification d'un fichier inexistant
  console.log('\nTest 2: Vérification d\'un fichier inexistant');
  try {
    const result = await invoiceVerification.checkInvoiceFileExists('INV-2023-999', 'pdf');
    console.log('Résultat:', result);
    console.log('✓ Test 2 passé:', result.exists === false);
  } catch (err) {
    console.error('✗ Test 2 échoué:', err.message);
  }
  
  // Test 3: Processus complet avec fichier existant
  console.log('\nTest 3: Processus complet avec fichier existant');
  try {
    const result = await invoiceVerification.verifyAndGenerateDownloadLink('INV-2023-001', 'pdf');
    console.log('Résultat:', result);
    console.log('✓ Test 3 passé:', result.success === true);
  } catch (err) {
    console.error('✗ Test 3 échoué:', err.message);
  }
  
  // Test 4: Processus complet avec fichier inexistant
  console.log('\nTest 4: Processus complet avec fichier inexistant');
  try {
    const result = await invoiceVerification.verifyAndGenerateDownloadLink('INV-2023-999', 'pdf');
    console.log('Résultat:', result);
    console.log('✓ Test 4 passé:', result.success === false && result.errorType === 'FILE_NOT_FOUND');
  } catch (err) {
    console.error('✗ Test 4 échoué:', err.message);
  }
  
  // Test 5: Génération de lien de téléchargement
  console.log('\nTest 5: Génération de lien de téléchargement');
  try {
    const result = await invoiceVerification.generateDownloadLink('/invoices/INV-2023-001.pdf');
    console.log('Résultat:', result);
    console.log('✓ Test 5 passé:', result.downloadLink && result.expiresAt);
  } catch (err) {
    console.error('✗ Test 5 échoué:', err.message);
  }
  
  // Test 6: Journalisation d'une erreur
  console.log('\nTest 6: Journalisation d\'une erreur');
  try {
    const result = await invoiceVerification.logEmailError('INV-2023-001', 'FILE_NOT_FOUND', 'Fichier introuvable');
    console.log('Résultat:', result);
    console.log('✓ Test 6 passé:', result.success === true);
  } catch (err) {
    console.error('✗ Test 6 échoué:', err.message);
  }
  
  console.log('\n=== Tous les tests terminés ===');
}

// Exécuter les tests
runTests().catch(console.error);