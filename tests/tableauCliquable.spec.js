const { test, expect } = require('@playwright/test');

// Test pour vérifier que le tableau est affiché et que les lignes sont cliquables
test('Vérification du tableau cliquable', async ({ page }) => {
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
  
  // Vérifier que chaque ligne a les bonnes classes pour être cliquable
  for (const row of await rows.all()) {
    await expect(row).toHaveClass(/hover:bg-gray-50/);
    await expect(row).toHaveClass('cursor-pointer');
  }
  
  // Vérifier que le clic sur une ligne déclenche bien la redirection
  const firstRow = rows.first();
  
  // Attendre la navigation
  const navigationPromise = page.waitForNavigation();
  
  // Cliquer sur la première ligne
  await firstRow.click();
  
  // Attendre que la navigation soit terminée
  await navigationPromise;
  
  // Vérifier que nous sommes bien sur une page de détail
  // (either /sequences/manuelle/ or /sequences/auto/)
  await expect(page).toHaveURL(/\/sequences\/(manuelle|auto)\/.*id=/);
});