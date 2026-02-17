#!/usr/bin/env node

/**
 * Console Error Catcher using Puppeteer
 * 
 * This script navigates to a given URL and captures all console errors,
 * warnings, and other console messages, then displays them in a structured format.
 */

const puppeteer = require('puppeteer');

/**
 * Main function to capture console errors from a webpage
 * @param {string} url - The URL to analyze
 * @param {Object} options - Configuration options
 */
async function captureConsoleErrors(url, options = {}) {
    // Default options
    const config = {
        headless: true,
        timeout: 30000,
        waitUntil: 'networkidle2',
        captureErrors: true,
        captureWarnings: true,
        captureLogs: false,
        ...options
    };

    console.log(`🔍 Analyzing console output for: ${url}`);
    console.log(`📊 Configuration:`, {
        headless: config.headless,
        timeout: `${config.timeout}ms`,
        waitUntil: config.waitUntil,
        captureErrors: config.captureErrors,
        captureWarnings: config.captureWarnings,
        captureLogs: config.captureLogs
    });

    let browser;
    try {
        // Launch browser
        browser = await puppeteer.launch({
            headless: config.headless,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Set up console message listeners
        const consoleMessages = {
            errors: [],
            warnings: [],
            logs: []
        };

        page.on('console', (msg) => {
            const text = msg.text();
            const type = msg.type();

            if (type === 'error' && config.captureErrors) {
                consoleMessages.errors.push({
                    type,
                    text,
                    location: msg.location() || 'unknown location'
                });
            } else if (type === 'warning' && config.captureWarnings) {
                consoleMessages.warnings.push({
                    type,
                    text,
                    location: msg.location() || 'unknown location'
                });
            } else if (config.captureLogs) {
                consoleMessages.logs.push({
                    type,
                    text,
                    location: msg.location() || 'unknown location'
                });
            }
        });

        // Set up page error listener
        const pageErrors = [];
        page.on('pageerror', (error) => {
            pageErrors.push({
                type: 'pageerror',
                message: error.message,
                stack: error.stack
            });
        });

        // Set up request failed listener
        const failedRequests = [];
        page.on('requestfailed', (request) => {
            failedRequests.push({
                type: 'requestfailed',
                url: request.url(),
                failureText: request.failure().errorText
            });
        });

        // Navigate to the page
        console.log('🌐 Navigating to page...');
        await page.goto(url, {
            waitUntil: config.waitUntil,
            timeout: config.timeout
        });

        console.log('✅ Page loaded successfully');

        // Wait a bit more for any async errors
        await page.waitForTimeout(2000);

        // Display results
        console.log('\n📋 Console Analysis Results:');
        console.log('='.repeat(50));

        if (pageErrors.length > 0) {
            console.log(`\n💥 Page Errors (${pageErrors.length}):`);
            pageErrors.forEach((error, index) => {
                console.log(`\n${index + 1}. ${error.message}`);
                if (error.stack) {
                    console.log(`   Stack: ${error.stack}`);
                }
            });
        }

        if (failedRequests.length > 0) {
            console.log(`\n⚠️  Failed Requests (${failedRequests.length}):`);
            failedRequests.forEach((request, index) => {
                console.log(`\n${index + 1}. URL: ${request.url}`);
                console.log(`   Error: ${request.failureText}`);
            });
        }

        if (consoleMessages.errors.length > 0) {
            console.log(`\n❌ Console Errors (${consoleMessages.errors.length}):`);
            consoleMessages.errors.forEach((error, index) => {
                console.log(`\n${index + 1}. [${error.type}] ${error.text}`);
                if (error.location) {
                    console.log(`   Location: ${error.location.url}:${error.location.lineNumber}:${error.location.columnNumber}`);
                }
            });
        }

        if (consoleMessages.warnings.length > 0) {
            console.log(`\n⚠️  Console Warnings (${consoleMessages.warnings.length}):`);
            consoleMessages.warnings.forEach((warning, index) => {
                console.log(`\n${index + 1}. [${warning.type}] ${warning.text}`);
                if (warning.location) {
                    console.log(`   Location: ${warning.location.url}:${warning.location.lineNumber}:${warning.location.columnNumber}`);
                }
            });
        }

        if (config.captureLogs && consoleMessages.logs.length > 0) {
            console.log(`\n📝 Console Logs (${consoleMessages.logs.length}):`);
            consoleMessages.logs.forEach((log, index) => {
                console.log(`\n${index + 1}. [${log.type}] ${log.text}`);
                if (log.location) {
                    console.log(`   Location: ${log.location.url}:${log.location.lineNumber}:${log.location.columnNumber}`);
                }
            });
        }

        // Summary
        const totalIssues = pageErrors.length + failedRequests.length + consoleMessages.errors.length + consoleMessages.warnings.length;
        console.log('\n' + '='.repeat(50));
        console.log(`📊 Summary: Found ${totalIssues} issues total`);
        console.log(`   - Page Errors: ${pageErrors.length}`);
        console.log(`   - Failed Requests: ${failedRequests.length}`);
        console.log(`   - Console Errors: ${consoleMessages.errors.length}`);
        console.log(`   - Console Warnings: ${consoleMessages.warnings.length}`);
        console.log(`   - Console Logs: ${consoleMessages.logs.length}`);

        return {
            pageErrors,
            failedRequests,
            consoleMessages,
            url,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error('❌ Error during analysis:', error.message);
        if (error.stack) {
            console.error('Stack trace:', error.stack);
        }
        return {
            error: error.message,
            stack: error.stack,
            url,
            timestamp: new Date().toISOString()
        };
    } finally {
        if (browser) {
            await browser.close();
            console.log('🔚 Browser closed');
        }
    }
}

// Command line interface
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('Usage: node console_error_catcher.js <url> [options]');
        console.log('');
        console.log('Options:');
        console.log('  --headless=false    Run browser in non-headless mode');
        console.log('  --timeout=5000      Set navigation timeout in ms');
        console.log('  --no-warnings       Disable warning capture');
        console.log('  --no-logs          Disable log capture');
        console.log('  --help              Show this help message');
        process.exit(1);
    }

    const url = args[0];
    const options = {};

    // Parse command line options
    for (let i = 1; i < args.length; i++) {
        const arg = args[i];
        
        if (arg.startsWith('--headless=')) {
            options.headless = arg.split('=')[1] !== 'false';
        } else if (arg.startsWith('--timeout=')) {
            options.timeout = parseInt(arg.split('=')[1]);
        } else if (arg === '--no-warnings') {
            options.captureWarnings = false;
        } else if (arg === '--no-logs') {
            options.captureLogs = false;
        } else if (arg === '--help') {
            console.log('Usage: node console_error_catcher.js <url> [options]');
            console.log('');
            console.log('Options:');
            console.log('  --headless=false    Run browser in non-headless mode');
            console.log('  --timeout=5000      Set navigation timeout in ms');
            console.log('  --no-warnings       Disable warning capture');
            console.log('  --no-logs          Disable log capture');
            console.log('  --help              Show this help message');
            process.exit(0);
        }
    }

    // Start the analysis
    captureConsoleErrors(url, options).then(result => {
        // You could save results to a file here if needed
        // fs.writeFileSync('console_analysis.json', JSON.stringify(result, null, 2));
    });
}

module.exports = captureConsoleErrors;