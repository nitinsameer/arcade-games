/**
 * Not Found (404) Page Renderer
 * Shown when a route is not found
 */

/**
 * Render 404 page
 * @param {Object} state - Application state
 * @param {Object} route - Route information
 * @returns {string} HTML content
 */
export function renderNotFound(state, route) {
  return `
    <div class="phone">
      <div class="top">
        <h1 style="margin: 0; flex: 1; text-align: center">Page Not Found</h1>
      </div>

      <div class="raise" style="padding: 48px 24px; border-radius: var(--r); box-shadow: var(--sh); margin-top: 40px; text-align: center">
        <div style="font-size: 80px; margin-bottom: 24px">🤔</div>
        <h2 style="margin: 0 0 16px 0; font-size: 18px">404</h2>
        <p style="margin: 0 0 24px 0; color: var(--mute); font-size: 14px">
          Oops! This page doesn't exist.
        </p>
        <p style="margin: 0 0 32px 0; color: var(--mute); font-size: 13px">
          Requested path: <code style="background: var(--well); padding: 4px 8px; border-radius: 4px; font-family: monospace">${route?.path || 'unknown'}</code>
        </p>
        
        <button class="cta" data-go="/home" style="width: 100%; padding: 12px">
          ← Back to Home
        </button>
      </div>

      <style>
        code {
          display: inline-block;
        }
      </style>
    </div>
  `
}
