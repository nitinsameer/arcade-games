/**
 * Legacy Games Module
 * Contains all 15 original game functions extracted from the original monolithic app
 * This module preserves exact original behavior for modularization
 * 
 * Games are wrapped by ES module wrappers in src/games/
 */

// ===== GLOBAL HELPERS (provided by wrappers) =====
// These are injected by the wrapper modules
let globalState = null;
let globalSfx = null;

export function setGameContext(state, sfxFn) {
  globalState = state;
  globalSfx = sfxFn;
}

// Game helper functions
const chips = (a) => `<div class="row2">${a.map(x => `<span class="star"${x[1] ? ` id="${x[1]}"` : ''}>${x[0]}</span>`).join('')}</div>`;
const gbest = (id, v) => { if (!globalState) return false; globalState.gb = globalState.gb || {}; const o = globalState.gb[id] || 0; if (v > o) { globalState.gb[id] = v; return true; } return false; };
const gb = (id) => globalState?.gb?.[id] || 0;
const gadd = (n) => { if (globalState) { globalState.stars = (globalState.stars || 0) + n; } };
const sfx = (ev, arg) => { if (globalSfx) globalSfx(ev, arg); };
const shuffle = (a) => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1]);
const rand = (n) => Math.floor(Math.random() * n);
const endScreen = (el, gameId, score, unit, onAgain) => {
  const nb = score > 0 && gbest(gameId, score);
  gadd(score * 2);
  sfx('end', score > 0 ? 1 : 0);
  el.innerHTML = `<div class="trophy">${nb ? '🏆' : '😢'}</div><h2>${score} ${unit}</h2><p style="color:var(--mute)">${nb ? 'New best score!' : 'Best: ' + gb(gameId)}</p><p><span class="star" style="display:inline-block">+${score * 2} ⭐</span></p><button class="cta" id="again">Play again</button>`;
  el.querySelector('#again').onclick = () => { sfx('tap'); onAgain() };
};

// ===== DATA CONSTANTS =====
const WORDS = [['CAT', '🐱'], ['DOG', '🐶'], ['FISH', '🐠'], ['LION', '🦁'], ['APPLE', '🍎'], ['MANGO', '🥭'], ['TIGER', '🐯'], ['ZEBRA', '🦓'], ['HORSE', '🐴'], ['BANANA', '🍌'], ['MOON', '🌙'], ['STAR', '⭐'], ['TREE', '🌳'], ['BIRD', '🐦'], ['FROG', '🐸'], ['DUCK', '🦆'], ['CAKE', '🍰'], ['BOOK', '📖'], ['SHIP', '🚢'], ['SUN', '☀️']];
const ANIMALS = [['ELEPHANT', '🐘'], ['GIRAFFE', '🦁'], ['MONKEY', '🐵'], ['PANDA', '🐼'], ['ZEBRA', '🦓'], ['KANGAROO', '🦘'], ['PENGUIN', '🐧'], ['DOLPHIN', '🐬'], ['TIGER', '🐯'], ['RABBIT', '🐰'], ['CAMEL', '🐫'], ['OWL', '🦉']];
const GRP = [['🍎', '🍌', '🍊', '🍋', '🍌', '🍑'], ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊'], ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️'], ['😀', '😃', '😄', '😁', '😆', '😂'], ['⭐', '✨', '💫', '🌟', '✪', '🔆'], ['🐠', '🐟', '🐡', '🦈', '🐙', '🦑'], ['🍕', '🍔', '🍟', '🌭', '🥪', '🌮'], ['🐦', '🦅', '🦆', '🦉', '🦇', '🕊️'], ['🚀', '✈️', '🛩️', '🚁', '🛫', '🛬'], ['☀️', '🌤️', '⛅', '🌥️', '☁️', '⛈️']];
const HARD = [[0, 6], [1, 5], [2, 7], [3, 0], [7, 1]];
const WL = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

// ===== GAME FUNCTIONS (Original Code) =====

