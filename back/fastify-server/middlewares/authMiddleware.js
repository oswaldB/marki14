// Middleware d'authentification Fastify
// Ce fichier n'est nécessaire que si une route Fastify spécifique est demandée

/**
 * Middleware pour vérifier l'authentification
 * @param {Object} request - Objet request Fastify
 * @param {Object} reply - Objet reply Fastify
 * @param {Function} done - Callback
 */
export async function authMiddleware(request, reply, done) {
  try {
    console.log('Vérification de l\'authentification pour:', request.url);
    
    // Récupérer le token des headers ou des cookies
    const token = request.headers['x-parse-session-token'] || request.cookies.parseToken;
    
    if (!token) {
      console.log('Aucun token trouvé, accès refusé');
      return reply.code(401).send({
        success: false,
        error: 'Non autorisé',
        message: 'Token d\'authentification manquant'
      });
    }
    
    // Valider le token avec Parse Server
    const isValid = await validateParseToken(token);
    
    if (!isValid) {
      console.log('Token invalide, accès refusé');
      return reply.code(401).send({
        success: false,
        error: 'Non autorisé',
        message: 'Token d\'authentification invalide'
      });
    }
    
    console.log('Authentification réussie pour:', request.url);
    done();
    
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    reply.code(500).send({
      success: false,
      error: 'Erreur serveur',
      message: 'Erreur lors de la vérification de l\'authentification'
    });
  }
}

/**
 * Valide un token Parse
 * @param {string} token - Token à valider
 * @returns {Promise<boolean>} - True si le token est valide
 */
async function validateParseToken(token) {
  try {
    console.log('Validation du token Parse');
    
    const response = await fetch('https://dev.parse.markidiags.com/parse/users/me', {
      headers: {
        'X-Parse-Application-Id': 'marki',
        'X-Parse-Session-Token': token
      }
    });
    
    return response.ok;
    
  } catch (error) {
    console.error('Erreur de validation du token:', error);
    return false;
  }
}
