// Script pour récupérer le schéma de la classe impayes et séquences
const Parse = require('parse/node');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialisation de Parse avec les variables d'environnement ou les valeurs par défaut
const appId = 'marki';
const jsKey = 'Careless7-Gore4-Guileless0-Jogger5-Clubbed9';
const masterKey = "Shaky4-Exception6"; // À remplacer par la vraie master key
const serverURL = 'https://dev.parse.markidiags.com';

Parse.initialize(appId, jsKey, masterKey);
Parse.serverURL = serverURL;

async function getSchema() {
    try {
        // Utiliser la master key pour les requêtes
        Parse.Cloud.useMasterKey();
        
        // Récupérer le schéma de toutes les classes
        const schema = await Parse.Schema.all();
        
        // Vérifier la classe Impayes (avec majuscule)
        const impayesSchema = schema.find(cls => cls.className === 'Impayes');
        
        if (impayesSchema) {
            console.log('Schéma de la classe Impayes :');
            console.log('Colonnes :', impayesSchema.fields);
        } else {
            console.log('La classe Impayes n\'existe pas dans le schéma.');
        }
        
        // Vérifier la classe Sequences (avec majuscule)
        const sequencesSchema = schema.find(cls => cls.className === 'Sequences');
        
        if (sequencesSchema) {
            console.log('Schéma de la classe Sequences :');
            console.log('Colonnes :', sequencesSchema.fields);
        } else {
            console.log('La classe Sequences n\'existe pas dans le schéma.');
        }
        
        // Vérifier la classe Sequence (sans s)
        const sequenceSchema = schema.find(cls => cls.className === 'Sequence');
        
        if (sequenceSchema) {
            console.log('Schéma de la classe Sequence :');
            console.log('Colonnes :', sequenceSchema.fields);
        } else {
            console.log('La classe Sequence n\'existe pas dans le schéma.');
        }
        
        return {
            impayes: impayesSchema ? impayesSchema.fields : null,
            sequences: sequencesSchema ? sequencesSchema.fields : null,
            sequence: sequenceSchema ? sequenceSchema.fields : null
        };
        
    } catch (error) {
        console.error('Erreur lors de la récupération du schéma :', error);
        return null;
    }
}

/**
 * Sauvegarde le schéma dans des fichiers JSON
 */
