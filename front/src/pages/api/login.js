// Proxy API pour Parse
import axios from 'axios';

const parseApi = axios.create({
  baseURL: process.env.PARSE_SERVER_URL + '/parse',
  headers: {
    'X-Parse-Application-Id': process.env.PARSE_APP_ID,
    'X-Parse-Javascript-Key': process.env.PARSE_JS_KEY,
    'Content-Type': 'application/json'
  }
});

export async function POST({ request }) {
  try {
    const { username, password, rememberMe } = await request.json();
    
    console.log('Tentative de connexion pour:', username);
    
    // Appel Parse REST pour authentification
    const response = await parseApi.post('/login', {
      username,
      password
    });
    
    const { sessionToken, objectId } = response.data;
    
    // Structure du token à stocker
    const authToken = {
      parseToken: sessionToken,
      userId: objectId
    };
    
    console.log('Authentification réussie - Token:', authToken);
    
    return new Response(JSON.stringify({
      success: true,
      token: authToken,
      redirectUrl: new URL(request.url).searchParams.get('redirect') || '/dashboard'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Erreur d\'authentification:', error.response?.data || error.message);

    // Gestion des erreurs selon le guide PARSE-AXIOS-REST.md
    let statusCode = 401;
    let errorMessage = 'Identifiants invalides';
    
    if (error.response) {
      const { status, data } = error.response;
      
      switch(status) {
        case 400:
          errorMessage = 'Requête invalide: ' + (data.error || 'Paramètres manquants');
          statusCode = 400;
          break;
        case 401:
          errorMessage = 'Non autorisé: ' + (data.error || 'Identifiants incorrects');
          statusCode = 401;
          break;
        case 403:
          errorMessage = 'Accès refusé: ' + (data.error || 'Compte désactivé');
          statusCode = 403;
          break;
        case 404:
          errorMessage = 'Utilisateur non trouvé';
          statusCode = 404;
          break;
        default:
          errorMessage = 'Erreur Parse: ' + (data.error || 'Erreur serveur');
          statusCode = status || 500;
      }
    } else {
      errorMessage = 'Erreur réseau: ' + error.message;
      statusCode = 500;
    }

    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}