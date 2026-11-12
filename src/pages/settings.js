/**
 * Settings Page Renderer
 * Theme selector, sound toggle, and app settings
 */

import { THEMES } from '../themes/index.js'

/**
 * Render settings page
 * @param {Object} state - Application state
 * @param {Object} route - Route information
 * @returns {string} HTML content
 */
export function renderSettings(state, route) {
  const currentTheme = state.theme || 'clay'
  const themeIds = Object.keys(THEMES)

  const themeCards = themeIds
    .map(id => {
      const theme = THEMES[id]
      const isActive = id === currentTheme

      return `
        <button 
          class="theme-card raise" 
          data-theme="${id}"
          data-act="changeTheme"
          style="
            --t: ${theme.vars?.accent || '#7c5cf0'};
            border: ${isActive ? '3px solid var(--accent)' : 'none'};
            opacity: ${isActive ? 1 : 0.7};
          "
        >
          <div style="font-size: 24px; margin-bottom: 8px; display: inline-block; width: 48px; height: 48px; border-radius: var(--r); background: ${theme.vars?.bg || '#ece8fb'}"></div>
          <div style="font-weight: 800; font-size: 12px; margin-top: 8px">${theme.name}</div>
          ${isActive ? '<div style="font-size: 11px; color: var(--green); margin-top: 4px">✓ Selected</div>' : ''}
        </button>
      `
    })
    .join('')

  return `
    <div class="phone">
      <div class="top">
        <button class="back" data-go="/home" style="background: none; border: none; cursor: pointer; font-size: 24px; padding: 0">←</button>
        <h1 style="margin: 0; flex: 1; text-align: center">Settings</h1>
        <div class="star" style="font-size: 18px; padding: 8px 16px">${state.stars || 0} ⭐</div>
      </div>

      <div style="margin-top: 24px">
        <h2 style="font-size: 14px; font-weight: 800; margin: 0 0 12px 0; color: var(--mute)">SOUND & VOLUME</h2>
        
        <div class="raise" style="padding: 16px; border-radius: var(--r); box-shadow: var(--sh); margin-bottom: 16px">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px">
            <label style="font-weight: 700; cursor: pointer">
              🔊 Sound Effects
            </label>
            <button 
              class="toggle-btn" 
              data-act="toggleSound"
              style="
                width: 50px;
                height: 28px;
                border-radius: 14px;
                border: none;
                background: ${state.sound ? 'var(--green)' : 'var(--mute)'};
                cursor: pointer;
                transition: 0.2s;
                position: relative;
              "
            >
              <div style="
                position: absolute;
                width: 24px;
                height: 24px;
                background: white;
                border-radius: 12px;
                top: 2px;
                left: ${state.sound ? 24 : 2}px;
                transition: 0.2s;
              "></div>
            </button>
          </div>
          
          <div style="font-size: 12px; color: var(--mute)">
            Volume: <span id="volDisplay">${Math.round((state.vol || 0.7) * 100)}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value="${Math.round((state.vol || 0.7) * 100)}"
            data-act="changeVolume"
            style="width: 100%; cursor: pointer; margin-top: 8px"
          />
        </div>
      </div>

      <div style="margin-top: 24px">
        <h2 style="font-size: 14px; font-weight: 800; margin: 0 0 12px 0; color: var(--mute)">THEMES (${themeIds.length})</h2>
        
        <div class="themes-grid">
          ${themeCards}
        </div>
      </div>

      <div style="margin-top: 24px">
        <h2 style="font-size: 14px; font-weight: 800; margin: 0 0 12px 0; color: var(--mute)">PROFILE</h2>
        
        <div class="raise" style="padding: 16px; border-radius: var(--r); box-shadow: var(--sh); margin-bottom: 16px">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <div>
              <div style="font-weight: 700; margin-bottom: 4px">Player Name</div>
              <div style="font-size: 13px; color: var(--mute)">${state.name || 'Explorer'}</div>
            </div>
            <button class="cta alt" data-go="/profile" style="padding: 8px 16px; font-size: 12px">
              Edit
            </button>
          </div>
        </div>

        <button 
          class="cta alt" 
          data-act="resetProfile"
          style="width: 100%; padding: 12px; margin-top: 12px"
        >
          🔄 Reset Profile
        </button>
      </div>

      <div style="margin-top: 24px; text-align: center; font-size: 11px; color: var(--mute)">
        <p>Version 1.0 | Style Lab Arcade Games</p>
      </div>

      <style>
        .themes-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .theme-card {
          padding: 12px;
          border-radius: var(--r);
          border: none;
          cursor: pointer;
          background: var(--card);
          color: var(--ink);
          font-family: inherit;
          text-align: center;
          transition: 0.2s;
          box-shadow: var(--sh);
        }
        .theme-card:active {
          transform: scale(0.97);
        }
        .back {
          font-size: 24px;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--rs);
        }
        .back:active {
          background: var(--card);
        }
      </style>
    </div>
  `
}
