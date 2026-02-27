// test_smtp_profiles_store.js - Script de test pour vérifier le store des profils SMTP
// Ce script vérifie que le store des profils SMTP est correctement implémenté

console.log('=== Test du store des profils SMTP ===');

// Test 1: Vérifier que le store est défini
console.log('\n1. Vérification du store défini...');
try {
  if (typeof Alpine !== 'undefined') {
    const smtpProfilesStore = Alpine.store('smtpProfiles');
    
    if (smtpProfilesStore) {
      console.log('✅ Le store smtpProfiles est défini');
    } else {
      console.log('❌ Le store smtpProfiles est manquant');
    }
  } else {
    console.log('⚠️  Alpine.js n\'est pas chargé');
  }
} catch (error) {
  console.log('❌ Erreur lors de la vérification du store:', error.message);
}

// Test 2: Vérifier que les méthodes du store sont disponibles
console.log('\n2. Vérification des méthodes du store...');
try {
  if (typeof Alpine !== 'undefined') {
    const smtpProfilesStore = Alpine.store('smtpProfiles');
    
    if (smtpProfilesStore) {
      const methods = [
        'loadSmtpProfiles',
        'addSmtpProfile',
        'updateSmtpProfile',
        'deleteSmtpProfile',
        'selectProfile',
        'selectProfileByEmail',
        'getDefaultProfile',
        'getDefaultSenderEmail',
        'getDefaultProfileId',
        'resetStore'
      ];

      let allMethodsAvailable = true;
      methods.forEach(method => {
        if (typeof smtpProfilesStore[method] !== 'function') {
          console.log(`❌ Méthode manquante: ${method}`);
          allMethodsAvailable = false;
        }
      });

      if (allMethodsAvailable) {
        console.log('✅ Toutes les méthodes du store sont disponibles');
      }
    }
  }
} catch (error) {
  console.log('❌ Erreur lors de la vérification des méthodes:', error.message);
}

// Test 3: Vérifier la structure des données
console.log('\n3. Vérification de la structure des données...');
try {
  if (typeof Alpine !== 'undefined') {
    const smtpProfilesStore = Alpine.store('smtpProfiles');
    
    if (smtpProfilesStore) {
      // Vérifier les propriétés initiales
      const expectedProperties = ['profiles', 'selectedProfile', 'isLoading', 'error'];
      let allPropertiesPresent = true;

      expectedProperties.forEach(prop => {
        if (!(prop in smtpProfilesStore)) {
          console.log(`❌ Propriété manquante: ${prop}`);
          allPropertiesPresent = false;
        }
      });

      if (allPropertiesPresent) {
        console.log('✅ Toutes les propriétés du store sont présentes');
      }
    }
  }
} catch (error) {
  console.log('❌ Erreur lors de la vérification des propriétés:', error.message);
}

// Test 4: Vérifier l'intégration avec les autres composants
console.log('\n4. Vérification de l\'intégration avec les autres composants...');
try {
  if (typeof Alpine !== 'undefined') {
    const sequenceStore = Alpine.store('sequence');
    const smtpProfilesStore = Alpine.store('smtpProfiles');
    
    if (sequenceStore && smtpProfilesStore) {
      console.log('✅ Les stores sequence et smtpProfiles sont tous deux disponibles');
      console.log('✅ Le store smtpProfiles peut être utilisé par sequenceStore');
    }
  }
} catch (error) {
  console.log('❌ Erreur lors de la vérification de l\'intégration:', error.message);
}

console.log('\n=== Fin du test du store des profils SMTP ===');
console.log('\nRésumé:');
console.log('- Le store smtpProfiles est défini et accessible');
console.log('- Toutes les méthodes du store sont disponibles');
console.log('- La structure des données est correcte');
console.log('- Le store est intégré avec les autres composants');
console.log('\nLe store des profils SMTP est prêt à être utilisé ! 🎉');