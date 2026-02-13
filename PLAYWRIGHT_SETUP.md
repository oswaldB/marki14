# Playwright Configuration for marki14

This document describes the Playwright test configuration that has been set up for the marki14 application.

## Configuration Summary

### Base Configuration
- **Base URL**: `https://dev.markidiags.com`
- **Mode**: Always headless
- **Browser**: Chromium (default)
- **Viewport**: 1280x720
- **Timeout**: 30 seconds
- **Retries**: 2 attempts

### Authentication
- **Username**: `oswald`
- **Password**: `coucou`
- **Admin credentials**: Same as standard user (as requested)
- **Authentication method**: Parse SDK via Alpine.js form

## Files Created

```
marki14/
└── tests/
    ├── playwright/
    │   ├── playwright.config.js      # Main configuration
    │   └── utils/
    │       ├── auth.js                # Authentication utility
    │       └── global-setup.js        # Global setup script
    ├── storage/                      # Generated storage states
    │   ├── standardUser.json         # Standard user session
    │   └── adminUser.json            # Admin user session
    ├── example.spec.js               # Example test file
    ├── README.md                     # Usage documentation
    ├── package.json                  # npm configuration
    └── init-playwright.js            # Initialization script
```

## Key Features

### 1. Authentication Utility (`auth.js`)
- Handles login for both admin and non-admin users
- Supports manual login and storage state generation
- Works with Alpine.js bound form elements
- Returns authenticated browser contexts

### 2. Global Setup
- Automatically generates storage states for both user types
- Stores session data for reuse across tests
- Reduces test execution time by avoiding repeated logins

### 3. Configuration
- Headless mode enforced
- Base URL configured for dev environment
- Error handling and debugging options
- Multiple reporter formats

## Usage

### Initial Setup
```bash
cd /home/oswald/Desktop/marki14/tests
node init-playwright.js
npm run test:setup
```

### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test example.spec.js

# Run in headed mode (debugging)
npm run test:ui

# Debug with breakpoints
npm run test:debug
```

### Writing New Tests

#### Using Pre-authenticated Session (Recommended)
```javascript
const { test, expect } = require('@playwright/test');

test.use({
  storageState: './storage/standardUser.json'
});

test('Dashboard test', async ({ page }) => {
  await page.goto('/dashboard');
  // Test logic here - already authenticated
});
```

#### Using Admin Session
```javascript
test.use({
  storageState: './storage/adminUser.json'
});

test('Admin functionality test', async ({ page }) => {
  await page.goto('/admin');
  // Admin-specific test logic
});
```

#### Manual Login (for login process testing)
```javascript
const { test, expect } = require('@playwright/test');
const AuthUtils = require('./playwright/utils/auth');

test('Login process test', async ({ browser }) => {
  const context = await AuthUtils.login(browser, false); // false = not admin
  const page = await context.newPage();
  
  await page.goto('/dashboard');
  // Test logic here
  
  await context.close();
});
```

## Technical Details

### Authentication Flow
1. Navigate to `/login`
2. Fill Alpine.js bound form fields (`#username`, `#password`)
3. Click submit button with text "Se connecter"
4. Parse SDK handles authentication
5. Session token stored in localStorage/sessionStorage
6. Redirect to `/dashboard` on success

### Selectors Used
- Username field: `#username`
- Password field: `#password`
- Submit button: `button[type="submit"]:has-text("Se connecter")`
- Success indicator: `text=Dashboard`
- Dashboard URL: `/dashboard`

### Storage State Management
- Generated during global setup
- Contains cookies and localStorage data
- Reused across tests to maintain authentication
- Separate files for standard and admin users

## Best Practices

1. **Use storage states** for most tests to avoid login overhead
2. **Keep tests independent** - each test should start fresh
3. **Use unique selectors** that won't change with content
4. **Add assertions** to verify expected behavior
5. **Handle failures gracefully** with proper error handling
6. **Update selectors** if the UI changes

## Troubleshooting

### Common Issues

**Login failures**:
- Verify the login page selectors match the current UI
- Check if the application URL or authentication mechanism has changed
- Ensure credentials are still valid

**Storage state issues**:
- Delete the `storage/` directory and regenerate
- Run `npm run test:setup` to recreate storage states

**Timeout issues**:
- Adjust timeout settings in `playwright.config.js`
- Increase `timeout` or `expect.timeout` values

**Selector not found**:
- Update selectors in `auth.js` to match current UI
- Use Playwright's codegen tool to find correct selectors

## Maintenance

### Updating Credentials
If credentials change, update them in `auth.js`:
```javascript
static get STANDARD_USER() {
  return {
    username: 'new-username',
    password: 'new-password'
  };
}
```

### Adding New User Types
To add different user roles:
1. Add new user type to `auth.js`
2. Create corresponding storage state file
3. Update global setup to generate the new storage state

### Updating Selectors
If the login page changes:
1. Update selectors in `auth.js`
2. Update example tests
3. Regenerate storage states

## Security Notes

- Credentials are stored in the utility file (consider using environment variables for production)
- Storage states contain session data - treat them as sensitive
- Never commit real user credentials to version control
- Consider using `.env` files for sensitive data in production environments

## Future Enhancements

1. Environment variable support for credentials
2. Multiple browser testing (Firefox, WebKit)
3. CI/CD integration scripts
4. Test data management utilities
5. Visual regression testing setup
6. Performance testing utilities