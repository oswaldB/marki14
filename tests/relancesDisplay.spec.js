const { test, expect } = require('@playwright/test');

// Test pour vérifier que le nombre de relances s'affiche dans le tableau
test('Vérification de l\'affichage du nombre de relances', async ({ page }) => {
  // Naviguer vers la page /sequences
  await page.goto('/sequences');
  
  // Attendre que le chargement soit terminé
  await page.waitForSelector('.animate-spin', { state: 'hidden' });
  
  // Vérifier que le tableau est visible
  const table = page.locator('table');
  await expect(table).toBeVisible();
  
  // Vérifier que le tableau contient des lignes de données
  const rows = table.locator('tbody tr');
  await expect(rows).toHaveCountGreaterThan(0);
  
  // Vérifier que chaque ligne contient un nombre de relances
  for (const row of await rows.all()) {
    const relances = row.locator('td:nth-child(4)');
    const relancesText = await relances.textContent();
    
    // Vérifier que le contenu est un nombre
    expect(relancesText).toMatch(/^\d+$/);
    
    // Vérifier que le nombre est supérieur ou égal à 0
    const relancesCount = parseInt(relancesText);
    expect(relancesCount).toBeGreaterThanOrEqual(0);
  }
});