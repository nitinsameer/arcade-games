/**
 * Sound Themes Registry
 * 19 complete sound theme configurations with exact original properties
 * Each theme defines waveform, pitch, duration, volume, and effects
 */

export const SOUND_THEMES = {
  clay: {
    w: 'sine',
    p: 1,
    d: 1,
    v: 1
  },

  claydark: {
    w: 'sine',
    p: 0.85,
    d: 1.1,
    v: 0.9
  },

  glass: {
    w: 'sine',
    p: 1.8,
    d: 1.5,
    v: 0.8,
    fx: 1
  },

  neu: {
    w: 'triangle',
    p: 1.1,
    d: 0.6,
    v: 0.5,
    k: 'click'
  },

  brutal: {
    w: 'square',
    p: 1,
    d: 0.8,
    v: 0.5,
    bend: 1
  },

  cyber: {
    w: 'sawtooth',
    p: 1,
    d: 1,
    v: 0.4,
    fx: 1
  },

  minimal: {
    w: 'sine',
    p: 1.3,
    d: 0.5,
    v: 0.5,
    k: 'click'
  },

  skeuo: {
    w: 'triangle',
    p: 1,
    d: 0.7,
    v: 0.8,
    k: 'click'
  },

  aurora: {
    w: 'sine',
    p: 1.6,
    d: 1.7,
    v: 0.7,
    fx: 1
  },

  material: {
    w: 'sine',
    p: 1.2,
    d: 1,
    v: 0.8
  },

  pixel: {
    w: 'square',
    p: 1.5,
    d: 0.7,
    v: 0.4
  },

  synth: {
    w: 'sawtooth',
    p: 0.9,
    d: 1.3,
    v: 0.4,
    fx: 1
  },

  paper: {
    w: 'triangle',
    p: 1.2,
    d: 0.6,
    v: 0.7,
    k: 'tick'
  },

  oled: {
    w: 'sine',
    p: 1.4,
    d: 0.4,
    v: 0.4,
    k: 'click'
  },

  bento: {
    w: 'sine',
    p: 1.1,
    d: 0.8,
    v: 0.8
  },

  pop: {
    w: 'triangle',
    p: 1.5,
    d: 1,
    v: 0.9
  },

  aero: {
    w: 'sine',
    p: 1.7,
    d: 1.4,
    v: 0.7,
    fx: 1
  },

  term: {
    w: 'square',
    p: 1.2,
    d: 0.5,
    v: 0.35
  },

  cartoon: {
    w: 'square',
    p: 1,
    d: 0.9,
    v: 0.5,
    bend: 1
  }
}

/**
 * Get preset by theme ID
 * @param {string} themeId - Theme name (e.g., 'clay', 'cyber')
 * @returns {Object} Sound preset or default clay
 */
export function getPreset(themeId) {
  return SOUND_THEMES[themeId] || SOUND_THEMES.clay
}

/**
 * List all available themes
 * @returns {string[]} Array of theme IDs
 */
export function getThemeIds() {
  return Object.keys(SOUND_THEMES)
}

/**
 * Get all presets as map
 * @returns {Object} All presets
 */
export function getAllPresets() {
  return { ...SOUND_THEMES }
}
