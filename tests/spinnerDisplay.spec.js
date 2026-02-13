const { test, expect } = require('@playwright/test');

// Test pour vérifier que le spinner s'affiche pendant le chargement
test('Vérification de l\'affichage du spinner pendant le chargement', async ({ page }) => {
  // Naviguer vers la page /sequences
  const response = await page.goto('/sequences');
  
  // Vérifier que le spinner est visible immédiatement
  const spinner = page.locator('.animate-spin');
  await expect(spinner).toBeVisible();
  
  // Attendre que le spinner disparaisse (chargement terminé)
  await spinner.waitFor({ state: 'hidden' });
  
  // Vérifier que le spinner n'est plus visible
  await expect(spinner).not.toBeVisible();
  
  // Vérifier que le tableau est maintenant visible
  const table = page.locator('table');
  await expect(table).toBeVisible();
});