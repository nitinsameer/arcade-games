/**
 * mathduel - Game wrapper
 * Delegates to legacy implementation for modularization
 */

import { mathduel as mathduelLegacy } from '../legacy/games.js';

export function mathduel(el) {
  return mathduelLegacy(el);
}