export function simon(el) {
  const cols = ['#ef4444', '#3b82f6', '#22c55e', '#facc15'];
  let seq = [], pos = 0, busy = true, tm = [];
  el.innerHTML = chips([['Round 0', 'sr'], ['Best ' + gb('simon')]]) + `<div class="pads">${cols.map((c, i) => `<button class="pad" data-i="${i}" style="background:${c}" aria-label="Pad ${i + 1}"></button>`).join('')}</div><p class="gmsg" id="sm">Press start</p><button class="cta" id="ss">Start</button>`;
  const pads = [...el.querySelectorAll('.pad')], M = el.querySelector('#sm'), B = el.querySelector('#ss');
  const later = (f, ms) => { tm.push(setTimeout(f, ms)) };
  const flash = i => { pads[i].classList.add('lit'); sfx('note', i); later(() => pads[i].classList.remove('lit'), 300) };
  function play() { busy = true; pos = 0; M.textContent = 'Watch…'; seq.forEach((n, k) => later(() => flash(n), 600 + k * 600)); later(() => { busy = false; M.textContent = 'Your turn!' }, 600 + seq.length * 600) }
  function round() { seq.push(Math.floor(Math.random() * 4)); el.querySelector('#sr').textContent = 'Round ' + seq.length; play() }
  pads.forEach(p => p.onclick = () => { if (busy) return; const i = +p.dataset.i; flash(i); if (i !== seq[pos]) { busy = true; sfx('wrong'); const r = seq.length - 1, nb = r > 0 && gbest('simon', r); gadd(r * 2); M.textContent = 'Oops! You reached round ' + Math.max(r, 0) + (nb ? ' - new best!' : ''); B.textContent = 'Try again'; B.style.display = ''; seq = []; return } pos++; if (pos === seq.length) { gadd(2); busy = true; later(() => { sfx('correct'); later(round, 500) }, 350) } });
  B.onclick = () => { sfx('tap'); B.style.display = 'none'; seq = []; round() };
  return () => tm.forEach(clearTimeout);
}

export function balloon(el) {
  let score, lives, t, tgt, run, iv = [];
  const cl = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ec4899'];
  const stop = () => { run = false; iv.forEach(clearInterval); iv = [] };
  function start() {
    score = 0; lives = 3; t = 30; run = true;
    el.innerHTML = chips([['⏱ 30s', 'bt'], ['Score 0', 'bs'], ['❤️❤️❤️', 'bl']]) + `<div class="gmsg" id="bq" style="font-size:26px"></div><div class="arena" id="ar"></div>`;
    const ar = el.querySelector('#ar'), q = el.querySelector('#bq');
    const ui = () => { el.querySelector('#bt').textContent = '⏱ ' + t + 's'; el.querySelector('#bs').textContent = 'Score ' + score; el.querySelector('#bl').textContent = '❤️'.repeat(Math.max(0, lives)) || '💔' };
    const newQ = () => { const a = 1 + Math.floor(Math.random() * 9), b = 1 + Math.floor(Math.random() * 9); tgt = a + b; q.textContent = 'Pop ' + a + ' + ' + b };
    const fin = () => { stop(); endScreen(el, 'balloon', score, 'popped', start) };
    function spawn() {
      const b = document.createElement('button'), v = Math.random() < .4 ? tgt : 2 + Math.floor(Math.random() * 17);
      b.className = 'balloon'; b.textContent = v; b.style.left = Math.random() * Math.max(10, ar.clientWidth - 60) + 'px'; b.style.background = cl[Math.floor(Math.random() * 6)]; b.style.setProperty('--dur', (4 + Math.random() * 2) + 's');
      b.onanimationend = () => b.remove();
      b.onclick = () => { if (!run) return; b.remove(); if (v === tgt) { score++; sfx('pop'); newQ() } else { lives--; sfx('wrong') } ui(); if (lives <= 0) fin() };
      ar.appendChild(b);
    }
    newQ(); ui();
    iv.push(setInterval(() => { if (run) spawn() }, 750));
    iv.push(setInterval(() => { t--; ui(); if (t <= 0) fin() }, 1000));
  }
  start();
  return stop;
}

