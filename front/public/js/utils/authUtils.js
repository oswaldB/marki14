/**
 * Utilitaires pour la gestion de l'authentification côté client
 */

/**
 * Récupère le token d'authentification
 * @returns {string|null} - Token ou null si non trouvé
 */
export function getAuthToken() {
  return localStorage.getItem('parseToken') || sessionStorage.getItem('parseToken');
}

/**
 * Récupère l'ID utilisateur
 * @returns {string|null} - User ID ou null si non trouvé
 */
export function getUserId() {
  return localStorage.getItem('userId') || sessionStorage.getItem('userId');
}

/**
 * Récupère le nom d'utilisateur
 * @returns {string|null} - Username ou null si non trouvé
 */
export function getUsername() {
  return localStorage.getItem('username') || sessionStorage.getItem('username');
}

/**
 * Vérifie si l'utilisateur est authentifié
 * @returns {boolean} - True si authentifié
 */
export function isAuthenticated() {
  return !!getAuthToken();
}

/**
 * Déconnecte l'utilisateur
 */
export function logout() {
  console.log('Déconnexion de l\'utilisateur');
  
  localStorage.removeItem('parseToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('username');
  
  sessionStorage.removeItem('parseToken');
  sessionStorage.removeItem('userId');
  sessionStorage.removeItem('username');
  
  window.location.href = '/login';
}

/**
 * Récupère les informations utilisateur
 * @returns {Promise<Object|null>} - Informations utilisateur ou null
 */
export async function getCurrentUser() {
  const token = getAuthToken();
  
  if (!token) {
    return null;
  }
  
  try {
    const response = await axios.get('/api/check-auth', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data.user;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return null;
  }
}