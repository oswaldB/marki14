/**
 * Garde de route pour protéger les pages nécessitant une authentification
 */

import { isAuthenticated } from './authUtils';

/**
 * Vérifie l'authentification et redirige si nécessaire
 * @param {boolean} requireAuth - Si true, la page nécessite une authentification
 */
export function checkAuth(requireAuth = true) {
  const isAuth = isAuthenticated();
  
  if (requireAuth && !isAuth) {
    console.log('Utilisateur non authentifié, redirection vers login');
    
    // Conserver l'URL actuelle pour la redirection après login
    const currentPath = window.location.pathname;
    window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
    return false;
  }
  
  if (!requireAuth && isAuth) {
    console.log('Utilisateur déjà authentifié, redirection vers dashboard');
    window.location.href = '/dashboard';
    return false;
  }
  
  return true;
}