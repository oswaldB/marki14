/**
 * Script Cron pour exécuter les synchronisations
 * Ce script sera appelé directement par le cron du système
 * Utilise Parse REST via Axios directement, sans passer par Fastify
 */

const { executeSync } = require('./syncConfigService');
const axios = require('axios');

/**
 * Exécute toutes les synchronisations activées
 */
async function runSyncCronJob() {
  try {
    console.log('Démarrage du job cron de synchronisation...');
    
    // Récupérer toutes les configurations activées directement depuis Parse via Axios
    const response = await axios.get(`${process.env.PARSE_SERVER_URL.replace(/\/$/, '')}/parse/classes/SyncConfigs`, {
      params: {
        where: JSON.stringify({ enabled: true })
      },
      headers: {
        'X-Parse-Application-Id': process.env.PARSE_APP_ID,
        'X-Parse-REST-API-Key': process.env.PARSE_REST_API_KEY
      }
    });
    
    const configs = response.data.results;
    
    if (!configs || configs.length === 0) {
      console.log('Aucune configuration activée trouvée');
      return { success: true, message: 'No enabled configurations found' };
    }
    
    console.log(`Trouvé ${configs.length} configurations activées`);
    
    // Exécuter la synchronisation pour chaque configuration
    const results = [];
    for (const config of configs) {
      console.log(`Exécution de la synchronisation pour ${config.configId}`);
      const result = await executeSync(config.configId);
      results.push(result);
    }
    
    console.log('Job cron de synchronisation terminé');
    return {
      success: true,
      configsProcessed: configs.length,
      results,
      message: 'All enabled synchronizations executed successfully'
    };
  } catch (error) {
    console.error('Erreur dans le job cron de synchronisation:', error);
    throw error;
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  runSyncCronJob()
    .then(result => {
      console.log('Résultat final:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('Échec du job cron:', error);
      process.exit(1);
    });
}

module.exports = { runSyncCronJob };