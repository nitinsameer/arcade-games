/**
 * Sound Effects Manager
 * High-level API for playing game sound effects with theme support
 */

import { getContext, isAudioSupported } from './context.js'
import { playTone, playNoise, playClick, playTick, playBend } from './synthesizer.js'
import { getPreset } from './soundThemes.js'

/**
 * Play a sound effect
 * @param {string} eventName - Event type (tap, correct, wrong, lesson, end, note, pop, theme)
 * @param {number} arg - Optional argument (e.g., note index, victory flag)
 * @param {Object} state - App state (S object with sound and theme settings)
 */
export function sfx(eventName, arg, state) {
  // Check if sound is enabled
  if (!state || !state.sound) {
    return
  }

  // Get audio context
  const ctx = getContext(state.vol || 0.7)
  if (!ctx) {
    return
  }

  // Get current theme preset
  const preset = getPreset(state.theme || 'clay')
  const p = preset.p || 1
  const d = preset.d || 1

  // Helper: play tone with preset multipliers
  const playNote = (freq, startTime, duration, volume, targetFreq) => {
    playTone(ctx, preset, freq * p, startTime, duration * d, volume, targetFreq && targetFreq * p)
  }

  try {
    switch (eventName) {
      // UI tap/click feedback
      case 'tap':
        if (preset.k === 'click') {
          playNoise(ctx, 0, 0.03, 0.5 * preset.v, 2500)
        } else if (preset.k === 'tick') {
          playTick(preset)
        } else if (preset.bend) {
          playBend(preset, 330, 640, 0.12)
        } else {
          playNote(520, 0, 0.09, 0.3, 380)
        }
        break

      // Correct answer
      case 'correct':
        playNote(523.25, 0, 0.2, 0.3)
        playNote(783.99, 0.1, 0.28, 0.3)
        playNote(1975, 0.2, 0.12, 0.12)
        break

      // Wrong answer
      case 'wrong':
        playNote(190, 0, 0.28, 0.28, 120)
        break

      // Lesson complete
      case 'lesson':
        [523.25, 659.25, 783.99].forEach((f, i) => {
          playNote(f, i * 0.09, 0.22, 0.3)
        })
        playNote(1318.5, 0.3, 0.2, 0.2)
        break

      // Game end (victory/defeat)
      case 'end':
        if (arg === 2) {
          // Victory fanfare
          [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
            playNote(f, i * 0.11, 0.25, 0.3)
          })
          [523.25, 659.25, 783.99, 1046.5].forEach((f) => {
            playNote(f, 0.55, 0.7, 0.16)
          })
        } else if (arg === 1) {
          // Good/neutral end
          [523.25, 659.25, 783.99].forEach((f, i) => {
            playNote(f, i * 0.11, 0.3, 0.3)
          })
        } else {
          // Defeat/sad
          [392, 440, 523.25].forEach((f, i) => {
            playNote(f, i * 0.13, 0.3, 0.25)
          })
        }
        break

      // Musical note (for Drum Kit, etc.)
      case 'note':
        // arg: 0=C4, 1=E4, 2=G4, 3=C5
        const notes = [261.63, 329.63, 392, 523.25]
        const freq = notes[arg] || notes[0]
        playNote(freq, 0, 0.35, 0.35)
        break

      // Bubble pop
      case 'pop':
        playNoise(ctx, 0, 0.05, 0.4 * preset.v, 800)
        playNote(900, 0, 0.08, 0.2, 300)
        break

      // Theme change confirmation
      case 'theme':
        playNote(220, 0, 0.3, 0.22, 1400)
        playNoise(ctx, 0, 0.25, 0.1 * preset.v, 1200)
        break

      default:
        // Unknown event - silent
        break
    }
  } catch (e) {
    // Silent fail - don't break game if audio errors
  }
}

/**
 * Check if audio is supported in this browser
 * @returns {boolean}
 */
export function canPlayAudio() {
  return isAudioSupported()
}
