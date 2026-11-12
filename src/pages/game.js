/**
 * Game Screen Renderer
 * Renders an active game based on game ID
 * Integrates with legacy game functions
 */

import { GAMES } from '../games/index.js'
import { getGame as getGameFunction, startGame } from '../games/index.js'
import { setGameContext } from '../legacy/games.js'

let currentGameCleanup = null

/**
 * Render game screen
 * @param {Object} state - Application state
 * @param {Object} route - Route information with params
 * @returns {string} HTML content
 */
export function renderGame(state, route) {
  const { id: gameId } = route.params

  // Validate game exists
  const gameMetadata = GAMES.find(g => g.id === gameId)
  if (!gameMetadata) {
    return `
      <div class="phone">
        <div class="top">
          <button class="back" data-go="/games">←</button>
          <h1 style="margin: 0">Game Not Found</h1>
        </div>
        <div style="text-align: center; margin-top: 40px">
          <p>Sorry, this game doesn't exist.</p>
          <button class="cta" data-go="/games">Back to Games</button>
        </div>
      </div>
    `
  }

  // Return container that will be populated by game logic
  // The game will be initialized in a post-render hook
  return `
    <div class="phone" id="game-screen">
      <div class="top">
        <button class="back" data-go="/games" style="background: none; border: none; cursor: pointer; font-size: 24px; padding: 0">←</button>
        <h1 style="margin: 0; flex: 1">${gameMetadata.name}</h1>
        <div class="star" style="font-size: 18px; padding: 8px 16px">${state.gb?.[gameId] || 0}</div>
      </div>

      <div class="gstage" id="game-content">
        <p style="text-align: center; color: var(--mute)">Loading game...</p>
      </div>

      <script type="module">
        (function() {
          const gameId = '${gameId}';
          const gameContainer = document.getElementById('game-content');
          if (!gameContainer) return;

          // Import game starter dynamically
          import('/src/games/index.js').then(module => {
            const { startGame } = module;
            try {
              const cleanup = startGame(gameId, gameContainer);
              // Store cleanup function for potential later cleanup
              window.__currentGameCleanup = cleanup;
            } catch (error) {
              console.error('Error starting game:', error);
              gameContainer.innerHTML = '<p style="color: red">Error loading game</p>';
            }
          }).catch(err => {
            console.error('Failed to load game module:', err);
            gameContainer.innerHTML = '<p style="color: red">Failed to load game</p>';
          });
        })();
      </script>

      <style>
        .gstage {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 20px 0;
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
