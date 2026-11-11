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
import { sfx, canPlayAudio } from './audio/sfx.js'

// Initialize application state
let S = initState()

// Set initial theme
document.documentElement.dataset.theme = S.theme || 'clay'

console.log('✓ Style Lab Arcade - Modularized Build')
console.log('✓ Services: Storage, Router, Navigator, Bootstrap')
console.log('✓ Audio System: Web Audio API, 19 themes, synthesizer')
console.log('✓ State initialized:', { theme: S.theme, sound: S.sound, volume: S.vol })
console.log('✓ Audio supported:', canPlayAudio())

// Export global functions for templates and event handlers
window.S = S
window.go = navigator.go
window.save = () => save(S)
window.showToast = showToast
window.esc = esc
window.sfx = (event, arg) => sfx(event, arg, S)

// Route change handler
function onRouteChange(route) {
  console.log('Route:', route.path)
  // This will be connected to page renderers in Phase 4+
}

// Initialize router
initRouter(onRouteChange);
