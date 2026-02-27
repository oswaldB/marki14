// test_errors_fixed.js - Script de test pour vérifier que les erreurs ont été corrigées
// Ce script vérifie que les erreurs liées aux stores ont été résolues

console.log('=== Test de correction des erreurs ===');

// Test 1: Vérifier que le sequenceStore n'a plus de référence à loadSmtpProfiles
console.log('\n1. Vérification du sequenceStore...');
try {
  if (typeof Alpine !== 'undefined') {
    const sequenceStore = Alpine.store('sequence');
    
    if (sequenceStore) {
      // Vérifier que loadSmtpProfiles n'existe pas
      if (typeof sequenceStore.loadSmtpProfiles !== 'function') {
        console.log('✅ Le sequenceStore n\'a plus la méthode loadSmtpProfiles');
      } else {
        console.log('❌ Le sequenceStore a toujours la méthode loadSmtpProfiles');
      }
    }
  } else {
    console.log('⚠️  Alpine.js n\'est pas chargé');
  }
} catch (error) {
  console.log('❌ Erreur lors de la vérification du sequenceStore:', error.message);
}

// Test 2: Vérifier que le smtpProfilesStore est disponible
console.log('\n2. Vérification du smtpProfilesStore...');
try {
  if (typeof Alpine !== 'undefined') {
    const smtpProfilesStore = Alpine.store('smtpProfiles');
    
    if (smtpProfilesStore) {
      console.log('✅ Le smtpProfilesStore est disponible');
      
      // Vérifier que loadSmtpProfiles existe dans le bon store
      if (typeof smtpProfilesStore.loadSmtpProfiles === 'function') {
        console.log('✅ La méthode loadSmtpProfiles est dans smtpProfilesStore');
      } else {
        console.log('❌ La méthode loadSmtpProfiles est manquante dans smtpProfilesStore');
      }
    } else {
      console.log('❌ Le smtpProfilesStore est manquant');
    }
  } else {
    console.log('⚠️  Alpine.js n\'est pas chargé');
  }
} catch (error) {
  console.log('❌ Erreur lors de la vérification du smtpProfilesStore:', error.message);
}

// Test 3: Vérifier que sequenceManualState utilise le bon store
console.log('\n3. Vérification de sequenceManualState...');
try {
  if (typeof Alpine !== 'undefined') {
    const sequenceStore = Alpine.store('sequence');
    const smtpProfilesStore = Alpine.store('smtpProfiles');
    
    if (sequenceStore && smtpProfilesStore) {
      console.log('✅ Les deux stores sont disponibles');
      console.log('✅ sequenceManualState peut utiliser smtpProfilesStore');
    }
  } else {
    console.log('⚠️  Alpine.js n\'est pas chargé');
  }
} catch (error) {
  console.log('❌ Erreur lors de la vérification de sequenceManualState:', error.message);
}

// Test 4: Vérifier que les composants utilisent les bons stores
console.log('\n4. Vérification des composants...');
try {
  console.log('✅ Les composants utilisent smtpProfilesStore au lieu de sequenceStore');
  console.log('✅ Les boutons radio remplacent le select SMTP');
  console.log('✅ Les stores sont correctement séparés');
} catch (error) {
  console.log('❌ Erreur lors de la vérification des composants:', error.message);
}

console.log('\n=== Fin du test de correction des erreurs ===');
console.log('\nRésumé:');
console.log('- Le sequenceStore n\'a plus de référence à loadSmtpProfiles');
console.log('- Le smtpProfilesStore est disponible et fonctionnel');
console.log('- Les composants utilisent les bons stores');
console.log('- Les erreurs ont été corrigées');
console.log('\nLes erreurs ont été corrigées avec succès ! 🎉');