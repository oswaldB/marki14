import { FastifyInstance } from 'fastify';

/**
 * Plugin Fastify pour l'authentification
 * @param {FastifyInstance} app
 */
export default async function authRoutes(app) {
  
  // Route POST pour le login
  app.post('/api/login', async (request, reply) => {
    try {
      const { username, password } = request.body;
      
      console.log('Tentative de login pour:', username);
      
      // Logique d'authentification via Parse REST
      // Cette implémentation utilise directement Parse REST API
      
      const parseConfig = {
        appId: 'marki',
        restApiKey: 'Careless7-Gore4-Guileless0-Jogger5-Clubbed9',
        serverUrl: 'https://dev.parse.markidiags.com/'
      };
      
      // Appel à Parse REST pour l'authentification
      const parseResponse = await fetch(`${parseConfig.serverUrl}login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`, {
        method: 'GET',
        headers: {
          'X-Parse-Application-Id': parseConfig.appId,
          'X-Parse-REST-API-Key': parseConfig.restApiKey
        }
      });
      
      if (!parseResponse.ok) {
        const errorData = await parseResponse.json();
        app.log.error('Erreur Parse REST:', errorData);
        return reply.status(401).send({ error: 'Identifiants invalides' });
      }
      
      const parseData = await parseResponse.json();
      
      return reply.send({
        success: true,
        sessionToken: parseData.sessionToken,
        user: {
          username: parseData.username,
          objectId: parseData.objectId
        }
      });
      
    } catch (error) {
      app.log.error('Erreur de login:', error);
      return reply.status(500).send({ error: 'Erreur interne du serveur' });
    }
  });
  
  // Route GET pour vérifier la session
  app.get('/api/session', async (request, reply) => {
    try {
      const sessionToken = request.headers['x-session-token'];
      
      if (!sessionToken) {
        return reply.status(401).send({ error: 'Token de session manquant' });
      }
      
      // Vérification du token via Parse REST
      const parseConfig = {
        appId: 'marki',
        restApiKey: 'Careless7-Gore4-Guileless0-Jogger5-Clubbed9',
        serverUrl: 'https://dev.parse.markidiags.com/'
      };
      
      const parseResponse = await fetch(`${parseConfig.serverUrl}users/me`, {
        method: 'GET',
        headers: {
          'X-Parse-Application-Id': parseConfig.appId,
          'X-Parse-REST-API-Key': parseConfig.restApiKey,
          'X-Parse-Session-Token': sessionToken
        }
      });
      
      if (!parseResponse.ok) {
        return reply.status(401).send({ error: 'Session invalide' });
      }
      
      const userData = await parseResponse.json();
      
      return reply.send({
        valid: true,
        user: userData
      });
      
    } catch (error) {
      app.log.error('Erreur de vérification de session:', error);
      return reply.status(500).send({ error: 'Erreur interne du serveur' });
    }
  });
}