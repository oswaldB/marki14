# Fiche d'Implémentation - Gestion des Configurations

**ID User Story** : 6992ff3c54e278e1e0a9cf21
**Titre** : Gestion des Configurations - US2.4 Interface Utilisateur
**Date** : 2026-02-17

## Préparation

- [x] Script `getParseData.sh` exécuté et fichier `data-model.md` lu
- [x] Contenu du dossier `guides/` lu et compris
- [x] Conformité avec les règles d'or et guides vérifiée

## Analyse de Conformité

La user story est conforme aux guides et au modèle de données. Les classes Parse nécessaires (`SyncConfigs`, `DBCredentials`, `VariablesGlobales`, `SyncLogs`) doivent être créées selon le modèle de données existant.

## Architecture Technique

### Approche Choisie

Conformément aux guides :
- **Parse REST via Axios** pour toutes les opérations CRUD
- **Pas de Fastify** (aucune demande explicite dans le prompt)
- **Pas de tests** (conformément à POLITIQUE-DE-TESTS.md)
- **State Alpine.js** pour la gestion d'état frontend

### Classes Parse à Créer

1. **SyncConfigs** - Configuration de synchronisation
2. **DBCredentials** - Credentials de base de données
3. **VariablesGlobales** - Variables globales du système
4. **SyncLogs** - Logs des opérations de synchronisation

## Todo Liste d'Implémentation

### 1. Backend - Parse REST API (Axios)

#### Fichier : `public/js/config/config-api.js`

```javascript
/**
 * Module API pour la gestion des configurations de synchronisation
 * @module config-api
 */

import axios from 'axios';

// Configuration Axios pour Parse
const parseApi = axios.create({
  baseURL: 'https://votre-serveur-parse.com/parse',
  headers: {
    'X-Parse-Application-Id': 'VOTRE_APPLICATION_ID',
    'X-Parse-Javascript-Key': 'VOTRE_JAVASCRIPT_KEY',
    'Content-Type': 'application/json'
  }
});

/**
 * Crée une nouvelle configuration de synchronisation
 * @param {Object} configData - Données de configuration
 * @param {string} configData.configId - ID de la configuration
 * @param {Object} configData.dbConfig - Configuration base de données
 * @param {Object} configData.parseConfig - Configuration Parse
 * @param {Object} configData.validationRules - Règles de validation
 * @returns {Promise<Object>} Configuration créée
 */
async function createSyncConfig(configData) {
  try {
    const response = await parseApi.post('/classes/SyncConfigs', configData);
    return response.data;
  } catch (error) {
    console.error('Erreur création configuration:', error);
    throw error;
  }
}

/**
 * Crée des credentials de base de données
 * @param {Object} credentials - Credentials à créer
 * @param {string} credentials.configId - ID de configuration associé
 * @param {string} credentials.username - Nom d'utilisateur
 * @param {string} credentials.encryptedPassword - Mot de passe chiffré
 * @returns {Promise<Object>} Credentials créés
 */
async function createDBCredentials(credentials) {
  try {
    const response = await parseApi.post('/classes/DBCredentials', credentials);
    return response.data;
  } catch (error) {
    console.error('Erreur création credentials:', error);
    throw error;
  }
}

/**
 * Met à jour les variables globales
 * @param {Object} updates - Mises à jour des variables globales
 * @returns {Promise<Object>} Variables globales mises à jour
 */
async function updateGlobalVariables(updates) {
  try {
    // Récupérer la variable globale existante
    const existing = await parseApi.get('/classes/VariablesGlobales');
    const globalVar = existing.data.results[0];
    
    const response = await parseApi.put(`/classes/VariablesGlobales/${globalVar.objectId}`, updates);
    return response.data;
  } catch (error) {
    console.error('Erreur mise à jour variables globales:', error);
    throw error;
  }
}

/**
 * Crée un log d'erreur
 * @param {Object} logData - Données du log
 * @param {string} logData.status - Statut (error, warning, info)
 * @param {string} logData.details - Détails de l'erreur
 * @param {string|null} logData.configId - ID de configuration
 * @returns {Promise<Object>} Log créé
 */
async function createSyncLog(logData) {
  try {
    const response = await parseApi.post('/classes/SyncLogs', logData);
    return response.data;
  } catch (error) {
    console.error('Erreur création log:', error);
    throw error;
  }
}

/**
 * Récupère toutes les configurations
 * @returns {Promise<Array>} Liste des configurations
 */
async function getAllSyncConfigs() {
  try {
    const response = await parseApi.get('/classes/SyncConfigs', {
      params: {
        include: 'parseConfig.targetClass'
      }
    });
    return response.data.results;
  } catch (error) {
    console.error('Erreur récupération configurations:', error);
    throw error;
  }
}

/**
 * Récupère une configuration par ID
 * @param {string} configId - ID de la configuration
 * @returns {Promise<Object>} Configuration
 */
async function getSyncConfigById(configId) {
  try {
    const response = await parseApi.get(`/classes/SyncConfigs/${configId}`, {
      params: {
        include: 'parseConfig.targetClass'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur récupération configuration:', error);
    throw error;
  }
}

/**
 * Met à jour une configuration
 * @param {string} configId - ID de la configuration
 * @param {Object} updates - Mises à jour
 * @returns {Promise<Object>} Configuration mise à jour
 */
async function updateSyncConfig(configId, updates) {
  try {
    const response = await parseApi.put(`/classes/SyncConfigs/${configId}`, updates);
    return response.data;
  } catch (error) {
    console.error('Erreur mise à jour configuration:', error);
    throw error;
  }
}

/**
 * Supprime une configuration
 * @param {string} configId - ID de la configuration
 * @returns {Promise<Object>} Résultat de la suppression
 */
async function deleteSyncConfig(configId) {
  try {
    const response = await parseApi.delete(`/classes/SyncConfigs/${configId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur suppression configuration:', error);
    throw error;
  }
}

