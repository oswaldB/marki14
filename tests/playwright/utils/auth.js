const { chromium } = require('@playwright/test');

/**
 * Authentication utility for Playwright tests
 * Handles login for both admin and non-admin users
 */

class AuthUtils {
  /**
   * Standard user credentials
   */
  static get STANDARD_USER() {
    return {
      username: 'oswald',
      password: 'coucou'
    };
  }

  /**
   * Admin user credentials (same as standard in this case)
   */
  static get ADMIN_USER() {
    return {
      username: 'oswald',
      password: 'coucou'
    };
  }

  /**
   * Perform login and return authenticated browser context
   * @param {import('@playwright/test').Browser} browser - Playwright browser instance
   * @param {boolean} isAdmin - Whether to login as admin
   * @returns {Promise<import('@playwright/test').BrowserContext>} Authenticated browser context
   */
  static async login(browser, isAdmin = false) {
    // Use appropriate credentials
    const credentials = isAdmin ? this.ADMIN_USER : this.STANDARD_USER;
    
    // Create new browser context
    const context = await browser.newContext({
      storageState: undefined, // Start with clean state
      ignoreHTTPSErrors: true
    });
    
    // Create new page
    const page = await context.newPage();
    
    // Navigate to login page
    console.log('🌐 Navigating to login page...');
    await page.goto('https://dev.markidiags.com/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('✅ Login page loaded');
    
    // Add a small delay to ensure Alpine.js is fully initialized
    await page.waitForTimeout(2000);
    
    // Wait for login form elements to be available
    console.log('🔍 Waiting for login form elements...');
    await page.waitForSelector('#username', { timeout: 10000 });
    await page.waitForSelector('#password', { timeout: 10000 });
    await page.waitForSelector('button[type="submit"]:has-text("Se connecter")', { timeout: 10000 });
    console.log('✅ Login form elements found');
    
    // Fill login form - using Alpine.js x-model bound elements
    console.log('📝 Filling login form with credentials:', credentials.username);
    await page.fill('#username', credentials.username);
    await page.fill('#password', credentials.password);
    console.log('✅ Form filled');
    
    // Click login button
    console.log('🔘 Attempting to click login button...');
    try {
      await page.click('button[type="submit"]:has-text("Se connecter")', { timeout: 10000 });
      console.log('✅ Login button clicked');
    } catch (error) {
      console.error('❌ Failed to click login button:', error.message);
      throw error;
    }
    
    // Wait for navigation to complete
    console.log('🔄 Waiting for navigation to dashboard...');
    try {
      await page.waitForURL('**/dashboard', { timeout: 20000 });
      console.log('✅ Navigation to dashboard completed');
    } catch (error) {
      console.log('⚠️  Navigation timeout, checking current URL...');
      const currentUrl = page.url();
      console.log(`Current URL: ${currentUrl}`);
      if (!currentUrl.includes('/dashboard')) {
        console.error('❌ Not on dashboard page after login');
        throw new Error(`Failed to navigate to dashboard. Current URL: ${currentUrl}`);
      } else {
        console.log('ℹ️  Already on dashboard page');
      }
    }
    
    // Verify successful login by checking for dashboard content
    console.log('🔍 Looking for dashboard content...');
    try {
      await page.waitForSelector('text=Dashboard', { timeout: 15000 });
      console.log('✅ Dashboard content found');
    } catch (error) {
      console.log('⚠️  Dashboard content not found, checking page state...');
      const pageTitle = await page.title();
      const pageContent = await page.content();
      console.log(`Page title: ${pageTitle}`);
      
      // Check if we can find Dashboard in the content
      if (pageContent.includes('Dashboard')) {
        console.log('ℹ️  Dashboard content found in page source');
      } else {
        console.error('❌ Dashboard content not found in page source');
        throw new Error(`Dashboard content not found. Page title: ${pageTitle}`);
      }
    }
    
    console.log(`Successfully logged in as ${credentials.username} (admin: ${isAdmin})`);
    
    return context;
  }

  /**
   * Get storage state for authenticated user
   * @param {boolean} isAdmin - Whether to get admin storage state
   * @returns {Promise<{cookies: Array, origins: Array}>} Storage state
   */
  static async getStorageState(isAdmin = false) {
    const browser = await chromium.launch({
      headless: true
    });
    
    const context = await this.login(browser, isAdmin);
    
    // Get storage state
    const storageState = await context.storageState();
    
    await context.close();
    await browser.close();
    
    return storageState;
  }

  /**
   * Save storage state to file for reuse
   * @param {string} filePath - Path to save storage state
   * @param {boolean} isAdmin - Whether to save admin storage state
   */
  static async saveStorageState(filePath, isAdmin = false) {
    const storageState = await this.getStorageState(isAdmin);
    const fs = require('fs');
    fs.writeFileSync(filePath, JSON.stringify(storageState, null, 2));
    console.log(`Storage state saved to ${filePath}`);
  }
}

module.exports = AuthUtils;