const { test, expect } = require('@playwright/test');
const AuthUtils = require('./playwright/utils/auth');

// Example test showing how to use authentication

// Test using global storage state (recommended for most tests)

// Alternative: Test with manual login (useful for testing login process itself)
test('Manual login test', async ({ browser }) => {
  const context = await AuthUtils.login(browser, false); // false = not admin
  const page = await context.newPage();
  
  await page.goto('http://localhost:5000/dashboard');
  await expect(page).toHaveURL('/dashboard');
  
  await context.close();
});

// Test login process
test('Login process test', async ({ page }) => {
  await page.goto('http://localhost:5000/login', { waitUntil: 'domcontentloaded' });
  
  // Fill login form
  await page.fill('#username', 'oswald');
  await page.fill('#password', 'coucou');
  
  // Submit form
  await page.click('button[type="submit"]:has-text("Se connecter")');
  
  // Verify successful login
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('text=Dashboard')).toBeVisible();
});