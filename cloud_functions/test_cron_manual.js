// cloud_functions/test_cron_manual.js
// Script de test manuel pour les fonctions cron

const {
  fetchRelancesPlanifiees,
  sendRelance,
  updateRelanceAfterSend,
  replanifyFailedRelance,
  logCronResult,
  triggerRelanceCron
} = require('./cronFunctions');

// Mock de Parse pour les tests manuels
const mockParse = {
  Object: {
    extend: function(className) {
      return function() {
        return {
          id: null,
          set: function(field, value) {
            this[field] = value;
          },
          save: function() {
            return Promise.resolve({ id: 'mock-id' });
          },
          get: function(field) {
            return this[field];
          }
        };
      };
    }
  },
  Query: function() {
    return {
      equalTo: function() { return this; },
      lessThanOrEqualTo: function() { return this; },
      ascending: function() { return this; },
      find: function() {
        // Retourner des relances mockées
        return Promise.resolve([
          {
            id: 'rel1',
            get: function(field) {
              const data = {
                'email_to': 'test@example.com',
                'email_subject': 'Test Subject',
                'email_body': 'Test Body',
                'email_sender': 'sender@example.com',
                'is_sent': false,
                'send_date': new Date(Date.now() - 3600000) // 1 heure dans le passé
              };
              return data[field];
            }
          }
        ]);
      }
    };
  },
  User: {
    current: function() {
      return { id: 'user1' };
    }
  }
};

// Remplacer Parse par le mock
global.Parse = mockParse;

async function testCronFunctions() {
  console.log('Début des tests manuels des fonctions cron...');
  
  try {
    // Test 1: fetchRelancesPlanifiees
    console.log('\n1. Test de fetchRelancesPlanifiees:');
    const relances = await fetchRelancesPlanifiees();
    console.log(`   Trouvé ${relances.length} relance(s) planifiée(s)`);
    
    // Test 2: sendRelance
    console.log('\n2. Test de sendRelance:');
    if (relances.length > 0) {
      const result = await sendRelance(relances[0], 1);
      console.log(`   Résultat: succès=${result.success}, message=${result.message}`);
    }
    
    // Test 3: updateRelanceAfterSend
    console.log('\n3. Test de updateRelanceAfterSend:');
    const updateResult = await updateRelanceAfterSend('rel1', 'sent');
    console.log(`   Résultat: succès=${updateResult.success}`);
    
    // Test 4: triggerRelanceCron (test complet)
    console.log('\n4. Test complet de triggerRelanceCron:');
    const cronResult = await triggerRelanceCron();
    console.log(`   Résultat: succès=${cronResult.success}`);
    console.log(`   Statistiques: ${cronResult.sentCount} envoyées, ${cronResult.failedCount} échouées`);
    console.log(`   Durée: ${cronResult.executionDuration} secondes`);
    
    console.log('\n✅ Tous les tests manuels ont été exécutés avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors des tests manuels:', error);
    console.error(error.stack);
  }
}

// Exécuter les tests
testCronFunctions();