/**
 * scramble - Game wrapper
 * Delegates to legacy implementation for modularization
 */

import { scramble as scrambleLegacy } from '../legacy/games.js';

export function scramble(el) {
  return scrambleLegacy(el);
}
