/**
 * react - Game wrapper
 * Delegates to legacy implementation for modularization
 */

import { react as reactLegacy } from '../legacy/games.js';

export function react(el) {
  return reactLegacy(el);
}
