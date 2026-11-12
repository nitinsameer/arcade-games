/**
 * Games List Page Renderer
 * Browse all 15 games - single-player and two-player
 */

import { GAMES } from '../games/index.js'

/**
 * Render games list page
 * @param {Object} state - Application state
 * @param {Object} route - Route information
 * @returns {string} HTML content
 */
export function renderGames(state, route) {
  const singlePlayerGames = GAMES.filter(g => !g.p2)
  const twoPlayerGames = GAMES.filter(g => g.p2)

  const renderGameCard = (game) => {
    const bestScore = state.gb?.[game.id] || 0

    return `
      <button class="tile raise" data-go="/game/${game.id}" style="--t: ${game.tint}">
        <div style="font-size: 48px; margin-bottom: 8px">${game.emoji}</div>
        <div style="font-weight: 800; font-size: 13px">${game.name}</div>
        <div style="font-size: 10px; color: var(--mute); margin-top: 4px">${game.desc || ''}</div>
        ${bestScore > 0 ? `<div style="font-size: 11px; margin-top: 8px; color: var(--green)">🏆 ${bestScore}</div>` : ''}
      </button>
    `
  }

  const singlePlayerCards = singlePlayerGames.map(renderGameCard).join('')
  const twoPlayerCards = twoPlayerGames.map(renderGameCard).join('')

  return `
    <div class="phone">
      <div class="top">
        <button class="back" data-go="/home" style="background: none; border: none; cursor: pointer; font-size: 24px; padding: 0">←</button>
        <h1 style="margin: 0; flex: 1; text-align: center">Games</h1>
        <div class="star" style="font-size: 18px; padding: 8px 16px">${state.stars || 0} ⭐</div>
      </div>

      <div style="margin-top: 24px">
        <h2 style="font-size: 14px; font-weight: 800; margin: 0 0 12px 0; color: var(--mute)">SINGLE PLAYER (${singlePlayerGames.length})</h2>
        <div class="row3">
          ${singlePlayerCards}
        </div>
      </div>

      <div style="margin-top: 24px">
        <h2 style="font-size: 14px; font-weight: 800; margin: 0 0 12px 0; color: var(--mute)">TWO PLAYER (${twoPlayerGames.length})</h2>
        <div class="row3">
          ${twoPlayerCards}
        </div>
      </div>

      <style>
        .row3 {
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
