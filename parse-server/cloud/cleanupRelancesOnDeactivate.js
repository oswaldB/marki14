// cleanupRelancesOnDeactivate.js - Fonction pour nettoyer les relances lors de la désactivation d'une séquence

Parse.Cloud.define('cleanupRelancesOnDeactivate', async (request) => {
  const { idSequence } = request.params;
  
  if (!idSequence) {
    throw new Error('Le paramètre idSequence est requis');
  }
  
  console.log(`Début du nettoyage des relances pour la séquence ${idSequence}`);
  
  try {
    // 1. Récupérer la séquence
    const Sequence = Parse.Object.extend('sequences');
    const sequenceQuery = new Parse.Query(Sequence);
    const sequence = await sequenceQuery.get(idSequence);
    
    if (!sequence) {
      throw new Error(`Séquence avec l'ID ${idSequence} non trouvée`);
    }
    
    console.log(`Séquence trouvée: ${sequence.get('nom')}`);
    
    // 2. Récupérer tous les impayés qui ont cette séquence
    const Impaye = Parse.Object.extend('Impayes');
    const impayeQuery = new Parse.Query(Impaye);
    impayeQuery.equalTo('sequence', sequence);
    const impayes = await impayeQuery.find();
    
    console.log(`Nombre d'impayés trouvés pour cette séquence: ${impayes.length}`);
    
    // 3. Pour chaque impayé, supprimer les relances non envoyées
    let deletedCount = 0;
    let keptCount = 0;
    
    for (const impaye of impayes) {
      console.log(`\nTraitement de l'impayé ${impaye.get('nfacture')} (ID: ${impaye.id})`);
      
      // 4. Chercher les relances pour cet impayé et cette séquence
      const RelancesClass = Parse.Object.extend('Relances');
      const relanceQuery = new Parse.Query(RelancesClass);
      relanceQuery.equalTo('impaye', impaye);
      relanceQuery.equalTo('sequence', sequence);
      const relances = await relanceQuery.find();
      
      console.log(`Nombre de relances trouvées: ${relances.length}`);
      
      // 5. Supprimer uniquement les relances non envoyées (is_sent = false)
      const relancesToDelete = relances.filter(r => !r.get('is_sent'));
      const relancesToKeep = relances.filter(r => r.get('is_sent'));
      
      if (relancesToDelete.length > 0) {
        console.log(`Suppression de ${relancesToDelete.length} relances non envoyées...`);
        for (const relance of relancesToDelete) {
          await relance.destroy();
          deletedCount++;
        }
        console.log('Relances non envoyées supprimées avec succès');
      } else {
        console.log('Aucune relance non envoyée à supprimer');
      }
      
      if (relancesToKeep.length > 0) {
        console.log(`Conservation de ${relancesToKeep.length} relances déjà envoyées`);
        keptCount += relancesToKeep.length;
      }
    }
    
    console.log(`\nNettoyage terminé:`);
    console.log(`- Relances non envoyées supprimées: ${deletedCount}`);
    console.log(`- Relances envoyées conservées: ${keptCount}`);
    
    return {
      success: true,
      message: 'Nettoyage des relances terminé avec succès',
      deleted: deletedCount,
      kept: keptCount
    };
    
  } catch (error) {
    console.error('Erreur lors du nettoyage des relances:', error);
    throw error;
  }
});