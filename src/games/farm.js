/**
 * farm - Game wrapper
 * Delegates to legacy implementation for modularization
 */

import { farm as farmLegacy } from '../legacy/games.js';

export function farm(el) {
  return farmLegacy(el);
}
