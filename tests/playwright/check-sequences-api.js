// Script Playwright pour vérifier les appels Parse Server pour les séquences
const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Script de vérification des appels Parse pour les séquences');
  console.log('==========================================================\n');

  // Lancer le navigateur en mode headless
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Variables pour suivre les appels Parse
  let parseRequests = [];
  let sequencesFound = false;

  // Configurer l'écoute des événements réseau avec focus sur Parse
  page.on('request', request => {
    const url = request.url();
    if (url.includes('dev.parse.markidiags.com')) {
      const parseRequest = {
        url: url,
        method: request.method(),
        timestamp: new Date().toISOString(),
        isSequences: url.includes('Sequences') || url.includes('sequences')
      };
      parseRequests.push(parseRequest);
      
      if (parseRequest.isSequences) {
        sequencesFound = true;
        console.log(`🎯 SEQUENCES REQUETE: ${request.method()} ${url}`);
      } else {
        console.log(`🔵 PARSE REQUETE: ${request.method()} ${url}`);
      }
    }
  });

  page.on('response', async response => {
    const url = response.url();
    if (url.includes('dev.parse.markidiags.com')) {
      const request = parseRequests.find(r => r.url === url);
      if (request) {
        request.status = response.status();
        
        if (request.isSequences) {
          console.log(`📊 SEQUENCES REPONSE: ${response.status()} ${url}`);
          
          // Essayer de parser la réponse
          try {
            const data = await response.json();
            if (data && data.results) {
              console.log(`📊 NOMBRE DE SEQUENCES: ${data.results.length}`);
              if (data.results.length > 0) {
                console.log('📋 PREMIERE SEQUENCE:', JSON.stringify(data.results[0], null, 2));
              } else {
                console.log('ℹ️ Aucune séquence trouvée dans la réponse');
              }
            }
          } catch (e) {
            console.log(`⚠️ Impossible de parser la réponse: ${e.message}`);
          }
        }
      }
    }
  });

  try {
    // Naviguer directement vers la page des séquences (en supposant que nous sommes déjà connectés)
    console.log('🌐 Navigation vers la page des séquences...');
    await page.goto('https://dev.markidiags.com/sequences');

    // Attendre 15 secondes pour capturer les appels Parse
    console.log('⏳ Attente des appels Parse pendant 15 secondes...');
    await new Promise(resolve => setTimeout(resolve, 15000));

    // Résumé
    console.log('\n==========================================================');
    console.log('📊 RESUME DES APPELS PARSE');
    console.log('==========================================================');
    console.log(`📡 Total des appels Parse: ${parseRequests.length}`);
    console.log(`🎯 Appels pour les séquences: ${sequencesFound ? 'OUI' : 'NON'}`);
    
    if (parseRequests.length > 0) {
      console.log('\n📋 Liste des appels Parse:');
      parseRequests.forEach((req, index) => {
        console.log(`${index + 1}. ${req.method} ${req.url} - ${req.status || 'en attente'}`);
      });
    }

    if (!sequencesFound) {
      console.log('\n❓ Aucune requête Parse pour les séquences détectée.');
      console.log('Cela peut signifier:');
      console.log('  - Les séquences sont chargées via un autre mécanisme');
      console.log('  - Les données sont en cache');
      console.log('  - La classe Parse s\'appelle différemment');
      console.log('  - L\'authentification est nécessaire');
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Script terminé');
  }
})();