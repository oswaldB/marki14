// Script Playwright pour diagnostiquer les erreurs de chargement de la page des séquences
const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Script de diagnostic des erreurs de la page des séquences');
  console.log('==========================================================\n');

  // Lancer le navigateur en mode headless avec capture d'erreurs améliorée
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Variables pour suivre les erreurs
  let consoleErrors = [];
  let parseErrors = [];
  let networkErrors = [];
  let alpineErrors = [];

  // Configurer l'écoute complète des événements
  page.on('console', msg => {
    const text = msg.text();
    consoleErrors.push(`${msg.type().toUpperCase()}: ${text}`);
    
    if (msg.type() === 'error') {
      console.log(`❌ CONSOLE ERROR: ${text}`);
    } else if (text.includes('Erreur') || text.includes('error')) {
      console.log(`⚠️ CONSOLE WARN: ${text}`);
    } else if (text.includes('Parse') || text.includes('Sequences')) {
      console.log(`📊 CONSOLE INFO: ${text}`);
    }
  });

  page.on('pageerror', error => {
    consoleErrors.push(`Page Error: ${error.message}`);
    console.log(`💥 PAGE ERROR: ${error.message}`);
  });

  page.on('requestfailed', request => {
    networkErrors.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
    console.log(`🌐 NETWORK ERROR: ${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
  });

  page.on('response', async response => {
    if (response.status() >= 400) {
      networkErrors.push(`${response.status()} ${response.url()}`);
      console.log(`⚠️ HTTP ERROR: ${response.status()} ${response.url()}`);
    }
  });

  try {
    // Étape 1: Connexion
    console.log('🔐 Étape 1/3: Connexion à l\'application...');
    await page.goto('https://dev.markidiags.com/login');
    
    // Attendre Alpine.js
    await page.waitForFunction(() => window.Alpine !== undefined, { timeout: 10000 });
    console.log('✅ Alpine.js chargé');
    
    // Remplir le formulaire
    await page.fill('#email', 'oswald');
    await page.fill('#password', 'coucou');
    await page.click('button[type="submit"]');
    
    // Attendre la connexion
    await page.waitForNavigation();
    console.log('✅ Connexion réussie');
    
    // Étape 2: Navigation vers les séquences
    console.log('\n📋 Étape 2/3: Navigation vers la page des séquences...');
    await page.goto('https://dev.markidiags.com/sequences');
    
    // Attendre le chargement initial
    await page.waitForSelector('h1:text("Séquences de Relance")', { timeout: 15000 });
    console.log('✅ Page des séquences chargée');
    
    // Étape 3: Attendre l'initialisation complète
    console.log('\n🔍 Étape 3/3: Surveillance des erreurs pendant 20 secondes...');
    
    // Attendre et capturer toutes les erreurs
    await new Promise(resolve => setTimeout(resolve, 20000));
    
    // Vérifier l'état final
    const hasSequences = await page.$('div[class*="grid grid-cols-1"]');
    const isEmptyState = await page.$('div:text("Aucune séquence trouvée")');
    const isLoading = await page.$('div:text("Chargement des séquences")');
    
    console.log('\n📊 ÉTAT FINAL DE LA PAGE:');
    console.log(`  - Grille des séquences: ${hasSequences ? 'OUI' : 'NON'}`);
    console.log(`  - État vide: ${isEmptyState ? 'OUI' : 'NON'}`);
    console.log(`  - Chargement en cours: ${isLoading ? 'OUI' : 'NON'}`);
    
  } catch (error) {
    console.error(`❌ Erreur critique: ${error.message}`);
    consoleErrors.push(`Script Error: ${error.message}`);
  } finally {
    // Résumé des erreurs
    console.log('\n==========================================================');
    console.log('📋 RAPPORT D\'ERREURS');
    console.log('==========================================================');
    
    const totalErrors = consoleErrors.length + networkErrors.length;
    console.log(`🔴 Total des erreurs détectées: ${totalErrors}`);
    
    if (consoleErrors.length > 0) {
      console.log(`\n📝 Erreurs de console (${consoleErrors.length}):`);
      consoleErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
    
    if (networkErrors.length > 0) {
      console.log(`\n🌐 Erreurs réseau (${networkErrors.length}):`);
      networkErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
    
    if (totalErrors === 0) {
      console.log('✅ Aucune erreur détectée - la page semble fonctionner correctement');
    } else {
      console.log('\n🔧 Suggestions de correction:');
      if (consoleErrors.some(e => e.includes('Parse'))) {
        console.log('  - Vérifier la configuration Parse et l\'authentification');
      }
      if (networkErrors.some(e => e.includes('404'))) {
        console.log('  - Vérifier les URLs et endpoints API');
      }
      if (consoleErrors.some(e => e.includes('Alpine'))) {
        console.log('  - Vérifier l\'initialisation Alpine.js');
      }
    }
    
    await browser.close();
    console.log('\n✅ Script de diagnostic terminé');
  }
})();