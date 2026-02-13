import { test, expect } from '@playwright/test';

test('Test accès à la page /sequences', async ({ page }) => {
    await page.goto('/sequences');
    
    // Vérifier que la page ne retourne pas un 404
    const title = await page.title();
    expect(title).toBe('Liste des Séquences');
    
    // Vérifier que le titre de la page est présent
    const heading = await page.textContent('h1');
    expect(heading).toBe('LISTE DES SÉQUENCES');
});