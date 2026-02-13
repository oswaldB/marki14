const { test, expect } = require('@playwright/test');

// Test pour simuler une erreur et vérifier que le message s'affiche
test('Vérification de l\'affichage des erreurs', async ({ page }) => {
  // Intercepter les requêtes fetch et simuler une erreur
  await page.route('**/parse/classes/Sequences', route => {
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Internal Server Error' })
    });
  });
  
  // Naviguer vers la page /sequences
  await page.goto('/sequences');
  
  // Attendre que le spinner disparaisse
  await page.waitForSelector('.animate-spin', { state: 'hidden' });
  
  // Vérifier que le message d'erreur est affiché
  const errorMessage = page.locator('.bg-red-100');
  await expect(errorMessage).toBeVisible();
  await expect(errorMessage).toContainText('Impossible de charger les séquences');
  
  // Vérifier que le bouton Réessayer est présent
  const retryButton = page.locator('button:has-text("Réessayer")');
  await expect(retryButton).toBeVisible();
  
  // Vérifier que le tableau n'est pas affiché
  const table = page.locator('table');
  await expect(table).not.toBeVisible();
});