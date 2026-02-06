const Client = require('ssh2-sftp-client');
require('dotenv').config();

// Configuration Parse Server
Parse.initialize(
  process.env.PUBLIC_APPLICATION_ID || 'marki',
  process.env.PUBLIC_JAVASCRIPT_KEY || 'Careless7-Gore4-Guileless0-Jogger5-Clubbed9'
);
Parse.serverURL = process.env.PUBLIC_SERVER_URL || 'https://dev.parse.markidiags.com';

Parse.Cloud.define('testSftpConnection', async (request) => {
  const { 
    host = process.env.FTP_HOST, 
    port = process.env.FTP_PORT, 
    username = process.env.FTP_USERNAME, 
    password = process.env.FTP_PASSWORD,
    testPath = '/'
  } = request.params;

  const logs = [];
  
  try {
    logs.push(`🔌 Tentative de connexion SFTP à ${host}:${port}`);
    logs.push(`   Utilisateur: ${username}`);
    logs.push(`   Chemin de test: ${testPath}`);
    
    const sftp = new Client();
    
    // Mesurer le temps de connexion
    const startTime = Date.now();
    
    await sftp.connect({
      host: host,
      port: parseInt(port) || 2222,
      username: username,
      password: password,
      algorithms: {
        kex: [
          'diffie-hellman-group14-sha1',
          'diffie-hellman-group1-sha1',
          'diffie-hellman-group-exchange-sha1'
        ],
        cipher: [
          'aes256-cbc',
          'aes192-cbc',
          'aes128-cbc',
          '3des-cbc',
          'blowfish-cbc'
        ],
        hmac: [
          'hmac-sha1',
          'hmac-md5'
        ],
        serverHostKey: [
          'ssh-rsa'
        ]
      },
      strictHostKeyChecking: false,
      readyTimeout: 20000,
      keepaliveInterval: 10000,
      keepaliveCountMax: 3
    });
    
    const connectionTime = Date.now() - startTime;
    logs.push(`✅ Connexion SFTP établie avec succès (${connectionTime}ms)`);
    
    // Tester la liste des fichiers dans le répertoire racine
    try {
      const listStart = Date.now();
      const fileList = await sftp.list(testPath);
      const listTime = Date.now() - listStart;
      
      logs.push(`📁 Répertoire listé avec succès (${listTime}ms)`);
      logs.push(`   Nombre de fichiers/dossiers: ${fileList.length}`);
      
      // Afficher quelques exemples
      const examples = fileList.slice(0, 5).map(f => `   - ${f.type === 'd' ? '📁' : '📄'} ${f.name}`);
      logs.push(...examples);
      
      if (fileList.length > 5) {
        logs.push(`   ... et ${fileList.length - 5} autres`);
      }
      
    } catch (listError) {
      logs.push(`⚠️ Impossible de lister le répertoire: ${listError.message}`);
    }
    
    await sftp.end();
    logs.push('🔌 Connexion SFTP fermée');
    
    return {
      success: true,
      message: 'SFTP connection test successful',
      logs: logs,
      connectionTime: connectionTime
    };
    
  } catch (error) {
    logs.push(`❌ Erreur de connexion SFTP: ${error.message}`);
    logs.push(`   Détails: ${error.stack}`);
    
    // Erreurs courantes et leurs solutions
    const commonFixes = [];
    if (error.message.includes('Invalid username')) {
      commonFixes.push('❗ Vérifiez le nom d\'utilisateur SFTP');
      commonFixes.push('❗ Essayez un format comme: domaine\\utilisateur ou utilisateur@domaine');
    }
    if (error.message.includes('password') || error.message.includes('auth')) {
      commonFixes.push('❗ Vérifiez le mot de passe SFTP');
      commonFixes.push('❗ Le serveur pourrait nécessiter une authentification par clé SSH');
    }
    if (error.message.includes('ECONNREFUSED')) {
      commonFixes.push('❗ Vérifiez que le serveur SFTP est accessible');
      commonFixes.push('❗ Vérifiez le numéro de port (2222 par défaut)');
      commonFixes.push('❗ Vérifiez les règles de pare-feu');
    }
    if (error.message.includes('timeout')) {
      commonFixes.push('❗ Le serveur SFTP ne répond pas');
      commonFixes.push('❗ Vérifiez l\'adresse IP/nom d\'hôte');
      commonFixes.push('❗ Essayez d\'augmenter le timeout');
    }
    if (error.message.includes('key exchange algorithm') || error.message.includes('handshake')) {
      commonFixes.push('❗ Problème de compatibilité des algorithmes de chiffrement');
      commonFixes.push('❗ Le serveur utilise des algorithmes non supportés par défaut');
      commonFixes.push('❗ Essayez de mettre à jour la configuration SSH du serveur');
      commonFixes.push('❗ Ou contactez l\'administrateur pour ajuster les algorithmes supportés');
    }
    
    if (commonFixes.length > 0) {
      logs.push('💡 Suggestions de correction:');
      logs.push(...commonFixes);
    }
    
    return {
      success: false,
      message: `SFTP connection failed: ${error.message}`,
      logs: logs,
      error: error.message,
      stack: error.stack
    };
  }
});