/**
 * Teste une configuration
 * @param {string} configId - ID de la configuration
 * @returns {Promise<Object>} Résultat du test
 */
async function testSyncConfig(configId) {
  try {
    // 1. Récupérer la configuration et les credentials
    const config = await getSyncConfigById(configId);
    const credentials = await parseApi.get('/classes/DBCredentials', {
      params: {
        where: JSON.stringify({ configId })
      }
    });
    
    // 2. Décrypter le mot de passe (à implémenter)
    const decryptedPassword = decryptPassword(credentials.data.results[0].encryptedPassword);
    
    // 3. Exécuter la requête en mode test
    // Implémentation spécifique à la base de données
    const testResults = await executeTestQuery(config.dbConfig, decryptedPassword);
    
    // 4. Valider les colonnes requises
    const missingColumns = checkRequiredColumns(testResults, config.validationRules.requiredFields);
    
    if (missingColumns.length > 0) {
      return {
        success: false,
        error: 'Colonnes manquantes',
        missingColumns,
        sampleData: testResults.slice(0, 5)
      };
    }
    
    return {
      success: true,
      message: `Configuration valide - ${testResults.length} enregistrements trouvés`,
      sampleData: testResults.slice(0, 5),
      recordCount: testResults.length
    };
  } catch (error) {
    console.error('Erreur test configuration:', error);
    throw error;
  }
}

// Fonctions helpers (à implémenter)
function decryptPassword(encrypted) {
  // Implémentation du déchiffrement
  return encrypted;
}

async function executeTestQuery(dbConfig, password) {
  // Implémentation de l'exécution de la requête test
  return [];
}

function checkRequiredColumns(data, requiredFields) {
  // Implémentation de la vérification des colonnes
  return [];
}

export {
  createSyncConfig,
  createDBCredentials,
  updateGlobalVariables,
  createSyncLog,
  getAllSyncConfigs,
  getSyncConfigById,
  updateSyncConfig,
  deleteSyncConfig,
  testSyncConfig
};
```

### 2. Frontend - State Alpine.js

#### Fichier : `public/js/states/configurations/state-main.js`

```javascript
/**
 * State Alpine.js pour la gestion des configurations
 * @module configurations-state
 */

