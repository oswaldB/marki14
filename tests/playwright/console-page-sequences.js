// Script Playwright pour se connecter et naviguer vers la page des séquences
const { chromium } = require('playwright');

(async () => {
  // Lancer le navigateur en mode headless (arrière-plan)
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Configurer l'écoute des événements de la console
  page.on('console', msg => {
    console.log(`CONSOLE [${msg.type()}]: ${msg.text()}`);
  });

  // Configurer l'écoute des événements réseau avec filtres
  page.on('request', request => {
    const url = request.url();
    // Mettre en évidence les requêtes Parse Server
    if (url.includes('dev.parse.markidiags.com')) {
      console.log(`🔵 PARSE REQUETE: ${request.method()} ${url}`);
    } else {
      console.log(`REQUETE: ${request.method()} ${url}`);
    }
  });

  page.on('response', response => {
    const url = response.url();
    // Mettre en évidence les réponses Parse Server
    if (url.includes('dev.parse.markidiags.com')) {
      console.log(`🟢 PARSE REPONSE: ${response.status()} ${url}`);
      // Afficher le corps de la réponse pour les requêtes Parse
      if (response.status() === 200) {
        response.json().then(data => {
          if (data && data.results) {
            console.log(`📊 PARSE DONNEES: ${data.results.length} résultats retournés`);
            if (data.results.length > 0) {
              console.log(`📋 PREMIER RESULTAT:`, JSON.stringify(data.results[0], null, 2));
            }
          }
        }).catch(e => {
          console.log(`⚠️ Impossible de parser la réponse JSON: ${e.message}`);
        });
      }
    } else {
      console.log(`REPONSE: ${response.status()} ${url}`);
    }
  });

  page.on('requestfailed', request => {
    if (request.url().includes('dev.parse.markidiags.com')) {
      console.log(`❌ PARSE REQUETE ECHOUEE: ${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
    }
  });

  try {
    // Naviguer vers la page de login
    console.log('Navigation vers la page de login...');
    await page.goto('https://dev.markidiags.com/login'); // URL de l'application

    // Attendre que la page soit complètement chargée et que Alpine.js soit initialisé
    console.log('Attente du chargement complet de la page...');
    await page.waitForFunction(() => window.Alpine !== undefined);

    // Remplir le formulaire de login avec les bons sélecteurs
    console.log('Remplissage du formulaire de connexion...');
    await page.fill('#email', 'oswald');
    await page.fill('#password', 'coucou');

    // Soumettre le formulaire
    console.log('Soumission du formulaire...');
    await page.click('button[type="submit"]');

    // Attendre la navigation vers la page d'accueil ou le tableau de bord
    console.log('Attente de la connexion...');
    await page.waitForNavigation();

    // Vérifier que nous sommes bien connectés en vérifiant l'URL ou un élément spécifique
    const currentUrl = page.url();
    console.log('URL actuelle après connexion:', currentUrl);

    // Naviguer vers la page des séquences
    console.log('Navigation vers la page des séquences...');
    await page.goto('https://dev.markidiags.com/sequences');
    
    // Attendre spécifiquement les requêtes Parse pour les séquences
    console.log('Attente des requêtes Parse pour les séquences...');

    // Attendre que la page des séquences soit chargée
    console.log('Attente du chargement de la page des séquences...');
    await page.waitForSelector('h1:text("Séquences de Relance")', { timeout: 30000 }); // Attendre le titre spécifique
    
    // Attendre spécifiquement les appels Parse pour les séquences
    console.log('🔍 Attente des appels Parse pour les séquences...');
    
    // Écouter les requêtes Parse spécifiques aux séquences
    let sequencesRequestFound = false;
    const sequencesListener = async (request) => {
      const url = request.url();
      if (url.includes('dev.parse.markidiags.com') && 
          (url.includes('Sequences') || url.includes('sequences'))) {
        sequencesRequestFound = true;
        console.log(`🎯 SEQUENCES REQUETE TROUVEE: ${request.method()} ${url}`);
        
        // Attendre et afficher la réponse
        const response = await request.response();
        if (response) {
          console.log(`📊 SEQUENCES REPONSE: ${response.status()}`);
          try {
            const data = await response.json();
            if (data && data.results) {
              console.log(`📊 NOMBRE DE SEQUENCES: ${data.results.length}`);
              if (data.results.length > 0) {
                console.log('📋 PREMIERE SEQUENCE:', JSON.stringify(data.results[0], null, 2));
              }
            }
          } catch (e) {
            console.log(`⚠️ Impossible de parser la réponse des séquences: ${e.message}`);
          }
        }
      }
    };
    
    page.on('request', sequencesListener);
    
    // Attendre les séquences ou un timeout
    await new Promise(resolve => {
      setTimeout(() => {
        if (!sequencesRequestFound) {
          console.log('⏳ Aucun appel Parse pour les séquences détecté après 10 secondes');
        }
        resolve();
      }, 10000);
    });
    
    page.off('request', sequencesListener);
    
    // Vérifier si nous avons des séquences ou un état vide
    try {
      await page.waitForSelector('div[class*="grid grid-cols-1"]', { timeout: 5000 });
      console.log('📊 Grille des séquences trouvée - des séquences sont disponibles');
    } catch (e) {
      try {
        await page.waitForSelector('div:text("Aucune séquence trouvée")', { timeout: 3000 });
        console.log('📊 État vide trouvé - aucune séquence disponible');
      } catch (e) {
        console.log('❓ Aucun conteneur de séquences trouvé');
      }
    }

    console.log('Script exécuté avec succès !');

    // Résumé des logs
    console.log('\n=== RESUME DES LOGS ===');
    console.log('📊 Console et réseau surveillés pendant toute l\'exécution');
    console.log('🔍 Toutes les requêtes, réponses et messages console ont été affichés');
    console.log('✅ Script terminé avec succès');

  } catch (error) {
    console.error('Erreur lors de l\'exécution du script:', error);
  } finally {
    // Fermer le navigateur
    console.log('Fermeture du navigateur...');
    await browser.close();
  }
})();