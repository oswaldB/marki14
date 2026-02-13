const { test, expect } = require('@playwright/test');

// Test pour vérifier que le tableau correspond à l'ASCII
test('Vérification du design du tableau selon l\'ASCII', async ({ page }) => {
  // Naviguer vers la page /sequences
  await page.goto('/sequences');
  
  // Attendre que le chargement soit terminé
  await page.waitForSelector('.animate-spin', { state: 'hidden' });
  
  // Vérifier que le tableau est visible
  const table = page.locator('table');
  await expect(table).toBeVisible();
  
  // Vérifier la structure du tableau selon l'ASCII
  const headers = table.locator('thead th');
  await expect(headers).toHaveCount(5);
  
  const expectedHeaders = ['Nom', 'Statut', 'Peuplement', 'Relances', 'Action'];
  for (let i = 0; i < expectedHeaders.length; i++) {
    await expect(headers.nth(i)).toContainText(expectedHeaders[i]);
  }
  
  // Vérifier que le tableau a des bordures
  await expect(table).toHaveClass(/border/);
  
  // Vérifier que les lignes ont un hover effect
  const rows = table.locator('tbody tr');
  await expect(rows.first()).toHaveClass(/hover:bg-gray-50/);
  
  // Vérifier que les lignes sont cliquables
  await expect(rows.first()).toHaveClass('cursor-pointer');
  
  // Vérifier que le statut est affiché avec des badges colorés
  const statutCell = rows.first().locator('td:nth-child(2) span');
  await expect(statutCell).toHaveClass(/bg-(green|red)-100/);
  await expect(statutCell).toHaveClass(/text-(green|red)-800/);
});