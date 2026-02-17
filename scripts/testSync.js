/**
 * Script de test pour la synchronisation
 * Ce script teste le service de synchronisation avec des données mockées
 */

require('dotenv').config();
const { executeSync } = require('./syncConfigService');

// Mock des données pour le test
const mockConfig = {
  configId: 'test-config-1',
  enabled: true,
  dbConfig: {
    host: 'localhost',
    database: 'test_db',
    query: 'SELECT * FROM test_table LIMIT 10'
  },
  parseConfig: {
    targetClass: 'Impayes',
    roleField: 'role',
    statusField: 'status'
  },
  validationRules: {
    requiredFields: ['id', 'name', 'amount'],
    roleField: 'role',
    roleValues: ['admin', 'user', 'guest']
  }
};

// Mock des fonctions pour éviter les appels réels
const originalGetSyncConfig = require('./syncConfigService').getSyncConfig;
const originalGetDBCredentials = require('./syncConfigService').getDBCredentials;
const originalConnectToDatabase = require('./syncConfigService').connectToDatabase;
const originalExecuteSQLQuery = require('./syncConfigService').executeSQLQuery;
const originalCreateParseObjects = require('./syncConfigService').createParseObjects;
const originalLogSyncOperation = require('./syncConfigService').logSyncOperation;

// Remplacer les fonctions par des mocks
require('./syncConfigService').getSyncConfig = async (configId) => {
  console.log(`Mock: getSyncConfig appelé avec ${configId}`);
  return mockConfig;
};

require('./syncConfigService').getDBCredentials = async (configId) => {
  console.log(`Mock: getDBCredentials appelé avec ${configId}`);
  return {
    username: 'test_user',
    password: 'test_password'
  };
};

require('./syncConfigService').connectToDatabase = async (dbConfig, credentials) => {
  console.log(`Mock: connectToDatabase appelé`);
  return {
    query: async (sql) => {
      console.log(`Mock: Exécution de la requête: ${sql}`);
      return [[
        {
          id: 1,
          name: 'Test Impayé',
          amount: 100.50,
          role: 'user',
          status: 'pending'
        },
        {
          id: 2,
          name: 'Test Impayé 2',
          amount: 200.75,
          role: 'admin',
          status: 'paid'
        }
      ]];
    },
    end: async () => {
      console.log(`Mock: Connexion fermée`);
    }
  };
};

require('./syncConfigService').executeSQLQuery = async (connection, query) => {
  console.log(`Mock: executeSQLQuery appelé`);
  const [results] = await connection.query(query);
  return results;
};

require('./syncConfigService').createParseObjects = async (data, targetClass, parseConfig) => {
  console.log(`Mock: createParseObjects appelé avec ${data.length} objets`);
  return data.map((item, index) => ({
    objectId: `mock-${index}`,
    createdAt: new Date().toISOString()
  }));
};

require('./syncConfigService').logSyncOperation = async (configId, status, details) => {
  console.log(`Mock: logSyncOperation appelé - ${status}: ${details}`);
  return { objectId: 'mock-log-id' };
};

/**
 * Test du service de synchronisation
 */
async function testSyncService() {
  try {
    console.log('Début du test de synchronisation...');
    
    const result = await executeSync('test-config-1');
    
    console.log('Test terminé avec succès:', result);
    
    // Restaurer les fonctions originales
    require('./syncConfigService').getSyncConfig = originalGetSyncConfig;
    require('./syncConfigService').getDBCredentials = originalGetDBCredentials;
    require('./syncConfigService').connectToDatabase = originalConnectToDatabase;
    require('./syncConfigService').executeSQLQuery = originalExecuteSQLQuery;
    require('./syncConfigService').createParseObjects = originalCreateParseObjects;
    require('./syncConfigService').logSyncOperation = originalLogSyncOperation;
    
    return result;
  } catch (error) {
    console.error('Erreur lors du test:', error);
    
    // Restaurer les fonctions originales
    require('./syncConfigService').getSyncConfig = originalGetSyncConfig;
    require('./syncConfigService').getDBCredentials = originalGetDBCredentials;
    require('./syncConfigService').connectToDatabase = originalConnectToDatabase;
    require('./syncConfigService').executeSQLQuery = originalExecuteSQLQuery;
    require('./syncConfigService').createParseObjects = originalCreateParseObjects;
    require('./syncConfigService').logSyncOperation = originalLogSyncOperation;
    
    throw error;
  }
}

// Exécuter le test
if (require.main === module) {
  testSyncService()
    .then(result => {
      console.log('Test réussi!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Test échoué:', error);
      process.exit(1);
    });
}

module.exports = { testSyncService };