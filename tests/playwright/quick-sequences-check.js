// Script Playwright rapide pour vérifier les erreurs de la page des séquences
const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Vérification rapide des séquences');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Capturer toutes les erreurs
  let errors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.text().includes('Erreur')) {
      errors.push(`CONSOLE: ${msg.text()}`);
    }
  });

  page.on('pageerror', error => {
    errors.push(`PAGE: ${error.message}`);
  });

  page.on('requestfailed', request => {
    errors.push(`NETWORK: ${request.url()} - ${request.failure()?.errorText}`);
  });

  try {
    // Connexion rapide
    await page.goto('https://dev.markidiags.com/login');
    await page.fill('#email', 'oswald');
    await page.fill('#password', 'coucou');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ timeout: 10000 });
    
    // Aller aux séquences
    await page.goto('https://dev.markidiags.com/sequences');
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Attendre 5 secondes pour capturer les erreurs
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Vérifier l'état
    const title = await page.title();
    const hasError = await page.$('div[class*="error"]');
    
    console.log(`📋 Résultat: ${title}`);
    console.log(`❌ Erreurs trouvées: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\n🔍 Détails des erreurs:');
      errors.forEach((error, i) => console.log(`${i+1}. ${error}`));
    } else {
      console.log('✅ Aucune erreur détectée');
    }
    
  } catch (error) {
    console.log(`💥 Erreur critique: ${error.message}`);
    errors.push(`SCRIPT: ${error.message}`);
  } finally {
    await browser.close();
    console.log('✅ Vérification terminée');
  }
})();