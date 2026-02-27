// test_store_consolidation.js - Test pour vérifier la consolidation des stores

console.log('🧪 Testing Store Consolidation...');

// Test 1: Vérifier que le store consolidé existe
try {
  const sequenceStore = Alpine.store('sequence');
  console.log('✅ Store consolidé "sequence" existe');
} catch (error) {
  console.error('❌ Store consolidé "sequence" introuvable:', error);
}

// Test 2: Vérifier que les anciens stores n'existent plus
try {
  const oldStores = ['variables', 'paymentLinks', 'smtpProfiles'];
  let allOldStoresRemoved = true;
  
  oldStores.forEach(storeName => {
    try {
      Alpine.store(storeName);
      console.warn(`⚠️  Ancien store "${storeName}" toujours présent`);
      allOldStoresRemoved = false;
    } catch (error) {
      // C'est normal que les anciens stores ne soient plus disponibles
    }
  });
  
  if (allOldStoresRemoved) {
    console.log('✅ Tous les anciens stores ont été supprimés');
  }
} catch (error) {
  console.error('❌ Erreur lors de la vérification des anciens stores:', error);
}

// Test 3: Vérifier la structure du store consolidé
try {
  const sequenceStore = Alpine.store('sequence');
  
  // Vérifier les sections principales
  const requiredSections = [
    'sequences',
    'currentSequence', 
    'associatedImpayes',
    'smtpProfiles',
    'variables',
    'paymentLinks',
    'isLoading',
    'error'
  ];
  
  let allSectionsPresent = true;
  requiredSections.forEach(section => {
    if (!(section in sequenceStore)) {
      console.error(`❌ Section manquante: ${section}`);
      allSectionsPresent = false;
    }
  });
  
  if (allSectionsPresent) {
    console.log('✅ Toutes les sections requises sont présentes dans le store consolidé');
  }
} catch (error) {
  console.error('❌ Erreur lors de la vérification de la structure du store:', error);
}

// Test 4: Vérifier les sous-sections
try {
  const sequenceStore = Alpine.store('sequence');
  
  // Vérifier smtpProfiles
  const smtpSubSections = ['profiles', 'selectedProfile', 'isLoading', 'error'];
  let smtpOk = true;
  smtpSubSections.forEach(subSection => {
    if (!(subSection in sequenceStore.smtpProfiles)) {
      console.error(`❌ Sous-section SMTP manquante: ${subSection}`);
      smtpOk = false;
    }
  });
  if (smtpOk) console.log('✅ Sous-section smtpProfiles complète');
  
  // Vérifier variables
  const variablesSubSections = ['variables', 'filteredVariables', 'isLoading', 'error', 'searchTerm'];
  let variablesOk = true;
  variablesSubSections.forEach(subSection => {
    if (!(subSection in sequenceStore.variables)) {
      console.error(`❌ Sous-section variables manquante: ${subSection}`);
      variablesOk = false;
    }
  });
  if (variablesOk) console.log('✅ Sous-section variables complète');
  
  // Vérifier paymentLinks
  const paymentLinksSubSections = ['links', 'selectedLink', 'isLoading', 'error', 'showLink', 'customMessage'];
  let paymentLinksOk = true;
  paymentLinksSubSections.forEach(subSection => {
    if (!(subSection in sequenceStore.paymentLinks)) {
      console.error(`❌ Sous-section paymentLinks manquante: ${subSection}`);
      paymentLinksOk = false;
    }
  });
  if (paymentLinksOk) console.log('✅ Sous-section paymentLinks complète');
  
} catch (error) {
  console.error('❌ Erreur lors de la vérification des sous-sections:', error);
}

// Test 5: Vérifier les méthodes principales
try {
  const sequenceStore = Alpine.store('sequence');
  
  const requiredMethods = [
    'loadSequences',
    'loadSequence',
    'saveSequence',
    'createSequence',
    'deleteSequence',
    'loadAssociatedImpayes',
    'addActionToCurrentSequence',
    'removeActionFromCurrentSequence',
    'updateActionInCurrentSequence',
    'loadSmtpProfiles',
    'addSmtpProfile',
    'updateSmtpProfile',
    'deleteSmtpProfile',
    'selectSmtpProfile',
    'selectSmtpProfileByEmail',
    'getDefaultProfile',
    'getDefaultSenderEmail',
    'getDefaultProfileId',
    'loadVariables',
    'updateFilteredVariables',
    'setSearchTerm',
    'copyVariable',
    'loadPaymentLinks',
    'addPaymentLink',
    'selectPaymentLink',
    'toggleShowPaymentLink',
    'setPaymentLinkCustomMessage',
    'copyPaymentLinkVariable',
    'copyPaymentLinkUrl',
    'resetStore',
    'formatDate',
    'formatCurrency'
  ];
  
  let allMethodsPresent = true;
  requiredMethods.forEach(method => {
    if (typeof sequenceStore[method] !== 'function') {
      console.error(`❌ Méthode manquante: ${method}`);
      allMethodsPresent = false;
    }
  });
  
  if (allMethodsPresent) {
    console.log('✅ Toutes les méthodes requises sont présentes');
  }
} catch (error) {
  console.error('❌ Erreur lors de la vérification des méthodes:', error);
}

console.log('🏁 Tests de consolidation terminés!');