async function saveSchemaToFiles() {
    try {
        // Utiliser la master key pour les requêtes
        Parse.Cloud.useMasterKey();
        
        // Récupérer le schéma de toutes les classes
        const schema = await Parse.Schema.all();
        
        // Vérifier la classe Impayes (avec majuscule)
        const impayesSchema = schema.find(cls => cls.className === 'Impayes');
        
        // Créer le répertoire configs s'il n'existe pas
        // Essayer d'abord dans le répertoire public qui est accessible depuis le frontend
        let configsDir;
        
        // Debug: Afficher les informations sur le répertoire courant
        console.log('Current working directory:', process.cwd());
        console.log('Script directory:', __dirname);
        console.log('Process user:', process.env.USER || 'unknown');
        console.log('Process permissions:', process.getuid && process.getuid() || 'unknown');
        
        try {
            // Essayer le chemin dans le répertoire public
            configsDir = path.join(process.cwd(), 'public', 'configs');
            console.log('Trying configs directory at:', configsDir);
            console.log('Directory exists?', fs.existsSync(configsDir));
            console.log('Parent directory exists?', fs.existsSync(path.join(process.cwd(), 'public')));
            
            // Vérifier les permissions du répertoire parent
            try {
                const publicDirStats = fs.statSync(path.join(process.cwd(), 'public'));
                console.log('Public directory permissions:', publicDirStats.mode.toString(8));
            } catch (statsError) {
                console.error('Cannot stat public directory:', statsError.message);
            }
            
            if (!fs.existsSync(configsDir)) {
                console.log('Attempting to create directory:', configsDir);
                fs.mkdirSync(configsDir, { recursive: true });
                console.log('Successfully created configs directory:', configsDir);
            } else {
                console.log('Configs directory already exists:', configsDir);
            }
        } catch (mkdirError) {
            console.error('Failed to create configs directory in public:', mkdirError.message);
            console.error('Error details:', mkdirError);
            
            // Essayer avec le chemin relatif au fichier actuel dans le répertoire public
            try {
                const publicDir = path.resolve(__dirname, '..', '..', 'public');
                configsDir = path.join(publicDir, 'configs');
                console.log('Falling back to configs directory at:', configsDir);
                console.log('Fallback directory exists?', fs.existsSync(configsDir));
                console.log('Fallback parent directory exists?', fs.existsSync(publicDir));
                
                if (!fs.existsSync(configsDir)) {
                    console.log('Attempting to create fallback directory:', configsDir);
                    fs.mkdirSync(configsDir, { recursive: true });
                    console.log('Successfully created fallback configs directory:', configsDir);
                } else {
                    console.log('Fallback configs directory already exists:', configsDir);
                }
            } catch (fallbackError) {
                console.error('Failed to create configs directory at fallback location:', fallbackError.message);
                console.error('Fallback error details:', fallbackError);
                
                // Essayer un chemin absolu comme dernier recours
                try {
                    configsDir = '/tmp/marki-configs';
                    console.log('Trying absolute fallback directory at:', configsDir);
                    
                    if (!fs.existsSync(configsDir)) {
                        fs.mkdirSync(configsDir, { recursive: true });
                        console.log('Created absolute fallback configs directory:', configsDir);
                    }
                } catch (absoluteError) {
                    console.error('Failed to create configs directory at absolute fallback:', absoluteError.message);
                    throw new Error('Unable to create configs directory at any location: ' + 
                                   mkdirError.message + ' | ' + 
                                   fallbackError.message + ' | ' + 
                                   absoluteError.message);
                }
            }
        }
        
        // Sauvegarder le schéma complet
        const fullSchema = {
            impayes: impayesSchema ? impayesSchema.fields : null,
            sequences: sequencesSchema ? sequencesSchema.fields : null,
            sequence: sequenceSchema ? sequenceSchema.fields : null,
            timestamp: new Date().toISOString()
        };
        
        fs.writeFileSync(
            path.join(configsDir, 'schema.json'),
            JSON.stringify(fullSchema, null, 2),
            'utf8'
        );
        
        // Sauvegarder uniquement les colonnes des impayés
        const impayesColumns = impayesSchema ? Object.keys(impayesSchema.fields) : [];
        fs.writeFileSync(
            path.join(configsDir, 'impayes.json'),
            JSON.stringify(impayesColumns, null, 2),
            'utf8'
        );
        
        console.log('Schéma sauvegardé dans', path.join(configsDir, 'schema.json'), 'et', path.join(configsDir, 'impayes.json'));
        
        // Déterminer les chemins relatifs pour le retour
        let relativeFiles = ['/configs/schema.json', '/configs/impayes.json'];
        if (configsDir.includes('/tmp/')) {
            relativeFiles = ['/tmp-configs/schema.json', '/tmp-configs/impayes.json'];
        }
        
        return {
            success: true,
            message: 'Schéma sauvegardé avec succès',
            files: relativeFiles,
            actualPath: configsDir
        };
        
    } catch (error) {
        console.error('Erreur lors de la sauvegarde du schéma :', error);
        return {
            success: false,
            message: 'Erreur lors de la sauvegarde du schéma',
            error: error.message
        };
    }
}

// Définir une fonction cloud pour récupérer le schéma
Parse.Cloud.define('getSchema', async (request) => {
  return await getSchema();
});

