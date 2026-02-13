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
    await page.goto('/login'); // Base URL is configured in playwright.config.js
    
    // Fill login form
    await page.fill('input[name="username"]', credentials.username);
    await page.fill('input[name="password"]', credentials.password);
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for navigation to complete (adjust selector as needed)
    await page.waitForURL('**/dashboard');
    
    // Verify successful login by checking for logout button or user info
    await page.waitForSelector('text=Logout');
    
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