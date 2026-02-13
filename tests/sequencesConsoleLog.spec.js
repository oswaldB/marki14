const { test, expect } = require('@playwright/test');

// Test pour vérifier que les console.log s'affichent au chargement de la page
test('Vérification des console.log au chargement de la page', async ({ page, browser }) => {
  // Capturer les logs de la console
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push(msg.text());
    console.log(`Console: ${msg.text()}`);
  });

  // Naviguer vers la page /sequences
  await page.goto('/sequences');
  
  // Attendre un peu pour que les logs soient capturés
  await page.waitForTimeout(2000);
  
  // Vérifier que les logs attendus sont présents
  const expectedLogs = [
    'Composant sequencesState initialisé',
    'Début de la récupération des séquences'
  ];
  
  expectedLogs.forEach(expectedLog => {
    const foundLog = consoleLogs.find(log => log.includes(expectedLog));
    expect(foundLog).toBeTruthy();
  });
});