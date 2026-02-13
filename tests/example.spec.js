const { test, expect } = require('@playwright/test');
const AuthUtils = require('./playwright/utils/auth');

// Example test showing how to use authentication

// Test using global storage state (recommended for most tests)
test.use({
  storageState: './storage/standardUser.json'
});

test('Example test with authenticated user', async ({ page }) => {
  // Page is already authenticated via storageState
  await page.goto('/dashboard');
  
  // Verify we're on the dashboard
  await expect(page).toHaveURL('/dashboard');
  await expect(page).toHaveTitle(/Dashboard/);
});

// Test using admin user
test.use({
  storageState: './storage/adminUser.json'
});

test('Example test with admin user', async ({ page }) => {
  await page.goto('/admin');
  
  // Verify admin access
  await expect(page).toHaveURL('/admin');
});

// Alternative: Test with manual login (useful for testing login process itself)
test('Manual login test', async ({ browser }) => {
  const context = await AuthUtils.login(browser, false); // false = not admin
  const page = await context.newPage();
  
  await page.goto('/dashboard');
  await expect(page).toHaveURL('/dashboard');
  
  await context.close();
});

// Test login process
test('Login process test', async ({ page }) => {
  await page.goto('/login');
  
  // Fill login form
  await page.fill('#username', 'oswald');
  await page.fill('#password', 'coucou');
  
  // Submit form
  await page.click('button[type="submit"]:has-text("Se connecter")');
  
  // Verify successful login
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('text=Dashboard')).toBeVisible();
});