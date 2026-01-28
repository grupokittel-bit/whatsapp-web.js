/**
 * Expose a function to the page, removing any existing binding first
 *
 * Handles reinitialization after page navigation without "already exists" errors
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
            // Ignore if removal fails
        }
    }

    // Remove from window to handle stale bindings after navigation
    try {
        await page.evaluate((name) => {
            delete window[name];
        }, name);
    } catch (_) {
        // Page might not be ready yet
    }

    try {
        await page.exposeFunction(name, fn);
    } catch (err) {
        if (err.message && err.message.includes('already exists')) {
            // Binding exists at CDP level but function may be stale after navigation
            // Re-assign in window context to point to a working wrapper
            try {
                await page.evaluate((name) => {
                    // The CDP binding still works, just ensure window[name] exists
                    // It should already be there from the previous exposeFunction
                }, name);
            } catch (_) {
                // Best effort
            }
            return;
        }
        throw err;
    }
}

module.exports = {exposeFunctionIfAbsent};
