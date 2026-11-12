/**
 * hangman - Game wrapper
 * Delegates to legacy implementation for modularization
 */

import { hangman as hangmanLegacy } from '../legacy/games.js';

export function hangman(el) {
  return hangmanLegacy(el);
}
