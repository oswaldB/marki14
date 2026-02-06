// Script de test pour la fonction getInvoicePdf
const Parse = require('parse/node');
require('dotenv').config();

// Configuration Parse Server
Parse.initialize(
  process.env.PUBLIC_APPLICATION_ID || 'marki',
  process.env.PUBLIC_JAVASCRIPT_KEY || 'Careless7-Gore4-Guileless0-Jogger5-Clubbed9'
);
Parse.serverURL = process.env.PUBLIC_SERVER_URL || 'https://dev.parse.markidiags.com';

async function testGetInvoicePdf() {
  try {
    console.log('📄 Test de la fonction getInvoicePdf...');
    
    // Utiliser un ID de facture valide (remplacer par un ID réel)
    const invoiceId = 'T4hYU0tRyf'; // ID de la facture du log d'erreur
    
    console.log(`📋 Appel de getInvoicePdf avec invoiceId: ${invoiceId}`);
    
    const response = await Parse.Cloud.run('getInvoicePdf', { invoiceId });
    
    console.log('✅ Réponse reçue:', JSON.stringify(response, null, 2));
    
    if (response.success) {
      console.log(`🎉 Succès ! PDF téléchargé: ${response.filename}`);
      console.log(`   Taille: ${response.pdfData ? response.pdfData.length : 0} caractères (base64)`);
    } else {
      console.log(`❌ Échec: ${response.message}`);
      if (response.pdfPath) {
        console.log(`   Chemin PDF: ${response.pdfPath}`);
      }
      if (response.triedPaths) {
        console.log(`   Chemins essayés: ${JSON.stringify(response.triedPaths, null, 2)}`);
      }
    }
    
    return response.success;
    
  } catch (error) {
    console.error('❌ Erreur lors du test getInvoicePdf:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}

// Exécuter le test
testGetInvoicePdf().then(success => {
  console.log(`\nTest terminé: ${success ? 'SUCCESS' : 'FAILED'}`);
  process.exit(success ? 0 : 1);
});