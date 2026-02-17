# Console Error Catcher with Puppeteer

A Node.js script that uses Puppeteer to analyze web pages and capture console errors, warnings, and other issues.

## Features

- ✅ Captures console errors and warnings
- ✅ Detects page errors and failed network requests
- ✅ Shows detailed error locations (file, line, column)
- ✅ Configurable timeout and navigation options
- ✅ Headless and headful browser modes
- ✅ Structured output with summary statistics
- ✅ Can be used as CLI tool or imported as module
- ✅ **Scan all Astro pages in your project automatically**
- ✅ **Batch testing with comprehensive summary reports**

## Installation

### Prerequisites
- Node.js (v14 or higher recommended)
- npm or yarn

### Install dependencies

```bash
npm install puppeteer
# or
npm install
```

## Usage

### Basic usage

```bash
node console_error_catcher.js https://example.com
```

### Command line options

```bash
# Show browser (non-headless mode)
node console_error_catcher.js https://example.com --headless=false

# Custom timeout (5 seconds)
node console_error_catcher.js https://example.com --timeout=5000

# Disable warning capture
node console_error_catcher.js https://example.com --no-warnings

# Disable log capture
node console_error_catcher.js https://example.com --no-logs

# Show help
node console_error_catcher.js --help
```

### Scan all Astro pages (NEW!)

The script can now automatically find and test all Astro pages in your `front/src/pages/` directory:

```bash
# Scan all pages with default settings
node console_error_catcher.js --scan

# Scan all pages in non-headless mode
node console_error_catcher.js --scan --headless=false

# Scan all pages with custom timeout
node console_error_catcher.js --scan --timeout=15000

# Scan all pages without capturing warnings
node console_error_catcher.js --scan --no-warnings
```

This will:
1. Find all `.astro` files in `front/src/pages/` (excluding `index.astro`)
2. Test each page at `https://dev.markidiags.com/page-name`
3. Provide detailed analysis for each page
4. Generate a comprehensive summary report

### Programmatic usage

You can also import and use the function in your own Node.js scripts:

```javascript
const captureConsoleErrors = require('./console_error_catcher');

(async () => {
    const result = await captureConsoleErrors('https://example.com', {
        headless: false,
        timeout: 10000,
        captureLogs: true
    });
    
    console.log('Analysis complete:', result);
})();
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `headless` | boolean | `true` | Run browser in headless mode |
| `timeout` | number | `30000` | Navigation timeout in milliseconds |
| `waitUntil` | string | `'networkidle2'` | When to consider navigation successful |
| `captureErrors` | boolean | `true` | Capture console errors |
| `captureWarnings` | boolean | `true` | Capture console warnings |
| `captureLogs` | boolean | `false` | Capture all console logs |

## Output Format

The script provides structured output showing:

1. **Page Errors**: Critical JavaScript errors that crashed the page
2. **Failed Requests**: Network requests that failed to load
3. **Console Errors**: Error messages logged to console
4. **Console Warnings**: Warning messages logged to console
5. **Console Logs**: (Optional) All console log messages

Each issue includes:
- Type of issue
- Error message/text
- Location (URL, line number, column number when available)
- Stack trace for page errors


💥 Page Errors (1):

1. ReferenceError: undefinedVariable is not defined
   Stack: ReferenceError: undefinedVariable is not defined at https://broken-website.com/script.js:42:13

❌ Console Errors (3):

1. [error] Uncaught TypeError: Cannot read property 'map' of undefined
   Location: https://broken-website.com/app.js:123:25

2. [error] Failed to load resource: the server responded with a status of 404 (Not Found)
   Location: https://broken-website.com/missing-file.js:1:1

3. [error] WebSocket connection failed: Error during WebSocket handshake
   Location: https://broken-website.com/socket.js:8:15

⚠️  Console Warnings (2):

1. [warning] Deprecated API usage: navigator.appVersion is deprecated
   Location: https://broken-website.com/legacy.js:5:10

2. [warning] Mixed Content: The page at 'https://broken-website.com' was loaded over HTTPS, but requested an insecure resource
   Location: https://broken-website.com/main.js:18:5

==================================================
📊 Summary: Found 6 issues total
   - Page Errors: 1
   - Failed Requests: 0
   - Console Errors: 3
   - Console Warnings: 2
   - Console Logs: 0
🔚 Browser closed
```
=======
## Examples

### Example 1: Analyzing a page with errors

```bash
$ node console_error_catcher.js https://broken-website.com

🔍 Analyzing console output for: https://broken-website.com
📊 Configuration: { headless: true, timeout: '30000ms', waitUntil: 'networkidle2', captureErrors: true, captureWarnings: true, captureLogs: false }
🌐 Navigating to page...
✅ Page loaded successfully

📋 Console Analysis Results:
==================================================

💥 Page Errors (1):

1. ReferenceError: undefinedVariable is not defined
   Stack: ReferenceError: undefinedVariable is not defined at https://broken-website.com/script.js:42:13

❌ Console Errors (3):

1. [error] Uncaught TypeError: Cannot read property 'map' of undefined
   Location: https://broken-website.com/app.js:123:25

2. [error] Failed to load resource: the server responded with a status of 404 (Not Found)
   Location: https://broken-website.com/missing-file.js:1:1

3. [error] WebSocket connection failed: Error during WebSocket handshake
   Location: https://broken-website.com/socket.js:8:15

⚠️  Console Warnings (2):

1. [warning] Deprecated API usage: navigator.appVersion is deprecated
   Location: https://broken-website.com/legacy.js:5:10

2. [warning] Mixed Content: The page at 'https://broken-website.com' was loaded over HTTPS, but requested an insecure resource
   Location: https://broken-website.com/main.js:11:5

==================================================
📊 Summary: Found 6 issues total
   - Page Errors: 1
   - Failed Requests: 0
   - Console Errors: 3
   - Console Warnings: 2
   - Console Logs: 0
🔚 Browser closed
```

