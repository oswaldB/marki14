/**
 * Script pour initialiser les collections Parse nécessaires
 * pour la gestion des configurations de synchronisation
 */

const axios = require('axios');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

// Configuration Parse
const PARSE_APP_ID = process.env.PARSE_APP_ID;
const PARSE_REST_API_KEY = process.env.PARSE_REST_API_KEY;
const PARSE_SERVER_URL = process.env.PARSE_SERVER_URL || 'http://localhost:1337/parse';

const parseHeaders = {
  'X-Parse-Application-Id': PARSE_APP_ID,
  'X-Parse-REST-API-Key': PARSE_REST_API_KEY,
  'Content-Type': 'application/json'
};

/**
 * Vérifie si une classe Parse existe
 * @param {string} className - Nom de la classe
 * @returns {Promise<boolean>} True si la classe existe
 */
async function classExists(className) {
  try {
    const response = await axios.get(`${PARSE_SERVER_URL}/schemas/${className}`, {
      headers: parseHeaders
    });
    return response.status === 200;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return false;
    }
    throw error;
  }
}

/**
 * Crée une classe Parse avec son schéma
 * @param {string} className - Nom de la classe
 * @param {Object} schema - Schéma de la classe
 * @returns {Promise<Object>} Résultat de la création
 */
async function createParseClass(className, schema) {
  try {
    const response = await axios.post(`${PARSE_SERVER_URL}/schemas/${className}`, schema, {
      headers: parseHeaders
    });
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la création de la classe ${className}:`, error.response?.data || error.message);
    throw error;
  }
}

/**
 * Initialise les collections nécessaires pour la gestion des configurations
 * @returns {Promise<Object>} Résultat de l'initialisation
 */
async function initializeSyncCollections() {
  console.log('🚀 Initialisation des collections de synchronisation...');
  
  const results = {
    SyncConfigs: null,
    DBCredentials: null,
    SyncLogs: null,
    VariablesGlobales: null
  };

  try {
    // 1. Créer la classe SyncConfigs si elle n'existe pas
    const syncConfigsExists = await classExists('SyncConfigs');
    if (!syncConfigsExists) {
      console.log('📋 Création de la classe SyncConfigs...');
      const syncConfigsSchema = {
        className: 'SyncConfigs',
        fields: {
          configId: { type: 'String', required: true },
          name: { type: 'String', required: true },
          description: { type: 'String' },
          dbConfig: {
            type: 'Object',
            required: true,
            fields: {
              host: { type: 'String', required: true },
              database: { type: 'String', required: true },
              user: { type: 'String', required: true },
              query: { type: 'String', required: true }
            }
          },
          parseConfig: {
            type: 'Object',
            required: true,
            fields: {
              mappings: { type: 'String', required: true },
              targetClass: { type: 'String', required: true }
            }
          },
          validationRules: {
            type: 'Object',
            required: true,
            fields: {
              requiredFields: { type: 'Array' },
              roleValues: { type: 'String' }
            }
          },
          frequency: { type: 'String', required: true },
          status: { type: 'String', required: true },
          createdBy: { type: 'Pointer', targetClass: '_User' },
          createdAt: { type: 'Date' },
          updatedAt: { type: 'Date' }
        },
        indexes: {
          configId: { configId: 1 }
        }
      };
      
      results.SyncConfigs = await createParseClass('SyncConfigs', syncConfigsSchema);
      console.log('✅ Classe SyncConfigs créée avec succès');
    } else {
      console.log('✅ Classe SyncConfigs existe déjà');
      results.SyncConfigs = { status: 'existing' };
    }

    // 2. Créer la classe DBCredentials si elle n'existe pas
    const dbCredentialsExists = await classExists('DBCredentials');
    if (!dbCredentialsExists) {
      console.log('🔐 Création de la classe DBCredentials...');
      const dbCredentialsSchema = {
        className: 'DBCredentials',
        fields: {
          configId: { type: 'String', required: true },
          username: { type: 'String', required: true },
          encryptedPassword: { type: 'String', required: true },
          createdAt: { type: 'Date' },
          updatedAt: { type: 'Date' }
        },
        indexes: {
          configId: { configId: 1 }
        }
      };
      
      results.DBCredentials = await createParseClass('DBCredentials', dbCredentialsSchema);
      console.log('✅ Classe DBCredentials créée avec succès');
    } else {
      console.log('✅ Classe DBCredentials existe déjà');
      results.DBCredentials = { status: 'existing' };
    }

    // 3. Créer la classe SyncLogs si elle n'existe pas
    const syncLogsExists = await classExists('SyncLogs');
    if (!syncLogsExists) {
      console.log('📝 Création de la classe SyncLogs...');
      const syncLogsSchema = {
        className: 'SyncLogs',
        fields: {
          configId: { type: 'String' },
          status: { type: 'String', required: true },
          details: { type: 'String', required: true },
          createdAt: { type: 'Date' }
        },
        indexes: {
          configId: { configId: 1 },
          createdAt: { createdAt: -1 }
        }
      };
      
      results.SyncLogs = await createParseClass('SyncLogs', syncLogsSchema);
      console.log('✅ Classe SyncLogs créée avec succès');
    } else {
      console.log('✅ Classe SyncLogs existe déjà');
      results.SyncLogs = { status: 'existing' };
    }

    // 4. Vérifier/initialiser VariablesGlobales.activeConfigs
    const variablesGlobalesExists = await classExists('VariablesGlobales');
    if (!variablesGlobalesExists) {
      console.log('🌐 Création de la classe VariablesGlobales...');
      const variablesGlobalesSchema = {
        className: 'VariablesGlobales',
        fields: {
          activeConfigs: { type: 'Array' },
          lastUpdated: { type: 'Date' }
        }
      };
      
      results.VariablesGlobales = await createParseClass('VariablesGlobales', variablesGlobalesSchema);
      console.log('✅ Classe VariablesGlobales créée avec succès');
      
      // Créer un enregistrement initial
      await axios.post(`${PARSE_SERVER_URL}/classes/VariablesGlobales`, {
        activeConfigs: [],
        lastUpdated: new Date().toISOString()
      }, { headers: parseHeaders });
      
      console.log('✅ Enregistrement initial VariablesGlobales créé');
      
    } else {
      console.log('✅ Classe VariablesGlobales existe déjà');
      results.VariablesGlobales = { status: 'existing' };
    }

    console.log('🎉 Initialisation des collections terminée avec succès !');
    console.log('\nRésumé:');
    console.log(`- SyncConfigs: ${results.SyncConfigs.status || 'créée'}`);
    console.log(`- DBCredentials: ${results.DBCredentials.status || 'créée'}`);
    console.log(`- SyncLogs: ${results.SyncLogs.status || 'créée'}`);
    console.log(`- VariablesGlobales: ${results.VariablesGlobales.status || 'créée'}`);
    
    return results;
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des collections:', error);
    throw error;
  }
}

// Exécuter le script
initializeSyncCollections()
  .then(results => {
    console.log('\n📊 Résultat final:', JSON.stringify(results, null, 2));
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Échec de l\'initialisation:', error);
    process.exit(1);
  });