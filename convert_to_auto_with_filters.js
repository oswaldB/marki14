// Script pour convertir une séquence en automatique et configurer des filtres
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
    
    // Se connecter avec les identifiants fournis
    const user = await Parse.User.logIn('oswald', 'coucou');
    console.log('✅ Connexion réussie:', user.get('username'));
    
    const sequenceId = 'UBEKeShwi0'; // ID de la séquence test-devtool
    
    // Récupérer la séquence existante
    console.log('📂 Récupération de la séquence existante...');
    const Sequences = Parse.Object.extend('Sequences');
    const query = new Parse.Query(Sequences);
    const sequence = await query.get(sequenceId);
    
    console.log('✅ Séquence récupérée:', sequence.get('nom'));
    console.log('   Type actuel:', sequence.get('isAuto') ? 'Automatique' : 'Normale');
    console.log('   Actions:', sequence.get('actions')?.length || 0);
    
    // Convertir en séquence automatique
    console.log('🔧 Conversion en séquence automatique...');
    sequence.set('isAuto', true);
    
    // Configurer les filtres automatiques
    console.log('🎯 Configuration des filtres automatiques...');
    
    const autoFilters = {
      include: {
        type_payeur: ['particuliers']
      },
      exclude: {}
    };
    
    sequence.set('requete_auto', autoFilters);
    
    // Sauvegarder les modifications
    await sequence.save();
    console.log('✅ Séquence convertie en automatique avec filtres!');
    
    // Premier rechargement pour vérifier la conversion
    console.log('🔄 Premier rechargement pour vérifier la conversion...');
    const firstReload = await query.get(sequenceId);
    
    console.log('✅ Après conversion:');
    console.log('   Type:', firstReload.get('isAuto') ? 'Automatique' : 'Normale');
    console.log('   Filtres:', JSON.stringify(firstReload.get('requete_auto'), null, 2));
    
    // Deuxième rechargement pour simuler la réouverture des filtres
    console.log('🔄 Deuxième rechargement (simulation réouverture filtres)...');
    const secondReload = await query.get(sequenceId);
    
    const finalFilters = secondReload.get('requete_auto');
    const typePayeurFilter = finalFilters?.include?.type_payeur;
    
    if (typePayeurFilter && typePayeurFilter.includes('particuliers')) {
      console.log('✅ Filtres toujours présents après rechargement!');
      console.log('   Type de payeur filtré:', typePayeurFilter);
      console.log('   Filtres complets:', JSON.stringify(finalFilters, null, 2));
    } else {
      console.log('❌ Filtres non trouvés ou modifiés après rechargement!');
    }
    
    console.log('\n🎉 Script terminé avec succès!');
    console.log('📋 Vous pouvez vérifier la séquence automatique via:');
    console.log(`   https://dev.markidiags.com/sequence-detail?id=${sequenceId}`);
    
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