### Example 2: Scanning all Astro pages (NEW!)

```bash
$ node console_error_catcher.js --scan

📋 Found 3 Astro pages to test:
   - dashboard
   - login
   - styleguide

============================================================
🧪 Testing page: dashboard
============================================================
🔍 Analyzing console output for: https://dev.markidiags.com/dashboard
📊 Configuration: { headless: true, timeout: '30000ms', waitUntil: 'networkidle2', captureErrors: true, captureWarnings: true, captureLogs: false }
🚀 Launching browser...
✅ Browser launched successfully
🌐 Navigating to page...
✅ Page loaded successfully

📋 Console Analysis Results for dashboard:
==================================================

⚠️  Console Warnings (1):

1. [warning] Deprecated API: Using old authentication method
   Location: https://dev.markidiags.com/dashboard.js:42:15

==================================================
📊 Summary for dashboard: Found 1 issue total
   - Page Errors: 0
   - Failed Requests: 0
   - Console Errors: 0
   - Console Warnings: 1
   - Console Logs: 0

============================================================
🧪 Testing page: login
============================================================
🔍 Analyzing console output for: https://dev.markidiags.com/login
✅ Page loaded successfully

📋 Console Analysis Results for login:
==================================================

✅ No issues found!

==================================================
📊 Summary for login: Found 0 issues total

============================================================
🧪 Testing page: styleguide
============================================================
🔍 Analyzing console output for: https://dev.markidiags.com/styleguide
✅ Page loaded successfully

📋 Console Analysis Results for styleguide:
==================================================

❌ Console Errors (2):

1. [error] Failed to load font: https://fonts.example.com/missing-font.woff
   Location: https://dev.markidiags.com/styleguide.css:18:3

2. [error] CSS parsing error: Unexpected token
   Location: https://dev.markidiags.com/custom.css:22:1

==================================================
📊 Summary for styleguide: Found 2 issues total

============================================================
📊 FINAL SUMMARY
============================================================
⚠️  dashboard: 1 issues found
✅ login: No issues found
❌ styleguide: 2 issues found

============================================================
📈 Overall Results: 2/3 pages with issues
🔢 Total issues across all pages: 3
============================================================
🔚 All tests completed
```
==================================================

💥 Page Errors (1):

1. ReferenceError: undefinedVariable is not defined
   Stack: ReferenceError: undefinedVariable is not defined at https://broken-website.com/script.js:42:13

❌ Console Errors (3):

1. [error] Uncaught TypeError: Cannot read property 'map' of undefined
   Location: https://broken-website.com/app.js:123:25

2. [error] Failed to load resource: the server responded with a status of 404 (Not Found)
   Location: https://broken-website.com/missing-file.js:1:1

3. [error] WebSocket connection failed: Error during WebSocket handshake
   Location: https://broken-website.com/socket.js:8:15

⚠️  Console Warnings (2):

1. [warning] Deprecated API usage: navigator.appVersion is deprecated
   Location: https://broken-website.com/legacy.js:5:10

2. [warning] Mixed Content: The page at 'https://broken-website.com' was loaded over HTTPS, but requested an insecure resource
   Location: https://broken-website.com/main.js:18:5

==================================================
📊 Summary: Found 6 issues total
   - Page Errors: 1
   - Failed Requests: 0
   - Console Errors: 3
   - Console Warnings: 2
   - Console Logs: 0
🔚 Browser closed
```

### Example 2: Clean website analysis

```bash
$ node console_error_catcher.js https://well-built-site.com

🔍 Analyzing console output for: https://well-built-site.com
📊 Configuration: { headless: true, timeout: '30000ms', waitUntil: 'networkidle2', captureErrors: true, captureWarnings: true, captureLogs: false }
🌐 Navigating to page...
✅ Page loaded successfully

📋 Console Analysis Results:
==================================================

==================================================
📊 Summary: Found 0 issues total
   - Page Errors: 0
   - Failed Requests: 0
   - Console Errors: 0
   - Console Warnings: 0
   - Console Logs: 0
🔚 Browser closed
```

## Troubleshooting

### Puppeteer installation issues

If you encounter issues installing Puppeteer:

```bash
# Try installing with additional dependencies
npm install puppeteer --save

# For Linux systems, you might need additional dependencies:
sudo apt-get install -y libgbm-dev
```

### Browser crashes

If the browser crashes, try:
- Reducing the timeout
- Running in non-headless mode to see what's happening
- Adding `--no-sandbox` flag (already included in the script)

### Network issues

For pages that require authentication or have CORS issues:
- The script runs with default Puppeteer settings
- You may need to modify the script to handle authentication
- Some sites may block headless browsers

## License

This script is provided as-is under the MIT License. Feel free to modify and use it for your projects.

## Contributing

Contributions are welcome! Please open issues or pull requests for:
- Bug fixes
- Feature enhancements
- Documentation improvements

## Author

Created with ❤️ by Mistral Vibe

## Version

2.0.0

### Changelog

**2.0.0** - Added Astro pages scanning functionality
- ✨ New `--scan` flag to automatically test all Astro pages
- 🔍 Auto-detects `.astro` files in `front/src/pages/` directory
- 📊 Comprehensive batch testing with summary reports
- 🎯 Excludes `index.astro` (root page) from scanning
- 🔧 Maintains backward compatibility with single URL mode

**1.0.0** - Initial release
- Basic console error capturing
- Single URL analysis
- Configurable options