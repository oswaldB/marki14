/**
 * Route d'authentification pour la connexion utilisateur
 * Utilise Parse REST API pour l'authentification
 */

export default async function (fastify) {
  // POST /api/login - Connexion utilisateur
  fastify.post('/api/login', async (request, reply) => {
    try {
      const { username, password, remember } = request.body;
      
      console.log('Tentative de connexion pour:', username);
      
      // Validation des paramètres
      if (!username || !password) {
        return reply.code(400).send({
          success: false,
          error: 'Paramètres manquants',
          message: 'Username et password sont requis'
        });
      }
      
      // Appel à Parse REST API pour l'authentification
      const parseResponse = await fastify.parseApi.post('/login', {
        username: username,
        password: password
      });
      
      console.log('Réponse Parse:', parseResponse.data);
      
      // Préparer la réponse avec les données nécessaires
      const responseData = {
        success: true,
        sessionToken: parseResponse.data.sessionToken,
        userId: parseResponse.data.objectId,
        username: username,
        remember: remember || false,
        message: 'Connexion réussie'
      };
      
      return reply.code(200).send(responseData);
      
    } catch (error) {
      console.error('Erreur de connexion:', error);
      
      fastify.log.error('Erreur de connexion:', error);
      
      if (error.response) {
        // Erreurs spécifiques de Parse
        switch (error.response.status) {
          case 401:
            return reply.code(401).send({
              success: false,
              error: 'Authentification échouée',
              message: 'Identifiant ou mot de passe incorrect'
            });
          case 404:
            return reply.code(404).send({
              success: false,
              error: 'Utilisateur non trouvé',
              message: 'Aucun utilisateur avec cet identifiant'
            });
          default:
            return reply.code(error.response.status).send({
              success: false,
              error: error.response.data.error || 'Erreur Parse',
              message: error.response.data.message || 'Erreur d\'authentification'
            });
        }
      }
      
      // Erreur réseau ou serveur
      return reply.code(500).send({
        success: false,
        error: 'Erreur serveur',
        message: 'Impossible de se connecter au service d\'authentification'
      });
    }
  });
  
  // GET /api/logout - Déconnexion utilisateur
  fastify.get('/api/logout', async (request, reply) => {
    try {
      // Supprimer les tokens de session
      // Note: Parse ne fournit pas d'endpoint de logout, nous gérons juste le côté client
      
      return reply.code(200).send({
        success: true,
        message: 'Déconnexion réussie'
      });
      
    } catch (error) {
      fastify.log.error('Erreur de déconnexion:', error);
      return reply.code(500).send({
        success: false,
        error: 'Erreur serveur',
        message: 'Erreur lors de la déconnexion'
      });
    }
  });
  
  // GET /api/check-auth - Vérification de l'authentification
  fastify.get('/api/check-auth', async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
      
      if (!authHeader) {
        return reply.code(401).send({
          success: false,
          error: 'Non autorisé',
          message: 'Token d\'authentification manquant'
        });
      }
      
      const token = authHeader.split(' ')[1];
      
      // Vérifier le token avec Parse
      const parseResponse = await fastify.parseApi.get('/users/me', {
        headers: {
          'X-Parse-Session-Token': token
        }
      });
      
      return reply.code(200).send({
        success: true,
        user: parseResponse.data,
        message: 'Authentification valide'
      });
      
    } catch (error) {
      console.error('Erreur de vérification d\'auth:', error);
      return reply.code(401).send({
        success: false,
        error: 'Non autorisé',
        message: 'Token invalide ou expiré'
      });
    }
  });
}