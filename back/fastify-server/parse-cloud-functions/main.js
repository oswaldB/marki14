/**
 * Parse Cloud Code - Main.js
 * Création des classes Parse pour la gestion des configurations de synchronisation
 */

// Initialisation des classes Parse au démarrage
Parse.Cloud.define("initializeSyncClasses", async (request) => {
  try {
    // Créer la classe SyncConfigs
    await createSyncConfigsClass();
    
    // Créer la classe DBCredentials
    await createDBCredentialsClass();
    
    // Créer la classe SyncLogs
    await createSyncLogsClass();
    
    return { success: true, message: "Classes Parse initialisées avec succès" };
  } catch (error) {
    console.error("Erreur lors de l'initialisation des classes:", error);
    return { success: false, error: error.message };
  }
});

/**
 * Crée la classe SyncConfigs dans Parse
 * @returns {Promise<Object>} La classe créée
 */
async function createSyncConfigsClass() {
  const classSchema = {
    className: 'SyncConfigs',
    fields: {
      configId: { type: 'String', required: true },
      name: { type: 'String', required: true },
      description: { type: 'String' },
      dbConfig: { type: 'Object', required: true },
      parseConfig: { type: 'Object', required: true },
      validationRules: { type: 'Object', required: true },
      frequency: { type: 'String', required: true },
      status: { type: 'String', required: true },
      createdBy: { type: 'Pointer', targetClass: '_User' },
      updatedBy: { type: 'Pointer', targetClass: '_User' }
    },
    classLevelPermissions: {
      find: { 'role:admin': true },
      get: { 'role:admin': true },
      create: { 'role:admin': true },
      update: { 'role:admin': true },
      delete: { 'role:admin': true }
    }
  };
  
  return await Parse.Schema.create(classSchema);
}

/**
 * Crée la classe DBCredentials dans Parse
 * @returns {Promise<Object>} La classe créée
 */
async function createDBCredentialsClass() {
  const classSchema = {
    className: 'DBCredentials',
    fields: {
      configId: { type: 'String', required: true },
      username: { type: 'String', required: true },
      encryptedPassword: { type: 'String', required: true },
      createdBy: { type: 'Pointer', targetClass: '_User' },
      updatedBy: { type: 'Pointer', targetClass: '_User' }
    },
    classLevelPermissions: {
      find: { 'role:admin': true },
      get: { 'role:admin': true },
      create: { 'role:admin': true },
      update: { 'role:admin': true },
      delete: { 'role:admin': true }
    }
  };
  
  return await Parse.Schema.create(classSchema);
}

/**
 * Crée la classe SyncLogs dans Parse
 * @returns {Promise<Object>} La classe créée
 */
async function createSyncLogsClass() {
  const classSchema = {
    className: 'SyncLogs',
    fields: {
      configId: { type: 'String' },
      status: { type: 'String', required: true },
      details: { type: 'String', required: true },
      timestamp: { type: 'Date', required: true },
      errorType: { type: 'String' },
      stackTrace: { type: 'String' }
    },
    classLevelPermissions: {
      find: { 'role:admin': true },
      get: { 'role:admin': true },
      create: { 'role:admin': true },
      update: { 'role:admin': true },
      delete: { 'role:admin': true }
    }
  };
  
  return await Parse.Schema.create(classSchema);
}