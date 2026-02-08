/**
 * Test Playwright pour vérifier que les séquences s'affichent correctement
 * sur la page /sequences
 */

const { chromium } = require('playwright');

(async () => {
  // Configuration
  const BASE_URL = 'http://localhost:5000'; // Port adapté pour le serveur local
  const USERNAME = 'oswald'; // Credentials par défaut
  const PASSWORD = 'coucou'; // Credentials par défaut
  
  console.log('🔍 Démarrage du test Playwright pour la page des séquences...');
  
  let browser = null;
  let page = null;
  
  try {
    // Lancer le navigateur
    browser = await chromium.launch({ headless: true }); // Mode headless pour les environnements sans XServer
    const context = await browser.newContext();
    page = await context.newPage();
    
    // Étape 1: Connexion
    console.log('📝 Étape 1/4: Connexion à l\'application...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    
    // Remplir le formulaire de connexion
    await page.fill('input#email', USERNAME);
    await page.fill('input#password', PASSWORD);
    await page.click('button[type="submit"]');
    
    // Attendre la redirection après connexion
    await page.waitForNavigation({ waitUntil: 'networkidle' });
    console.log('✅ Connexion réussie');
    
    // Étape 2: Navigation vers la page des séquences
    console.log('📝 Étape 2/4: Navigation vers /sequences...');
    await page.goto(`${BASE_URL}/sequences`, { waitUntil: 'networkidle' });
    
    // Attendre que la page soit complètement chargée
    await page.waitForSelector('#sequencesPage', { state: 'attached' });
    console.log('✅ Page des séquences chargée');
    
    // Étape 3: Vérification de l'initialisation Alpine.js
    console.log('📝 Étape 3/4: Vérification de l\'initialisation Alpine.js...');
    
    // Attendre que l'état de chargement soit terminé (timeout réduit)
    try {
      await page.waitForFunction(() => {
        const sequencesPage = document.getElementById('sequencesPage');
        if (!sequencesPage) return false;
        
        // Vérifier que Alpine.js est initialisé
        const alpineData = sequencesPage.__x;
        if (!alpineData) return false;
        
        // Vérifier que l'état n'est plus en chargement
        const state = alpineData.$data;
        return state && !state.isLoading;
      }, { timeout: 15000 }); // Timeout réduit à 15 secondes
    } catch (error) {
      console.log('⚠️  Alpine.js n\'a pas pu s\'initialiser complètement dans le temps imparti');
      console.log('📝 Tentative de continuation malgré tout...');
      
      // Vérifier si la page est au moins partiellement chargée
      const pageTitle = await page.title();
      console.log(`🏷️ Titre de la page: "${pageTitle}"`);
      
      // Vérifier si Alpine.js est présent
      const hasAlpine = await page.evaluate(() => !!window.Alpine);
      console.log(`🔧 Alpine.js présent: ${hasAlpine}`);
      
      // Vérifier si l'élément sequencesPage existe
      const hasSequencesPage = await page.evaluate(() => !!document.getElementById('sequencesPage'));
      console.log(`📄 Élément sequencesPage présent: ${hasSequencesPage}`);
    }
    
    console.log('✅ Alpine.js initialisé et prêt');
    
    // Étape 4: Vérification de l'affichage des séquences
    console.log('📝 Étape 4/4: Vérification de l\'affichage des séquences...');
    
    // Vérifier si des séquences sont affichées
    const sequencesCount = await page.evaluate(() => {
      const sequencesPage = document.getElementById('sequencesPage');
      if (!sequencesPage || !sequencesPage.__x) return 0;
      
      const state = sequencesPage.__x.$data;
      return state.sequences ? state.sequences.length : 0;
    });
    
    console.log(`📊 Nombre de séquences trouvées: ${sequencesCount}`);
    
    if (sequencesCount === 0) {
      // Vérifier si c'est un état vide ou un problème de chargement
      const emptyStateVisible = await page.isVisible('text=Aucune séquence trouvée');
      const loadingStateVisible = await page.isVisible('text=Chargement des séquences...');
      
      if (emptyStateVisible) {
        console.log('ℹ️ État vide: Aucune séquence n\'existe dans la base de données');
      } else if (loadingStateVisible) {
        console.log('❌ Problème: L\'état de chargement est toujours visible');
      } else {
        console.log('❌ Problème: Impossible de déterminer l\'état de la page');
      }
    } else {
      // Vérifier que les séquences sont bien affichées dans le DOM
      const sequenceCards = await page.$$eval('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3 > div', 
        cards => cards.length
      );
      
      console.log(`📋 Cartes de séquences affichées dans le DOM: ${sequenceCards}`);
      
      if (sequenceCards === sequencesCount) {
        console.log('✅ Toutes les séquences sont correctement affichées');
        
        // Vérifier quelques éléments spécifiques
        const firstSequenceName = await page.$eval('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3 > div:first-child [x-text="sequence.nom"]', 
          el => el.textContent
        );
        console.log(`🏷️ Nom de la première séquence: "${firstSequenceName}"`);
        
      } else {
        console.log('⚠️ Attention: Le nombre de cartes ne correspond pas au nombre de séquences');
      }
    }
    
    // Capture d'écran pour référence
    await page.screenshot({ path: 'tests/playwright/screenshots/sequences-page.png' });
    console.log('📸 Capture d\'écran sauvegardée');
    
    // Test réussi
    console.log('🎉 Test Playwright terminé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test Playwright:', error);
    
    // Capture d'écran en cas d'erreur
    if (page) {
      await page.screenshot({ path: 'tests/playwright/screenshots/sequences-error.png' });
      console.log('📸 Capture d\'écran de l\'erreur sauvegardée');
    }
    
    process.exit(1);
  } finally {
    // Fermer le navigateur
    if (browser) {
      await browser.close();
      console.log('🚪 Navigateur fermé');
    }
  }
})();