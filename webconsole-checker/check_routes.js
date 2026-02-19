const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

// Configuration
const BASE_URL = "https://dev.markidiags.com";
const WAIT_TIME = 5000; // 5 seconds
const OUTPUT_DIR = path.join(
    __dirname,
    "../webconsole-checker/console-web-error",
);
const APP_PY_PATH = path.join(__dirname, "../app/app.py");

// Function to extract routes from app.py
function extractRoutesFromAppPy() {
    try {
        const appContent = fs.readFileSync(APP_PY_PATH, "utf-8");

        // Regular expression to find @app.route() decorators
        // Matches both @app.route("/path") and @app.route('/path')
        const routeRegex = /@app\.route\((["'])([^"']+)\1\)/g;

        const routes = [];
        let match;

        while ((match = routeRegex.exec(appContent)) !== null) {
            routes.push(match[2]); // match[2] contains the route path
        }

        return routes;
    } catch (error) {
        console.error("Error reading app.py:", error.message);
        // Fallback to hardcoded routes if extraction fails
        return ["/", "/styleguide", "/components", "/icons", "/icons-regular"];
    }
}

// Extract routes automatically from app.py
const routes = extractRoutesFromAppPy();
console.log("Extracted routes from app.py:", routes);

async function checkRoute(route) {
    const browser = await puppeteer.launch({
        headless: "new",
        executablePath: '/usr/bin/google-chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Capture console errors and logs
    let consoleErrors = [];
    let consoleLogs = [];
    let networkErrors = [];

    page.on("console", (msg) => {
        const messageText = msg.text();
        // Filter out the Tailwind CSS production warning
        if (!messageText.includes("cdn.tailwindcss.com should not be used in production")) {
            consoleLogs.push(messageText);
        }
    });

    page.on("pageerror", (error) => {
        consoleErrors.push(error.toString());
    });

    page.on("error", (error) => {
        consoleErrors.push(error.toString());
    });

    // Capture network errors (like 404, 502, etc.)
    page.on("requestfailed", (request) => {
        const failure = request.failure();
        if (failure) {
            networkErrors.push(`Failed to load ${request.url()}: ${failure.errorText} (${request.resourceType()})`);
        }
    });

    try {
        console.log(`Testing route: ${route}`);
        const url = `${BASE_URL}${route}`;
        await page.goto(url, { waitUntil: "networkidle2", timeout: 10000 });

        // Wait for 5 seconds
        await new Promise(resolve => setTimeout(resolve, WAIT_TIME));

        // Determine status
        const hasErrors = consoleErrors.length > 0 || networkErrors.length > 0;
        const status = hasErrors ? "error" : "clear";

        // Create output directory if it doesn't exist
        const statusDir = path.join(OUTPUT_DIR, status);
        if (!fs.existsSync(statusDir)) {
            fs.mkdirSync(statusDir, { recursive: true });
        }

        // Create filename from route
        const filename = route.replace(/\//g, "-") || "home";
        const outputPath = path.join(statusDir, `${filename}.md`);

        // Write console output to file
        let content = `# Console Output for ${route}\n\n`;
        content += `URL: ${url}\n\n`;
        content += `Status: ${status}\n\n`;

        if (hasErrors) {
            content += "## Errors:\n\n";
            content += "```\n";
            
            // Add console errors
            if (consoleErrors.length > 0) {
                content += "Console Errors:\n";
                content += consoleErrors.join("\n");
                content += "\n\n";
            }
            
            // Add network errors
            if (networkErrors.length > 0) {
                content += "Network Errors:\n";
                content += networkErrors.join("\n");
                content += "\n";
            }
            
            content += "```\n\n";
        }

        if (consoleLogs.length > 0) {
            content += "## Console Logs:\n\n";
            content += "```\n";
            content += consoleLogs.join("\n");
            content += "\n```\n";
        }

        fs.writeFileSync(outputPath, content);
        console.log(`✓ Saved to ${outputPath}`);

        // Combine all errors for the return object
        const allErrors = [...consoleErrors, ...networkErrors];
        return { route, status, errors: allErrors };
    } catch (error) {
        console.error(`Error testing ${route}:`, error.message);
        // Include network errors in the catch block too
        const allErrors = networkErrors.length > 0 ? networkErrors : [error.message];
        return { route, status: "error", errors: allErrors };
    } finally {
        await browser.close();
    }
}

async function main() {
    console.log("Starting route checking...");

    // Clean up existing clear and error directories
    const clearDir = path.join(OUTPUT_DIR, "clear");
    const errorDir = path.join(OUTPUT_DIR, "error");
    
    if (fs.existsSync(clearDir)) {
        fs.rmSync(clearDir, { recursive: true, force: true });
        console.log("Cleaned up existing clear directory");
    }
    
    if (fs.existsSync(errorDir)) {
        fs.rmSync(errorDir, { recursive: true, force: true });
        console.log("Cleaned up existing error directory");
    }

    // Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const results = [];

    for (const route of routes) {
        const result = await checkRoute(route);
        results.push(result);

        // Small delay between routes
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log("\n=== Summary ===");
    results.forEach((result) => {
        console.log(`${result.route}: ${result.status}`);
        if (result.errors.length > 0) {
            console.log(`  Errors: ${result.errors.length}`);
        }
    });

    console.log("\nAll routes checked!");
}

main().catch(console.error);