// Définir une fonction cloud pour obtenir le schéma complet
Parse.Cloud.define('getFullSchema', async (request) => {
  try {
    Parse.Cloud.useMasterKey();
    const schema = await Parse.Schema.all();
    
    const impayesSchema = schema.find(cls => cls.className === 'Impayes');
    const sequencesSchema = schema.find(cls => cls.className === 'Sequences');
    const sequenceSchema = schema.find(cls => cls.className === 'Sequence');
    
    return {
      success: true,
      schema: {
        impayes: impayesSchema ? impayesSchema.fields : null,
        sequences: sequencesSchema ? sequencesSchema.fields : null,
        sequence: sequenceSchema ? sequenceSchema.fields : null,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Erreur lors de la récupération du schéma complet:', error);
    return {
      success: false,
      message: 'Erreur lors de la récupération du schéma',
      error: error.message
    };
  }
});

// Définir une fonction cloud pour obtenir uniquement les colonnes des impayés
Parse.Cloud.define('getImpayesColumns', async (request) => {
  try {
    Parse.Cloud.useMasterKey();
    const schema = await Parse.Schema.all();
    
    const impayesSchema = schema.find(cls => cls.className === 'Impayes');
    
    if (impayesSchema) {
      const impayesColumns = Object.keys(impayesSchema.fields);
      return {
        success: true,
        columns: impayesColumns,
        count: impayesColumns.length
      };
    } else {
      return {
        success: false,
        message: 'La classe Impayes n\'existe pas dans le schéma'
      };
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des colonnes des impayés:', error);
    return {
      success: false,
      message: 'Erreur lors de la récupération des colonnes',
      error: error.message
    };
  }
});

// Définir une fonction cloud pour obtenir le schéma des impayés
Parse.Cloud.define('getImpayesSchema', async (request) => {
  try {
    // D'abord essayer de lire depuis le fichier
    // Essayer d'abord avec le chemin dans le répertoire public
    let impayesFile;
    try {
        const configsDir = path.join(process.cwd(), 'public', 'configs');
        impayesFile = path.join(configsDir, 'impayes.json');
        
        console.log('Looking for impayes.json at:', impayesFile);
        
        // Si le fichier existe, le lire
        if (fs.existsSync(impayesFile)) {
          const impayesColumns = JSON.parse(fs.readFileSync(impayesFile, 'utf8'));
          
          // Convertir le tableau de colonnes en objet schéma
          const schema = {};
          impayesColumns.forEach(column => {
            schema[column] = { type: 'String' }; // Type par défaut
          });
          
          console.log('Loaded impayes schema from file:', impayesFile);
          return schema;
        }
    } catch (fileError) {
        console.log('Could not read impayes.json from public directory, trying fallback...');
    }
    
    // Essayer avec le chemin relatif au fichier actuel dans le répertoire public
    try {
        const publicDir = path.resolve(__dirname, '..', '..', 'public');
        const configsDir = path.join(publicDir, 'configs');
        impayesFile = path.join(configsDir, 'impayes.json');
        
        console.log('Looking for impayes.json at fallback location:', impayesFile);
        
        // Si le fichier existe, le lire
        if (fs.existsSync(impayesFile)) {
          const impayesColumns = JSON.parse(fs.readFileSync(impayesFile, 'utf8'));
          
          // Convertir le tableau de colonnes en objet schéma
          const schema = {};
          impayesColumns.forEach(column => {
            schema[column] = { type: 'String' }; // Type par défaut
          });
          
          console.log('Loaded impayes schema from fallback file:', impayesFile);
          return schema;
        }
    } catch (fallbackError) {
        console.log('Could not read impayes.json from public directory, trying /tmp fallback...');
    }
    
    // Essayer le chemin /tmp comme dernier recours
    try {
        const tmpConfigsDir = '/tmp/marki-configs';
        impayesFile = path.join(tmpConfigsDir, 'impayes.json');
        
        console.log('Looking for impayes.json at /tmp fallback:', impayesFile);
        
        // Si le fichier existe, le lire
        if (fs.existsSync(impayesFile)) {
          const impayesColumns = JSON.parse(fs.readFileSync(impayesFile, 'utf8'));
          
          // Convertir le tableau de colonnes en objet schéma
          const schema = {};
          impayesColumns.forEach(column => {
            schema[column] = { type: 'String' }; // Type par défaut
          });
          
          console.log('Loaded impayes schema from /tmp fallback file:', impayesFile);
          return schema;
        }
    } catch (tmpError) {
        console.log('Could not read impayes.json from /tmp, falling back to Parse API');
    }
    
    // Si le fichier n'existe pas, obtenir le schéma directement depuis Parse
    Parse.Cloud.useMasterKey();
    const schema = await Parse.Schema.all();
    const impayesSchema = schema.find(cls => cls.className === 'Impayes');
    
    return impayesSchema ? impayesSchema.fields : null;
    
  } catch (error) {
    console.error('Erreur lors de la récupération du schéma des impayés:', error);
    return null;
  }
});

// Exporter la fonction pour qu'elle soit utilisée par main.js
module.exports = { getSchema, saveSchemaToFiles };