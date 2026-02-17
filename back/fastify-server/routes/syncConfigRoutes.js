/**
 * Routes Fastify pour la gestion des configurations de synchronisation
 * Ces routes servent de proxy vers les services Parse REST
 */

const { 
  createSyncConfig, 
  testSyncConfig, 
  getAllSyncConfigs, 
  updateSyncConfig, 
  deleteSyncConfig 
} = require('./syncConfigService');

/**
 * Enregistre les routes de configuration de synchronisation
 * @param {FastifyInstance} fastify - Instance Fastify
 */
async function syncConfigRoutes(fastify) {
  
  // Route pour créer une nouvelle configuration
  fastify.post('/api/sync-configs', async (request, reply) => {
    try {
      const { configData, credentials } = request.body;
      const sessionToken = request.headers['x-parse-session-token'];
      
      if (!sessionToken) {
        return reply.status(401).send({ error: 'Non autorisé - token manquant' });
      }
      
      const result = await createSyncConfig(configData, credentials, sessionToken);
      return reply.status(201).send(result);
      
    } catch (error) {
      console.error('Erreur lors de la création de la configuration:', error);
      return reply.status(400).send({ error: error.message });
    }
  });
  
  // Route pour tester une configuration
  fastify.get('/api/sync-configs/:configId/test', async (request, reply) => {
    try {
      const { configId } = request.params;
      const sessionToken = request.headers['x-parse-session-token'];
      
      if (!sessionToken) {
        return reply.status(401).send({ error: 'Non autorisé - token manquant' });
      }
      
      const result = await testSyncConfig(configId, sessionToken);
      return reply.status(200).send(result);
      
    } catch (error) {
      console.error(`Erreur lors du test de la configuration ${configId}:`, error);
      return reply.status(400).send({ error: error.message });
    }
  });
  
  // Route pour récupérer toutes les configurations
  fastify.get('/api/sync-configs', async (request, reply) => {
    try {
      const sessionToken = request.headers['x-parse-session-token'];
      
      if (!sessionToken) {
        return reply.status(401).send({ error: 'Non autorisé - token manquant' });
      }
      
      const configs = await getAllSyncConfigs(sessionToken);
      return reply.status(200).send(configs);
      
    } catch (error) {
      console.error('Erreur lors de la récupération des configurations:', error);
      return reply.status(400).send({ error: error.message });
    }
  });
  
  // Route pour mettre à jour une configuration
  fastify.put('/api/sync-configs/:configId', async (request, reply) => {
    try {
      const { configId } = request.params;
      const updates = request.body;
      const sessionToken = request.headers['x-parse-session-token'];
      
      if (!sessionToken) {
        return reply.status(401).send({ error: 'Non autorisé - token manquant' });
      }
      
      const result = await updateSyncConfig(configId, updates, sessionToken);
      return reply.status(200).send(result);
      
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la configuration ${configId}:`, error);
      return reply.status(400).send({ error: error.message });
    }
  });
  
  // Route pour supprimer une configuration
  fastify.delete('/api/sync-configs/:configId', async (request, reply) => {
    try {
      const { configId } = request.params;
      const sessionToken = request.headers['x-parse-session-token'];
      
      if (!sessionToken) {
        return reply.status(401).send({ error: 'Non autorisé - token manquant' });
      }
      
      const success = await deleteSyncConfig(configId, sessionToken);
      return reply.status(200).send({ success });
      
    } catch (error) {
      console.error(`Erreur lors de la suppression de la configuration ${configId}:`, error);
      return reply.status(400).send({ error: error.message });
    }
  });
  
  // Route pour initialiser les collections
  fastify.post('/api/init-sync-collections', async (request, reply) => {
    try {
      const { initializeSyncCollections } = require('./initCollections');
      const result = await initializeSyncCollections();
      return reply.status(200).send(result);
      
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des collections:', error);
      return reply.status(400).send({ error: error.message });
    }
  });
}

module.exports = syncConfigRoutes;