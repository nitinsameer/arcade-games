/**
 * colormatch - Game wrapper
 * Delegates to legacy implementation for modularization
 */

import { colormatch as colormatchLegacy } from '../legacy/games.js';

export function colormatch(el) {
  return colormatchLegacy(el);
}
