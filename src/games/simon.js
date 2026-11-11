/**
 * Simon Says - Memory pattern game
 * Player must repeat increasingly longer color sequences
 */

import { sfx } from '../audio/sfx.js';
import { gbest, gadd } from '../services/storage.js';
import { shuffle } from '../utils/index.js';

export function simon(el) {
  const cols = ['#ef4444', '#3b82f6', '#22c55e', '#facc15'];
  let seq = [], pos = 0, busy = true, tm = [];
  
  const chips = (a) => `<div class="row2">${a.map(x => `<span class="star"${x[1] ? ` id="${x[1]}"` : ''}>${x[0]}</span>`).join('')}</div>`;
  
  el.innerHTML = chips([['Round 0', 'sr'], ['Best ' + gbest('simon')]]) + `<div class="pads">${cols.map((c, i) => `<button class="pad" data-i="${i}" style="background:${c}" aria-label="Pad ${i + 1}"></button>`).join('')}</div><p class="gmsg" id="sm">Press start</p><button class="cta" id="ss">Start</button>`;
  
  const pads = [...el.querySelectorAll('.pad')], M = el.querySelector('#sm'), B = el.querySelector('#ss');
  const later = (f, ms) => { tm.push(setTimeout(f, ms)) };
  const flash = i => {
    pads[i].classList.add('lit');
    sfx('note', i);
    later(() => pads[i].classList.remove('lit'), 300)
  };
  
  function play() {
    busy = true;
    pos = 0;
    M.textContent = 'Watch…';
    seq.forEach((n, k) => later(() => flash(n), 600 + k * 600));
    later(() => { busy = false; M.textContent = 'Your turn!' }, 600 + seq.length * 600)
  }
  
  function round() {
    seq.push(Math.floor(Math.random() * 4));
    el.querySelector('#sr').textContent = 'Round ' + seq.length;
    play()
  }
  
  pads.forEach(p => p.onclick = () => {
    if (busy) return;
    const i = +p.dataset.i;
    flash(i);
    if (i !== seq[pos]) {
      busy = true;
      sfx('wrong');
      const r = seq.length - 1, nb = r > 0 && gbest('simon', r);
      gadd(r * 2);
      M.textContent = 'Oops! You reached round ' + Math.max(r, 0) + (nb ? ' - new best!' : '');
      B.textContent = 'Try again';
      B.style.display = '';
      seq = [];
      return
    }
    pos++;
    if (pos === seq.length) {
      gadd(2);
      busy = true;
      later(() => { sfx('correct'); later(round, 500) }, 350)
    }
  });
  
  B.onclick = () => { sfx('tap'); B.style.display = 'none'; seq = []; round() };
  
  return () => tm.forEach(clearTimeout)
}
