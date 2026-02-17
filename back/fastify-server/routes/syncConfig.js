// Sync Configuration Routes for Fastify
// This implements the sync configuration functionality as Fastify routes
// that will communicate with Parse Server

import { parseRequest, queryParseObjects } from '../utils/parseUtils.js'
import crypto from 'crypto'

// SQL injection detection keywords
const SQL_KEYWORDS = ['DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'EXEC', 'INSERT INTO', 'UPDATE', 'CREATE', 'GRANT', 'REVOKE', 'UNION', 'EXECUTE']

/**
 * Check for SQL injection in a query
 * @param {string} query - SQL query to validate
 * @returns {boolean} - True if SQL injection detected
 */
function hasSqlInjection(query) {
  const upperQuery = query.toUpperCase()
  return SQL_KEYWORDS.some(keyword => upperQuery.includes(keyword))
}

/**
 * Generate a unique config ID
 * @returns {string} - Generated config ID
 */
function generateConfigId() {
  return 'sync-' + crypto.randomBytes(8).toString('hex')
}

/**
 * Encrypt password (simple implementation - in production use proper encryption)
 * @param {string} password - Password to encrypt
 * @returns {string} - Encrypted password
 */
function encryptPassword(password) {
  // In production, use proper encryption like bcrypt or AES
  // This is a simple placeholder
  return Buffer.from(password).toString('base64')
}

/**
 * Decrypt password
 * @param {string} encryptedPassword - Encrypted password
 * @returns {string} - Decrypted password
 */
function decryptPassword(encryptedPassword) {
  return Buffer.from(encryptedPassword, 'base64').toString('utf8')
}

/**
 * Validate sync configuration data
 * @param {Object} configData - Configuration data to validate
 * @throws {Error} - If validation fails
 */
function validateConfigData(configData) {
  const errors = []
  
  if (!configData.name || configData.name.length > 100) {
    errors.push('Nom invalide')
  }
  
  if (!configData.dbConfig || !configData.dbConfig.host) {
    errors.push('Configuration de base de données incomplète')
  }
  
  if (!configData.parseConfig || !configData.parseConfig.targetClass) {
    errors.push('Configuration Parse incomplète')
  }
  
  if (errors.length > 0) {
    throw new Error(errors.join(', '))
  }
}

/**
 * Save credentials to Parse DBCredentials class
 * @param {string} configId - Configuration ID
 * @param {Object} credentials - Database credentials
 */
async function saveCredentials(configId, credentials) {
  try {
    const credentialsData = {
      configId: configId,
      username: credentials.username,
      encryptedPassword: encryptPassword(credentials.password),
      ACL: {
        '*': { read: false, write: false },
        'role:Admin': { read: true, write: true }
      }
    }
    
    // Save to Parse DBCredentials class
    await parseRequest('saveDBCredentials', { credentials: credentialsData })
  } catch (error) {
    console.error('Error saving credentials:', error)
    throw new Error('Failed to save credentials')
  }
}

/**
 * Get credentials from Parse DBCredentials class
 * @param {string} configId - Configuration ID
 * @returns {Object} - Database credentials
 */
async function getCredentials(configId) {
  try {
    const credentials = await queryParseObjects('DBCredentials', {
      where: { configId: configId }
    })
    
    if (!credentials || credentials.length === 0) {
      throw new Error('Credentials not found')
    }
    
    return credentials[0]
  } catch (error) {
    console.error('Error getting credentials:', error)
    throw new Error('Failed to get credentials')
  }
}

/**
 * Create a sync log entry
 * @param {string} configId - Configuration ID
 * @param {string} status - Status (success, error, warning)
 * @param {string} details - Details message
 * @param {number} recordsProcessed - Number of records processed
 */
async function createSyncLog(configId, status, details, recordsProcessed = 0) {
  try {
    const logData = {
      configId: configId,
      status: status,
      details: details,
      recordsProcessed: recordsProcessed,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      ACL: {
        '*': { read: false, write: false },
        'role:Admin': { read: true, write: true }
      }
    }
    
    await parseRequest('createSyncLog', { logData })
  } catch (error) {
    console.error('Error creating sync log:', error)
    // Don't throw to avoid breaking the main flow
  }
}

/**
 * Update global variables with active sync configs
 * @param {string} configId - Configuration ID
 * @param {boolean} isActive - Whether config is active
 */
async function updateGlobalVariables(configId, isActive) {
  try {
    // Get current global variables
    const globalVars = await queryParseObjects('VariablesGlobales', {})
    let currentVars = {}
    
    if (globalVars && globalVars.length > 0) {
      currentVars = globalVars[0]
    }
    
    const currentConfigs = currentVars.activeSyncConfigs || []
    
    if (isActive && !currentConfigs.includes(configId)) {
      currentConfigs.push(configId)
    } else if (!isActive) {
      const index = currentConfigs.indexOf(configId)
      if (index > -1) {
        currentConfigs.splice(index, 1)
      }
    }
    
    // Update global variables
    await parseRequest('updateGlobalVariables', {
      activeSyncConfigs: currentConfigs
    })
  } catch (error) {
    console.error('Error updating global variables:', error)
    throw new Error('Failed to update global variables')
  }
}

export default async function (fastify) {
  
  // POST /api/sync-configs - Create a new sync configuration
  fastify.post('/api/sync-configs', async (request, reply) => {
    try {
      const { configData, credentials } = request.body
      
      // Validate SQL injection
      if (hasSqlInjection(configData.dbConfig.query)) {
        return reply.code(400).send({
          success: false,
          error: 'Requête SQL non autorisée',
          message: 'La requête contient des mots-clés SQL interdits'
        })
      }
      
      // Validate config data
      validateConfigData(configData)
      
      // Generate config ID
      const configId = generateConfigId()
      
      // Prepare sync config data
      const syncConfigData = {
        configId: configId,
        name: configData.name,
        description: configData.description || '',
        isActive: configData.isActive || false,
        isAuto: configData.isAuto || false,
        frequency: configData.frequency || 'Quotidienne',
        dbConfig: configData.dbConfig,
        parseConfig: configData.parseConfig,
        validationRules: configData.validationRules || {},
        createdBy: request.user?.id || 'system',
        ACL: {
          '*': { read: false, write: false },
          'role:Admin': { read: true, write: true },
          [request.user?.id || '']: { read: true, write: true }
        }
      }
      
      // Save sync config to Parse
      await parseRequest('createSyncConfig', { configData: syncConfigData })
      
      // Save credentials
      await saveCredentials(configId, credentials)
      
      // Update global variables if active
      if (configData.isActive) {
        await updateGlobalVariables(configId, true)
      }
      
      // Create success log
      await createSyncLog(configId, 'success', 'Configuration créée avec succès')
      
      return {
        success: true,
        configId: configId,
        message: 'Configuration de synchronisation créée avec succès'
      }
    } catch (error) {
      fastify.log.error('Error creating sync config:', error)
      return reply.code(500).send({
        success: false,
        error: error.message,
        message: 'Erreur lors de la création de la configuration'
      })
    }
  })
  
  // GET /api/sync-configs - Get sync configurations
  fastify.get('/api/sync-configs', async (request, reply) => {
    try {
      const { filter, limit, skip } = request.query
      
      let query = {}
      
      if (filter === 'active') {
        query.where = { isActive: true }
      } else if (filter === 'auto') {
        query.where = { isAuto: true }
      }
      
      if (limit) query.limit = parseInt(limit)
      if (skip) query.skip = parseInt(skip)
      
      query.order = '-createdAt'
      
      const configs = await queryParseObjects('SyncConfigs', query)
      
      return {
        success: true,
        count: configs.length,
        data: configs,
        message: 'Configurations récupérées avec succès'
      }
    } catch (error) {
      fastify.log.error('Error getting sync configs:', error)
      return reply.code(500).send({
        success: false,
        error: error.message,
        message: 'Erreur lors de la récupération des configurations'
      })
    }
  })
  
  // POST /api/sync-configs/:configId/test - Test a sync configuration
  fastify.post('/api/sync-configs/:configId/test', async (request, reply) => {
    try {
      const { configId } = request.params
      
      // Get the configuration
      const configs = await queryParseObjects('SyncConfigs', {
        where: { configId: configId }
      })
      
      if (!configs || configs.length === 0) {
        return reply.code(404).send({
          success: false,
          error: 'Configuration non trouvée',
          message: 'Aucune configuration avec cet ID'
        })
      }
      
      const config = configs[0]
      
      // Get credentials
      const credentials = await getCredentials(configId)
      const password = decryptPassword(credentials.encryptedPassword)
      
      // Validate SQL injection again
      if (hasSqlInjection(config.dbConfig.query)) {
        return reply.code(400).send({
          success: false,
          error: 'Requête SQL non autorisée',
          message: 'La requête contient des mots-clés SQL interdits'
        })
      }
      
      // Execute test query (limited to 10 records)
      const testQuery = `${config.dbConfig.query} LIMIT 10`
      
      // In a real implementation, this would connect to the external database
      // For now, we'll simulate a successful test
      const sampleData = [
        { id: 1, name: 'Test Record 1', value: 'Sample Value 1' },
        { id: 2, name: 'Test Record 2', value: 'Sample Value 2' }
      ]
      
      // Create test log
      await createSyncLog(configId, 'success', `Test réussi - ${sampleData.length} enregistrements trouvés`, sampleData.length)
      
      return {
        success: true,
        sampleData: sampleData,
        totalRecords: sampleData.length,
        message: 'Test de configuration réussi'
      }
    } catch (error) {
      fastify.log.error('Error testing sync config:', error)
      
      // Create error log
      try {
        await createSyncLog(request.params.configId, 'error', error.message)
      } catch (logError) {
        console.error('Failed to create error log:', logError)
      }
      
      return reply.code(500).send({
        success: false,
        error: error.message,
        message: 'Erreur lors du test de la configuration'
      })
    }
  })
  
  // PUT /api/sync-configs/:configId - Update a sync configuration
  fastify.put('/api/sync-configs/:configId', async (request, reply) => {
    try {
      const { configId } = request.params
      const { configData } = request.body
      
      // Validate SQL injection
      if (configData.dbConfig && hasSqlInjection(configData.dbConfig.query)) {
        return reply.code(400).send({
          success: false,
          error: 'Requête SQL non autorisée',
          message: 'La requête contient des mots-clés SQL interdits'
        })
      }
      
      // Validate config data
      validateConfigData(configData)
      
      // Get existing config
      const existingConfigs = await queryParseObjects('SyncConfigs', {
        where: { configId: configId }
      })
      
      if (!existingConfigs || existingConfigs.length === 0) {
        return reply.code(404).send({
          success: false,
          error: 'Configuration non trouvée',
          message: 'Aucune configuration avec cet ID'
        })
      }
      
      const existingConfig = existingConfigs[0]
      
      // Prepare update data
      const updateData = {
        name: configData.name || existingConfig.name,
        description: configData.description || existingConfig.description,
        isActive: configData.isActive !== undefined ? configData.isActive : existingConfig.isActive,
        isAuto: configData.isAuto !== undefined ? configData.isAuto : existingConfig.isAuto,
        frequency: configData.frequency || existingConfig.frequency,
        dbConfig: configData.dbConfig || existingConfig.dbConfig,
        parseConfig: configData.parseConfig || existingConfig.parseConfig,
        validationRules: configData.validationRules || existingConfig.validationRules
      }
      
      // Update sync config in Parse
      await parseRequest('updateSyncConfig', { 
        configId: configId,
        updateData: updateData 
      })
      
      // Update global variables if active status changed
      if (configData.isActive !== undefined && configData.isActive !== existingConfig.isActive) {
        await updateGlobalVariables(configId, configData.isActive)
      }
      
      // Create success log
      await createSyncLog(configId, 'success', 'Configuration mise à jour avec succès')
      
      return {
        success: true,
        configId: configId,
        message: 'Configuration de synchronisation mise à jour avec succès'
      }
    } catch (error) {
      fastify.log.error('Error updating sync config:', error)
      return reply.code(500).send({
        success: false,
        error: error.message,
        message: 'Erreur lors de la mise à jour de la configuration'
      })
    }
  })
  
  // DELETE /api/sync-configs/:configId - Delete a sync configuration
  fastify.delete('/api/sync-configs/:configId', async (request, reply) => {
    try {
      const { configId } = request.params
      
      // Get existing config
      const existingConfigs = await queryParseObjects('SyncConfigs', {
        where: { configId: configId }
      })
      
      if (!existingConfigs || existingConfigs.length === 0) {
        return reply.code(404).send({
          success: false,
          error: 'Configuration non trouvée',
          message: 'Aucune configuration avec cet ID'
        })
      }
      
      // Delete sync config from Parse
      await parseRequest('deleteSyncConfig', { configId: configId })
      
      // Delete credentials
      try {
        await parseRequest('deleteDBCredentials', { configId: configId })
      } catch (credError) {
        console.error('Error deleting credentials:', credError)
        // Continue with deletion even if credentials deletion fails
      }
      
      // Update global variables (remove from active configs)
      await updateGlobalVariables(configId, false)
      
      // Create success log
      await createSyncLog(configId, 'success', 'Configuration supprimée avec succès')
      
      return {
        success: true,
        configId: configId,
        message: 'Configuration de synchronisation supprimée avec succès'
      }
    } catch (error) {
      fastify.log.error('Error deleting sync config:', error)
      return reply.code(500).send({
        success: false,
        error: error.message,
        message: 'Erreur lors de la suppression de la configuration'
      })
    }
  })
  
  // POST /api/sync-configs/:configId/run - Run a sync configuration manually
  fastify.post('/api/sync-configs/:configId/run', async (request, reply) => {
    try {
      const { configId } = request.params
      
      // Get the configuration
      const configs = await queryParseObjects('SyncConfigs', {
        where: { configId: configId }
      })
      
      if (!configs || configs.length === 0) {
        return reply.code(404).send({
          success: false,
          error: 'Configuration non trouvée',
          message: 'Aucune configuration avec cet ID'
        })
      }
      
      const config = configs[0]
      
      // Get credentials
      const credentials = await getCredentials(configId)
      const password = decryptPassword(credentials.encryptedPassword)
      
      // Create start log
      await createSyncLog(configId, 'info', 'Synchronisation manuelle démarrée')
      
      // In a real implementation, this would:
      // 1. Connect to the external database
      // 2. Execute the query
      // 3. Transform data to Parse format
      // 4. Save to Parse
      
      // For now, we'll simulate a successful sync
      const recordsProcessed = Math.floor(Math.random() * 100) + 1
      
      // Create success log
      await createSyncLog(configId, 'success', `Synchronisation manuelle réussie - ${recordsProcessed} enregistrements traités`, recordsProcessed)
      
      return {
        success: true,
        recordsProcessed: recordsProcessed,
        message: 'Synchronisation manuelle exécutée avec succès'
      }
    } catch (error) {
      fastify.log.error('Error running sync config:', error)
      
      // Create error log
      try {
        await createSyncLog(request.params.configId, 'error', error.message)
      } catch (logError) {
        console.error('Failed to create error log:', logError)
      }
      
      return reply.code(500).send({
        success: false,
        error: error.message,
        message: 'Erreur lors de l\'exécution de la synchronisation'
      })
    }
  })
  
  // GET /api/sync-configs/:configId/logs - Get sync logs for a configuration
  fastify.get('/api/sync-configs/:configId/logs', async (request, reply) => {
    try {
      const { configId } = request.params
      const { limit, skip } = request.query
      
      let query = {
        where: { configId: configId },
        order: '-createdAt'
      }
      
      if (limit) query.limit = parseInt(limit)
      if (skip) query.skip = parseInt(skip)
      
      const logs = await queryParseObjects('SyncLogs', query)
      
      return {
        success: true,
        count: logs.length,
        data: logs,
        message: 'Logs de synchronisation récupérés avec succès'
      }
    } catch (error) {
      fastify.log.error('Error getting sync logs:', error)
      return reply.code(500).send({
        success: false,
        error: error.message,
        message: 'Erreur lors de la récupération des logs'
      })
    }
  })
}