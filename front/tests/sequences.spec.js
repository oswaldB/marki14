// front/tests/sequences.spec.js
import { test, expect } from '@playwright/test';

test.describe('Sequences Page', () => {
  test.beforeEach(async ({ page }) => {
    // Start the dev server before running tests
    await page.goto('http://localhost:5000/sequences');
  });

  test('should load sequences page without 404', async ({ page }) => {
    await expect(page).toHaveURL(/sequences/);
    await expect(page).not.toHaveTitle(/404/);
    await expect(page.locator('h1')).toHaveText('Liste des Séquences');
  });

  test('should show loading indicator initially', async ({ page }) => {
    const loadingIndicator = page.locator('#loading');
    await expect(loadingIndicator).toBeVisible();
  });

  test('should fetch and display sequences data', async ({ page }) => {
    // Wait for the sequences to load
    await page.waitForSelector('#sequences-body tr', { state: 'visible' });
    
    const rows = page.locator('#sequences-body tr');
    const rowCount = await rows.count();
    
    // We should have at least one sequence from the test data
    expect(rowCount).toBeGreaterThan(0);
    
    // Check that the first row has the expected data
    const firstRow = rows.first();
    await expect(firstRow.locator('td:nth-child(1)')).toBeVisible();
    await expect(firstRow.locator('td:nth-child(2) span')).toBeVisible();
    await expect(firstRow.locator('td:nth-child(3)')).toBeVisible();
    await expect(firstRow.locator('td:nth-child(4)')).toBeVisible();
  });

  test('should show error message when fetch fails', async ({ page }) => {
    // Mock a failed fetch response
    await page.route('https://dev.parse.markidiags.com/classes/Sequences', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    // Reload the page to trigger the error
    await page.reload();
    
    const errorMessage = page.locator('#error');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage.locator('#error-message')).toHaveText('Impossible de charger les séquences');
    
    // Table should be hidden
    const table = page.locator('#sequences-table');
    await expect(table).not.toBeVisible();
  });

  test('should retry when retry button is clicked', async ({ page }) => {
    // First, mock a failed response
    let requestCount = 0;
    await page.route('https://dev.parse.markidiags.com/classes/Sequences', route => {
      requestCount++;
      if (requestCount === 1) {
        // First request fails
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' })
        });
      } else {
        // Second request succeeds
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            results: [
              {
                objectId: 'test1',
                nom: 'Test Sequence',
                isActif: true,
                isAuto: false
              }
            ]
          })
        });
      }
    });
    
    // Reload to trigger the error
    await page.reload();
    
    // Error should be visible
    const errorMessage = page.locator('#error');
    await expect(errorMessage).toBeVisible();
    
    // Click retry button
    const retryButton = page.locator('#retry-button');
    await retryButton.click();
    
    // Wait for the sequences to load
    await page.waitForSelector('#sequences-body tr', { state: 'visible' });
    
    // Error should be gone
    await expect(errorMessage).not.toBeVisible();
    
    // Table should be visible
    const table = page.locator('#sequences-table');
    await expect(table).toBeVisible();
  });

  test('should redirect to manual sequence detail page when clicking manual sequence', async ({ page }) => {
    // Mock the sequences response
    await page.route('https://dev.parse.markidiags.com/classes/Sequences', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          results: [
            {
              objectId: 'manual1',
              nom: 'Manual Sequence',
              isActif: true,
              isAuto: false
            }
          ]
        })
      });
    });
    
    // Mock the relances count response
    await page.route('https://dev.parse.markidiags.com/classes/Impayes*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ count: 5 })
      });
    });
    
    // Reload to get the data
    await page.reload();
    
    // Wait for the sequence to load
    await page.waitForSelector('#sequences-body tr', { state: 'visible' });
    
    // Click the first row (manual sequence)
    const firstRow = page.locator('#sequences-body tr').first();
    await firstRow.click();
    
    // Should redirect to manual sequence detail page
    await expect(page).toHaveURL(/sequences\/manuelle\/?id=manual1/);
  });

  test('should redirect to automatic sequence detail page when clicking automatic sequence', async ({ page }) => {
    // Mock the sequences response
    await page.route('https://dev.parse.markidiags.com/classes/Sequences', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          results: [
            {
              objectId: 'auto1',
              nom: 'Automatic Sequence',
              isActif: true,
              isAuto: true
            }
          ]
        })
      });
    });
    
    // Mock the relances count response
    await page.route('https://dev.parse.markidiags.com/classes/Impayes*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ count: 3 })
      });
    });
    
    // Reload to get the data
    await page.reload();
    
    // Wait for the sequence to load
    await page.waitForSelector('#sequences-body tr', { state: 'visible' });
    
    // Click the first row (automatic sequence)
    const firstRow = page.locator('#sequences-body tr').first();
    await firstRow.click();
    
    // Should redirect to automatic sequence detail page
    await expect(page).toHaveURL(/sequences\/auto\/?id=auto1/);
  });
});