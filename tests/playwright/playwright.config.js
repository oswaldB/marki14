const { defineConfig, devices } = require('@playwright/test');

// Playwright configuration
module.exports = defineConfig({
  testDir: './tests',
  
  // Base URL for all tests
  use: {
    baseURL: 'https://dev.markidiags.com',
    
    // Always run in headless mode
    headless: true,
    
    // Browser configuration
    browserName: 'chromium',
    
    // Viewport size
    viewport: { width: 1280, height: 720 },
    
    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video recording
    video: 'retain-on-failure',
    
    // Trace viewing
    trace: 'retain-on-failure',
  },
  
  // Timeout settings
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  
  // Retry configuration
  retries: 2,
  
  // Workers
  workers: 1,
  
  // Reporter configuration
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],
  
  // Global setup and teardown
  globalSetup: './tests/playwright/utils/global-setup.js',
  
  // Projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    // Uncomment to test on other browsers
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
});