document.addEventListener('alpine:init', () => {
  Alpine.state('configurations', {
    // État initial
    configs: [],
    currentConfig: null,
    isLoading: false,
    error: null,
    showForm: false,
    showTestResults: false,
    testResults: null,
    
    // Formulaire
    formData: {
      configId: '',
      name: '',
      dbConfig: {
        host: '',
        database: '',
        user: '',
        query: ''
      },
      parseConfig: {
        mappings: '',
        targetClass: 'Impayes'
      },
      validationRules: {
        requiredFields: '',
        roleValues: ''
      },
      frequency: 'daily',
      status: 'active'
    },
    
    // Getters
    get activeConfigs() {
      return this.configs.filter(config => config.status === 'active');
    },
    
    get inactiveConfigs() {
      return this.configs.filter(config => config.status === 'inactive');
    },
    
    // Actions
    async init() {
      console.log('Initialisation du state configurations');
      await this.loadConfigs();
    },
    
    async loadConfigs() {
      this.isLoading = true;
      this.error = null;
      
      try {
        const { getAllSyncConfigs } = await import('/js/config/config-api.js');
        this.configs = await getAllSyncConfigs();
        console.log('Configurations chargées:', this.configs.length);
      } catch (error) {
        console.error('Erreur chargement configurations:', error);
        this.error = 'Failed to load configurations';
      } finally {
        this.isLoading = false;
      }
    },
    
    openForm() {
      this.showForm = true;
      this.currentConfig = null;
      this.resetForm();
      console.log('Formulaire ouvert pour nouvelle configuration');
    },
    
    editConfig(config) {
      this.currentConfig = config;
      this.formData = { ...config };
      this.showForm = true;
      console.log('Édition configuration:', config.configId);
    },
    
    resetForm() {
      this.formData = {
        configId: `config_${Date.now()}`,
        name: '',
        dbConfig: {
          host: '',
          database: '',
          user: '',
          query: ''
        },
        parseConfig: {
          mappings: '',
          targetClass: 'Impayes'
        },
        validationRules: {
          requiredFields: '',
          roleValues: ''
        },
        frequency: 'daily',
        status: 'active'
      };
    },
    
    async saveConfig() {
      console.log('Sauvegarde configuration:', this.formData);
      
      try {
        const { createSyncConfig, createDBCredentials, updateGlobalVariables } = 
          await import('/js/config/config-api.js');
        
        // 1. Créer la configuration
        const config = await createSyncConfig(this.formData);
        
        // 2. Créer les credentials
        await createDBCredentials({
          configId: config.configId,
          username: this.formData.dbConfig.user,
          encryptedPassword: '[chiffré]' // À implémenter
        });
        
        // 3. Mettre à jour les variables globales
        await updateGlobalVariables({
          activeConfigs: [...this.activeConfigs.map(c => c.configId), config.configId]
        });
        
        // 4. Rafraîchir la liste
        await this.loadConfigs();
        
        // 5. Réinitialiser le formulaire
        this.showForm = false;
        
        console.log('Configuration enregistrée avec succès');
        
        return { success: true, message: 'Configuration enregistrée avec succès' };
      } catch (error) {
        console.error('Erreur sauvegarde configuration:', error);
        this.error = error.message || 'Failed to save configuration';
        return { success: false, error: this.error };
      }
    },
    
    async testConfig(configId) {
      console.log('Test configuration:', configId);
      
      try {
        const { testSyncConfig } = await import('/js/config/config-api.js');
        const result = await testSyncConfig(configId);
        
        if (result.success) {
          this.testResults = result;
          this.showTestResults = true;
          console.log('Test réussi:', result.message);
        } else {
          this.error = result.error || 'Test failed';
          console.error('Test échoué:', result.error);
        }
        
        return result;
      } catch (error) {
        console.error('Erreur test configuration:', error);
        this.error = error.message || 'Failed to test configuration';
        return { success: false, error: this.error };
      }
    },
    
    async deleteConfig(configId) {
      console.log('Suppression configuration:', configId);
      
      try {
        const { deleteSyncConfig } = await import('/js/config/config-api.js');
        await deleteSyncConfig(configId);
        
        // Rafraîchir la liste
        await this.loadConfigs();
        
        console.log('Configuration supprimée avec succès');
        
        return { success: true, message: 'Configuration supprimée avec succès' };
      } catch (error) {
        console.error('Erreur suppression configuration:', error);
        this.error = error.message || 'Failed to delete configuration';
        return { success: false, error: this.error };
      }
    },
    
    closeTestResults() {
      this.showTestResults = false;
      this.testResults = null;
    }
  });
});
```

### 3. Frontend - Page Astro

#### Fichier : `src/pages/admin/configurations.astro`

```html
---
// Layout et metadata
---

