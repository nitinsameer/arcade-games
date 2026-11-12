/**
 * Utilities Index
 * Aggregates all utility functions for easy importing
 */

export * from './dom.js'
export * from './sanitize.js'
export * from './constants.js'
export * from './shuffle.js'

// Re-export for convenience
export { THEMES, findTheme } from './constants.js'
export { esc, sanitizeUrl, sanitizeClassName } from './sanitize.js'
export { $ as querySelector, $$ as querySelectorAll, render, showToast, setActiveNav } from './dom.js'
export { shuffle } from './shuffle.js'

// Aggregate object for backwards compatibility
export const UTILS = {
  $: (sel) => document.querySelector(sel),
  $$: (sel) => document.querySelectorAll(sel),
  esc: (v) => String(v).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])),
  sanitizeUrl: (u) => {
    const l = String(u).toLowerCase().trim()
    if (l.startsWith('javascript:') || l.startsWith('data:')) return ''
    if (l.startsWith('http://') || l.startsWith('https://') || l.startsWith('/')) return u
    if (l.startsWith('#')) return u
    return ''
  }
}

export default { UTILS }
