const { test, expect } = require('@playwright/test');
const AuthUtils = require('./playwright/utils/auth');

// Example test showing how to use authentication

// Test using global storage state (recommended for most tests)

// Alternative: Test with manual login (useful for testing login process itself)
test('Manual login test', async ({ browser }) => {
  const context = await AuthUtils.login(browser, false); // false = not admin
  const page = await context.newPage();
  
  await page.goto('https://dev.markidiags.com/dashboard', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await expect(page).toHaveURL('/dashboard');
  
  await context.close();
});

// Test login process
test('Login process test', async ({ page }) => {
  await page.goto('https://dev.markidiags.com/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
  
  // Add a small delay to ensure Alpine.js is fully initialized
  await page.waitForTimeout(2000);
  
  // Wait for login form elements
  await page.waitForSelector('#username', { timeout: 10000 });
  await page.waitForSelector('#password', { timeout: 10000 });
  await page.waitForSelector('button[type="submit"]:has-text("Se connecter")', { timeout: 10000 });
  
  // Fill login form
  await page.fill('#username', 'oswald');
  await page.fill('#password', 'coucou');
  
  // Submit form
  await page.click('button[type="submit"]:has-text("Se connecter")', { timeout: 10000 });
  
  // Verify successful login
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('text=Dashboard')).toBeVisible();
});