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
import { PAGE_REGISTRY, getPageRenderer, getRoutePattern } from './pages/registry.js'
import { renderNotFound } from './pages/not-found.js'
import { renderError } from './pages/error.js'

// Initialize application state
let S = initState()

// Set initial theme
document.documentElement.dataset.theme = S.theme || 'clay'

console.log('✓ Style Lab Arcade - Modularized Build')
console.log('✓ Services: Storage, Router, Navigator, Bootstrap')
console.log('✓ Pages: Registry with 11 routes')
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

// Initialize navigation buttons
function initializeNavigation() {
  const nav = document.querySelector('#nav')
  if (!nav) return

  const navButtons = [
    { id: 'nav-home', emoji: '🏠', label: 'Home', path: '/home' },
    { id: 'nav-explore', emoji: '🗺️', label: 'Explore', path: '/explore' },
    { id: 'nav-games', emoji: '👾', label: 'Games', path: '/games' },
    { id: 'nav-settings', emoji: '⚙️', label: 'Settings', path: '/settings' },
    { id: 'nav-profile', emoji: '👤', label: 'Profile', path: '/profile' }
  ]

  nav.innerHTML = navButtons
    .map(
      btn => `
    <button id="${btn.id}" data-go="${btn.path}" style="display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 8px 1px; border-radius: var(--rs); font-size: 10px; font-weight: 800; color: var(--mute); background: transparent; border: none; cursor: pointer; text-align: center; flex: 1">
      <span style="font-size: 21px">${btn.emoji}</span>
      ${btn.label}
    </button>
  `
    )
    .join('')

  // Add click handlers to nav buttons
  nav.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault()
      const path = btn.getAttribute('data-go')
      navigator.go(path)
    })
  })
}

// Navigation ID mapping for active state
const routeToNavId = {
  '/home': 'nav-home',
  '/explore': 'nav-explore',
  '/games': 'nav-games',
  '/settings': 'nav-settings',
  '/profile': 'nav-profile'
}

// Route change handler - connects router to page renderers
function onRouteChange(route) {
  console.log('Route:', route.path)

  try {
    // Get the appropriate renderer
    const renderer = getPageRenderer(route.path)

    if (!renderer) {
      console.warn('No renderer for route:', route.path)
      render(renderNotFound(S, route))
      setActiveNav(null)
      return
    }

    // Render the page
    const html = renderer(S, route)
    render(html)

    // Set active navigation based on route pattern
    const routePattern = getRoutePattern(route.path)
    const baseRoute = route.path.split('/')[1] ? `/${route.path.split('/')[1]}` : route.path
    setActiveNav(routeToNavId[baseRoute] || null)

    // Delegate event handlers
    attachEventHandlers()
  } catch (error) {
    console.error('Error rendering page:', error)
    render(renderError(S, route, error))
    setActiveNav(null)
  }
}

// Attach event handlers to rendered content
function attachEventHandlers() {
  // Handle navigation clicks
  document.querySelectorAll('[data-go]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault()
      const path = btn.getAttribute('data-go')
      navigator.go(path)
    })
  })

  // Handle theme changes
  document.querySelectorAll('[data-act="changeTheme"]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault()
      const themeId = btn.getAttribute('data-theme')
      S.theme = themeId
      document.documentElement.dataset.theme = themeId
      save(S)
      sfx('tap', 0)
      showToast('Theme changed!')
      // Trigger re-render
      const route = parseRoute()
      onRouteChange(route)
    })
  })

  // Handle sound toggle
  document.querySelectorAll('[data-act="toggleSound"]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault()
      S.sound = !S.sound
      save(S)
      sfx('tap', 0)
      showToast(S.sound ? 'Sound on' : 'Sound off')
    })
  })

  // Handle volume change
  document.querySelectorAll('[data-act="changeVolume"]').forEach(input => {
    input.addEventListener('input', e => {
      const value = parseInt(e.target.value) / 100
      S.vol = Math.max(0, Math.min(1, value))
      const display = document.getElementById('volDisplay')
      if (display) display.textContent = Math.round(S.vol * 100) + '%'
      save(S)
    })
  })

  // Handle profile reset
  document.querySelectorAll('[data-act="resetProfile"]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault()
      if (confirm('Are you sure you want to reset your profile? This will clear all progress.')) {
        // Reset state but preserve theme/sound settings
        const theme = S.theme
        const sound = S.sound
        const vol = S.vol
        S = initState()
        S.theme = theme
        S.sound = sound
        S.vol = vol
        save(S)
        window.S = S
        showToast('Profile reset!')
        navigator.go('/home')
      }
    })
  })

  // Handle name save
  document.querySelectorAll('[data-act="saveName"]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault()
      const input = document.getElementById('playerName')
      if (input && input.value.trim()) {
        S.name = input.value.trim()
        save(S)
        showToast('Name saved!')
      }
    })
  })
}

// Initialize navigation buttons
initializeNavigation()

// Initialize router
initRouter(onRouteChange)
