/**
 * Balloon Pop - Tap balloons with the target number
 */

import { sfx } from '../audio/sfx.js';
import { gadd } from '../services/storage.js';

export function balloon(el) {
  let score, lives, t, tgt, run, iv = [];
  const cl = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ec4899'];
  const chips = (a) => `<div class="row2">${a.map(x => `<span class="star"${x[1] ? ` id="${x[1]}"` : ''}>${x[0]}</span>`).join('')}</div>`;
  
  const stop = () => { run = false; iv.forEach(clearInterval); iv = [] };
  
  function start() {
    score = 0; lives = 3; t = 30; run = true;
    el.innerHTML = chips([['⏱ 30s', 'bt'], ['Score 0', 'bs'], ['❤️❤️❤️', 'bl']]) + `<div class="gmsg" id="bq" style="font-size:26px"></div><div class="arena" id="ar"></div>`;
    const ar = el.querySelector('#ar'), q = el.querySelector('#bq');
    const ui = () => {
      el.querySelector('#bt').textContent = '⏱ ' + t + 's';
      el.querySelector('#bs').textContent = 'Score ' + score;
      el.querySelector('#bl').textContent = '❤️'.repeat(Math.max(0, lives)) || '💔'
    };
    const newQ = () => { const a = 1 + Math.floor(Math.random() * 9), b = 1 + Math.floor(Math.random() * 9); tgt = a + b; q.textContent = 'Pop ' + a + ' + ' + b };
    const fin = () => { stop(); endGame() };
    
    function spawn() {
      const b = document.createElement('button'), v = Math.random() < .4 ? tgt : 2 + Math.floor(Math.random() * 17);
      b.className = 'balloon';
      b.textContent = v;
      b.style.left = Math.random() * Math.max(10, ar.clientWidth - 60) + 'px';
      b.style.background = cl[Math.floor(Math.random() * 6)];
      b.style.setProperty('--dur', (4 + Math.random() * 2) + 's');
      b.onanimationend = () => b.remove();
      b.onclick = () => {
        if (!run) return;
        b.remove();
        if (v === tgt) { score++; sfx('pop'); newQ() }
        else { lives--; sfx('wrong') }
        ui();
        if (lives <= 0) fin()
      };
      ar.appendChild(b)
    }
    
    newQ(); ui();
    iv.push(setInterval(() => { if (run) spawn() }, 750));
    iv.push(setInterval(() => { t--; ui(); if (t <= 0) fin() }, 1000))
  }
  
  function endGame() {
    gadd(score * 2);
    sfx('end', score > 0 ? 1 : 0);
    el.innerHTML = `<div class="trophy">${score > 0 ? '🏆' : '😢'}</div><h2>${score} popped</h2><p style="color:var(--mute)">Best: ${score}</p><p><span class="star" style="display:inline-block">+${score * 2} ⭐</span></p><button class="cta" id="again">Play again</button>`;
    el.querySelector('#again').onclick = () => { sfx('tap'); start() }
  }
  
  start();
  return stop
}
