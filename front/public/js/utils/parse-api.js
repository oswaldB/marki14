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
  baseURL: import.meta.env.PARSE_SERVER_URL + 'parse',
  headers: {
    'X-Parse-Application-Id': import.meta.env.PARSE_APP_ID,
    'X-Parse-Javascript-Key': import.meta.env.PARSE_JS_KEY,
    'Content-Type': 'application/json'
  }
});

export default parseApi;