export function scramble(el) {
  let round, score, words, pool, ans, w, tm = [];
  function start() { round = 0; score = 0; words = shuffle([...WORDS]).slice(0, 5); next() }
  function next() { if (round >= 5) return endScreen(el, 'scramble', score, 'correct', start); w = words[round]; let L; do { L = shuffle(w[0].split('')) } while (L.join('') === w[0] && w[0].length > 2); pool = L.map(c => ({ c, used: false })); ans = []; draw() }
  function draw() {
    el.innerHTML = chips([['Word ' + (round + 1) + '/5'], ['Score ' + score]]) + `<div style="font-size:72px;filter:drop-shadow(3px 5px 4px rgba(0,0,0,.2))">${w[1]}</div><div class="slots">${w[0].split('').map((_,k) => `<button class="slot" data-k="${k}" aria-label="Letter ${k+1}">${ans[k] ? ans[k].c : ''}</button>`).join('')}</div><div class="slots">${pool.map((p,i) => `<button class="tileL" data-i="${i}" ${p.used ? 'disabled style="opacity:.3"' : ''}>${p.c}</button>`).join('')}</div><button class="cta alt" id="sk">Skip</button>`;
    el.querySelectorAll('.slot').forEach(b => b.onclick = () => { ans.splice(+b.dataset.k).forEach(x => x.used = false); sfx('tap'); draw() });
    el.querySelectorAll('.tileL').forEach(b => b.onclick = () => { const p = pool[+b.dataset.i]; if (p.used) return; p.used = true; ans.push(p); sfx('tap'); if (ans.length === w[0].length) { if (ans.map(x => x.c).join('') === w[0]) { score++; sfx('correct'); draw(); tm.push(setTimeout(() => { round++; next() }, 700)) } else { sfx('wrong'); pool.forEach(x => x.used = false); ans = []; draw() } } else draw() });
    el.querySelector('#sk').onclick = () => { sfx('tap'); round++; next() }
  }
  start();
  return () => tm.forEach(clearTimeout);
}

export function hangman(el) {
  let round, score, list, w, got, lives;
  function start() { round = 0; score = 0; list = shuffle([...ANIMALS]).slice(0, 5); next() }
  function next() { if (round >= 5) return endScreen(el, 'hangman', score, 'guessed', start); w = list[round]; got = new Set(); lives = 6; draw() }
  function draw() {
    const word = w[0], won = [...word].every(c => got.has(c)), lost = lives <= 0, done = won || lost;
    el.innerHTML = chips([['Animal ' + (round + 1) + '/5'], ['Score ' + score]]) + `<div style="font-size:64px;margin:4px 0">${done ? w[1] : '🤔'}</div><div class="word">${[...word].map(c => got.has(c) || lost ? c : '_').join(' ')}</div><div style="font-size:22px;margin-bottom:12px">${'❤️'.repeat(Math.max(0, lives)) || '💔'}</div>` + (done ? `<p class="gmsg">${won ? 'Great job!' : 'It was ' + word}</p><button class="cta" id="nx">Next</button>` : `<div class="keys">${[...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map(c => `<button class="key" data-c="${c}" ${got.has(c) ? 'disabled' : ''}>${c}</button>`).join('')}</div>`);
    el.querySelectorAll('.key').forEach(b => b.onclick = () => { const c = b.dataset.c; got.add(c); if (!word.includes(c)) { lives--; sfx('wrong') } else sfx('tap'); if ([...word].every(x => got.has(x))) { score++; sfx('correct') } draw() });
    const nx = el.querySelector('#nx');
    if (nx) nx.onclick = () => { sfx('tap'); round++; next() }
  }
  start();
}

