#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Initializing Playwright for marki14...');

try {
  // Check if package.json exists
  const packageJsonPath = path.join(__dirname, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log('❌ package.json not found in tests directory');
    process.exit(1);
  }

  console.log('✅ package.json found');

  // Install npm dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install', { cwd: __dirname, stdio: 'inherit' });

  // Install Playwright browsers
  console.log('🌐 Installing Playwright browsers...');
  execSync('npx playwright install', { cwd: __dirname, stdio: 'inherit' });

  // Create storage directory
  const storageDir = path.join(__dirname, 'storage');
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
    console.log('📁 Created storage directory');
  }

  console.log('✅ Playwright initialization complete!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Run global setup to generate storage states:');
  console.log('   cd tests && npm run test:setup');
  console.log('');
  console.log('2. Run tests:');
  console.log('   cd tests && npm test');

} catch (error) {
  console.error('❌ Initialization failed:', error.message);
  process.exit(1);
}