// Parse Server utility functions for Fastify

import axios from 'axios';

// Parse Server configuration
const PARSE_CONFIG = {
  serverURL: 'https://dev.parse.markidiags.com/parse',
  appId: 'marki',
  masterKey: 'Shaky4-Exception6',
  javascriptKey: 'javascript-key-here'
};

/**
 * Call a Parse Cloud function
 * @param {string} functionName - Name of the cloud function
 * @param {Object} params - Parameters to pass to the function
 * @param {string} sessionToken - Optional session token for authentication
 * @returns {Promise<Object>} - Response from the cloud function
 */
export async function parseRequest(functionName, params = {}, sessionToken = null) {
  try {
    const headers = {
      'X-Parse-Application-Id': PARSE_CONFIG.appId,
      'Content-Type': 'application/json'
    };
    
    // Add session token if provided
    if (sessionToken) {
      headers['X-Parse-Session-Token'] = sessionToken;
    } else {
      // Use master key for server-to-server communication
      headers['X-Parse-Master-Key'] = PARSE_CONFIG.masterKey;
    }
    
    const response = await axios.post(
      `${PARSE_CONFIG.serverURL}/functions/${functionName}`,
      params,
      { headers }
    );
    
    return response.data.result;
    
  } catch (error) {
    console.error('Parse Cloud function error:', error.response?.data || error.message);
    throw new Error(`Parse Cloud function ${functionName} failed: ${error.message}`);
  }
}

/**
 * Get Parse object by ID
 * @param {string} className - Parse class name
 * @param {string} objectId - Object ID
 * @param {string} sessionToken - Optional session token
 * @returns {Promise<Object>} - Parse object
 */
export async function getParseObject(className, objectId, sessionToken = null) {
  try {
    const headers = {
      'X-Parse-Application-Id': PARSE_CONFIG.appId,
      'Content-Type': 'application/json'
    };
    
    if (sessionToken) {
      headers['X-Parse-Session-Token'] = sessionToken;
    } else {
      headers['X-Parse-Master-Key'] = PARSE_CONFIG.masterKey;
    }
    
    const response = await axios.get(
      `${PARSE_CONFIG.serverURL}/classes/${className}/${objectId}`,
      { headers }
    );
    
    return response.data;
    
  } catch (error) {
    console.error('Error getting Parse object:', error.response?.data || error.message);
    throw new Error(`Failed to get ${className} object: ${error.message}`);
  }
}

/**
 * Query Parse objects
 * @param {string} className - Parse class name
 * @param {Object} query - Query parameters
 * @param {string} sessionToken - Optional session token
 * @returns {Promise<Array>} - Array of Parse objects
 */
export async function queryParseObjects(className, query = {}, sessionToken = null) {
  try {
    const headers = {
      'X-Parse-Application-Id': PARSE_CONFIG.appId,
      'Content-Type': 'application/json'
    };
    
    if (sessionToken) {
      headers['X-Parse-Session-Token'] = sessionToken;
    } else {
      headers['X-Parse-Master-Key'] = PARSE_CONFIG.masterKey;
    }
    
    const response = await axios.get(
      `${PARSE_CONFIG.serverURL}/classes/${className}`,
      {
        headers,
        params: {
          where: JSON.stringify(query.where || {}),
          limit: query.limit,
          skip: query.skip,
          order: query.order,
          keys: query.keys,
          include: query.include,
          count: query.count
        }
      }
    );
    
    return response.data.results;
    
  } catch (error) {
    console.error('Error querying Parse objects:', error.response?.data || error.message);
    throw new Error(`Failed to query ${className} objects: ${error.message}`);
  }
}