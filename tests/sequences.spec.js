const { test, expect } = require('@playwright/test');

// Test pour vérifier que la page /sequences est accessible et ne retourne pas un 404
test('Page /sequences est accessible', async ({ page }) => {
  // Naviguer vers la page /sequences
  const response = await page.goto('/sequences');
  
  // Vérifier que la réponse n'est pas un 404
  expect(response.status()).not.toBe(404);
  
  // Vérifier que le titre de la page est correct
  await expect(page).toHaveTitle(/Liste des Séquences/);
  
  // Vérifier que le titre principal est affiché
  await expect(page.locator('h1')).toHaveText('Liste des Séquences');
});