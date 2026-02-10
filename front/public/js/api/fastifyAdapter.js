// Adaptateur Fastify pour remplacer Parse.Cloud.run()
// Ce module permet au frontend d'utiliser les nouveaux endpoints Fastify
// au lieu des fonctions Parse Cloud

const API_BASE_URL = 'https://dev.api.markidiags.com/api';

/**
 * Adaptateur principal pour remplacer Parse.Cloud.run()
 * @param {string} functionName - Nom de la fonction Parse Cloud
 * @param {Object} params - Paramètres à passer à la fonction
 * @returns {Promise<Object>} - Résultat de l'appel API
 */
async function fastifyCloudRun(functionName, params = {}) {
  try {
    // Mapper les noms de fonctions Parse Cloud aux nouveaux endpoints Fastify
    const endpointMap = {
      // Fonctions déjà migrées
      'getDistinctValues': { method: 'GET', endpoint: `/distinct-values/${params.columnName}`, queryParams: { limit: params.limit } },
      'getInvoicePdf': { method: 'POST', endpoint: '/invoice-pdf', body: { invoiceId: params.invoiceId } },
      'sendTestEmail': { method: 'POST', endpoint: '/test-email', body: params },
      'initCollections': { method: 'POST', endpoint: '/initCollections', body: params },
      'syncImpayes': { method: 'POST', endpoint: '/sync-impayes', body: params },
      'generateEmailWithOllama': { method: 'POST', endpoint: '/generate-email', body: params },
      'generateSingleEmailWithAI': { method: 'POST', endpoint: '/generate-single-email', body: params },
      'populateRelanceSequence': { method: 'POST', endpoint: '/populate-relance-sequence', body: params },
      'cleanupRelancesOnDeactivate': { method: 'POST', endpoint: '/cleanup-relances', body: params },
      'handleManualSequenceAssignment': { method: 'POST', endpoint: '/assign-sequence', body: params }
    };

    const mapping = endpointMap[functionName];
    
    if (!mapping) {
      console.warn(`⚠️ Fonction Parse Cloud '${functionName}' non encore migrée vers Fastify`);
      return { success: false, error: `Fonction ${functionName} non disponible` };
    }

    // Construire l'URL complète
    const url = `${API_BASE_URL}${mapping.endpoint}`;
    
    // Préparer les options de requête
    const options = {
      method: mapping.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    // Ajouter le body si nécessaire
    if (mapping.body) {
      options.body = JSON.stringify(mapping.body);
    }

    // Ajouter les query params si nécessaire
    if (mapping.queryParams) {
      const queryString = new URLSearchParams(mapping.queryParams).toString();
      url = `${url}?${queryString}`;
    }

    console.log(`🔄 Appel Fastify: ${mapping.method} ${url}`);
    
    // Effectuer la requête
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log(`✅ Réponse Fastify pour ${functionName}:`, data);
    
    return data;
    
  } catch (error) {
    console.error(`❌ Erreur dans fastifyCloudRun pour ${functionName}:`, error);
    throw error;
  }
}

/**
 * Remplacement direct de Parse.Cloud.run()
 * @param {string} functionName - Nom de la fonction
 * @param {Object} params - Paramètres
 * @returns {Promise<Object>} - Résultat
 */
async function ParseCloudRun(functionName, params) {
  return fastifyCloudRun(functionName, params);
}

// Exporter pour compatibilité
window.Parse = window.Parse || {};
window.Parse.Cloud = window.Parse.Cloud || {};
window.Parse.Cloud.run = ParseCloudRun;

// Exporter aussi la fonction directement
export { fastifyCloudRun, ParseCloudRun };

default fastifyCloudRun;