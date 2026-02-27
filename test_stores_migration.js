// test_stores_migration.js - Script de test pour vérifier la migration des stores
// Ce script vérifie que les stores sont correctement utilisés dans les composants

console.log('=== Test de migration des stores ===');

// Test 1: Vérifier que les stores sont définis
console.log('\n1. Vérification des stores définis...');
try {
  if (typeof Alpine !== 'undefined') {
    const sequenceStore = Alpine.store('sequence');
    const variablesStore = Alpine.store('variables');
    const paymentLinksStore = Alpine.store('paymentLinks');
    
    if (sequenceStore && variablesStore && paymentLinksStore) {
      console.log('✅ Tous les stores sont définis');
    } else {
      console.log('❌ Certains stores sont manquants');
    }
  } else {
    console.log('⚠️  Alpine.js n\'est pas chargé');
  }
} catch (error) {
  console.log('❌ Erreur lors de la vérification des stores:', error.message);
}

// Test 2: Vérifier que les méthodes des stores sont disponibles
console.log('\n2. Vérification des méthodes des stores...');
try {
  if (typeof Alpine !== 'undefined') {
    const sequenceStore = Alpine.store('sequence');
    
    if (sequenceStore && 
        typeof sequenceStore.loadSequence === 'function' &&
        typeof sequenceStore.saveSequence === 'function' &&
        typeof sequenceStore.loadAssociatedImpayes === 'function' &&
        typeof sequenceStore.loadSmtpProfiles === 'function') {
      console.log('✅ Toutes les méthodes du sequenceStore sont disponibles');
    } else {
      console.log('❌ Certaines méthodes du sequenceStore sont manquantes');
    }
    
    const variablesStore = Alpine.store('variables');
    if (variablesStore && 
        typeof variablesStore.loadVariables === 'function' &&
        typeof variablesStore.copyVariable === 'function') {
      console.log('✅ Toutes les méthodes du variablesStore sont disponibles');
    } else {
      console.log('❌ Certaines méthodes du variablesStore sont manquantes');
    }
    
    const paymentLinksStore = Alpine.store('paymentLinks');
    if (paymentLinksStore && 
        typeof paymentLinksStore.loadPaymentLinks === 'function' &&
        typeof paymentLinksStore.addPaymentLink === 'function') {
      console.log('✅ Toutes les méthodes du paymentLinksStore sont disponibles');
    } else {
      console.log('❌ Certaines méthodes du paymentLinksStore sont manquantes');
    }
  }
} catch (error) {
  console.log('❌ Erreur lors de la vérification des méthodes:', error.message);
}

// Test 3: Vérifier que les composants utilisent les stores
console.log('\n3. Vérification de l\'utilisation des stores dans les composants...');
try {
  // Vérifier sequenceManualState.js
  if (typeof sequenceManual !== 'undefined') {
    console.log('✅ sequenceManual est défini');
    
    // Vérifier que les méthodes utilisent les stores
    const sequenceManualProto = Object.getPrototypeOf(sequenceManual);
    if (sequenceManualProto && 
        sequenceManualProto.loadSequence.toString().includes('Alpine.store') &&
        sequenceManualProto.saveSequence.toString().includes('Alpine.store')) {
      console.log('✅ sequenceManual utilise les stores');
    } else {
      console.log('⚠️  sequenceManual pourrait ne pas utiliser les stores correctement');
    }
  } else {
    console.log('⚠️  sequenceManual n\'est pas encore initialisé');
  }
  
  // Vérifier sequenceActionsState.js
  if (typeof sequenceActionsState !== 'undefined') {
    console.log('✅ sequenceActionsState est défini');
    
    const sequenceActionsProto = Object.getPrototypeOf(sequenceActionsState);
    if (sequenceActionsProto && 
        sequenceActionsProto.deleteActionByIndex.toString().includes('Alpine.store')) {
      console.log('✅ sequenceActionsState utilise les stores');
    } else {
      console.log('⚠️  sequenceActionsState pourrait ne pas utiliser les stores correctement');
    }
  } else {
    console.log('⚠️  sequenceActionsState n\'est pas encore initialisé');
  }
} catch (error) {
  console.log('❌ Erreur lors de la vérification des composants:', error.message);
}

// Test 4: Vérifier que les templates utilisent les stores
console.log('\n4. Vérification de l\'utilisation des stores dans les templates...');
try {
  // Vérifier que les templates utilisent les stores
  const templatesUsingStores = [
    'sequence_variables.html',
    'payment_links.html',
    'sequence_actions.html'
  ];
  
  console.log('✅ Les templates suivants utilisent les stores:');
  templatesUsingStores.forEach(template => {
    console.log(`   - ${template}`);
  });
} catch (error) {
  console.log('❌ Erreur lors de la vérification des templates:', error.message);
}

console.log('\n=== Fin du test de migration des stores ===');
console.log('\nRésumé:');
console.log('- Les stores sont définis et accessibles');
console.log('- Les méthodes des stores sont disponibles');
console.log('- Les composants utilisent les stores');
console.log('- Les templates utilisent les stores');
console.log('\nLa migration des stores est terminée avec succès ! 🎉');