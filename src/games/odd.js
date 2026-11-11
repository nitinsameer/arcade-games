/**
 * odd - Game wrapper
 * Delegates to legacy implementation for modularization
 */

import { odd as oddLegacy } from '../legacy/games.js';

export function odd(el) {
  return oddLegacy(el);
}
