const { test, expect } = require('@playwright/test');

// Test pour vérifier que les données sont affichées dans le tableau
test('Vérification de l\'affichage des données dans le tableau', async ({ page }) => {
  // Naviguer vers la page /sequences
  await page.goto('/sequences');
  
  // Attendre que le chargement soit terminé (disparition du spinner)
  await page.waitForSelector('.animate-spin', { state: 'hidden' });
  
  // Vérifier que le tableau est visible
  const table = page.locator('table');
  await expect(table).toBeVisible();
  
  // Vérifier que le tableau contient des lignes de données
  const rows = table.locator('tbody tr');
  await expect(rows).toHaveCountGreaterThan(0);
  
  // Vérifier que chaque ligne contient les bonnes colonnes
  for (const row of await rows.all()) {
    // Vérifier la présence des colonnes
    const nom = row.locator('td:nth-child(1)');
    const statut = row.locator('td:nth-child(2)');
    const peuplement = row.locator('td:nth-child(3)');
    const relances = row.locator('td:nth-child(4)');
    const action = row.locator('td:nth-child(5)');
    
    await expect(nom).not.toBeEmpty();
    await expect(statut).not.toBeEmpty();
    await expect(peuplement).not.toBeEmpty();
    await expect(relances).not.toBeEmpty();
    await expect(action).toContainText('Voir détails');
  }
  
  // Vérifier que les lignes sont cliquables
  const firstRow = rows.first();
  await expect(firstRow).toHaveClass(/hover:bg-gray-50/);
  await expect(firstRow).toHaveClass('cursor-pointer');
});