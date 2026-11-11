/**
 * ttt2 - Game wrapper
 * Delegates to legacy implementation for modularization
 */

import { ttt2 as ttt2Legacy } from '../legacy/games.js';

export function ttt2(el) {
  return ttt2Legacy(el);
}
