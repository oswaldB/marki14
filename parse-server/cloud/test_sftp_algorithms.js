// Script de test pour vérifier les algorithmes SFTP
const Client = require('ssh2-sftp-client');
require('dotenv').config();

async function testSftpConnection() {
  const sftp = new Client();
  
  const config = {
    host: process.env.FTP_HOST,
    port: parseInt(process.env.FTP_PORT) || 2222,
    username: process.env.FTP_USERNAME,
    password: process.env.FTP_PASSWORD,
    // Ne pas spécifier d'algorithmes pour utiliser les valeurs par défaut de la bibliothèque
    // Cela devrait éviter les problèmes de compatibilité
    strictHostKeyChecking: false,
    readyTimeout: 20000,
    keepaliveInterval: 10000,
    keepaliveCountMax: 3
  };

  try {
    console.log('🔌 Tentative de connexion SFTP avec les nouveaux algorithmes...');
    await sftp.connect(config);
    console.log('✅ Connexion SFTP établie avec succès !');
    
    // Tester la liste des fichiers
    const files = await sftp.list('/');
    console.log(`📁 Fichiers trouvés: ${files.length}`);
    
    await sftp.end();
    console.log('🔌 Connexion fermée');
    
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion SFTP:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}

// Exécuter le test
testSftpConnection().then(success => {
  console.log(`\nTest terminé: ${success ? 'SUCCESS' : 'FAILED'}`);
  process.exit(success ? 0 : 1);
});