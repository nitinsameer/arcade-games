/**
 * Bootstrap Service
 * Application initialization and state setup
 */

import { load, save } from './storage.js'

/**
 * Default application state
 */
const DEFAULT_STATE = {
  name: 'Explorer',
  theme: 'clay',
  sound: true,
  vol: 0.7,
  gb: {}, // game best scores
  done: {}, // lessons done
  stars: 0, // total achievements
  best: {}, // quiz best scores per subject
  day: { d: '', n: 0 } // today's lesson count
}

/**
 * Initialize application state
 * @returns {Object} Initialized state
 */
export function initState() {
  const state = load(DEFAULT_STATE)

  // Validate and correct invalid state values
  if (typeof state.vol !== 'number' || state.vol < 0 || state.vol > 1) {
    state.vol = 0.7
  }
  if (typeof state.sound !== 'boolean') {
    state.sound = true
  }
  if (typeof state.stars !== 'number') {
    state.stars = 0
  }
  if (!state.gb) state.gb = {}
  if (!state.done) state.done = {}
  if (!state.best) state.best = {}
  if (!state.day) state.day = { d: '', n: 0 }

  // Persist validated state
  save(state)

  return state
}

/**
 * Update application theme
 * @param {Object} state - Current state
 * @param {string} themeName - Theme name to apply
 */
export function setTheme(state, themeName) {
  state.theme = themeName
  document.documentElement.dataset.theme = themeName
  save(state)
}

/**
 * Toggle sound on/off
 * @param {Object} state - Current state
 * @returns {boolean} New sound state
 */
export function toggleSound(state) {
  state.sound = !state.sound
  save(state)
  return state.sound
}

/**
 * Set volume level
 * @param {Object} state - Current state
 * @param {number} volume - Volume 0-1
 */
export function setVolume(state, volume) {
  state.vol = Math.max(0, Math.min(1, volume))
  save(state)
}

/**
 * Update player name
 * @param {Object} state - Current state
 * @param {string} name - New player name
 */
export function setPlayerName(state, name) {
  state.name = String(name).slice(0, 14)
  save(state)
}

/**
 * Reset all progress (keeping theme/name/settings)
 * @param {Object} state - Current state
 */
export function resetProgress(state) {
  state.gb = {}
  state.done = {}
  state.stars = 0
  state.best = {}
  state.day = { d: '', n: 0 }
  save(state)
}

/**
 * Get default state (for reference)
 * @returns {Object} Default state template
 */
export function getDefaultState() {
  return { ...DEFAULT_STATE }
}