export function mole(el) {
  let score, t, iv = [], tm = [], run;
  const stop = () => { run = false; iv.forEach(clearInterval); tm.forEach(clearTimeout); iv = []; tm = [] };
  function start() {
    score = 0; t = 30; run = true;
    el.innerHTML = chips([['⏱ 30s', 'mt'], ['Score 0', 'ms']]) + `<div class="mgrid">${Array.from({length:9},(_,i) => `<button class="hole" data-i="${i}" aria-label="Hole ${i+1}"><span></span></button>`).join('')}</div><p class="gmsg">🧣 +1 &nbsp; 💣 -2</p>`;
    const holes = [...el.querySelectorAll('.hole')], st = holes.map(() => null);
    const ui = () => { el.querySelector('#mt').textContent = '⏱ ' + t + 's'; el.querySelector('#ms').textContent = 'Score ' + score };
    holes.forEach((h, i) => h.onclick = () => { const s = st[i]; if (!run || !s) return; st[i] = null; h.classList.remove('up'); if (s === 'm') { score++; sfx('pop') } else { score = Math.max(0, score - 2); sfx('wrong') } ui() });
    iv.push(setInterval(() => { if (!run) return; const i = Math.floor(Math.random() * 9); if (st[i]) return; const bomb = Math.random() < .2; st[i] = bomb ? 'b' : 'm'; holes[i].firstChild.textContent = bomb ? '💣' : '🧣'; holes[i].classList.add('up'); tm.push(setTimeout(() => { st[i] = null; holes[i].classList.remove('up') }, 800)) }, 650));
    iv.push(setInterval(() => { t--; ui(); if (t <= 0) { stop(); endScreen(el, 'mole', score, 'points', start) } }, 1000));
  }
  start();
  return stop;
}

export function odd(el) {
  let r, score, tm = [];
  function start() { r = 0; score = 0; next() }
  function next() {
    if (r >= 8) return endScreen(el, 'odd', score, 'correct', start);
    const hard = r >= 4, n = hard ? 6 : 4;
    let a, b;
    if (hard) { [a, b] = HARD[Math.floor(Math.random() * HARD.length)] } else { a = Math.floor(Math.random() * GRP.length); do { b = Math.floor(Math.random() * GRP.length) } while (b === a) }
    const oddE = shuffle([...GRP[b]])[0], opts = shuffle(shuffle([...GRP[a]]).slice(0, n - 1).concat(oddE));
    el.innerHTML = chips([['Round ' + (r + 1) + '/8'], ['Score ' + score], [hard ? 'Level 2' : 'Level 1']]) + `<p class="gmsg">Which one is different?</p><div class="oo ${hard ? 'six' : ''}">${opts.map(e => `<button data-e="${e}">${e}</button>`).join('')}</div>`;
    const bs = [...el.querySelectorAll('.oo button')];
    bs.forEach(b => b.onclick = () => { const ok = b.dataset.e === oddE; bs.forEach(x => { x.disabled = true; if (x.dataset.e === oddE) x.classList.add('right') }); if (ok) { score++; sfx('correct') } else { b.classList.add('wrong'); sfx('wrong') } tm.push(setTimeout(() => { r++; next() }, 900)) })
  }
  start();
  return () => tm.forEach(clearTimeout);
}

export function ttt2(el) {
  let b, turn, over, sc = { X: 0, O: 0, D: 0 };
  const em = t => t === 'X' ? '⭕' : '❌';
  function start() { b = Array(9).fill(null); turn = 'X'; over = false; draw() }
  function draw(msg) {
    el.innerHTML = chips([['⭕ ' + sc.X], ['❌ ' + sc.O], ['🤝 ' + sc.D]]) + `<p class="gmsg">${msg || 'Turn: ' + em(turn)}</p><div class="cells" style="grid-template-columns:repeat(3,1fr);max-width:320px;margin:0 auto 14px"></div>${over ? '<button class="cta" id="ag">Play again</button>' : ''}`;
    const g = el.querySelector('.cells');
    b.forEach((v, i) => { const c = document.createElement('button'); c.className = 'cell'; c.textContent = v ? em(v) : ''; c.setAttribute('aria-label', 'Square ' + (i + 1)); c.onclick = () => play(i); g.appendChild(c) });
    const a = el.querySelector('#ag');
    if (a) a.onclick = () => { sfx('tap'); start() }
  }
  function play(i) {
    if (over || b[i]) return;
    b[i] = turn;
    sfx('tap');
    if (WL.some(l => l.every(k => b[k] === turn))) { over = true; sc[turn]++; gadd(5); sfx('end', 2); return draw(em(turn) + ' wins!') }
    if (b.every(Boolean)) { over = true; sc.D++; sfx('end', 0); return draw('Draw!') }
    turn = turn === 'X' ? 'O' : 'X';
    draw()
  }
  start();
}

