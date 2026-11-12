/**
 * balloon - Game wrapper
 * Delegates to legacy implementation for modularization
 */

import { balloon as balloonLegacy } from '../legacy/games.js';

export function balloon(el) {
  return balloonLegacy(el);
}
