const { test, expect } = require('@playwright/test');

// Test pour vérifier la redirection vers /sequences/manuelle/ et /sequences/auto/
test('Vérification de la redirection vers les pages de détail', async ({ page }) => {
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
  
  // Cliquer sur la première ligne et vérifier la redirection
  const firstRow = rows.first();
  
  // Récupérer le type de la première séquence
  const typeCell = firstRow.locator('td:nth-child(3)');
  const typeText = await typeCell.textContent();
  
  // Cliquer sur la ligne
  const [newPage] = await Promise.all([
    page.waitForEvent('popup'),
    firstRow.click()
  ]);
  
  // Vérifier l'URL de la nouvelle page en fonction du type
  if (typeText.includes('manuel')) {
    await expect(newPage).toHaveURL(/\/sequences\/manuelle\/.*id=/);
  } else if (typeText.includes('automatique')) {
    await expect(newPage).toHaveURL(/\/sequences\/auto\/.*id=/);
  }
  
  // Fermer la nouvelle page
  await newPage.close();
});