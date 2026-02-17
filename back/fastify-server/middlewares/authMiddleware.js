/**
 * Middleware pour vérifier l'authentification
 */

export default async function authMiddleware(request, reply) {
  try {
    const authHeader = request.headers.authorization;
    
    if (!authHeader) {
      return reply.code(401).send({
        success: false,
        error: 'Non autorisé',
        message: 'Token d\'authentification requis'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return reply.code(401).send({
        success: false,
        error: 'Non autorisé',
        message: 'Format de token invalide'
      });
    }
    
    // Vérifier le token avec Parse
    const parseResponse = await request.server.parseApi.get('/users/me', {
      headers: {
        'X-Parse-Session-Token': token
      }
    });
    
    // Ajouter les informations utilisateur à la requête
    request.user = parseResponse.data;
    
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    return reply.code(401).send({
      success: false,
      error: 'Non autorisé',
      message: 'Token invalide ou expiré'
    });
  }
}