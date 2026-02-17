const axios = require('axios');

/**
 * Service principal de synchronisation
 * Récupère la configuration et exécute la synchronisation directement via Parse REST
 * @param {string} configId - ID de la configuration à exécuter
 * @returns {Promise<Object>} Résultat de la synchronisation
 */
async function executeSync(configId) {
  try {
    console.log(`Début de la synchronisation pour configId: ${configId}`);
    
    // 1. Récupérer la configuration depuis Parse via Axios
    const config = await getSyncConfig(configId);
    
    // 2. Récupérer les credentials depuis Parse via Axios
    const credentials = await getDBCredentials(configId);
    
    // 3. Se connecter à la BDD externe
    const connection = await connectToDatabase(config.dbConfig, credentials);
    
    // 4. Exécuter la requête SQL
    const results = await executeSQLQuery(connection, config.dbConfig.query);
    
    // 5. Valider les résultats
    const isValid = await validateResults(results, config.validationRules);
    
    if (!isValid) {
      throw new Error('Validation des résultats échouée');
    }
    
    // 6. Créer les objets dans Parse
    const createdObjects = await createParseObjects(results, config.parseConfig.targetClass, config.parseConfig);
    
    // 7. Logger l'opération
    await logSyncOperation(configId, 'success', `Création de ${createdObjects.length} objets réussie`);
    
    console.log(`Synchronisation terminée avec succès pour configId: ${configId}`);
    
    return {
      success: true,
      configId,
      objectsCreated: createdObjects.length,
      message: 'Synchronization completed successfully'
    };
  } catch (error) {
    console.error(`Erreur de synchronisation pour configId ${configId}:`, error);
    
    // Logger l'erreur
    await logSyncOperation(configId, 'error', error.message);
    
    return {
      success: false,
      configId,
      error: error.message,
      message: 'Synchronization failed'
    };
  }
}

/**
 * Récupère une configuration depuis Parse via Axios
 * @param {string} configId - ID de la configuration
 * @returns {Promise<Object>} Configuration complète
 */
async function getSyncConfig(configId) {
  console.log(`Récupération de la configuration ${configId} depuis Parse`);
  
  const response = await axios.get(`${process.env.PARSE_SERVER_URL.replace(/\/$/, '')}/parse/classes/SyncConfigs/${configId}`, {
    headers: {
      'X-Parse-Application-Id': process.env.PARSE_APP_ID,
      'X-Parse-REST-API-Key': process.env.PARSE_REST_API_KEY
    }
  });
  
  if (!response.data || !response.data.enabled) {
    throw new Error(`Configuration ${configId} non trouvée ou désactivée`);
  }
  
  console.log(`Configuration ${configId} récupérée avec succès`);
  return response.data;
}

/**
 * Récupère les credentials pour une configuration depuis Parse via Axios
 * @param {string} configId - ID de la configuration
 * @returns {Promise<Object>} Credentials avec mot de passe déchiffré
 */
async function getDBCredentials(configId) {
  console.log(`Récupération des credentials pour configId ${configId}`);
  
  const response = await axios.get(`${process.env.PARSE_SERVER_URL.replace(/\/$/, '')}/parse/classes/DBCredentials/${configId}`, {
    headers: {
      'X-Parse-Application-Id': process.env.PARSE_APP_ID,
      'X-Parse-REST-API-Key': process.env.PARSE_REST_API_KEY
    }
  });
  
  if (!response.data) {
    throw new Error(`Credentials non trouvés pour configId ${configId}`);
  }
  
  // Déchiffrer le mot de passe
  const decryptedPassword = decryptPassword(response.data.encryptedPassword);
  
  console.log(`Credentials récupérés et déchiffrés pour configId ${configId}`);
  return {
    username: response.data.username,
    password: decryptedPassword
  };
}

/**
 * Se connecte à une base de données externe
 * @param {Object} dbConfig - Configuration de la BDD
 * @param {Object} credentials - Credentials de connexion
 * @returns {Promise<Object>} Connexion à la BDD
 */
async function connectToDatabase(dbConfig, credentials) {
  console.log(`Connexion à la BDD ${dbConfig.host}/${dbConfig.database}`);
  
  // Implémentation spécifique selon le type de BDD (MySQL/PostgreSQL)
  // Exemple pour MySQL:
  const mysql = require('mysql2/promise');
  
  const connection = await mysql.createConnection({
    host: dbConfig.host,
    user: credentials.username,
    password: credentials.password,
    database: dbConfig.database
  });
  
  console.log(`Connecté à la BDD avec succès`);
  return connection;
}

