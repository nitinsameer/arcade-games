/**
 * Sanitization Utilities
 * XSS prevention for user input
 */

/**
 * Escape HTML special characters to prevent XSS
 * @param {*} input - Value to escape (will be converted to string)
 * @returns {string} Escaped string safe for HTML
 */
export function esc(input) {
  return String(input).replace(/[&<>"]/g, c => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;'
    }
    return map[c]
  })
}

/**
 * Check if string looks like a safe HTML class name
 * @param {string} className - Class name to validate
 * @returns {boolean} Whether it's a safe class name
 */
export function isValidClassName(className) {
  // Only allow alphanumeric, hyphens, underscores
  return /^[a-zA-Z0-9_-]+$/.test(className)
}

/**
 * Sanitize class name by filtering
 * @param {string} className - Class name to sanitize
 * @returns {string} Sanitized class name or empty string
 */
export function sanitizeClassName(className) {
  return isValidClassName(className) ? className : ''
}

/**
 * Sanitize attribute value (common for data attributes)
 * @param {string} value - Value to sanitize
 * @returns {string} Sanitized value
 */
export function sanitizeAttr(value) {
  return String(value)
    .replace(/["'`]/g, '') // Remove quotes
    .replace(/[<>]/g, '') // Remove angle brackets
    .slice(0, 255) // Limit length
}

/**
 * Sanitize URL to prevent javascript: and data: URIs
 * @param {string} url - URL to sanitize
 * @returns {string} Safe URL or empty string
 */
export function sanitizeUrl(url) {
  const lower = String(url).toLowerCase().trim()
  if (lower.startsWith('javascript:') || lower.startsWith('data:')) {
    return ''
  }
  if (lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('/')) {
    return url
  }
  if (lower.startsWith('#')) {
    return url
  }
  return ''
}
