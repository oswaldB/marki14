// Script pour récupérer les valeurs distinctes pour chaque colonne de la classe impayes
const Parse = require('parse/node');
require('dotenv').config();

// Initialisation de Parse avec les variables d'environnement ou les valeurs par défaut
const appId = 'marki';
const jsKey = 'Careless7-Gore4-Guileless0-Jogger5-Clubbed9';
const masterKey = "Shaky4-Exception6"; // À remplacer par la vraie master key
const serverURL = 'https://dev.parse.markidiags.com';

Parse.initialize(appId, jsKey, masterKey);
Parse.serverURL = serverURL;

async function getDistinctValues(columnName, limit = 50) {
    try {
        // Utiliser la master key pour les requêtes
        Parse.Cloud.useMasterKey();
        
        // Récupérer les valeurs distinctes pour une colonne spécifique
        const Impayes = Parse.Object.extend('Impayes');
        const query = new Parse.Query(Impayes);
        
        // Utiliser distinct pour obtenir les valeurs uniques
        query.distinct(columnName);
        query.limit(limit);
        
        const results = await query.find();
        
        if (results && results.length > 0) {
            // Extraire les valeurs de la colonne
            const values = results.map(item => item.get(columnName));
            // Filtrer les valeurs null/undefined et retourner les valeurs uniques
            return [...new Set(values.filter(val => val !== null && val !== undefined))];
        } else {
            console.log(`Aucune valeur trouvée pour la colonne ${columnName}.`);
            return [];
        }
    } catch (error) {
        console.error(`Erreur lors de la récupération des valeurs distinctes pour ${columnName} :`, error);
        return [];
    }
}

// Définir une fonction cloud pour récupérer les valeurs distinctes
Parse.Cloud.define('getDistinctValues', async (request) => {
    const { columnName, limit } = request.params;
    return await getDistinctValues(columnName, limit);
});

// Exporter la fonction pour qu'elle soit utilisée par main.js
module.exports = { getDistinctValues };