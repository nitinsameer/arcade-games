/**
 * Home Page Renderer
 * Main landing screen with quick access to games, explore, and settings
 */

import { GAMES } from '../games/index.js'
import { SUBJECTS } from '../subjects/index.js'
import { THEMES } from '../themes/index.js'

/**
 * Render home page
 * @param {Object} state - Application state
 * @param {Object} route - Route information
 * @returns {string} HTML content
 */
export function renderHome(state, route) {
  const topGames = GAMES.slice(0, 3) // Show first 3 games
  const topSubjects = SUBJECTS.slice(0, 3) // Show first 3 subjects
  const theme = THEMES[state.theme || 'clay']
  const themeVars = theme?.vars || {}

  const gameCards = topGames
    .map(
      game => `
    <button class="tile raise" data-go="/game/${game.id}" style="--t: ${game.tint}">
      <div style="font-size: 48px; margin-bottom: 8px">${game.emoji}</div>
      <div style="font-weight: 800; font-size: 13px">${game.name}</div>
      <div style="font-size: 11px; color: var(--mute); margin-top: 4px">${game.desc || ''}</div>
    </button>
  `
    )
    .join('')

  const subjectCards = topSubjects
    .map(
      subject => `
    <button class="tile raise" data-go="/course/${subject.id}" style="--t: ${subject.tint}">
      <div style="font-size: 48px; margin-bottom: 8px">${subject.emoji}</div>
      <div style="font-weight: 800; font-size: 13px">${subject.name}</div>
      <div style="font-size: 11px; color: var(--mute); margin-top: 4px">${subject.lessons} Lessons</div>
    </button>
  `
    )
    .join('')

  return `
    <div class="phone">
      <div class="top">
        <h1 style="margin: 0; flex: 1">Style Lab</h1>
        <div class="star" style="font-size: 18px; padding: 8px 16px">${state.stars || 0} ⭐</div>
      </div>

      <div style="margin-bottom: 24px">
        <h2 style="font-size: 14px; font-weight: 800; margin: 0 0 12px 0; color: var(--mute)">QUICK GAMES</h2>
        <div class="row">${gameCards}</div>
      </div>

      <div style="margin-bottom: 24px">
        <h2 style="font-size: 14px; font-weight: 800; margin: 0 0 12px 0; color: var(--mute)">LEARN</h2>
        <div class="row">${subjectCards}</div>
      </div>

      <div style="margin-bottom: 24px">
        <button class="cta" data-go="/games" style="width: 100%; margin-bottom: 10px">
          👾 All Games
        </button>
        <button class="cta" data-go="/explore" style="width: 100%; margin-bottom: 10px">
          🗺️ Explore All Subjects
        </button>
      </div>

      <style>
        .row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .tile {
          padding: 16px 12px;
          border-radius: var(--r);
          border: none;
          cursor: pointer;
          background: var(--t, var(--card));
          color: var(--ink);
          font-family: inherit;
          text-align: center;
          transition: 0.2s;
          box-shadow: var(--sh);
        }
        .tile:active {
          transform: scale(0.97);
          box-shadow: var(--sin);
        }
      </style>
    </div>
  `
}
