/**
 * Web Audio API Context Management
 * Lazy initialization of audio context with proper browser fallbacks
 */

let ctx = null
let master = null
let fxBus = null

/**
 * Initialize or retrieve Web Audio context
 * Handles browser compatibility and suspended states
 * @param {number} volume - Master volume (0-1)
 * @returns {AudioContext|null} Audio context or null if not supported
 */
export function getContext(volume = 0.7) {
  if (!ctx) {
    // Try to get audio context (different APIs for different browsers)
    const AudioContextClass = window.AudioContext || window.webkitAudioContext

    // No audio support
    if (!AudioContextClass) {
      return null
    }

    try {
      ctx = new AudioContextClass()
    } catch (e) {
      return null
    }

    // Create master volume control
    master = ctx.createGain()
    master.connect(ctx.destination)

    // Create delay/reverb effect chain
    const delay = ctx.createDelay(1)
    delay.delayTime.value = 0.17

    const feedback = ctx.createGain()
    feedback.gain.value = 0.38
    delay.connect(feedback)
    feedback.connect(delay)

    const wet = ctx.createGain()
    wet.gain.value = 0.5
    delay.connect(wet)
    wet.connect(master)

    fxBus = delay
  }

  // Resume context if suspended (user interaction required)
  if (ctx.state === 'suspended') {
    ctx.resume()
  }

  // Update master volume
  if (master) {
    master.gain.value = Math.pow(volume, 1.5) * 0.9
  }

  return ctx
}

/**
 * Get master gain node
 * @returns {GainNode|null} Master gain or null
 */
export function getMaster() {
  return master
}

/**
 * Get effect bus (delay/reverb)
 * @returns {DelayNode|null} Effect bus or null
 */
export function getEffectBus() {
  return fxBus
}

/**
 * Check if audio context is available
 * @returns {boolean} Whether audio is supported
 */
export function isAudioSupported() {
  return !!(window.AudioContext || window.webkitAudioContext)
}

/**
 * Reset audio context (for testing/cleanup)
 * Exposed for testing only
 */
export function resetContext() {
  if (ctx) {
    try {
      ctx.close()
    } catch (e) {
      // Ignore close errors
    }
  }
  ctx = null
  master = null
  fxBus = null
}
