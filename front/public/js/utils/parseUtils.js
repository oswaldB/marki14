/**
 * Services utilitaires pour interagir avec les classes Parse
 * @module parseUtils
 */

import parseApi from './parse-api.js';

/**
 * Service pour gérer les configurations de synchronisation
 */
export const SyncConfigService = {
  
  /**
   * Crée une nouvelle configuration de synchronisation
   * @param {Object} config - La configuration à créer
   * @returns {Promise<Object>} La configuration créée
   */
  async create(config) {
    const response = await parseApi.post('/classes/SyncConfigs', config);
    return response.data;
  },
  
  /**
   * Récupère toutes les configurations
   * @returns {Promise<Array>} Liste des configurations
   */
  async getAll() {
    const response = await parseApi.get('/classes/SyncConfigs');
    return response.data.results;
  },
  
  /**
   * Récupère une configuration par son ID
   * @param {string} configId - L'ID de la configuration
   * @returns {Promise<Object>} La configuration
   */
  async getById(configId) {
    const response = await parseApi.get(`/classes/SyncConfigs/${configId}`);
    return response.data;
  },
  
  /**
   * Met à jour une configuration
   * @param {string} configId - L'ID de la configuration
   * @param {Object} updates - Les mises à jour
   * @returns {Promise<Object>} La configuration mise à jour
   */
  async update(configId, updates) {
    const response = await parseApi.put(`/classes/SyncConfigs/${configId}`, updates);
    return response.data;
  },
  
  /**
   * Supprime une configuration
   * @param {string} configId - L'ID de la configuration
   * @returns {Promise<Object>} Résultat de la suppression
   */
  async delete(configId) {
    const response = await parseApi.delete(`/classes/SyncConfigs/${configId}`);
    return response.data;
  }
};

/**
 * Service pour gérer les identifiants de base de données
 */
export const DBCredentialsService = {
  
  /**
   * Crée de nouveaux identifiants
   * @param {Object} credentials - Les identifiants à créer
   * @returns {Promise<Object>} Les identifiants créés
   */
  async create(credentials) {
    const response = await parseApi.post('/classes/DBCredentials', credentials);
    return response.data;
  },
  
  /**
   * Récupère les identifiants par configId
   * @param {string} configId - L'ID de la configuration
   * @returns {Promise<Object>} Les identifiants
   */
  async getByConfigId(configId) {
    const response = await parseApi.get('/classes/DBCredentials', {
      params: {
        where: JSON.stringify({ configId })
      }
    });
    return response.data.results[0];
  }
};

/**
 * Service pour gérer les logs de synchronisation
 */
export const SyncLogsService = {
  
  /**
   * Crée un nouveau log
   * @param {Object} log - Le log à créer
   * @returns {Promise<Object>} Le log créé
   */
  async create(log) {
    const response = await parseApi.post('/classes/SyncLogs', log);
    return response.data;
  }
};

/**
 * Service pour gérer les variables globales
 */
export const GlobalVariablesService = {
  
  /**
   * Récupère les variables globales
   * @returns {Promise<Object>} Les variables globales
   */
  async get() {
    const response = await parseApi.get('/classes/VariablesGlobales');
    return response.data.results[0] || {};
  },
  
  /**
   * Met à jour les variables globales
   * @param {Object} updates - Les mises à jour
   * @returns {Promise<Object>} Les variables mises à jour
   */
  async update(updates) {
    const globalVars = await this.get();
    const objectId = globalVars.objectId || 'globalVariablesId';
    
    const response = await parseApi.put(`/classes/VariablesGlobales/${objectId}`, updates);
    return response.data;
  }
};