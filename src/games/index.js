/**
 * Games Module Index - Central aggregator for all 15 games
 * Each game is imported and exported for use in the application
 */

import { GAMES } from './registry.js';

// Import all game modules
import { simon } from './simon.js';
import { balloon } from './balloon.js';
import { scramble } from './scramble.js';
import { hangman } from './hangman.js';
import { mole } from './mole.js';
import { odd } from './odd.js';
import { ttt2 } from './ttt2.js';
import { connect4 } from './connect4.js';
import { tug } from './tug.js';
import { react } from './react.js';
import { mathduel } from './mathduel.js';
import { rps2 } from './rps2.js';
import { snake } from './snake.js';
import { farm } from './farm.js';
import { colormatch } from './colormatch.js';

// Map of game ID to game function
const gameMap = {
  simon,
  balloon,
  scramble,
  hangman,
  mole,
  odd,
  ttt2,
  connect4,
  tug,
  react,
  mathduel,
  rps2,
  snake,
  farm,
  colormatch
};

/**
 * Get a game function by ID
 */
export function getGame(gameId) {
  return gameMap[gameId];
}

/**
 * Start a game - renders game UI into element
 */
export function startGame(gameId, element) {
  const gameFn = gameMap[gameId];
  if (!gameFn) {
    console.error(`Game not found: ${gameId}`);
    return null;
  }
  return gameFn(element);
}

/**
 * Export all games for potential direct access
 */
export {
  simon,
  balloon,
  scramble,
  hangman,
  mole,
  odd,
  ttt2,
  connect4,
  tug,
  react,
  mathduel,
  rps2,
  snake,
  farm,
  colormatch,
  GAMES
};
