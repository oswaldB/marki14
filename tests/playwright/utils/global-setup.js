const { chromium } = require('@playwright/test');
const AuthUtils = require('./auth');
const fs = require('fs');
const path = require('path');

// Create storage directory if it doesn't exist
const storageDir = path.join(__dirname, '../../storage');
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

async function globalSetup() {
  console.log('Running global setup...');
  
  try {
    // Save standard user storage state
    const standardStoragePath = path.join(storageDir, 'standardUser.json');
    await AuthUtils.saveStorageState(standardStoragePath, false);
    
    // Save admin user storage state (same credentials in this case)
    const adminStoragePath = path.join(storageDir, 'adminUser.json');
    await AuthUtils.saveStorageState(adminStoragePath, true);
    
    console.log('Global setup completed successfully!');
    
    return {
      standardUser: standardStoragePath,
      adminUser: adminStoragePath
    };
  } catch (error) {
    console.error('Global setup failed:', error);
    throw error;
  }
}

module.exports = globalSetup;