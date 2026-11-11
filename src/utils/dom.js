/**
 * DOM Utilities
 * Helper functions for DOM manipulation and rendering
 */

/**
 * Query selector shorthand
 * @param {string} selector - CSS selector
 * @returns {Element|null} Selected element or null
 */
export function $(selector) {
  return document.querySelector(selector)
}

/**
 * Query all matching elements
 * @param {string} selector - CSS selector
 * @returns {NodeList} All matching elements
 */
export function $$(selector) {
  return document.querySelectorAll(selector)
}

/**
 * Set HTML content of element (must sanitize input!)
 * @param {Element|string} el - Element or selector
 * @param {string} html - HTML content (should be pre-sanitized)
 */
export function setHTML(el, html) {
  const elem = typeof el === 'string' ? $(el) : el
  if (elem) elem.innerHTML = html
}

/**
 * Set text content of element
 * @param {Element|string} el - Element or selector
 * @param {string} text - Text content
 */
export function setText(el, text) {
  const elem = typeof el === 'string' ? $(el) : el
  if (elem) elem.textContent = String(text)
}

/**
 * Add class to element
 * @param {Element|string} el - Element or selector
 * @param {string} cls - Class name
 */
export function addClass(el, cls) {
  const elem = typeof el === 'string' ? $(el) : el
  if (elem) elem.classList.add(cls)
}

/**
 * Remove class from element
 * @param {Element|string} el - Element or selector
 * @param {string} cls - Class name
 */
export function removeClass(el, cls) {
  const elem = typeof el === 'string' ? $(el) : el
  if (elem) elem.classList.remove(cls)
}

/**
 * Toggle class on element
 * @param {Element|string} el - Element or selector
 * @param {string} cls - Class name
 * @returns {boolean} Whether class is now present
 */
export function toggleClass(el, cls) {
  const elem = typeof el === 'string' ? $(el) : el
  if (elem) return elem.classList.toggle(cls)
  return false
}

/**
 * Render page content to view
 * @param {string} html - HTML to render
 */
export function render(html) {
  setHTML('#view', html)
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {number} duration - Duration in ms (default 1800)
 */
export function showToast(message, duration = 1800) {
  const toast = $('#toast')
  if (!toast) return

  toast.textContent = message
  addClass(toast, 'show')

  // Clear any existing timeout
  if (showToast.timeout) clearTimeout(showToast.timeout)

  showToast.timeout = setTimeout(() => {
    removeClass(toast, 'show')
  }, duration)
}

/**
 * Update navigation active state
 * @param {string} activeId - ID of active nav button (e.g., 'nav-home')
 */
export function setActiveNav(activeId) {
  $$('#nav button').forEach(btn => {
    removeClass(btn, 'on')
  })
  if (activeId) {
    const btn = $(`#${activeId}`)
    if (btn) addClass(btn, 'on')
  }
}

/**
 * Handle element focus
 * @param {Element|string} el - Element or selector
 */
export function focus(el) {
  const elem = typeof el === 'string' ? $(el) : el
  if (elem) elem.focus()
}

/**
 * Get input value
 * @param {Element|string} el - Input element or selector
 * @returns {string} Input value
 */
export function getValue(el) {
  const elem = typeof el === 'string' ? $(el) : el
  return elem ? elem.value : ''
}

/**
 * Set input value
 * @param {Element|string} el - Input element or selector
 * @param {string} value - Value to set
 */
export function setValue(el, value) {
  const elem = typeof el === 'string' ? $(el) : el
  if (elem) elem.value = String(value)
}
