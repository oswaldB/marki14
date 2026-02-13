# Playwright Test Configuration

This directory contains Playwright configuration and utilities for end-to-end testing.

## Configuration

- **Base URL**: `https://dev.markidiags.com`
- **Mode**: Always headless
- **Browser**: Chromium (default)
- **Credentials**: 
  - Username: `oswald`
  - Password: `coucou`

## Structure

```
tests/
├── playwright/
│   ├── playwright.config.js  # Main Playwright configuration
│   └── utils/
│       ├── auth.js            # Authentication utility
│       └── global-setup.js    # Global setup for storage state
├── storage/
│   ├── standardUser.json     # Generated storage state for standard user
│   └── adminUser.json        # Generated storage state for admin user
└── *.spec.js                # Test files
```

## Setup

1. Install Playwright:
   ```bash
   npm init playwright@latest
   ```

2. Install required dependencies:
   ```bash
   npm install @playwright/test
   ```

## Running Tests

### First time setup (generate storage states):
```bash
npm run test -- --global-setup
```

### Run all tests:
```bash
npm run test
```

### Run specific test file:
```bash
npm run test example.spec.js
```

### Run in headed mode (for debugging):
```bash
npm run test -- --headed
```

## Writing Tests

### Using pre-authenticated storage state (recommended):

```javascript
const { test, expect } = require('@playwright/test');

test.use({
  storageState: './storage/standardUser.json'
});

test('Test with authenticated user', async ({ page }) => {
  await page.goto('/dashboard');
  // Your test logic here
});
```

### Using admin user:

```javascript
const { test, expect } = require('@playwright/test');

test.use({
  storageState: './storage/adminUser.json'
});

test('Test with admin user', async ({ page }) => {
  await page.goto('/admin');
  // Your admin test logic here
});
```

### Manual login (for testing login process):

```javascript
const { test, expect } = require('@playwright/test');
const AuthUtils = require('./playwright/utils/auth');

test('Manual login test', async ({ browser }) => {
  const context = await AuthUtils.login(browser, false); // false = not admin
  const page = await context.newPage();
  
  await page.goto('/dashboard');
  // Your test logic here
  
  await context.close();
});
```

## Authentication Utility

The `AuthUtils` class provides methods for handling authentication:

- `AuthUtils.login(browser, isAdmin)` - Perform login and return authenticated context
- `AuthUtils.getStorageState(isAdmin)` - Get storage state for authenticated user
- `AuthUtils.saveStorageState(filePath, isAdmin)` - Save storage state to file

## Best Practices

1. **Use storage state** for most tests to avoid repeated logins
2. **Keep tests independent** - each test should start with a clean state
3. **Use unique selectors** - avoid relying on text content that may change
4. **Add assertions** - verify the expected behavior
5. **Handle failures gracefully** - use try/catch where appropriate

## Troubleshooting

- **Login failures**: Check if the login page selectors need to be updated
- **Storage state issues**: Delete the `storage/` directory and regenerate
- **Timeout issues**: Adjust timeout settings in `playwright.config.js`

## Updating Selectors

If the login page structure changes, update the selectors in `auth.js`:
- Login form fields: `#username`, `#password` (Alpine.js x-model bound elements)
- Submit button: `button[type="submit"]:has-text("Se connecter")`
- Success indicator: `text=Dashboard`
- Dashboard URL: `/dashboard`

## Parse Authentication

The application uses Parse SDK for authentication. The login process:
1. Fills Alpine.js bound form fields
2. Submits to Parse.User.logIn()
3. Stores session token in localStorage or sessionStorage
4. Redirects to /dashboard on success