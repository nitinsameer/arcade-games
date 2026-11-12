/**
 * snake - Game wrapper
 * Delegates to legacy implementation for modularization
 */

import { snake as snakeLegacy } from '../legacy/games.js';

export function snake(el) {
  return snakeLegacy(el);
}
