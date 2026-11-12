/**
 * Web Audio Synthesizer
 * Tone generation and noise synthesis for sound effects
 */

import { getContext, getMaster, getEffectBus } from './context.js'

/**
 * Generate a musical tone
 * @param {AudioContext} ctx - Audio context
 * @param {Object} preset - Sound preset with waveform and properties
 * @param {number} frequency - Base frequency in Hz
 * @param {number} time - Start time (relative to current time)
 * @param {number} duration - Duration in seconds
 * @param {number} volume - Volume (0-1)
 * @param {number} targetFreq - Optional end frequency for pitch bend
 */
export function playTone(ctx, preset, frequency, time, duration, volume, targetFreq) {
  if (!ctx || !getMaster()) return

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  const nowTime = ctx.currentTime + time

  // Set waveform type
  osc.type = preset.w || 'sine'

  // Set frequency
  osc.frequency.setValueAtTime(frequency, nowTime)

  // Apply frequency bend if target provided
  if (targetFreq) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(30, targetFreq), nowTime + duration)
  }

  // Envelope: attack, sustain, release
  const volume_scaled = Math.max(0.0002, volume * (preset.v || 1))
  gain.gain.setValueAtTime(0.0001, nowTime)
  gain.gain.linearRampToValueAtTime(volume_scaled, nowTime + 0.008)
  gain.gain.exponentialRampToValueAtTime(0.0001, nowTime + duration)

  // Connect to master (and effect bus if enabled)
  osc.connect(gain)
  gain.connect(getMaster())

  if (preset.fx) {
    gain.connect(getEffectBus())
  }

  // Play
  osc.start(nowTime)
  osc.stop(nowTime + duration + 0.05)
}

/**
 * Generate noise (percussion/hit sound)
 * @param {AudioContext} ctx - Audio context
 * @param {number} time - Start time
 * @param {number} duration - Duration in seconds
 * @param {number} volume - Volume (0-1)
 * @param {number} highpass - High-pass filter frequency (Hz)
 */
export function playNoise(ctx, time, duration, volume, highpass) {
  if (!ctx || !getMaster()) return

  // Create noise buffer
  const bufferLen = Math.max(1, Math.floor(ctx.sampleRate * duration))
  const buffer = ctx.createBuffer(1, bufferLen, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  // Fill with white noise with fade-out envelope
  for (let i = 0; i < bufferLen; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferLen)
  }

  // Create source and filter
  const source = ctx.createBufferSource()
  source.buffer = buffer

  const filter = ctx.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.value = highpass || 1000

  const gain = ctx.createGain()
  gain.gain.value = volume

  // Connect chain
  source.connect(filter)
  filter.connect(gain)
  gain.connect(getMaster())

  // Play
  const nowTime = ctx.currentTime + time
  source.start(nowTime)
}

/**
 * Play a simple click sound (UI feedback)
 * @param {Object} preset - Sound preset
 * @param {boolean} useNoise - Use noise (true) or tone (false)
 */
export function playClick(preset, useNoise = false) {
  const ctx = getContext()
  if (!ctx) return

  if (useNoise) {
    playNoise(ctx, 0, 0.03, 0.5 * (preset.v || 1), 2500)
  } else {
    playTone(ctx, preset, 1800, 0, 0.03, 0.1, null)
  }
}

/**
 * Play a tick sound (clock-like)
 * @param {Object} preset - Sound preset
 */
export function playTick(preset) {
  const ctx = getContext()
  if (!ctx) return

  playNoise(ctx, 0, 0.02, 0.45, 5000)
  playTone(ctx, preset, 1800, 0, 0.03, 0.1, null)
}

/**
 * Play a pitch-bent tone (slide/glide effect)
 * @param {Object} preset - Sound preset
 * @param {number} startFreq - Start frequency
 * @param {number} endFreq - End frequency
 * @param {number} duration - Duration in seconds
 */
export function playBend(preset, startFreq, endFreq, duration) {
  const ctx = getContext()
  if (!ctx) return

  playTone(ctx, preset, startFreq, 0, duration, 0.3, endFreq)
}
