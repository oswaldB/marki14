/**
 * Configuration Axios pour les appels Parse REST
 * @module parseConfig
 */

import axios from 'axios';

/**
 * Instance Axios configurée pour Parse REST API
 * @type {import('axios').AxiosInstance}
 */
export const parseApi = axios.create({
  baseURL: 'https://dev.parse.markidiags.com',
  headers: {
    'X-Parse-Application-Id': 'marki',
    'X-Parse-REST-API-Key':  'Careless7-Gore4-Guileless0-Jogger5-Clubbed9',
    'Content-Type': 'application/json'
  }
});

/**
 * Fonction utilitaire pour gérer les erreurs Parse
 * @param {Error} error - L'erreur à traiter
 * @returns {string} Message d'erreur formaté
 */
export function handleParseError(error) {
  if (error.response) {
    const { status, data } = error.response;
    
    switch(status) {
      case 400:
        return data.error || 'Requête invalide';
      case 401:
        return 'Identifiants invalides';
      case 403:
        return 'Accès refusé';
      case 404:
        return 'Ressource non trouvée';
      default:
        return data.error || 'Erreur serveur Parse';
    }
  } else {
    return error.message || 'Erreur réseau';
  }
}