/**
 * Style Lab Arcade Games - Main Entry Point
 * Modularized application with Vite bundler
 */

import { initState, setTheme } from './services/bootstrap.js'
import { save } from './services/storage.js'
import { initRouter, parseRoute } from './services/router.js'
import * as navigator from './services/navigator.js'
import { render, setActiveNav, showToast } from './utils/dom.js'
import { esc } from './utils/sanitize.js'

// Initialize application state
let S = initState()

// Set initial theme
document.documentElement.dataset.theme = S.theme || 'clay'

console.log('✓ Style Lab Arcade - Modularized Build')
console.log('✓ Services: Storage, Router, Navigator, Bootstrap')
console.log('✓ State initialized:', { theme: S.theme, sound: S.sound, volume: S.vol })

// Export global functions for templates and event handlers
window.S = S
window.go = navigator.go
window.save = () => save(S)
window.showToast = showToast
window.esc = esc

// Route change handler
function onRouteChange(route) {
  console.log('Route:', route.path)
  // This will be connected to page renderers in Phase 3+
}

// Initialize router
initRouter(onRouteChange);
