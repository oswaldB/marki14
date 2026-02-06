// sequenceTriggers.js - Triggers pour les séquences

// Trigger après sauvegarde d'une séquence
// Note: Désactivé car les fonctions Cloud sont maintenant appelées explicitement depuis le frontend
// Parse.Cloud.afterSave('Sequences', async (request) => {
//   // Vérifier si c'est une nouvelle création ou une mise à jour
//   const isNew = !request.original;
//   
//   if (isNew) {
//     console.log('Nouvelle séquence créée:', request.object.get('nom'));
//     return; // Ne pas traiter les nouvelles séquences, attendre qu'elles soient activées
//   }
//   
//   // Vérifier si le statut a changé pour devenir actif
//   const originalIsActif = request.original.get('isActif');
//   const newIsActif = request.object.get('isActif');
//   
//   console.log(`Séquence ${request.object.get('nom')} - isActif: ${originalIsActif} -> ${newIsActif}`);
//   
//   // Si la séquence vient d'être activée
//   if (!originalIsActif && newIsActif) {
//     console.log(`Séquence ${request.object.get('nom')} a été activée, lancement de populateRelanceSequence...`);
//     
//     try {
//       // Appeler la fonction populateRelanceSequence
//       const result = await Parse.Cloud.run('populateRelanceSequence', {
//         idSequence: request.object.id
//       });
//       
//       console.log(`populateRelanceSequence terminé avec succès:`);
//       console.log(`- Impayés traités: ${result.processed}`);
//       console.log(`- Relances créées: ${result.created}`);
//       console.log(`- Relances existantes conservées: ${result.updated}`);
//       
//     } catch (error) {
//       console.error(`Erreur lors de l'exécution de populateRelanceSequence pour la séquence ${request.object.id}:`, error);
//       // Ne pas bloquer la sauvegarde de la séquence, juste logger l'erreur
//     }
//   }
//   
//   // Si la séquence vient d'être désactivée
//   if (originalIsActif && !newIsActif) {
//     console.log(`Séquence ${request.object.get('nom')} a été désactivée, lancement de cleanupRelancesOnDeactivate...`);
//     
//     try {
//       // Appeler la fonction cleanupRelancesOnDeactivate
//       const result = await Parse.Cloud.run('cleanupRelancesOnDeactivate', {
//         idSequence: request.object.id
//       });
//       
//       console.log(`cleanupRelancesOnDeactivate terminé avec succès:`);
//       console.log(`- Relances non envoyées supprimées: ${result.deleted}`);
//       console.log(`- Relances envoyées conservées: ${result.kept}`);
//       
//     } catch (error) {
//       console.error(`Erreur lors de l'exécution de cleanupRelancesOnDeactivate pour la séquence ${request.object.id}:`, error);
//       // Ne pas bloquer la sauvegarde de la séquence, juste logger l'erreur
//     }
//   }
// });

// Trigger avant suppression d'une séquence (optionnel - pour nettoyage)
Parse.Cloud.beforeDelete('Sequences', async (request) => {
  console.log(`Suppression de la séquence ${request.object.get('nom')} (ID: ${request.object.id})`);
  
  // Optionnel: Nettoyer les relances associées à cette séquence
  // Cela dépend des besoins métiers - à discuter
  // const Relances = Parse.Object.extend('Relances');
  // const query = new Parse.Query(Relances);
  // query.equalTo('sequence', request.object);
  // const relances = await query.find();
  // for (const relance of relances) {
  //   await relance.destroy();
  // }
});

// Trigger après sauvegarde d'un impayé pour détecter l'association manuelle d'une séquence
Parse.Cloud.afterSave('Impayes', async (request) => {
  // Vérifier si c'est une mise à jour (pas une création)
  const isUpdate = !request.original;
  
  if (!isUpdate) {
    return; // Ne pas traiter les nouvelles créations
  }
  
  // Vérifier si la séquence a changé
  const originalSequenceId = request.original.get('sequence') ? request.original.get('sequence').id : null;
  const newSequenceId = request.object.get('sequence') ? request.object.get('sequence').id : null;
  
  console.log(`Impayé ${request.object.get('nfacture')} - sequence: ${originalSequenceId} -> ${newSequenceId}`);
  
  // Si une séquence a été associée (nouvelle séquence ou première association)
  if (newSequenceId && newSequenceId !== originalSequenceId) {
    console.log(`Association manuelle de la séquence ${newSequenceId} à l'impayé ${request.object.id}`);
    
    try {
      // Appeler la fonction handleManualSequenceAssignment
      const result = await Parse.Cloud.run('handleManualSequenceAssignment', {
        impayeId: request.object.id,
        sequenceId: newSequenceId
      });
      
      console.log(`handleManualSequenceAssignment terminé avec succès:`);
      console.log(`- Message: ${result.message}`);
      console.log(`- Relances créées: ${result.relancesCreated}`);
      
    } catch (error) {
      console.error(`Erreur lors de l'exécution de handleManualSequenceAssignment pour l'impayé ${request.object.id}:`, error);
      // Ne pas bloquer la sauvegarde de l'impayé, juste logger l'erreur
    }
  }
});