/**
 * Game Utilities - Shared helpers for all games
 * Maintains compatibility with original global state model
 */

// These will be injected from main.js
export let globalState = null;
export let globalSfx = null;
export let globalGo = null;

/**
 * Set the global state reference (called from main.js)
 */
export function setGameContext(state, sfxFn, goFn) {
  globalState = state;
  globalSfx = sfxFn;
  globalGo = goFn;
}

/**
 * Get best score for a game
 */
export function gb(gameId) {
  return globalState?.gb?.[gameId] || 0;
}

/**
 * Set best score if this is a new best
 */
export function gbest(gameId, score) {
  if (!globalState) return false;
  const current = globalState.gb?.[gameId] || 0;
  if (score > current) {
    if (!globalState.gb) globalState.gb = {};
    globalState.gb[gameId] = score;
    return true;
  }
  return false;
}

/**
 * Add points/stars to global game count
 */
export function gadd(points) {
  if (globalState) {
    globalState.stars = (globalState.stars || 0) + points;
  }
}

/**
 * Play sound effect
 */
export function sfx(eventName, arg) {
  if (globalSfx) {
    globalSfx(eventName, arg);
  }
}

/**
 * Navigate to a route
 */
export function go(path) {
  if (globalGo) {
    globalGo(path);
  }
}

/**
 * Shuffle array in-place
 */
export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Random integer 0 to n-1
 */
export function rand(n) {
  return Math.floor(Math.random() * n);
}

/**
 * Create chip display (stats bar)
 */
export function chips(items) {
  return `<div class="row2">${items.map(x => `<span class="star"${x[1] ? ` id="${x[1]}"` : ''}>${x[0]}</span>`).join('')}</div>`;
}

/**
 * Display end game screen
 */
export function endScreen(el, gameId, score, unit, onAgain) {
  const nb = score > 0 && gbest(gameId, score);
  gadd(score * 2);
  sfx('end', score > 0 ? 1 : 0);
  el.innerHTML = `<div class="trophy">${nb ? '🏆' : '😢'}</div><h2>${score} ${unit}</h2><p style="color:var(--mute)">${nb ? 'New best score!' : 'Best: ' + gb(gameId)}</p><p><span class="star" style="display:inline-block">+${score * 2} ⭐</span></p><button class="cta" id="again">Play again</button>`;
  el.querySelector('#again').onclick = () => { sfx('tap'); onAgain() };
}
