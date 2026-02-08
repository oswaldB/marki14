/**
 * Test Playwright simplifié pour diagnostiquer les problèmes d'affichage des séquences
 */

const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Test de diagnostic pour les séquences...');
  
  let browser = null;
  let page = null;
  
  try {
    // Lancer le navigateur en mode headless
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    page = await context.newPage();
    
    // Étape 1: Vérifier que le serveur est accessible
    console.log('📝 Étape 1/3: Vérification de l\'accessibilité du serveur...');
    try {
      const response = await page.goto('http://localhost:5000/login', { 
        waitUntil: 'domcontentloaded',
        timeout: 10000 
      });
      console.log(`✅ Serveur accessible - Status: ${response.status()}`);
    } catch (error) {
      console.error('❌ Impossible d\'atteindre le serveur:', error.message);
      throw error;
    }
    
    // Étape 2: Tentative de connexion
    console.log('📝 Étape 2/3: Tentative de connexion...');
    await page.fill('input#email', 'oswald');
    await page.fill('input#password', 'coucou');
    
    // Intercepter les erreurs de navigation
    let navigationError = null;
    page.on('pageerror', error => {
      console.error('🚨 Erreur de page:', error.message);
      navigationError = error;
    });
    
    // Cliquer sur le bouton de connexion
    await Promise.race([
      page.click('button[type="submit"]'),
      new Promise((resolve) => setTimeout(resolve, 5000))
    ]);
    
    // Attendre la navigation ou un timeout
    try {
      await Promise.race([
        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }),
        page.waitForSelector('.text-red-700', { timeout: 10000 }) // Erreur de connexion
      ]);
      
      // Vérifier si nous sommes connectés
      const currentUrl = page.url();
      console.log(`🔗 URL actuelle: ${currentUrl}`);
      
      if (currentUrl.includes('/login')) {
        // Vérifier s'il y a une erreur de connexion
        const errorVisible = await page.isVisible('.text-red-700');
        if (errorVisible) {
          const errorText = await page.textContent('.text-red-700');
          console.error(`❌ Erreur de connexion: ${errorText}`);
        } else {
          console.log('⚠️  Toujours sur la page de login, mais pas d\'erreur visible');
        }
      } else {
        console.log('✅ Connexion réussie, redirigé vers:', currentUrl);
      }
    } catch (error) {
      console.log('⚠️  Navigation timeout ou erreur:', error.message);
      console.log('📝 Continuation du diagnostic...');
    }
    
    // Étape 3: Tentative d'accès direct à la page des séquences
    console.log('📝 Étape 3/3: Accès direct à la page des séquences...');
    try {
      const response = await page.goto('http://localhost:5000/sequences', { 
        waitUntil: 'domcontentloaded',
        timeout: 10000 
      });
      console.log(`🔗 Page des séquences - Status: ${response.status()}`);
      
      // Vérifier le contenu de la page
      const pageTitle = await page.title();
      const pageContent = await page.content();
      
      console.log(`🏷️ Titre: "${pageTitle}"`);
      
      // Vérifier si c'est une page d'erreur ou de redirection
      if (pageContent.includes('Connexion') || pageContent.includes('login')) {
        console.log('ℹ️  Redirigé vers la page de login - authentification requise');
      } else if (pageContent.includes('Séquences de Relance')) {
        console.log('✅ Page des séquences chargée avec succès');
        
        // Vérifier si des séquences sont présentes
        const hasSequences = await page.evaluate(() => {
          return document.querySelectorAll('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3 > div').length > 0;
        });
        
        console.log(`📊 Séquences trouvées: ${hasSequences ? 'Oui' : 'Non'}`);
        
        // Vérifier l'état vide
        const isEmpty = await page.isVisible('text=Aucune séquence trouvée');
        console.log(`📋 État vide: ${isEmpty ? 'Oui' : 'Non'}`);
        
      } else {
        console.log('❓ Contenu de la page non reconnu');
      }
      
    } catch (error) {
      console.error('❌ Impossible d\'accéder à la page des séquences:', error.message);
    }
    
    // Capture d'écran finale
    await page.screenshot({ path: 'tests/playwright/screenshots/debug-final.png' });
    console.log('📸 Capture d\'écran de diagnostic sauvegardée');
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    if (page) {
      await page.screenshot({ path: 'tests/playwright/screenshots/debug-error.png' });
    }
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
    console.log('🎉 Diagnostic terminé');
  }
})();