/**
 * Exécute une requête SQL sur une BDD externe
 * @param {Object} connection - Connexion à la BDD
 * @param {string} query - Requête SQL à exécuter
 * @returns {Promise<Array>} Résultats de la requête
 */
async function executeSQLQuery(connection, query) {
  console.log(`Exécution de la requête SQL`);
  
  const [results] = await connection.query(query);
  console.log(`Requête exécutée, ${results.length} résultats retournés`);
  
  await connection.end();
  return results;
}

/**
 * Valide les résultats selon les règles de validation
 * @param {Array} results - Résultats de la requête
 * @param {Object} validationRules - Règles de validation
 * @returns {Promise<boolean>} True si la validation réussit
 */
async function validateResults(results, validationRules) {
  console.log(`Validation de ${results.length} résultats`);
  
  if (results.length === 0) {
    console.warn('Aucun résultat à valider');
    return false;
  }
  
  // Vérifier que tous les champs requis sont présents
  for (const item of results) {
    for (const field of validationRules.requiredFields) {
      if (!(field in item)) {
        console.error(`Champ requis manquant: ${field}`);
        return false;
      }
    }
  }
  
  // Vérifier que les valeurs des champs role sont valides
  if (validationRules.roleValues) {
    for (const item of results) {
      const roleField = validationRules.roleField || 'role';
      if (item[roleField] && !validationRules.roleValues.includes(item[roleField])) {
        console.error(`Valeur de role invalide: ${item[roleField]}`);
        return false;
      }
    }
  }
  
  console.log('Validation réussie');
  return true;
}

/**
 * Crée des objets dans Parse via REST API
 * @param {Array} data - Données à créer
 * @param {string} targetClass - Classe cible
 * @param {Object} parseConfig - Configuration Parse
 * @returns {Promise<Array>} Objets créés
 */
async function createParseObjects(data, targetClass, parseConfig) {
  console.log(`Création de ${data.length} objets dans la classe ${targetClass}`);
  
  const createdObjects = [];
  
  for (const item of data) {
    // Mapper les données selon les mappings
    const parseObject = {
      ...item,
      [parseConfig.roleField]: item[parseConfig.roleField],
      [parseConfig.statusField]: item[parseConfig.statusField]
    };
    
    // Appel Parse REST pour créer l'objet
    const response = await axios.post(`${process.env.PARSE_SERVER_URL.replace(/\/$/, '')}/parse/classes/${targetClass}`, parseObject, {
      headers: {
        'X-Parse-Application-Id': process.env.PARSE_APP_ID,
        'X-Parse-REST-API-Key': process.env.PARSE_REST_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    createdObjects.push(response.data);
  }
  
  console.log(`Création de ${createdObjects.length} objets réussie`);
  return createdObjects;
}

/**
 * Logge une opération de synchronisation dans Parse via REST
 * @param {string} configId - ID de la configuration
 * @param {string} status - Statut (success/error)
 * @param {string} details - Détails de l'opération
 * @returns {Promise<Object>} Log créé
 */
async function logSyncOperation(configId, status, details) {
  console.log(`Logging de l'opération: ${status} - ${details}`);
  
  const logObject = {
    configId,
    status,
    details,
    createdAt: new Date().toISOString()
  };
  
  const response = await axios.post(`${process.env.PARSE_SERVER_URL.replace(/\/$/, '')}/parse/classes/SyncLogs`, logObject, {
    headers: {
      'X-Parse-Application-Id': process.env.PARSE_APP_ID,
      'X-Parse-REST-API-Key': process.env.PARSE_REST_API_KEY,
      'Content-Type': 'application/json'
    }
  });
  
  console.log('Log créé avec succès');
  return response.data;
}

/**
 * Déchiffre un mot de passe
 * @param {string} encryptedPassword - Mot de passe chiffré
 * @returns {string} Mot de passe déchiffré
 */
function decryptPassword(encryptedPassword) {
  console.log('Déchiffrement du mot de passe');
  
  // Implémentation du déchiffrement AES-256
  // Utiliser une bibliothèque comme crypto-js
  const crypto = require('crypto');
  
  const algorithm = 'aes-256-cbc';
  const key = crypto.createHash('sha256').update(process.env.ENCRYPTION_KEY).digest();
  const iv = Buffer.alloc(16, 0); // IV simple pour l'exemple
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedPassword, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  console.log('Mot de passe déchiffré avec succès');
  return decrypted;
}

// Export pour utilisation dans le script cron
module.exports = {
  executeSync,
  getSyncConfig,
  getDBCredentials,
  connectToDatabase,
  executeSQLQuery,
  validateResults,
  createParseObjects,
  logSyncOperation,
  decryptPassword
};