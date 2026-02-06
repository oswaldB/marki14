// Script pour ajouter une action email à une séquence et vérifier sa persistance
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
    console.log('   Actions actuelles:', sequence.get('actions')?.length || 0);
    
    // Ajouter une action email
    console.log('✉️  Ajout d\'une action email...');
    
    const currentActions = sequence.get('actions') || [];
    
    const newEmailAction = {
      type: 'email',
      order: currentActions.length + 1,
      subject: 'Rappel de paiement - {{clientName}}',
      body: 'Bonjour {{clientName}},\n\nCeci est un rappel pour le paiement de votre facture {{invoiceNumber}} d\'un montant de {{amount}} €.\n\nMerci de régulariser votre situation dans les plus brefs délais.\n\nCordialement,\nL\'équipe Marki',
      from: 'comptabilite@markidiags.com',
      delayDays: 7,
      isActive: true,
      template: 'default'
    };
    
    currentActions.push(newEmailAction);
    sequence.set('actions', currentActions);
    
    // Sauvegarder les modifications
    await sequence.save();
    console.log('✅ Action email ajoutée avec succès!');
    
    // Recharger la séquence pour vérifier la persistance
    console.log('🔄 Rechargement de la séquence...');
    const reloadedSequence = await query.get(sequenceId);
    
    const reloadedActions = reloadedSequence.get('actions') || [];
    const emailAction = reloadedActions.find(action => action.type === 'email');
    
    if (emailAction) {
      console.log('✅ Action email toujours présente après rechargement!');
      console.log('   Sujet:', emailAction.subject);
      console.log('   Délai:', emailAction.delayDays + ' jours');
      console.log('   Statut:', emailAction.isActive ? 'Active' : 'Inactive');
      console.log('   Nombre total d\'actions:', reloadedActions.length);
    } else {
      console.log('❌ Action email non trouvée après rechargement!');
    }
    
    console.log('\n🎉 Script terminé avec succès!');
    console.log('📋 Vous pouvez vérifier la séquence via:');
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