export function connect4(el) {
  const R = 6, C = 7, col = ['#ef4444', '#facc15'];
  let g, turn, over, sc = [0, 0];
  function start() { g = Array.from({length:R}, () => Array(C).fill(-1)); turn = 0; over = false; draw() }
  function win(r, c) { const p = g[r][c]; for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) { let n = 1; for (const s of [1, -1]) { let rr = r + dr * s, cc = c + dc * s; while (rr >= 0 && rr < R && cc >= 0 && cc < C && g[rr][cc] === p) { n++; rr += dr * s; cc += dc * s } } if (n >= 4) return true } return false }
  function drop(c) { if (over) return; let r = R - 1; while (r >= 0 && g[r][c] !== -1) r--; if (r < 0) { sfx('wrong'); return } g[r][c] = turn; sfx('tap'); if (win(r, c)) { over = true; sc[turn]++; gadd(5); sfx('end', 2); return draw((turn ? '🔴' : '🟡') + ' wins!') } if (g[0].every(x => x !== -1)) { over = true; sfx('end', 0); return draw('Draw!') } turn = 1 - turn; draw() }
  function draw(msg) {
    el.innerHTML = chips([['🟡 ' + sc[0]], ['🔴 ' + sc[1]]]) + `<p class="gmsg">${msg || 'Turn: ' + (turn ? '🔴' : '🟡')}</p><div class="c4grid">${g.map(row => row.map((v, c) => `<button class="c4" data-c="${c}" aria-label="Column ${c+1}" style="background:${v < 0 ? '#eef0ff' : col[v]}"></button>`).join('')).join('')}</div>${over ? '<button class="cta" id="ag">Play again</button>' : ''}`;
    el.querySelectorAll('.c4').forEach(b => b.onclick = () => drop(+b.dataset.c));
    const a = el.querySelector('#ag');
    if (a) a.onclick = () => { sfx('tap'); start() }
  }
  start();
}

export function tug(el) {
  let pos, run, tm = [];
  function start() {
    pos = 50; run = false;
    el.innerHTML = `<div class="duel"><div class="half p2" style="--pc:#ef4444"><div class="who">Player 2</div><button class="bigbtn" id="b2">TAP FAST!</button></div><div class="mid" id="md">Get ready…</div><div class="track" id="tr"></div><div class="half" style="--pc:#3b82f6"><div class="who">Player 1</div><button class="bigbtn" id="b1">TAP FAST!</button></div></div>`;
    const md = el.querySelector('#md'), tr = el.querySelector('#tr');
    const paint = () => { tr.style.background = `linear-gradient(90deg,#3b82f6 ${pos}%,#ef4444 ${pos}%)` };
    paint();
    const pull = d => { if (!run) return; pos = Math.max(0, Math.min(100, pos + d)); paint(); if (pos <= 0 || pos >= 100) { run = false; const w = pos >= 100 ? 1 : 2; sfx('end', 2); gadd(5); md.textContent = '🏆 Player ' + w + ' wins!'; el.insertAdjacentHTML('beforeend', '<button class="cta" id="ag">Play again</button>'); el.querySelector('#ag').onclick = () => { sfx('tap'); start() } } };
    ['1', '2'].forEach(k => el.querySelector('#b' + k).addEventListener('pointerdown', e => { e.preventDefault(); pull(k === '1' ? 2.2 : -2.2) }));
    ['3', '2', '1', 'GO!'].forEach((t, i) => tm.push(setTimeout(() => { md.textContent = t; sfx(i === 3 ? 'correct' : 'tap'); if (i === 3) run = true }, i * 800)));
  }
  start();
  return () => tm.forEach(clearTimeout);
}

