/**
 * rps2 - Game wrapper
 * Delegates to legacy implementation for modularization
 */

import { rps2 as rps2Legacy } from '../legacy/games.js';

export function rps2(el) {
  return rps2Legacy(el);
}
