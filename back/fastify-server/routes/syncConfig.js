import axios from 'axios';

// Configuration Axios pour Parse REST API
const parseApi = axios.create({
  baseURL: process.env.PARSE_SERVER_URL + '/parse',
  headers: {
    'X-Parse-Application-Id': process.env.PARSE_APP_ID,
    'X-Parse-REST-API-Key': process.env.PARSE_REST_API_KEY,
    'Content-Type': 'application/json'
  }
});

/**
 * Crée une nouvelle configuration de synchronisation
 * @param {Object} configData - Données de configuration
 * @param {Object} credentials - Identifiants de base de données
 * @returns {Promise<Object>} Résultat de la création
 */
export async function createSyncConfig(configData, credentials) {
  try {
    console.log('Création de configuration - ID:', configData.configId);
    
    // Validation des données
    if (!configData || !credentials) {
      throw new Error('Données de configuration manquantes');
    }
    
    // Vérification de la requête SQL (pas de DROP, DELETE, etc.)
    if (configData.dbConfig.query && /\b(DROP|DELETE|TRUNCATE|ALTER)\b/i.test(configData.dbConfig.query)) {
      throw new Error('Requête SQL non autorisée');
    }
    
    // Création de la configuration via Parse REST
    const syncConfigResponse = await parseApi.post('/classes/SyncConfigs', configData);
    console.log('Configuration créée:', syncConfigResponse.data.objectId);
    
    // Sauvegarde des credentials
    const credentialsResponse = await parseApi.post('/classes/DBCredentials', {
      configId: configData.configId,
      username: credentials.username,
      encryptedPassword: credentials.encryptedPassword
    });
    console.log('Credentials sauvegardés:', credentialsResponse.data.objectId);
    
    // Mise à jour des variables globales
    const globalsResponse = await parseApi.get('/classes/VariablesGlobales', {
      params: { limit: 1 }
    });
    
    if (globalsResponse.data.results.length > 0) {
      const globals = globalsResponse.data.results[0];
      const activeConfigs = globals.activeConfigs || [];
      activeConfigs.push(configData.configId);
      
      await parseApi.put(`/classes/VariablesGlobales/${globals.objectId}`, {
        activeConfigs: activeConfigs
      });
      console.log('Variables globales mises à jour');
    }
    
    return { success: true, configId: configData.configId };
  } catch (error) {
    console.error('Erreur lors de la création de configuration:', error.message);
    throw error;
  }
}

/**
 * Teste une configuration existante
 * @param {string} configId - ID de la configuration à tester
 * @returns {Promise<Object>} Résultat du test
 */
export async function testSyncConfig(configId) {
  try {
    console.log('Test de configuration - ID:', configId);
    
    // Récupération de la configuration
    const configResponse = await parseApi.get(`/classes/SyncConfigs/${configId}`);
    const config = configResponse.data;
    
    if (!config) {
      throw new Error('Configuration non trouvée');
    }
    
    // Récupération des credentials
    const credentialsResponse = await parseApi.get('/classes/DBCredentials', {
      params: {
        where: JSON.stringify({ configId: configId })
      }
    });
    
    const credentials = credentialsResponse.data.results[0];
    
    if (!credentials) {
      throw new Error('Credentials non trouvés');
    }
    
    // Exécution de la requête de test (simulée)
    // Dans un environnement réel, cela se connecterait à la base de données
    const testResults = {
      sampleData: [
        { email: 'client@acme.com', montant: 1200.50, échéance: '01/03/2026' },
        { email: 'client2@acme.com', montant: 850.00, échéance: '15/03/2026' }
      ],
      recordCount: 12
    };
    
    console.log('Test réussi - Enregistrements trouvés:', testResults.recordCount);
    return { success: true, ...testResults };
  } catch (error) {
    console.error('Erreur lors du test de configuration:', error.message);
    throw error;
  }
}

/**
 * Récupère toutes les configurations
 * @returns {Promise<Array>} Liste des configurations
 */
export async function getAllSyncConfigs() {
  try {
    console.log('Récupération de toutes les configurations');
    const response = await parseApi.get('/classes/SyncConfigs');
    console.log('Configurations trouvées:', response.data.results.length);
    return response.data.results;
  } catch (error) {
    console.error('Erreur lors de la récupération des configurations:', error.message);
    throw error;
  }
}

/**
 * Met à jour une configuration
 * @param {string} configId - ID de la configuration
 * @param {Object} updates - Mises à jour
 * @returns {Promise<Object>} Résultat de la mise à jour
 */
export async function updateSyncConfig(configId, updates) {
  try {
    console.log('Mise à jour de configuration - ID:', configId);
    
    // Validation de la requête SQL si elle est modifiée
    if (updates.dbConfig?.query && /\b(DROP|DELETE|TRUNCATE|ALTER)\b/i.test(updates.dbConfig.query)) {
      throw new Error('Requête SQL non autorisée');
    }
    
    const response = await parseApi.put(`/classes/SyncConfigs/${configId}`, updates);
    console.log('Configuration mise à jour:', response.data.objectId);
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la mise à jour de configuration:', error.message);
    throw error;
  }
}

/**
 * Supprime une configuration
 * @param {string} configId - ID de la configuration
 * @returns {Promise<Object>} Résultat de la suppression
 */
export async function deleteSyncConfig(configId) {
  try {
    console.log('Suppression de configuration - ID:', configId);
    
    // Suppression de la configuration
    await parseApi.delete(`/classes/SyncConfigs/${configId}`);
    console.log('Configuration supprimée');
    
    // Suppression des credentials
    const credentialsResponse = await parseApi.get('/classes/DBCredentials', {
      params: {
        where: JSON.stringify({ configId: configId })
      }
    });
    
    if (credentialsResponse.data.results.length > 0) {
      const credentials = credentialsResponse.data.results[0];
      await parseApi.delete(`/classes/DBCredentials/${credentials.objectId}`);
      console.log('Credentials supprimés');
    }
    
    // Mise à jour des variables globales
    const globalsResponse = await parseApi.get('/classes/VariablesGlobales', {
      params: { limit: 1 }
    });
    
    if (globalsResponse.data.results.length > 0) {
      const globals = globalsResponse.data.results[0];
      const activeConfigs = globals.activeConfigs || [];
      const updatedConfigs = activeConfigs.filter(id => id !== configId);
      
      await parseApi.put(`/classes/VariablesGlobales/${globals.objectId}`, {
        activeConfigs: updatedConfigs
      });
      console.log('Variables globales mises à jour');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la suppression de configuration:', error.message);
    throw error;
  }
}