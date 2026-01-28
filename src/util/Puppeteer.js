/**
 * Expose a function to the page, removing any existing binding first
 *
 * Uses page.removeExposedFunction (Puppeteer 20.6+) to handle reinitialization
 * without "already exists" errors
 *
 * @param {object} page - Puppeteer Page instance
 * @param {string} name
 * @param {Function} fn
 */
async function exposeFunctionIfAbsent(page, name, fn) {
    // Try to remove existing Puppeteer binding first (Puppeteer 20.6+)
    if (typeof page.removeExposedFunction === 'function') {
        try {
            await page.removeExposedFunction(name);
        } catch (_) {
            // Ignore if removal fails - function might not have been exposed
        }
    }

    // Also remove from window to handle stale bindings after navigation
    try {
        await page.evaluate((name) => {
            delete window[name];
        }, name);
    } catch (_) {
        // Page might not be ready yet
    }

    await page.exposeFunction(name, fn);
}

module.exports = {exposeFunctionIfAbsent};
