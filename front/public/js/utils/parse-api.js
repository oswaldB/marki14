/**
 * Configuration Axios pour les appels Parse REST API
 * @module parse-api
 */

import axios from 'axios';

/**
 * Instance Axios configurée pour Parse REST API
 * @type {import('axios').AxiosInstance}
 */
const parseApi = axios.create({
  baseURL: (import.meta.env.PARSE_SERVER_URL || 'https://dev.parse.markidiags.com/') + 'parse',
  headers: {
    'X-Parse-Application-Id': import.meta.env.PARSE_APP_ID || 'marki',
    'X-Parse-Javascript-Key': import.meta.env.PARSE_JS_KEY || 'Careless7-Gore4-Guileless0-Jogger5-Clubbed9',
    'X-Parse-REST-API-Key': import.meta.env.PARSE_REST_API_KEY || 'Careless7-Gore4-Guileless0-Jogger5-Clubbed9',
    'Content-Type': 'application/json'
  }
});

export default parseApi;