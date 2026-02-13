const { test, expect } = require('@playwright/test');

// Test pour vérifier que le flux Mermaid est respecté
test('Vérification du flux Mermaid', async ({ page }) => {
  // Naviguer vers la page /sequences
  await page.goto('/sequences');
  
  // Vérifier que le spinner s'affiche pendant le chargement
  const spinner = page.locator('.animate-spin');
  await expect(spinner).toBeVisible();
  
  // Attendre que le chargement soit terminé
  await spinner.waitFor({ state: 'hidden' });
  
  // Vérifier que le tableau est affiché (requêtes réussies)
  const table = page.locator('table');
  await expect(table).toBeVisible();
  
  // Vérifier que les lignes sont cliquables
  const rows = table.locator('tbody tr');
  await expect(rows).toHaveCountGreaterThan(0);
  
  // Cliquer sur une ligne et vérifier la redirection
  const firstRow = rows.first();
  const typeCell = firstRow.locator('td:nth-child(3)');
  const typeText = await typeCell.textContent();
  
  const navigationPromise = page.waitForNavigation();
  await firstRow.click();
  await navigationPromise;
  
  // Vérifier la redirection en fonction du type
  if (typeText.includes('manuel')) {
    await expect(page).toHaveURL(/\/sequences\/manuelle\/.*id=/);
  } else if (typeText.includes('automatique')) {
    await expect(page).toHaveURL(/\/sequences\/auto\/.*id=/);
  }
  
  // Retour à la page des séquences pour tester l'erreur
  await page.goto('/sequences');
  
  // Intercepter les requêtes et simuler une erreur
  await page.route('**/parse/classes/Sequences', route => {
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Internal Server Error' })
    });
  });
  
  // Recharger la page
  await page.reload();
  
  // Vérifier que le message d'erreur s'affiche
  const errorMessage = page.locator('.bg-red-100');
  await expect(errorMessage).toBeVisible();
  await expect(errorMessage).toContainText('Impossible de charger les séquences');
  
  // Vérifier que le bouton Réessayer est présent
  const retryButton = page.locator('button:has-text("Réessayer")');
  await expect(retryButton).toBeVisible();
});