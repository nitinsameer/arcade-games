/**
 * Shuffle Utility
 * Fisher-Yates shuffle algorithm for randomizing arrays
 */

/**
 * Shuffle an array randomly (non-mutating)
 * @param {Array} array - Array to shuffle
 * @returns {Array} New shuffled array
 */
export function shuffle(array) {
  return array
    .map(value => [Math.random(), value])
    .sort((a, b) => a[0] - b[0])
    .map(x => x[1])
}

/**
 * Shuffle an array in place (mutating)
 * @param {Array} array - Array to shuffle
 * @returns {Array} The same array, shuffled
 */
export function shuffleInPlace(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

/**
 * Get random element from array
 * @param {Array} array - Array to pick from
 * @returns {*} Random element
 */
export function randomElement(array) {
  if (array.length === 0) return undefined
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * Get N random unique elements from array
 * @param {Array} array - Array to pick from
 * @param {number} n - Number of elements to pick
 * @returns {Array} Array of N random unique elements
 */
export function randomUnique(array, n) {
  if (n > array.length) {
    throw new Error('Cannot pick more elements than array length')
  }
  const shuffled = shuffle(array)
  return shuffled.slice(0, n)
}