<div class="container mx-auto px-4 py-8">
  <!-- Header -->
  <div class="flex justify-between items-center mb-8">
    <h1 class="text-2xl font-bold text-gray-900">Gestion des Configurations de Synchronisation</h1>
    <button 
      @click="$state.configurations.openForm()"
      class="bg-[#007ACE] text-white px-4 py-2 rounded-md hover:bg-[#006BCE] transition-colors"
    >
      <i class="fas fa-plus mr-2"></i> Nouvelle Configuration
    </button>
  </div>
  
  <!-- Message d'erreur -->
  <div x-show="$state.configurations.error" class="mb-4">
    <div class="bg-red-50 border border-red-200 rounded-md p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <i class="fas fa-exclamation-circle text-red-400 text-lg"></i>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-red-800">Erreur</p>
          <p class="text-sm text-red-700" x-text="$state.configurations.error"></p>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Liste des configurations -->
  <div class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base de données</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fréquence</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <template x-for="config in $state.configurations.configs" :key="config.configId">
            <tr>
              <td class="px-6 py-4 text-sm font-medium text-gray-900" x-text="config.name"></td>
              <td class="px-6 py-4 text-sm text-gray-500" x-text="config.dbConfig.database"></td>
              <td class="px-6 py-4 text-sm text-gray-500" x-text="config.frequency"></td>
              <td class="px-6 py-4">
                <span 
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="config.status === 'active' ? 'bg-[#00CF9B] text-white' : 'bg-gray-200 text-gray-800'"
                  x-text="config.status === 'active' ? 'Actif' : 'Désactivé'"
                ></span>
              </td>
              <td class="px-6 py-4 text-right text-sm font-medium">
                <button 
                  @click="$state.configurations.editConfig(config)"
                  class="text-[#007ACE] hover:text-[#006BCE] mr-2"
                  title="Éditer"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button 
                  @click="$state.configurations.testConfig(config.configId)"
                  class="text-[#00BDCF] hover:text-[#00ADC0] mr-2"
                  title="Tester"
                >
                  <i class="fas fa-vial"></i>
                </button>
                <button 
                  @click="$state.configurations.deleteConfig(config.configId)"
                  class="text-red-500 hover:text-red-600"
                  title="Supprimer"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
  
  <!-- Formulaire de configuration -->
  <div 
    x-show="$state.configurations.showForm"
    @click.away="$state.configurations.showForm = false"
    class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-y-auto max-h-[90vh]">
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-gray-900">
            <template x-if="!$state.configurations.currentConfig">
              Nouvelle Configuration
            </template>
            <template x-if="$state.configurations.currentConfig">
              Éditer Configuration
            </template>
          </h2>
          <button 
            @click="$state.configurations.showForm = false"
            class="text-gray-400 hover:text-gray-600"
          >
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <form @submit.prevent="$state.configurations.saveConfig()" class="space-y-6">
          <!-- Informations générales -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="configName" class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input 
                type="text" 
                id="configName" 
                x-model="$state.configurations.formData.name" 
                required 
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#007ACE] focus:border-transparent"
              >
            </div>
            <div>
              <label for="configId" class="block text-sm font-medium text-gray-700 mb-1">ID</label>
              <input 
                type="text" 
                id="configId" 
                x-model="$state.configurations.formData.configId" 
                readonly 
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
              >
            </div>
          </div>
          
          <!-- Configuration Base de Données -->
          <div class="border-t border-gray-200 pt-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Configuration Base de Données</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="dbHost" class="block text-sm font-medium text-gray-700 mb-1">Hôte</label>
                <input 
                  type="text" 
                  id="dbHost" 
                  x-model="$state.configurations.formData.dbConfig.host" 
                  required 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#007ACE] focus:border-transparent"
                >
              </div>
              <div>
                <label for="dbDatabase" class="block text-sm font-medium text-gray-700 mb-1">Base de données</label>
                <input 
                  type="text" 
                  id="dbDatabase" 
                  x-model="$state.configurations.formData.dbConfig.database" 
                  required 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#007ACE] focus:border-transparent"
                >
              </div>
              <div>
                <label for="dbUser" class="block text-sm font-medium text-gray-700 mb-1">Utilisateur BDD</label>
                <input 
                  type="text" 
                  id="dbUser" 
                  x-model="$state.configurations.formData.dbConfig.user" 
                  required 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#007ACE] focus:border-transparent"
                >
              </div>
              <div>
                <label for="dbPassword" class="block text-sm font-medium text-gray-700 mb-1">Mot de passe BDD</label>
                <input 
                  type="password" 
                  id="dbPassword" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#007ACE] focus:border-transparent"
                >
              </div>
            </div>
            
            <div class="mt-4">
              <label for="dbQuery" class="block text-sm font-medium text-gray-700 mb-1">Requête SQL</label>
              <textarea 
                id="dbQuery" 
                x-model="$state.configurations.formData.dbConfig.query" 
                rows="4" 
                required 
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#007ACE] focus:border-transparent"
              ></textarea>
            </div>
          </div>
          
          <!-- Configuration Parse -->
          <div class="border-t border-gray-200 pt-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Configuration Parse</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="mappings" class="block text-sm font-medium text-gray-700 mb-1">Mappings</label>
                <input 
                  type="text" 
                  id="mappings" 
                  x-model="$state.configurations.formData.parseConfig.mappings" 
                  placeholder="email→email_contact, amount→montant" 
                  required 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#007ACE] focus:border-transparent"
                >
              </div>
              <div>
                <label for="targetClass" class="block text-sm font-medium text-gray-700 mb-1">Classe cible</label>
                <select 
                  id="targetClass" 
                  x-model="$state.configurations.formData.parseConfig.targetClass" 
                  required 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#007ACE] focus:border-transparent"
                >
                  <option value="Impayes">Impayes</option>
                  <!-- Autres classes si nécessaire -->
                </select>
              </div>
            </div>
          </div>
          
          <!-- Règles de validation -->
          <div class="border-t border-gray-200 pt-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Règles de Validation</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="requiredFields" class="block text-sm font-medium text-gray-700 mb-1">Champs requis</label>
                <input 
                  type="text" 
                  id="requiredFields" 
                  x-model="$state.configurations.formData.validationRules.requiredFields" 
                  placeholder="email, amount, due_date" 
                  required 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#007ACE] focus:border-transparent"
                >
              </div>
              <div>
                <label for="roleValues" class="block text-sm font-medium text-gray-700 mb-1">Valeurs de rôle</label>
                <input 
                  type="text" 
                  id="roleValues" 
                  x-model="$state.configurations.formData.validationRules.roleValues" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#007ACE] focus:border-transparent"
                >
              </div>
            </div>
          </div>
          
          <!-- Paramètres supplémentaires -->
          <div class="border-t border-gray-200 pt-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Paramètres Supplémentaires</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="frequency" class="block text-sm font-medium text-gray-700 mb-1">Fréquence</label>
                <select 
                  id="frequency" 
                  x-model="$state.configurations.formData.frequency" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#007ACE] focus:border-transparent"
                >
                  <option value="daily">Quotidienne</option>
                  <option value="weekly">Hebdomadaire</option>
                  <option value="monthly">Mensuelle</option>
                  <option value="manual">Manuelle</option>
                </select>
              </div>
              <div>
                <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select 
                  id="status" 
                  x-model="$state.configurations.formData.status" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#007ACE] focus:border-transparent"
                >
                  <option value="active">Activé</option>
                  <option value="inactive">Désactivé</option>
                </select>
              </div>
            </div>
          </div>
          
          <!-- Boutons -->
          <div class="border-t border-gray-200 pt-6 flex justify-end space-x-3">
            <button 
              type="button" 
              @click="$state.configurations.showForm = false"
              class="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              Annuler
            </button>
            <button 
              type="submit"
              class="bg-[#007ACE] text-white px-4 py-2 rounded-md hover:bg-[#006BCE] transition-colors"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  
  <!-- Résultats de test -->
  <div 
    x-show="$state.configurations.showTestResults"
    @click.away="$state.configurations.closeTestResults()"
    class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-y-auto max-h-[90vh]">
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-gray-900">Résultats du Test</h2>
          <button 
            @click="$state.configurations.closeTestResults()"
            class="text-gray-400 hover:text-gray-600"
          >
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <template x-if="$state.configurations.testResults.success">
          <div class="mb-6">
            <div class="bg-[#00CF9B] bg-opacity-20 border border-[#00CF9B] rounded-md p-4 mb-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <i class="fas fa-check-circle text-[#00CF9B] text-lg"></i>
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-[#00CF9B]">Succès</p>
                  <p class="text-sm text-gray-700" x-text="$state.configurations.testResults.message"></p>
                </div>
              </div>
            </div>
            
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <template x-for="column in Object.keys($state.configurations.testResults.sampleData[0] || {})">
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase" x-text="column"></th>
                    </template>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <template x-for="row in $state.configurations.testResults.sampleData" :key="$index">
                    <tr>
                      <template x-for="column in Object.keys(row)">
                        <td class="px-4 py-3 text-sm text-gray-500" x-text="row[column]"></td>
                      </template>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </div>
        </template>
        
        <template x-if="!$state.configurations.testResults.success">
          <div class="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <i class="fas fa-exclamation-circle text-red-400 text-lg"></i>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-red-800">Erreur</p>
                <p class="text-sm text-red-700" x-text="$state.configurations.testResults.error"></p>
                <template x-if="$state.configurations.testResults.missingColumns">
                  <p class="text-sm text-red-700 mt-1">
                    Colonnes manquantes: <span x-text="$state.configurations.testResults.missingColumns.join(', ')"></span>
                  </p>
                </template>
              </div>
            </div>
          </div>
        </template>
        
        <div class="flex justify-end">
          <button 
            @click="$state.configurations.closeTestResults()"
            class="bg-[#007ACE] text-white px-4 py-2 rounded-md hover:bg-[#006BCE] transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
  // Initialisation du state
  document.addEventListener('DOMContentLoaded', () => {
    if (window.Alpine) {
      Alpine.state('configurations').init();
    }
  });
</script>
```

### 4. Intégration dans le Menu

#### Fichier : `src/components/SideMenu.astro`

Ajouter un lien vers la page de gestion des configurations dans le menu d'administration :

```html
<!-- Dans la section Admin -->
<li>
  <a 
    href="/admin/configurations"
    class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
  >
    <i class="fas fa-cog mr-3"></i>
    Configurations
  </a>
</li>
```

## Validation des Règles d'Or

- [x] **Pas de Parse Cloud** : Utilisation exclusive de Parse REST via Axios
- [x] **Pas de dossier utils/** : Toutes les fonctions sont dans les modules spécifiques
- [x] **Pas de Fastify** : Aucune demande explicite pour Fastify
- [x] **Pas de composants Astro** : Utilisation exclusive de pages Astro
- [x] **Font Awesome uniquement** : Utilisation exclusive des icônes Font Awesome
- [x] **Pas de CSS personnalisé** : Utilisation exclusive de Tailwind CSS
- [x] **Pas de tests** : Conformément à la politique de tests
- [x] **Console.log** : Tous les événements Alpine.js sont logués

## Points d'Attention

1. **Chiffrement des mots de passe** : Implémenter une fonction de chiffrement/déchiffrement sécurisée
2. **Validation SQL** : Ajouter une validation pour détecter les tentatives d'injection SQL
3. **Gestion des erreurs** : Compléter la gestion des erreurs pour tous les cas d'usage
4. **Sécurité** : Vérifier les permissions d'accès à la page d'administration

## Dépendances

- Axios pour les appels API Parse REST
- Alpine.js pour la gestion d'état
- Font Awesome pour les icônes
- Tailwind CSS pour le styling

## Conclusion

Cette implémentation suit strictement les guides du projet et le modèle de données. Elle utilise Parse REST via Axios pour le backend et Alpine.js pour la gestion d'état frontend, sans aucun test conformément à la politique du projet.
