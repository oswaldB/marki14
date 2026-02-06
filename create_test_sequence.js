// Script pour créer une séquence de test et vérifier ses détails
// Basé sur l'API Parse et la structure du projet

import Parse from 'parse/node';

// Configuration Parse
const PARSE_APPLICATION_ID = 'marki';
const PARSE_JAVASCRIPT_KEY = 'Careless7-Gore4-Guileless0-Jogger5-Clubbed9';
const PARSE_SERVER_URL = 'https://dev.parse.markidiags.com';

// Initialiser Parse
Parse.initialize(PARSE_APPLICATION_ID, PARSE_JAVASCRIPT_KEY);
Parse.serverURL = PARSE_SERVER_URL;

async function main() {
  try {
    console.log('🔄 Connexion à Parse Server...');
    
    // D'abord, se connecter avec les identifiants fournis
    const user = await Parse.User.logIn('oswald', 'coucou');
    console.log('✅ Connexion réussie:', user.get('username'));
    
    // Créer une nouvelle séquence
    console.log('📝 Création de la séquence "test-devtool"...');
    
    const Sequences = Parse.Object.extend('Sequences');
    const sequence = new Sequences();
    
    sequence.set('nom', 'test-devtool');
    sequence.set('description', 'Séquence créée via script de test');
    sequence.set('isActif', false);
    sequence.set('actions', []);
    sequence.set('isAuto', false);
    
    const newSequence = await sequence.save();
    console.log('✅ Séquence créée avec succès!');
    console.log('   ID:', newSequence.id);
    console.log('   Nom:', newSequence.get('nom'));
    console.log('   URL des détails:', `https://dev.markidiags.com/sequence-detail?id=${newSequence.id}`);
    
    // Essayer de récupérer les détails de la séquence
    console.log('🔍 Récupération des détails de la séquence...');
    
    const query = new Parse.Query('Sequences');
    const sequenceDetails = await query.get(newSequence.id);
    
    console.log('✅ Détails de la séquence récupérés:');
    console.log('   Nom:', sequenceDetails.get('nom'));
    console.log('   Description:', sequenceDetails.get('description'));
    console.log('   Statut:', sequenceDetails.get('isActif') ? 'Actif' : 'Inactif');
    console.log('   Type:', sequenceDetails.get('isAuto') ? 'Automatique' : 'Normale');
    console.log('   Nombre d\'actions:', sequenceDetails.get('actions')?.length || 0);
    console.log('   Créé le:', sequenceDetails.createdAt);
    
    console.log('\n🎉 Script terminé avec succès!');
    console.log('📋 Vous pouvez accéder à la séquence via:');
    console.log(`   https://dev.markidiags.com/sequence-detail?id=${newSequence.id}`);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution du script:', error);
    console.error('   Détails:', error.message);
    if (error.code) {
      console.error('   Code d\'erreur:', error.code);
    }
    process.exit(1);
  }
}

// Exécuter le script
main();