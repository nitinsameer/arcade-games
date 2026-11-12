/**
 * Error Page Renderer
 * Shown when an error occurs during rendering
 */

/**
 * Render error page
 * @param {Object} state - Application state
 * @param {Object} route - Route information
 * @param {Error} error - Error object
 * @returns {string} HTML content
 */
export function renderError(state, route, error) {
  const errorMessage = error?.message || 'An unexpected error occurred'
  const errorStack = error?.stack || ''

  return `
    <div class="phone">
      <div class="top">
        <button class="back" data-go="/home" style="background: none; border: none; cursor: pointer; font-size: 24px; padding: 0">←</button>
        <h1 style="margin: 0; flex: 1; text-align: center">Error</h1>
      </div>

      <div class="raise" style="padding: 24px; border-radius: var(--r); box-shadow: var(--sh); margin-top: 24px">
        <div style="font-size: 64px; text-align: center; margin-bottom: 16px">⚠️</div>
        
        <div style="background: var(--well); padding: 16px; border-radius: var(--rs); margin-bottom: 16px">
          <div style="font-weight: 700; color: #e74c3c; margin-bottom: 8px">Error Message:</div>
          <code style="display: block; font-family: monospace; font-size: 12px; color: var(--ink); word-break: break-all; white-space: pre-wrap">
            ${errorMessage}
          </code>
        </div>

        ${errorStack ? `
          <details style="margin-bottom: 16px; cursor: pointer">
            <summary style="font-weight: 700; color: var(--mute); user-select: none">Stack Trace</summary>
            <pre style="background: var(--well); padding: 12px; border-radius: var(--rs); font-size: 11px; overflow-x: auto; margin-top: 8px; white-space: pre-wrap; word-break: break-all">${errorStack}</pre>
          </details>
        ` : ''}

        <p style="font-size: 12px; color: var(--mute); margin-bottom: 16px">
          Route: <code style="background: var(--well); padding: 2px 6px; border-radius: 3px">${route?.path || 'unknown'}</code>
        </p>

        <button class="cta" data-go="/home" style="width: 100%; padding: 12px; margin-bottom: 8px">
          🏠 Go Home
        </button>
        
        <button class="cta alt" data-go="/games" style="width: 100%; padding: 12px">
          🎮 Go to Games
        </button>
      </div>

      <style>
        code {
          display: inline;
        }
        details {
          border-left: 2px solid var(--accent);
          padding-left: 12px;
        }
        summary {
          outline: none;
        }
      </style>
    </div>
  `
}
