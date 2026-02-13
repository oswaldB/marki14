#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Playwright setup for marki14...\n');

const testDir = path.join(__dirname, 'tests');
const requiredFiles = [
  'tests/playwright/playwright.config.js',
  'tests/playwright/utils/auth.js',
  'tests/playwright/utils/global-setup.js',
  'tests/example.spec.js',
  'tests/README.md',
  'tests/package.json',
  'tests/init-playwright.js'
];

let allFilesExist = true;

console.log('Checking required files:');
requiredFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  const exists = fs.existsSync(fullPath);
  console.log(`  ${exists ? '✅' : '❌'} ${filePath}`);
  if (!exists) allFilesExist = false;
});

console.log('\nConfiguration details:');

// Check base URL
const configPath = path.join(__dirname, 'tests/playwright/playwright.config.js');
if (fs.existsSync(configPath)) {
  const configContent = fs.readFileSync(configPath, 'utf8');
  const baseUrlMatch = configContent.match(/baseURL:\s*['"]([^'"]+)['"]/);
  if (baseUrlMatch) {
    console.log(`  ✅ Base URL: ${baseUrlMatch[1]}`);
  }
  
  const headlessMatch = configContent.match(/headless:\s*([^,\s]+)/);
  if (headlessMatch) {
    console.log(`  ✅ Headless mode: ${headlessMatch[1]}`);
  }
}

// Check credentials
const authPath = path.join(__dirname, 'tests/playwright/utils/auth.js');
if (fs.existsSync(authPath)) {
  const authContent = fs.readFileSync(authPath, 'utf8');
  const usernameMatch = authContent.match(/username:\s*['"]([^'"]+)['"]/);
  const passwordMatch = authContent.match(/password:\s*['"]([^'"]+)['"]/);
  
  if (usernameMatch && passwordMatch) {
    console.log(`  ✅ Credentials configured: ${usernameMatch[1]}/*****`);
  }
}

console.log('\nSetup status:');
if (allFilesExist) {
  console.log('  ✅ All required files are present');
  console.log('\n🎉 Playwright setup is complete!');
  console.log('\nNext steps:');
  console.log('1. cd tests');
  console.log('2. node init-playwright.js');
  console.log('3. npm run test:setup');
  console.log('4. npm test');
} else {
  console.log('  ❌ Some files are missing');
  console.log('\nPlease check the installation.');
  process.exit(1);
}