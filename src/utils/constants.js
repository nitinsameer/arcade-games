/**
 * Constants and Registries
 * Placeholder for games and subjects (to be split in later phases)
 */

/**
 * Games registry - will be imported from separate game modules
 */
export let GAMES = []

/**
 * Subjects registry - will be imported from separate subject modules
 */
export let SUBJECTS = []

/**
 * Themes registry - all 19 visual themes
 */
export const THEMES = [
  ['clay', 'Claymorphism', 'Soft, puffy 3D clay'],
  ['claydark', 'Clay Dark', 'Clay after sunset'],
  ['glass', 'Glassmorphism', 'Frosted translucent glass'],
  ['neu', 'Neumorphism', 'Soft extruded surfaces'],
  ['brutal', 'Neobrutalism', 'Bold borders, hard shadows'],
  ['cyber', 'Cyber Neon', 'Glowing neon on dark'],
  ['minimal', 'Minimal Flat', 'Clean and light'],
  ['skeuo', 'Skeuomorphism', 'Realistic glossy materials'],
  ['aurora', 'Aurora Mesh', 'Glowing flowing gradients'],
  ['material', 'Material You', 'Soft rounded pastel'],
  ['pixel', 'Retro Pixel', '8-bit arcade blocks'],
  ['synth', 'Synthwave', 'Neon 80s sunset'],
  ['paper', 'Paper Notebook', 'Hand-drawn on paper'],
  ['oled', 'Dark OLED', 'Pure black, thin lines'],
  ['bento', 'Bento Grid', 'Clean rounded boxes'],
  ['pop', 'Gradient Pop', 'Bold colorful gradients'],
  ['aero', 'Frutiger Aero', 'Glossy sky and bubbles'],
  ['term', 'Terminal', 'Green on black hacker'],
  ['cartoon', 'Cartoon Comic', 'Thick outlines, comic dots']
]

/**
 * Set games registry
 * @param {Array} games - Games array
 */
export function setGames(games) {
  GAMES = games
}

/**
 * Set subjects registry
 * @param {Array} subjects - Subjects array
 */
export function setSubjects(subjects) {
  SUBJECTS = subjects
}

/**
 * Find a game by ID
 * @param {string} gameId - Game ID
 * @returns {Object|undefined} Game object
 */
export function findGame(gameId) {
  return GAMES.find(g => g.id === gameId)
}

/**
 * Find a subject by ID
 * @param {string} subjectId - Subject ID
 * @returns {Object|undefined} Subject object
 */
export function findSubject(subjectId) {
  return SUBJECTS.find(s => s.id === subjectId)
}

/**
 * Find a theme by ID
 * @param {string} themeId - Theme ID
 * @returns {Array|undefined} Theme array [id, name, description]
 */
export function findTheme(themeId) {
  return THEMES.find(t => t[0] === themeId)
}

/**
 * Get all single-player games
 * @returns {Array} Single-player games
 */
export function getSinglePlayerGames() {
  return GAMES.filter(g => !g.p2)
}

/**
 * Get all two-player games
 * @returns {Array} Two-player games
 */
export function getTwoPlayerGames() {
  return GAMES.filter(g => g.p2)
}
