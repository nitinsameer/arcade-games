/**
 * Storage Service
 * Handles localStorage persistence of game state
 */

/**
 * Save application state to localStorage
 * @param {Object} state - The state object to persist
 */
export function save(state) {
  try {
    localStorage.setItem('claylearn', JSON.stringify(state))
  } catch (e) {
    // Silent fail; app continues with in-memory state
  }
}

/**
 * Load application state from localStorage
 * @param {Object} defaultState - Default state if nothing saved
 * @returns {Object} Merged state from storage + defaults
 */
export function load(defaultState) {
  try {
    const v = localStorage.getItem('claylearn')
    if (v) {
      return { ...defaultState, ...JSON.parse(v) }
    }
  } catch (e) {
    // Silent fail; use default state
  }
  return defaultState
}
