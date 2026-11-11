/**
 * connect4 - Game wrapper
 * Delegates to legacy implementation for modularization
 */

import { connect4 as connect4Legacy } from '../legacy/games.js';

export function connect4(el) {
  return connect4Legacy(el);
}
