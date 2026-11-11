/**
 * tug - Game wrapper
 * Delegates to legacy implementation for modularization
 */

import { tug as tugLegacy } from '../legacy/games.js';

export function tug(el) {
  return tugLegacy(el);
}
