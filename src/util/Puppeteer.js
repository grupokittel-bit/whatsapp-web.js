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
    // This clears Puppeteer's internal tracking, even if window[name] exists
    if (typeof page.removeExposedFunction === 'function') {
        try {
            await page.removeExposedFunction(name);
        } catch (_) {
            // Ignore if removal fails - function might not have been exposed
        }
    }

    // Check if function exists in window after removal attempt
    const existsInWindow = await page.evaluate((name) => {
        return !!window[name];
    }, name);

    // If still exists in window (from a different source), skip
    if (existsInWindow) {
        return;
    }

    await page.exposeFunction(name, fn);
}

module.exports = {exposeFunctionIfAbsent};