export function react(el) {
  let s, state, tm = [];
  const later = (f, ms) => { tm.push(setTimeout(f, ms)) };
  function start() {
    s = [0, 0]; state = 'idle';
    el.innerHTML = `<div class="duel"><div class="half p2" style="--pc:#ef4444"><div class="who">Player 2</div><button class="bigbtn pad2" data-p="1">TAP</button></div><div class="mid" id="md"></div><div class="half" style="--pc:#3b82f6"><div class="who">Player 1</div><button class="bigbtn pad2" data-p="0">TAP</button></div></div>`;
    const md = el.querySelector('#md'), pads = [...el.querySelectorAll('.pad2')];
    const paint = c => pads.forEach(x => x.style.background = c), score = () => 'P1 ' + s[0] + ' – ' + s[1] + ' P2';
    function round() { state = 'wait'; paint('#ef4444'); md.textContent = 'Wait for GREEN… ' + score(); later(() => { if (state !== 'wait') return; state = 'go'; paint('#22c55e'); md.textContent = 'GO!'; sfx('note', 3) }, 1500 + Math.random() * 2500) }
    function point(p, why) { state = 'over'; s[p]++; sfx('correct'); md.textContent = 'P' + (p + 1) + ' scores! ' + why + '  ' + score(); if (s[p] >= 3) later(() => { md.textContent = '🏆 Player ' + (p + 1) + ' wins!'; gadd(5); sfx('end', 2); el.insertAdjacentHTML('beforeend', '<button class="cta" id="ag">Play again</button>'); el.querySelector('#ag').onclick = () => { sfx('tap'); start() } }, 900); else later(round, 1500) }
    pads.forEach(pd => pd.addEventListener('pointerdown', e => { e.preventDefault(); const p = +pd.dataset.p; if (state === 'wait') point(1 - p, '(P' + (p + 1) + ' tapped too early)'); else if (state === 'go') point(p, 'Fast!') }));
    md.textContent = 'Get ready… first to 3 wins';
    later(round, 1200)
  }
  start();
  return () => tm.forEach(clearTimeout);
}

export function mathduel(el) {
  let s, ans, lock, done, tm = [];
  function start() { s = [0, 0]; q() }
  function q() {
    const a = 2 + rand(10), b = 2 + rand(10), op = ['+', '−', '×'][rand(3)];
    ans = op === '+' ? a + b : op === '−' ? a - b : a * b;
    const set = new Set([ans]);
    while (set.size < 4) set.add(Math.max(0, ans + rand(11) - 5));
    lock = [false, false];
    done = false;
    const half = (p, cls, c) => `<div class="half ${cls}" style="--pc:${c}"><div class="who">Player ${p+1}</div><div class="qbig">${a} ${op} ${b} = ?</div><div class="opts2">${shuffle([...set]).map(v => `<button class="mb2" data-p="${p}" data-v="${v}">${v}</button>`).join('')}</div></div>`;
    el.innerHTML = `<div class="duel">${half(1, 'p2', '#ef4444')}<div class="mid">P1 ${s[0]} – ${s[1]} P2 (first to 5)</div>${half(0, '', '#3b82f6')}</div>`;
    el.querySelectorAll('.mb2').forEach(b => b.onclick = () => { const p = +b.dataset.p; if (done || lock[p]) return; if (+b.dataset.v === ans) { done = true; s[p]++; sfx('correct'); b.style.background = 'var(--okbg)'; tm.push(setTimeout(() => s[p] >= 5 ? end(p) : q(), 900)) } else { lock[p] = true; sfx('wrong'); b.style.background = 'var(--badbg)'; b.disabled = true; if (lock[0] && lock[1]) { done = true; tm.push(setTimeout(q, 800)) } } })
  }
  function end(p) { gadd(5); sfx('end', 2); el.innerHTML = `<div class="trophy">🏆</div><h2>Player ${p+1} wins!</h2><p style="color:var(--mute)">P1 ${s[0]} – ${s[1]} P2</p><button class="cta" id="ag">Play again</button>`; el.querySelector('#ag').onclick = () => { sfx('tap'); start() } }
  start();
  return () => tm.forEach(clearTimeout);
}

