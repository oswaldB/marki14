// Fastify routes for FTP configuration management
import { getFtpConfig, saveFtpConfig, verifyFtpConnection } from '../utils/ftpUtils.js';

/**
 * Get current FTP configuration
 */
export async function getFtpConfigRoute(request, reply) {
  try {
    const config = await getFtpConfig();
    
    if (!config) {
      return reply.status(200).send({
        success: true,
        config: null,
        message: 'Aucune configuration FTP active trouvée'
      });
    }
    
    // Don't return password in the response for security
    const { password, ...configWithoutPassword } = config;
    
    return reply.status(200).send({
      success: true,
      config: configWithoutPassword
    });
    
  } catch (error) {
    request.log.error('Error getting FTP config:', error);
    return reply.status(500).send({
      success: false,
      message: 'Erreur lors de la récupération de la configuration FTP',
      error: error.message
    });
  }
}

/**
 * Save FTP configuration
 */
export async function saveFtpConfigRoute(request, reply) {
  try {
    const configData = request.body;
    
    // Validate required fields
    if (!configData.host || !configData.port || !configData.username || !configData.password || !configData.rootPath) {
      return reply.status(400).send({
        success: false,
        message: 'Tous les champs sont obligatoires'
      });
    }
    
    const result = await saveFtpConfig(configData);
    
    if (result.success) {
      return reply.status(200).send({
        success: true,
        message: result.message,
        configId: result.configId
      });
    } else {
      return reply.status(400).send({
        success: false,
        message: result.message,
        error: result.error
      });
    }
    
  } catch (error) {
    request.log.error('Error saving FTP config:', error);
    return reply.status(500).send({
      success: false,
      message: 'Erreur lors de l\'enregistrement de la configuration FTP',
      error: error.message
    });
  }
}

/**
 * Test FTP connection
 */
export async function testFtpConnectionRoute(request, reply) {
  try {
    const configData = request.body;
    
    // Validate required fields for connection test
    if (!configData.host || !configData.port || !configData.username || !configData.password) {
      return reply.status(400).send({
        success: false,
        message: 'Hôte, port, utilisateur et mot de passe sont obligatoires pour le test'
      });
    }
    
    const result = await verifyFtpConnection(configData);
    
    return reply.status(200).send({
      success: result.success,
      error: result.error || undefined
    });
    
  } catch (error) {
    request.log.error('Error testing FTP connection:', error);
    return reply.status(500).send({
      success: false,
      message: 'Erreur lors du test de connexion FTP',
      error: error.message
    });
  }
}