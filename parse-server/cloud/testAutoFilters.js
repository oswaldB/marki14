// Script pour tester les filtres automatiques et retourner les résultats
const Parse = require('parse/node');
require('dotenv').config();

// Initialisation de Parse avec les variables d'environnement ou les valeurs par défaut
const appId = 'marki';
const jsKey = 'Careless7-Gore4-Guileless0-Jogger5-Clubbed9';
const masterKey = "Shaky4-Exception6"; // À remplacer par la vraie master key
const serverURL = 'https://dev.parse.markidiags.com';

Parse.initialize(appId, jsKey, masterKey);
Parse.serverURL = serverURL;

async function testAutoFilters(filters) {
    try {
        // Utiliser la master key pour les requêtes
        Parse.Cloud.useMasterKey();
        
        const Impayes = Parse.Object.extend('Impayes');
        const query = new Parse.Query(Impayes);
        
        // Appliquer les filtres incluant
        if (filters.include && Object.keys(filters.include).length > 0) {
            for (const [column, value] of Object.entries(filters.include)) {
                if (value) {
                    query.equalTo(column, value);
                }
            }
        }
        
        // Appliquer les filtres excluant
        if (filters.exclude && Object.keys(filters.exclude).length > 0) {
            for (const [column, value] of Object.entries(filters.exclude)) {
                if (value) {
                    query.notEqualTo(column, value);
                }
            }
        }
        
        // Limiter les résultats pour le test
        query.limit(10);
        
        const results = await query.find();
        
        // Formater les résultats
        const formattedResults = results.map(impaye => {
            const data = impaye.toJSON();
            return {
                id: impaye.id,
                ...data
            };
        });
        
        return {
            success: true,
            count: formattedResults.length,
            results: formattedResults,
            message: `Trouvé ${formattedResults.length} impayés correspondant aux critères`
        };
    } catch (error) {
        console.error('Erreur lors du test des filtres automatiques:', error);
        return {
            success: false,
            count: 0,
            results: [],
            message: error.message
        };
    }
}

// Définir une fonction cloud pour tester les filtres automatiques
Parse.Cloud.define('testAutoFilters', async (request) => {
    const { filters } = request.params;
    return await testAutoFilters(filters);
});

// Exporter la fonction pour qu'elle soit utilisée par main.js
module.exports = { testAutoFilters };