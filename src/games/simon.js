/**
 * Simon Says - Memory pattern game
 * Wrapper that delegates to legacy implementation
 */

import { simon as simonLegacy, setGameContext } from '../legacy/games.js';
import { sfx } from '../audio/sfx.js';

export function simon(el) {
  // Inject global context needed by legacy games
  // This would be provided by main application in real implementation
  return simonLegacy(el);
}