export function rps2(el) {
  const E = ['✌️', '✋', '✊'];
  let s, ch, lock, tm = [];
  function start() { s = [0, 0]; ch = [null, null]; lock = false; draw('Pick one!') }
  function side(p, cls, c) { const x = ch[p]; return `<div class="half ${cls}" style="--pc:${c}"><div class="who">Player ${p+1}</div>${lock ? `<div class="qbig">${E[x]}</div>` : x != null ? '<div class="qbig">✓ Ready</div>' : `<div class="opts3">${E.map((e, i) => `<button class="mb2" data-p="${p}" data-i="${i}">${e}</button>`).join('')}</div>`}</div>` }
  function draw(msg) { el.innerHTML = `<div class="duel">${side(1, 'p2', '#ef4444')}<div class="mid">${msg}<br>P1 ${s[0]} – ${s[1]} P2 (first to 3)</div>${side(0, '', '#3b82f6')}</div>`; el.querySelectorAll('.mb2').forEach(b => b.onclick = () => pick(+b.dataset.p, +b.dataset.i)) }
  function pick(p, i) { if (lock || ch[p] != null) return; ch[p] = i; sfx('tap'); if (ch[0] != null && ch[1] != null) { lock = true; const r = (ch[0] - ch[1] + 3) % 3, w = r === 1 ? 0 : r === 2 ? 1 : -1; if (w >= 0) s[w]++; sfx(w < 0 ? 'tap' : 'correct'); draw(E[ch[0]] + ' vs ' + E[ch[1]] + ' – ' + (w < 0 ? 'Draw!' : 'Player ' + (w + 1) + ' wins the round!')); tm.push(setTimeout(() => { if (s[0] >= 3 || s[1] >= 3) { const f = s[0] >= 3 ? 0 : 1; gadd(5); sfx('end', 2); el.innerHTML = `<div class="trophy">🏆</div><h2>Player ${f+1} wins!</h2><p style="color:var(--mute)">P1 ${s[0]} – ${s[1]} P2</p><button class="cta" id="ag">Play again</button>`; el.querySelector('#ag').onclick = () => { sfx('tap'); start() } } else { ch = [null, null]; lock = false; draw('Pick one!') } }, 1900)) } else draw('Pick one!') }
  start();
  return () => tm.forEach(clearTimeout);
}

export function snake(el) {
  const N = 15, Z = 20, V = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] };
  let sn, dir, nd, food, score, iv;
  const stop = () => clearInterval(iv);
  const steer = k => { const v = V[k]; if (v && dir && !(v[0] === -dir[0] && v[1] === -dir[1])) nd = v };
  const place = () => { do { food = [rand(N), rand(N)] } while (sn.some(s => s[0] === food[0] && s[1] === food[1])) };
  const kd = e => { const m = { ArrowUp: 'u', ArrowDown: 'd', ArrowLeft: 'l', ArrowRight: 'r' }[e.key]; if (m) { e.preventDefault(); steer(m) } };
  document.addEventListener('keydown', kd);
  function build() {
    el.innerHTML = chips([['Score 0', 'ss'], ['Best ' + gb('snake')]]) + `<canvas id="cv" class="arena" width="300" height="300" style="width:100%;max-width:300px;height:auto;display:block;margin:0 auto 12px;touch-action:none"></canvas><div class="dpad"><button data-d="u" aria-label="Up">↑</button><div><button data-d="l" aria-label="Left">←</button><button data-d="r" aria-label="Right">→</button></div><button data-d="d" aria-label="Down">↓</button></div>`;
    const cv = el.querySelector('#cv'), x = cv.getContext && cv.getContext('2d');
    el.querySelectorAll('[data-d]').forEach(b => b.onclick = () => steer(b.dataset.d));
    let tx = 0, ty = 0;
    cv.addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY }, { passive: true });
    cv.addEventListener('touchend', e => { const t = e.changedTouches[0], dx = t.clientX - tx, dy = t.clientY - ty; if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return; steer(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'r' : 'l') : (dy > 0 ? 'd' : 'u')) });
    sn = [[7, 7], [6, 7], [5, 7]];
    dir = [1, 0];
    nd = dir;
    score = 0;
    place();
    const paint = () => { if (!x) return; x.clearRect(0, 0, 300, 300); sn.forEach((s, i) => { x.fillStyle = i ? '#22c55e' : '#15803d'; x.fillRect(s[0] * Z + 1, s[1] * Z + 1, Z - 2, Z - 2) }); x.font = '17px serif'; x.fillText('🍎', food[0] * Z + 1, food[1] * Z + 16) };
    const tick = () => { dir = nd; const h = [(sn[0][0] + dir[0] + N) % N, (sn[0][1] + dir[1] + N) % N]; if (sn.some(s => s[0] === h[0] && s[1] === h[1])) { stop(); sfx('wrong'); endScreen(el, 'snake', score, 'apples', build); return } sn.unshift(h); if (h[0] === food[0] && h[1] === food[1]) { score++; sfx('pop'); place(); el.querySelector('#ss').textContent = 'Score ' + score } else sn.pop(); paint() };
    paint();
    stop();
    iv = setInterval(tick, 170);
  }
  build();
  return () => { stop(); document.removeEventListener('keydown', kd) };
}

