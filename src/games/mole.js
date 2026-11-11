/**
 * mole - Game wrapper
 * Delegates to legacy implementation for modularization
 */

import { mole as moleLegacy } from '../legacy/games.js';

export function mole(el) {
  return moleLegacy(el);
}
