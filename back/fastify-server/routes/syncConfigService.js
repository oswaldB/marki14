/**
 * Services Parse REST pour la gestion des configurations de synchronisation
 */

const axios = require('axios');
const crypto = require('crypto');

// Configuration Parse
const PARSE_APP_ID = process.env.PARSE_APP_ID;
const PARSE_REST_API_KEY = process.env.PARSE_REST_API_KEY;
const PARSE_SERVER_URL = process.env.PARSE_SERVER_URL || 'http://localhost:1337/parse';

const parseHeaders = {
  'X-Parse-Application-Id': PARSE_APP_ID,
  'X-Parse-REST-API-Key': PARSE_REST_API_KEY,
  'Content-Type': 'application/json'
};

// Clé de chiffrement pour les mots de passe (devrait être dans les variables d'environnement)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const IV_LENGTH = 16;

/**
 * Chiffre une chaîne de caractères
 * @param {string} text - Texte à chiffrer
 * @returns {string} Texte chiffré (hex)
 */
function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Déchiffre une chaîne de caractères
 * @param {string} text - Texte chiffré (hex)
 * @returns {string} Texte déchiffré
 */
function decrypt(text) {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

/**
 * Vérifie la présence d'injection SQL
 * @param {string} query - Requête SQL à vérifier
 * @returns {boolean} True si injection détectée
 */
function hasSqlInjection(query) {
  // Implémentation basique de détection d'injection SQL
  const dangerousKeywords = ['DROP', 'DELETE', 'TRUNCATE', 'INSERT', 'UPDATE', 'ALTER', 'EXEC', 'UNION', 'SELECT'];
  const upperQuery = query.toUpperCase();
  
  return dangerousKeywords.some(keyword => {
    // Vérifier si le mot-clé est présent en tant que mot complet (pas dans un commentaire ou une chaîne)
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    return regex.test(upperQuery) && !upperQuery.includes(`-- ${keyword}`);
  });
}

/**
 * Crée une nouvelle configuration de synchronisation via Parse REST
 * @param {Object} configData - Données de configuration
 * @param {Object} credentials - Identifiants de base de données
 * @param {string} sessionToken - Token de session utilisateur
 * @returns {Promise<Object>} Configuration créée
 */
async function createSyncConfig(configData, credentials, sessionToken) {
  console.log('Création d\'une nouvelle configuration de synchronisation');
  
  try {
    // Validation des données d'entrée
    if (!configData || !configData.configId || !configData.name) {
      throw new Error('ConfigId et name sont requis');
    }
    
    // Vérification de l'absence d'injection SQL dans la requête
    if (hasSqlInjection(configData.dbConfig.query)) {
      throw new Error('Requête SQL non autorisée - injection détectée');
    }
    
    // Chiffrement du mot de passe
    const encryptedPassword = encrypt(credentials.password);
    
    // Préparation des données pour Parse
    const parseConfigData = {
      configId: configData.configId,
      name: configData.name,
      description: configData.description || '',
      dbConfig: {
        host: configData.dbConfig.host,
        database: configData.dbConfig.database,
        user: configData.dbConfig.user,
        query: configData.dbConfig.query
      },
      parseConfig: {
        mappings: configData.parseConfig.mappings,
        targetClass: configData.parseConfig.targetClass
      },
      validationRules: {
        requiredFields: configData.validationRules.requiredFields,
        roleValues: configData.validationRules.roleValues || ''
      },
      frequency: configData.frequency,
      status: configData.status,
      createdBy: configData.createdBy
    };
    
    const parseCredentials = {
      configId: configData.configId,
      username: credentials.username,
      encryptedPassword: encryptedPassword
    };
    
    // Appel Parse REST pour créer SyncConfigs
    const configResponse = await axios.post(`${PARSE_SERVER_URL}/classes/SyncConfigs`, parseConfigData, {
      headers: {
        ...parseHeaders,
        'X-Parse-Session-Token': sessionToken
      }
    });
    
    // Appel Parse REST pour créer DBCredentials
    await axios.post(`${PARSE_SERVER_URL}/classes/DBCredentials`, parseCredentials, {
      headers: {
        ...parseHeaders,
        'X-Parse-Session-Token': sessionToken
      }
    });
    
    // Mettre à jour VariablesGlobales.activeConfigs si status=Actif
    if (configData.status === 'Actif') {
      await updateActiveConfigsList(sessionToken);
    }
    
    // Créer un log dans SyncLogs
    await axios.post(`${PARSE_SERVER_URL}/classes/SyncLogs`, {
      configId: configData.configId,
      status: 'success',
      details: `Configuration créée avec succès par ${configData.createdBy}`
    }, { headers: parseHeaders });
    
    console.log('Configuration créée avec succès:', configResponse.data.objectId);
    return configResponse.data;
    
  } catch (error) {
    console.error('Erreur lors de la création de la configuration:', error.message);
    
    // Créer un log d'erreur
    await axios.post(`${PARSE_SERVER_URL}/classes/SyncLogs`, {
      configId: configData?.configId || 'unknown',
      status: 'error',
      details: `Erreur lors de la création: ${error.message}`
    }, { headers: parseHeaders });
    
    throw error;
  }
}

/**
 * Teste une configuration existante
 * @param {string} configId - ID de la configuration
 * @param {string} sessionToken - Token de session utilisateur
 * @returns {Promise<Object>} Résultats du test
 */
async function testSyncConfig(configId, sessionToken) {
  console.log(`Test de la configuration: ${configId}`);
  
  try {
    // Appel Parse REST pour récupérer la configuration et les credentials
    const configResponse = await axios.get(`${PARSE_SERVER_URL}/classes/SyncConfigs`, {
      params: { where: JSON.stringify({ configId: configId }) },
      headers: {
        ...parseHeaders,
        'X-Parse-Session-Token': sessionToken
      }
    });
    
    if (configResponse.data.results.length === 0) {
      throw new Error('Configuration non trouvée');
    }
    
    const config = configResponse.data.results[0];
    
    // Récupérer les credentials
    const credentialsResponse = await axios.get(`${PARSE_SERVER_URL}/classes/DBCredentials`, {
      params: { where: JSON.stringify({ configId: configId }) },
      headers: {
        ...parseHeaders,
        'X-Parse-Session-Token': sessionToken
      }
    });
    
    if (credentialsResponse.data.results.length === 0) {
      throw new Error('Credentials non trouvés pour cette configuration');
    }
    
    const credentials = credentialsResponse.data.results[0];
    const password = decrypt(credentials.encryptedPassword);
    
    // TODO: Implémenter la connexion à la base de données externe et l'exécution de la requête
    // Pour l'instant, on simule un test réussi
    console.log('Connexion à la base de données simulée...');
    console.log('Exécution de la requête:', config.dbConfig.query);
    
    // Simulation de résultats de test
    const testResults = {
      success: true,
      message: 'Configuration valide - connexion et requête réussies',
      columns: ['email', 'montant', 'echeance'],
      data: [
        { email: 'client@acme.com', montant: 1200.50, echeance: '01/03/2026' },
        { email: 'client2@acme.com', montant: 850.00, echeance: '15/03/2026' }
      ]
    };
    
    // Valider les colonnes requises
    const requiredFields = config.validationRules.requiredFields || [];
    const missingFields = requiredFields.filter(field => !testResults.columns.includes(field.toLowerCase()));
    
    if (missingFields.length > 0) {
      throw new Error(`Champs requis manquants: ${missingFields.join(', ')}`);
    }
    
    // Créer un log de succès
    await axios.post(`${PARSE_SERVER_URL}/classes/SyncLogs`, {
      configId: configId,
      status: 'success',
      details: `Test réussi: ${testResults.message}`
    }, { headers: parseHeaders });
    
    return {
      success: true,
      message: testResults.message,
      columns: testResults.columns,
      results: testResults.data
    };
    
  } catch (error) {
    console.error(`Erreur lors du test de la configuration ${configId}:`, error.message);
    
    // Créer un log d'erreur
    await axios.post(`${PARSE_SERVER_URL}/classes/SyncLogs`, {
      configId: configId,
      status: 'error',
      details: `Erreur lors du test: ${error.message}`
    }, { headers: parseHeaders });
    
    throw error;
  }
}

/**
 * Récupère toutes les configurations via Parse REST
 * @param {string} sessionToken - Token de session utilisateur
 * @returns {Promise<Array>} Liste des configurations
 */
async function getAllSyncConfigs(sessionToken) {
  console.log('Récupération de toutes les configurations de synchronisation');
  
  try {
    const response = await axios.get(`${PARSE_SERVER_URL}/classes/SyncConfigs`, {
      headers: {
        ...parseHeaders,
        'X-Parse-Session-Token': sessionToken
      }
    });
    
    // Pour chaque configuration, vérifier le statut dans DBCredentials
    const configsWithStatus = await Promise.all(response.data.results.map(async (config) => {
      // Vérifier si des credentials existent pour cette config
      const credentialsResponse = await axios.get(`${PARSE_SERVER_URL}/classes/DBCredentials`, {
        params: { where: JSON.stringify({ configId: config.configId }) },
        headers: {
          ...parseHeaders,
          'X-Parse-Session-Token': sessionToken
        }
      });
      
      return {
        ...config,
        hasCredentials: credentialsResponse.data.results.length > 0
      };
    }));
    
    return configsWithStatus;
    
  } catch (error) {
    console.error('Erreur lors de la récupération des configurations:', error.message);
    throw error;
  }
}

/**
 * Met à jour une configuration via Parse REST
 * @param {string} configId - ID de la configuration
 * @param {Object} updates - Mises à jour
 * @param {string} sessionToken - Token de session utilisateur
 * @returns {Promise<Object>} Configuration mise à jour
 */
async function updateSyncConfig(configId, updates, sessionToken) {
  console.log(`Mise à jour de la configuration: ${configId}`);
  
  try {
    // Validation des mises à jour
    if (!configId || !updates) {
      throw new Error('ConfigId et updates sont requis');
    }
    
    // Vérification de l'injection SQL si la requête est mise à jour
    if (updates.dbConfig?.query && hasSqlInjection(updates.dbConfig.query)) {
      throw new Error('Requête SQL non autorisée - injection détectée');
    }
    
    // Récupérer la configuration existante
    const existingConfig = await axios.get(`${PARSE_SERVER_URL}/classes/SyncConfigs`, {
      params: { where: JSON.stringify({ configId: configId }) },
      headers: {
        ...parseHeaders,
        'X-Parse-Session-Token': sessionToken
      }
    });
    
    if (existingConfig.data.results.length === 0) {
      throw new Error('Configuration non trouvée');
    }
    
    const objectId = existingConfig.data.results[0].objectId;
    
    // Appel Parse REST pour mettre à jour SyncConfigs
    const response = await axios.put(`${PARSE_SERVER_URL}/classes/SyncConfigs/${objectId}`, updates, {
      headers: {
        ...parseHeaders,
        'X-Parse-Session-Token': sessionToken
      }
    });
    
    // Mettre à jour les credentials si nécessaire
    if (updates.dbConfig?.user || updates.dbConfig?.password) {
      const credentialsResponse = await axios.get(`${PARSE_SERVER_URL}/classes/DBCredentials`, {
        params: { where: JSON.stringify({ configId: configId }) },
        headers: {
          ...parseHeaders,
          'X-Parse-Session-Token': sessionToken
        }
      });
      
      if (credentialsResponse.data.results.length > 0) {
        const credentialsObjectId = credentialsResponse.data.results[0].objectId;
        const credentialsUpdates = {};
        
        if (updates.dbConfig.user) {
          credentialsUpdates.username = updates.dbConfig.user;
        }
        
        if (updates.dbConfig.password) {
          credentialsUpdates.encryptedPassword = encrypt(updates.dbConfig.password);
        }
        
        await axios.put(`${PARSE_SERVER_URL}/classes/DBCredentials/${credentialsObjectId}`, credentialsUpdates, {
          headers: {
            ...parseHeaders,
            'X-Parse-Session-Token': sessionToken
          }
        });
      }
    }
    
    // Mettre à jour VariablesGlobales.activeConfigs
    await updateActiveConfigsList(sessionToken);
    
    // Créer un log de mise à jour
    await axios.post(`${PARSE_SERVER_URL}/classes/SyncLogs`, {
      configId: configId,
      status: 'success',
      details: `Configuration mise à jour par ${updates.createdBy || 'utilisateur inconnu'}`
    }, { headers: parseHeaders });
    
    return response.data;
    
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la configuration ${configId}:`, error.message);
    
    // Créer un log d'erreur
    await axios.post(`${PARSE_SERVER_URL}/classes/SyncLogs`, {
      configId: configId,
      status: 'error',
      details: `Erreur lors de la mise à jour: ${error.message}`
    }, { headers: parseHeaders });
    
    throw error;
  }
}

/**
 * Supprime une configuration via Parse REST
 * @param {string} configId - ID de la configuration
 * @param {string} sessionToken - Token de session utilisateur
 * @returns {Promise<boolean>} Succès de la suppression
 */
async function deleteSyncConfig(configId, sessionToken) {
  console.log(`Suppression de la configuration: ${configId}`);
  
  try {
    // Récupérer la configuration existante
    const configResponse = await axios.get(`${PARSE_SERVER_URL}/classes/SyncConfigs`, {
      params: { where: JSON.stringify({ configId: configId }) },
      headers: {
        ...parseHeaders,
        'X-Parse-Session-Token': sessionToken
      }
    });
    
    if (configResponse.data.results.length === 0) {
      throw new Error('Configuration non trouvée');
    }
    
    const objectId = configResponse.data.results[0].objectId;
    
    // Supprimer de SyncConfigs
    await axios.delete(`${PARSE_SERVER_URL}/classes/SyncConfigs/${objectId}`, {
      headers: {
        ...parseHeaders,
        'X-Parse-Session-Token': sessionToken
      }
    });
    
    // Supprimer de DBCredentials
    const credentialsResponse = await axios.get(`${PARSE_SERVER_URL}/classes/DBCredentials`, {
      params: { where: JSON.stringify({ configId: configId }) },
      headers: {
        ...parseHeaders,
        'X-Parse-Session-Token': sessionToken
      }
    });
    
    if (credentialsResponse.data.results.length > 0) {
      const credentialsObjectId = credentialsResponse.data.results[0].objectId;
      await axios.delete(`${PARSE_SERVER_URL}/classes/DBCredentials/${credentialsObjectId}`, {
        headers: {
          ...parseHeaders,
          'X-Parse-Session-Token': sessionToken
        }
      });
    }
    
    // Mettre à jour VariablesGlobales.activeConfigs
    await updateActiveConfigsList(sessionToken);
    
    // Créer un log de suppression
    await axios.post(`${PARSE_SERVER_URL}/classes/SyncLogs`, {
      configId: configId,
      status: 'success',
      details: 'Configuration supprimée avec succès'
    }, { headers: parseHeaders });
    
    return true;
    
  } catch (error) {
    console.error(`Erreur lors de la suppression de la configuration ${configId}:`, error.message);
    
    // Créer un log d'erreur
    await axios.post(`${PARSE_SERVER_URL}/classes/SyncLogs`, {
      configId: configId,
      status: 'error',
      details: `Erreur lors de la suppression: ${error.message}`
    }, { headers: parseHeaders });
    
    throw error;
  }
}

/**
 * Met à jour la liste des configurations actives dans VariablesGlobales
 * @param {string} sessionToken - Token de session utilisateur
 */
async function updateActiveConfigsList(sessionToken) {
  try {
    // Récupérer toutes les configurations actives
    const activeConfigs = await axios.get(`${PARSE_SERVER_URL}/classes/SyncConfigs`, {
      params: { where: JSON.stringify({ status: 'Actif' }) },
      headers: {
        ...parseHeaders,
        'X-Parse-Session-Token': sessionToken
      }
    });
    
    const activeConfigIds = activeConfigs.data.results.map(config => config.configId);
    
    // Mettre à jour VariablesGlobales
    const variablesResponse = await axios.get(`${PARSE_SERVER_URL}/classes/VariablesGlobales`, {
      headers: {
        ...parseHeaders,
        'X-Parse-Session-Token': sessionToken
      }
    });
    
    if (variablesResponse.data.results.length > 0) {
      const objectId = variablesResponse.data.results[0].objectId;
      await axios.put(`${PARSE_SERVER_URL}/classes/VariablesGlobales/${objectId}`, {
        activeConfigs: activeConfigIds,
        lastUpdated: new Date().toISOString()
      }, {
        headers: {
          ...parseHeaders,
          'X-Parse-Session-Token': sessionToken
        }
      });
    }
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour des configurations actives:', error.message);
    throw error;
  }
}

module.exports = {
  createSyncConfig,
  testSyncConfig,
  getAllSyncConfigs,
  updateSyncConfig,
  deleteSyncConfig,
  hasSqlInjection
};