export function farm(el) {
  let r, score, tm = [];
  const EM = ['🐄', '🐖', '🐑', '🐐', '🐴', '🦆'];
  function start() { r = 0; score = 0; next() }
  function next() {
    if (r >= 8) return endScreen(el, 'farm', score, 'correct', start);
    const n = 1 + rand(9), e = EM[rand(6)], set = new Set([n]);
    while (set.size < 4) set.add(1 + rand(10));
    el.innerHTML = chips([['Round ' + (r + 1) + '/8'], ['Score ' + score]]) + `<p class="gmsg">How many ${e}?</p><div class="arena" style="height:auto;min-height:160px;display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-items:center;padding:14px;font-size:38px">${Array.from({length:n}, () => `<span style="display:inline-block;transform:rotate(${rand(30)-15}deg)">${e}</span>`).join('')}</div><div class="opts2" style="margin-top:12px">${shuffle([...set]).map(v => `<button class="mb2" data-v="${v}">${v}</button>`).join('')}</div>`;
    const bs = [...el.querySelectorAll('.mb2')];
    bs.forEach(b => b.onclick = () => { bs.forEach(x => { x.disabled = true; if (+x.dataset.v === n) x.style.background = 'var(--okbg)' }); if (+b.dataset.v === n) { score++; sfx('correct') } else { b.style.background = 'var(--badbg)'; sfx('wrong') } tm.push(setTimeout(() => { r++; next() }, 900)) })
  }
  start();
  return () => tm.forEach(clearTimeout);
}

export function colormatch(el) {
  const C = [['RED', '#ef4444'], ['BLUE', '#3b82f6'], ['GREEN', '#22c55e'], ['YELLOW', '#facc15'], ['PURPLE', '#a855f7'], ['ORANGE', '#f97316']];
  let score, t, iv, run;
  const stop = () => { run = false; clearInterval(iv) };
  function start() {
    score = 0; t = 30; run = true;
    el.innerHTML = chips([['⏱ 30s', 'ct'], ['Score 0', 'cs']]) + `<p class="gmsg">Tap the COLOR of the word, not what it says</p><div id="cw" style="font-size:54px;font-weight:900;margin:12px 0 18px"></div><div class="opts2" id="co"></div>`;
    const cw = el.querySelector('#cw'), co = el.querySelector('#co');
    const ui = () => { el.querySelector('#ct').textContent = '⏱ ' + t + 's'; el.querySelector('#cs').textContent = 'Score ' + score };
    function next() {
      const wi = rand(6);
      let ci;
      do { ci = rand(6) } while (ci === wi);
      cw.textContent = C[wi][0];
      cw.style.color = C[ci][1];
      const ids = shuffle([ci, ...shuffle([0, 1, 2, 3, 4, 5].filter(k => k !== ci)).slice(0, 3)]);
      co.innerHTML = ids.map(k => `<button class="mb2" data-k="${k}" aria-label="${C[k][0]}" style="height:64px;background:${C[k][1]}"></button>`).join('');
      co.querySelectorAll('.mb2').forEach(b => b.onclick = () => { if (!run) return; if (+b.dataset.k === ci) { score++; sfx('pop') } else sfx('wrong'); ui(); next() })
    }
    next();
    ui();
    iv = setInterval(() => { t--; ui(); if (t <= 0) { stop(); endScreen(el, 'colormatch', score, 'correct', start) } }, 1000);
  }
  start();
  return stop;
}
