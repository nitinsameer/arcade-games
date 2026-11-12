(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
function save(state) {
  try {
    localStorage.setItem("claylearn", JSON.stringify(state));
  } catch (e) {
  }
}
function load(defaultState) {
  try {
    const v = localStorage.getItem("claylearn");
    if (v) {
      return { ...defaultState, ...JSON.parse(v) };
    }
  } catch (e) {
  }
  return defaultState;
}
const DEFAULT_STATE = {
  name: "Explorer",
  theme: "clay",
  sound: true,
  vol: 0.7,
  gb: {},
  // game best scores
  done: {},
  // lessons done
  stars: 0,
  // total achievements
  best: {},
  // quiz best scores per subject
  day: { d: "", n: 0 }
  // today's lesson count
};
function initState() {
  const state = load(DEFAULT_STATE);
  if (typeof state.vol !== "number" || state.vol < 0 || state.vol > 1) {
    state.vol = 0.7;
  }
  if (typeof state.sound !== "boolean") {
    state.sound = true;
  }
  if (typeof state.stars !== "number") {
    state.stars = 0;
  }
  if (!state.gb) state.gb = {};
  if (!state.done) state.done = {};
  if (!state.best) state.best = {};
  if (!state.day) state.day = { d: "", n: 0 };
  save(state);
  return state;
}
function navigate(path) {
  location.hash = path;
}
function parseRoute() {
  const hash = location.hash.slice(1) || "/home";
  const [route, ...parts] = hash.split("/");
  return {
    path: hash,
    route: `/${route}`,
    params: parts
  };
}
function initRouter(onRouteChange2) {
  const handleHashChange = () => {
    location.hash.slice(1) || "/home";
    onRouteChange2(parseRoute());
  };
  window.addEventListener("hashchange", handleHashChange);
  handleHashChange();
}
function go(path) {
  navigate(path);
}
function $(selector) {
  return document.querySelector(selector);
}
function $$(selector) {
  return document.querySelectorAll(selector);
}
function setHTML(el, html) {
  const elem = $(el);
  if (elem) elem.innerHTML = html;
}
function addClass(el, cls) {
  const elem = typeof el === "string" ? $(el) : el;
  if (elem) elem.classList.add(cls);
}
function removeClass(el, cls) {
  const elem = typeof el === "string" ? $(el) : el;
  if (elem) elem.classList.remove(cls);
}
function render(html) {
  setHTML("#view", html);
}
function showToast(message, duration = 1800) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  addClass(toast, "show");
  if (showToast.timeout) clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => {
    removeClass(toast, "show");
  }, duration);
}
function setActiveNav(activeId) {
  $$("#nav button").forEach((btn) => {
    removeClass(btn, "on");
  });
  if (activeId) {
    const btn = $(`#${activeId}`);
    if (btn) addClass(btn, "on");
  }
}
function esc(input) {
  return String(input).replace(/[&<>"]/g, (c) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;"
    };
    return map[c];
  });
}
let ctx = null;
let master = null;
let fxBus = null;
function getContext(volume = 0.7) {
  if (!ctx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return null;
    }
    try {
      ctx = new AudioContextClass();
    } catch (e) {
      return null;
    }
    master = ctx.createGain();
    master.connect(ctx.destination);
    const delay = ctx.createDelay(1);
    delay.delayTime.value = 0.17;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.38;
    delay.connect(feedback);
    feedback.connect(delay);
    const wet = ctx.createGain();
    wet.gain.value = 0.5;
    delay.connect(wet);
    wet.connect(master);
    fxBus = delay;
  }
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  if (master) {
    master.gain.value = Math.pow(volume, 1.5) * 0.9;
  }
  return ctx;
}
function getMaster() {
  return master;
}
function getEffectBus() {
  return fxBus;
}
function isAudioSupported() {
  return !!(window.AudioContext || window.webkitAudioContext);
}
function playTone(ctx2, preset, frequency, time, duration, volume, targetFreq) {
  if (!ctx2 || !getMaster()) return;
  const osc = ctx2.createOscillator();
  const gain = ctx2.createGain();
  const nowTime = ctx2.currentTime + time;
  osc.type = preset.w || "sine";
  osc.frequency.setValueAtTime(frequency, nowTime);
  if (targetFreq) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(30, targetFreq), nowTime + duration);
  }
  const volume_scaled = Math.max(2e-4, volume * (preset.v || 1));
  gain.gain.setValueAtTime(1e-4, nowTime);
  gain.gain.linearRampToValueAtTime(volume_scaled, nowTime + 8e-3);
  gain.gain.exponentialRampToValueAtTime(1e-4, nowTime + duration);
  osc.connect(gain);
  gain.connect(getMaster());
  if (preset.fx) {
    gain.connect(getEffectBus());
  }
  osc.start(nowTime);
  osc.stop(nowTime + duration + 0.05);
}
function playNoise(ctx2, time, duration, volume, highpass) {
  if (!ctx2 || !getMaster()) return;
  const bufferLen = Math.max(1, Math.floor(ctx2.sampleRate * duration));
  const buffer = ctx2.createBuffer(1, bufferLen, ctx2.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferLen; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferLen);
  }
  const source = ctx2.createBufferSource();
  source.buffer = buffer;
  const filter = ctx2.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = highpass || 1e3;
  const gain = ctx2.createGain();
  gain.gain.value = volume;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(getMaster());
  const nowTime = ctx2.currentTime + time;
  source.start(nowTime);
}
function playTick(preset) {
  const ctx2 = getContext();
  if (!ctx2) return;
  playNoise(ctx2, 0, 0.02, 0.45, 5e3);
  playTone(ctx2, preset, 1800, 0, 0.03, 0.1, null);
}
function playBend(preset, startFreq, endFreq, duration) {
  const ctx2 = getContext();
  if (!ctx2) return;
  playTone(ctx2, preset, startFreq, 0, duration, 0.3, endFreq);
}
const SOUND_THEMES = {
  clay: {
    w: "sine",
    p: 1,
    d: 1,
    v: 1
  },
  claydark: {
    w: "sine",
    p: 0.85,
    d: 1.1,
    v: 0.9
  },
  glass: {
    w: "sine",
    p: 1.8,
    d: 1.5,
    v: 0.8,
    fx: 1
  },
  neu: {
    w: "triangle",
    p: 1.1,
    d: 0.6,
    v: 0.5,
    k: "click"
  },
  brutal: {
    w: "square",
    p: 1,
    d: 0.8,
    v: 0.5,
    bend: 1
  },
  cyber: {
    w: "sawtooth",
    p: 1,
    d: 1,
    v: 0.4,
    fx: 1
  },
  minimal: {
    w: "sine",
    p: 1.3,
    d: 0.5,
    v: 0.5,
    k: "click"
  },
  skeuo: {
    w: "triangle",
    p: 1,
    d: 0.7,
    v: 0.8,
    k: "click"
  },
  aurora: {
    w: "sine",
    p: 1.6,
    d: 1.7,
    v: 0.7,
    fx: 1
  },
  material: {
    w: "sine",
    p: 1.2,
    d: 1,
    v: 0.8
  },
  pixel: {
    w: "square",
    p: 1.5,
    d: 0.7,
    v: 0.4
  },
  synth: {
    w: "sawtooth",
    p: 0.9,
    d: 1.3,
    v: 0.4,
    fx: 1
  },
  paper: {
    w: "triangle",
    p: 1.2,
    d: 0.6,
    v: 0.7,
    k: "tick"
  },
  oled: {
    w: "sine",
    p: 1.4,
    d: 0.4,
    v: 0.4,
    k: "click"
  },
  bento: {
    w: "sine",
    p: 1.1,
    d: 0.8,
    v: 0.8
  },
  pop: {
    w: "triangle",
    p: 1.5,
    d: 1,
    v: 0.9
  },
  aero: {
    w: "sine",
    p: 1.7,
    d: 1.4,
    v: 0.7,
    fx: 1
  },
  term: {
    w: "square",
    p: 1.2,
    d: 0.5,
    v: 0.35
  },
  cartoon: {
    w: "square",
    p: 1,
    d: 0.9,
    v: 0.5,
    bend: 1
  }
};
function getPreset(themeId) {
  return SOUND_THEMES[themeId] || SOUND_THEMES.clay;
}
function sfx(eventName, arg, state) {
  if (!state || !state.sound) {
    return;
  }
  const ctx2 = getContext(state.vol || 0.7);
  if (!ctx2) {
    return;
  }
  const preset = getPreset(state.theme || "clay");
  const p = preset.p || 1;
  const d = preset.d || 1;
  const playNote = (freq, startTime, duration, volume, targetFreq) => {
    playTone(ctx2, preset, freq * p, startTime, duration * d, volume, targetFreq && targetFreq * p);
  };
  try {
    switch (eventName) {
      case "tap":
        if (preset.k === "click") {
          playNoise(ctx2, 0, 0.03, 0.5 * preset.v, 2500);
        } else if (preset.k === "tick") {
          playTick(preset);
        } else if (preset.bend) {
          playBend(preset, 330, 640, 0.12);
        } else {
          playNote(520, 0, 0.09, 0.3, 380);
        }
        break;
      case "correct":
        playNote(523.25, 0, 0.2, 0.3);
        playNote(783.99, 0.1, 0.28, 0.3);
        playNote(1975, 0.2, 0.12, 0.12);
        break;
      case "wrong":
        playNote(190, 0, 0.28, 0.28, 120);
        break;
      case "lesson":
        [523.25, 659.25, 783.99].forEach((f, i) => {
          playNote(f, i * 0.09, 0.22, 0.3);
        });
        playNote(1318.5, 0.3, 0.2, 0.2);
        break;
      case "end":
        if (arg === 2) {
          [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
            playNote(f, i * 0.11, 0.25, 0.3);
          })[523.25, 659.25, 783.99, 1046.5].forEach((f) => {
            playNote(f, 0.55, 0.7, 0.16);
          });
        } else if (arg === 1) {
          [523.25, 659.25, 783.99].forEach((f, i) => {
            playNote(f, i * 0.11, 0.3, 0.3);
          });
        } else {
          [392, 440, 523.25].forEach((f, i) => {
            playNote(f, i * 0.13, 0.3, 0.25);
          });
        }
        break;
      case "note":
        const notes = [261.63, 329.63, 392, 523.25];
        const freq = notes[arg] || notes[0];
        playNote(freq, 0, 0.35, 0.35);
        break;
      case "pop":
        playNoise(ctx2, 0, 0.05, 0.4 * preset.v, 800);
        playNote(900, 0, 0.08, 0.2, 300);
        break;
      case "theme":
        playNote(220, 0, 0.3, 0.22, 1400);
        playNoise(ctx2, 0, 0.25, 0.1 * preset.v, 1200);
        break;
      default:
        break;
    }
  } catch (e) {
  }
}
function canPlayAudio() {
  return isAudioSupported();
}
const GAMES = [
  // Single-Player Games (9)
  {
    id: "simon",
    name: "Simon Says",
    emoji: "🎨",
    tint: "#ffd9a8",
    desc: "Repeat the colour pattern.",
    p2: false,
    bst: "Best Round"
  },
  {
    id: "balloon",
    name: "Balloon Pop",
    emoji: "🎈",
    tint: "#ffc6d9",
    desc: "Pop the right number.",
    p2: false,
    bst: "Best Score"
  },
  {
    id: "scramble",
    name: "Word Scramble",
    emoji: "🔤",
    tint: "#c4eccb",
    desc: "Unscramble the word.",
    p2: false,
    bst: "Best Score"
  },
  {
    id: "hangman",
    name: "Hangman Zoo",
    emoji: "🦁",
    tint: "#ffe3a3",
    desc: "Guess the animal.",
    p2: false,
    bst: "Best Score"
  },
  {
    id: "mole",
    name: "Whack-a-Mole",
    emoji: "🔨",
    tint: "#d9c8ff",
    desc: "Tap moles, skip bombs.",
    p2: false,
    bst: "Best Score"
  },
  {
    id: "odd",
    name: "Odd One Out",
    emoji: "🤔",
    tint: "#bfe3ff",
    desc: "Find the different one.",
    p2: false,
    bst: "Best Score"
  },
  {
    id: "snake",
    name: "Snake",
    emoji: "🐍",
    tint: "#c4eccb",
    desc: "Eat apples, do not bite yourself.",
    p2: false,
    bst: "Best Score"
  },
  {
    id: "farm",
    name: "Counting Farm",
    emoji: "🐄",
    tint: "#ffe3a3",
    desc: "Count the animals.",
    p2: false,
    bst: "Best Score"
  },
  {
    id: "colormatch",
    name: "Color Match",
    emoji: "🎨",
    tint: "#ffc6d9",
    desc: "Tap the ink colour.",
    p2: false,
    bst: "Best Score"
  },
  // Two-Player Games (6)
  {
    id: "ttt2",
    name: "Tic-Tac-Toe",
    emoji: "⭕",
    tint: "#bfe3ff",
    desc: "Two players, one phone.",
    p2: true,
    bst: "Wins"
  },
  {
    id: "connect4",
    name: "Connect Four",
    emoji: "🔴",
    tint: "#ffd9a8",
    desc: "Get four in a row.",
    p2: true,
    bst: "Wins"
  },
  {
    id: "tug",
    name: "Tug of War",
    emoji: "🏋️",
    tint: "#d9c8ff",
    desc: "Tap fastest to win.",
    p2: true,
    bst: "Wins"
  },
  {
    id: "react",
    name: "Reaction Duel",
    emoji: "⚡",
    tint: "#fff0b0",
    desc: "First to tap on green.",
    p2: true,
    bst: "Wins"
  },
  {
    id: "mathduel",
    name: "Math Duel",
    emoji: "🔢",
    tint: "#c8d4ff",
    desc: "Solve it first.",
    p2: true,
    bst: "Wins"
  },
  {
    id: "rps2",
    name: "Rock Paper Scissors",
    emoji: "✌️",
    tint: "#ffc6d9",
    desc: "Pick in secret, then reveal.",
    p2: true,
    bst: "Wins"
  }
];
const SUBJECTS = [
  { id: "math", name: "Math", emoji: "🔢", tint: "#ff6b6b", lessons: 5 },
  { id: "science", name: "Science", emoji: "🔬", tint: "#339af0", lessons: 5 },
  { id: "reading", name: "Reading", emoji: "📖", tint: "#f06595", lessons: 5 },
  { id: "art", name: "Art", emoji: "🎨", tint: "#ee5a6f", lessons: 5 },
  { id: "music", name: "Music", emoji: "🎵", tint: "#a8e6cf", lessons: 5 },
  { id: "puzzle", name: "Puzzle", emoji: "🧩", tint: "#ffd93d", lessons: 5 },
  { id: "animals", name: "Animals", emoji: "🦁", tint: "#ffa06b", lessons: 5 },
  { id: "space", name: "Space", emoji: "🚀", tint: "#6bcf7f", lessons: 5 },
  { id: "world", name: "World", emoji: "🌍", tint: "#4a90e2", lessons: 5 },
  { id: "hindi", name: "हिंदी", emoji: "🔡", tint: "#9b59b6", lessons: 5 },
  { id: "health", name: "Health", emoji: "❤️", tint: "#e74c3c", lessons: 5 },
  { id: "money", name: "Money", emoji: "💰", tint: "#16a085", lessons: 5 }
];
function getSubject(id) {
  return SUBJECTS.find((s) => s.id === id);
}
const THEMES = {
  clay: {
    id: "clay",
    name: "Claymorphism",
    vars: {
      bg: "#ece8fb",
      bgc: "#ece8fb",
      card: "#f7f4ff",
      ink: "#2d2650",
      mute: "#7a72a8",
      accent: "#7c5cf0",
      accentg: "linear-gradient(135deg,#8b6cf6,#6a4fe0)",
      onacc: "#fff",
      green: "#5cc46b",
      greeng: "linear-gradient(135deg,#6fd37e,#4cb85c)",
      r: "26px",
      rs: "20px",
      bd: "0",
      bdt: "0",
      blur: "none",
      well: "#ece8fb",
      barfill: "#ffd66b",
      sh: "9px 9px 20px rgba(124,100,200,.26),-7px -7px 16px rgba(255,255,255,.95),inset -4px -4px 9px rgba(110,90,190,.13),inset 4px 4px 9px rgba(255,255,255,.8)",
      shs: "5px 5px 11px rgba(124,100,200,.26),-3px -3px 8px rgba(255,255,255,.95),inset -3px -3px 7px rgba(110,90,190,.13),inset 3px 3px 7px rgba(255,255,255,.8)",
      sin: "inset 3px 3px 7px rgba(110,90,190,.16),inset -3px -3px 7px rgba(255,255,255,.85)",
      sht: "7px 7px 15px rgba(124,100,200,.26),-5px -5px 11px rgba(255,255,255,.95),inset -5px -5px 10px rgba(0,0,0,.1),inset 5px 5px 10px rgba(255,255,255,.55)",
      shbtn: "7px 7px 15px rgba(124,100,200,.26),-5px -5px 11px rgba(255,255,255,.95),inset -5px -5px 10px rgba(0,0,0,.22),inset 5px 5px 10px rgba(255,255,255,.3)",
      font: "'Nunito',system-ui,sans-serif",
      fonth: "'Nunito',system-ui,sans-serif",
      tsh: "none"
    }
  },
  claydark: {
    id: "claydark",
    name: "Clay Dark",
    vars: {
      bg: "#1e1a36",
      bgc: "#1e1a36",
      card: "#27224a",
      ink: "#f0ecff",
      mute: "#a69fd6",
      accent: "#9b82ff",
      well: "#1e1a36",
      sh: "9px 9px 20px rgba(0,0,0,.5),-6px -6px 14px rgba(255,255,255,.05),inset -4px -4px 9px rgba(0,0,0,.3),inset 4px 4px 9px rgba(255,255,255,.07)",
      shs: "5px 5px 11px rgba(0,0,0,.5),-3px -3px 8px rgba(255,255,255,.05),inset -3px -3px 7px rgba(0,0,0,.3),inset 3px 3px 7px rgba(255,255,255,.07)",
      sin: "inset 3px 3px 7px rgba(0,0,0,.45),inset -3px -3px 7px rgba(255,255,255,.06)",
      sht: "7px 7px 15px rgba(0,0,0,.5),-5px -5px 11px rgba(255,255,255,.05),inset -5px -5px 10px rgba(0,0,0,.25),inset 5px 5px 10px rgba(255,255,255,.12)",
      shbtn: "7px 7px 15px rgba(0,0,0,.5),-5px -5px 11px rgba(255,255,255,.05),inset -5px -5px 10px rgba(0,0,0,.3),inset 5px 5px 10px rgba(255,255,255,.25)"
    }
  },
  glass: {
    id: "glass",
    name: "Glassmorphism",
    vars: {
      bg: "radial-gradient(circle at 12% 15%,rgba(76,215,255,.75),transparent 42%),radial-gradient(circle at 88% 72%,rgba(255,95,163,.7),transparent 46%),linear-gradient(135deg,#5b4bff,#9b4fe0 55%,#ff8a5c)",
      bgc: "#6a4fe0",
      card: "rgba(255,255,255,.18)",
      ink: "#fff",
      mute: "rgba(255,255,255,.78)",
      accent: "#fff",
      accentg: "linear-gradient(135deg,rgba(255,255,255,.42),rgba(255,255,255,.16))",
      onacc: "#fff",
      greeng: "linear-gradient(135deg,rgba(90,230,150,.6),rgba(40,190,120,.4))",
      green: "#5ff0a0",
      r: "28px",
      rs: "20px",
      bd: "1px solid rgba(255,255,255,.4)",
      bdt: "1px solid rgba(255,255,255,.3)",
      blur: "blur(18px) saturate(1.5)",
      well: "rgba(0,0,0,.2)",
      barfill: "#ffe38a",
      sh: "0 8px 32px rgba(31,20,90,.35),inset 0 1px 0 rgba(255,255,255,.45)",
      shs: "0 4px 16px rgba(31,20,90,.28),inset 0 1px 0 rgba(255,255,255,.4)",
      sin: "inset 0 2px 6px rgba(0,0,0,.25)",
      sht: "0 8px 24px rgba(31,20,90,.3),inset 0 1px 0 rgba(255,255,255,.45)",
      shbtn: "0 8px 24px rgba(31,20,90,.3),inset 0 1px 0 rgba(255,255,255,.5)",
      font: "'Nunito',system-ui,sans-serif"
    }
  },
  neu: {
    id: "neu",
    name: "Neumorphism",
    vars: {
      bg: "#e0e5ec",
      bgc: "#e0e5ec",
      card: "#e0e5ec",
      ink: "#3d4468",
      mute: "#7b83a3",
      accent: "#5b6cff",
      accentg: "linear-gradient(145deg,#6d7dff,#4a5bf0)",
      greeng: "linear-gradient(145deg,#4fd08a,#2fb56e)",
      well: "#e0e5ec",
      r: "24px",
      rs: "18px",
      sh: "9px 9px 18px #a3b1c6,-9px -9px 18px #fff",
      shs: "5px 5px 10px #a3b1c6,-5px -5px 10px #fff",
      sin: "inset 4px 4px 8px #a3b1c6,inset -4px -4px 8px #fff",
      sht: "6px 6px 12px #a3b1c6,-6px -6px 12px #fff",
      shbtn: "6px 6px 12px #a3b1c6,-6px -6px 12px #fff"
    }
  },
  brutal: {
    id: "brutal",
    name: "Brutalism",
    vars: {
      bg: "#ffe66d",
      bgc: "#ffe66d",
      card: "#fff",
      ink: "#111",
      mute: "#444",
      accent: "#ff3d7f",
      accentg: "#ff5d8f",
      onacc: "#111",
      greeng: "#4ade80",
      green: "#2fbf71",
      ongr: "#111",
      r: "14px",
      rs: "10px",
      bd: "3px solid #111",
      bdt: "2px solid #111",
      well: "#fff",
      barfill: "#ffe66d",
      sh: "6px 6px 0 #111",
      shs: "3px 3px 0 #111",
      sin: "none",
      sht: "4px 4px 0 #111",
      shbtn: "4px 4px 0 #111",
      font: "'Space Grotesk',system-ui,sans-serif",
      fonth: "'Space Grotesk',system-ui,sans-serif"
    }
  },
  cyber: {
    id: "cyber",
    name: "Cyberpunk",
    vars: {
      bg: "radial-gradient(circle at 15% 0%,#3a1060,transparent 50%),radial-gradient(circle at 90% 90%,#07405a,transparent 45%),#07071a",
      bgc: "#07071a",
      card: "#12122e",
      ink: "#e8f0ff",
      mute: "#8fa0d0",
      accent: "#00f5d4",
      accentg: "linear-gradient(135deg,#00f5d4,#00a8ff)",
      onacc: "#021018",
      greeng: "linear-gradient(135deg,#00f5a0,#00c27a)",
      green: "#00f5a0",
      ongr: "#021018",
      r: "18px",
      rs: "14px",
      bd: "1px solid rgba(0,245,212,.55)",
      bdt: "1px solid rgba(0,245,212,.4)",
      well: "#0a0a22",
      barfill: "#ff2ec8",
      sh: "0 0 18px rgba(0,245,212,.22),inset 0 0 14px rgba(0,245,212,.07)",
      shs: "0 0 10px rgba(0,245,212,.25)",
      sin: "inset 0 0 8px rgba(0,0,0,.7)",
      sht: "0 0 14px rgba(0,245,212,.3),inset 0 0 12px rgba(0,245,212,.08)",
      shbtn: "0 0 20px rgba(0,245,212,.55)",
      font: "'Space Grotesk',system-ui,sans-serif",
      fonth: "'Orbitron','Space Grotesk',system-ui,sans-serif",
      tsh: "0 0 12px rgba(0,245,212,.6)"
    }
  },
  minimal: {
    id: "minimal",
    name: "Minimal",
    vars: {
      bg: "#f5f5f7",
      bgc: "#f5f5f7",
      card: "#fff",
      ink: "#1d1d1f",
      mute: "#6e6e73",
      accent: "#0071e3",
      accentg: "#0071e3",
      greeng: "#30b857",
      r: "18px",
      rs: "12px",
      bd: "1px solid #e5e5ea",
      bdt: "1px solid #e5e5ea",
      well: "#ececf0",
      barfill: "#ffd60a",
      sh: "0 2px 12px rgba(0,0,0,.06)",
      shs: "0 1px 5px rgba(0,0,0,.08)",
      sin: "inset 0 0 0 1px #e5e5ea",
      sht: "0 1px 6px rgba(0,0,0,.08)",
      shbtn: "0 4px 14px rgba(0,113,227,.3)",
      blur: "blur(20px)"
    }
  },
  skeuo: {
    id: "skeuo",
    name: "Skeuomorphism",
    vars: {
      bg: "repeating-linear-gradient(45deg,rgba(0,0,0,.035) 0 2px,transparent 2px 4px),#d8d2c4",
      bgc: "#d8d2c4",
      card: "linear-gradient(#fcfcfc,#d4d4d4)",
      ink: "#3b2a1e",
      mute: "#7a6652",
      accent: "#1f6fd6",
      accentg: "linear-gradient(#7cc0ff,#1f7be0 50%,#1565c8 51%,#3e9bf0)",
      greeng: "linear-gradient(#8be37f,#3bb44a 50%,#2f9d3d 51%,#58cf63)",
      r: "16px",
      rs: "12px",
      bd: "1px solid #8c8470",
      bdt: "1px solid #a39b88",
      well: "#c9c3b3",
      sh: "0 6px 12px rgba(0,0,0,.4),inset 0 1px 0 #fff,inset 0 -2px 4px rgba(0,0,0,.15)",
      shs: "0 3px 6px rgba(0,0,0,.4),inset 0 1px 0 #fff,inset 0 -2px 3px rgba(0,0,0,.15)",
      sin: "inset 0 3px 6px rgba(0,0,0,.4)",
      sht: "0 4px 8px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.7),inset 0 -3px 5px rgba(0,0,0,.2)",
      shbtn: "0 4px 8px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.7),inset 0 -3px 5px rgba(0,0,0,.3)",
      font: "Georgia,'Nunito',serif",
      fonth: "Georgia,'Nunito',serif"
    }
  },
  aurora: {
    id: "aurora",
    name: "Aurora",
    vars: {
      bg: "radial-gradient(circle at 20% 10%,rgba(0,255,170,.45),transparent 40%),radial-gradient(circle at 85% 30%,rgba(120,80,255,.55),transparent 45%),radial-gradient(circle at 50% 95%,rgba(0,170,255,.45),transparent 45%),#0b1020",
      bgc: "#0b1020",
      card: "rgba(255,255,255,.08)",
      ink: "#f2f6ff",
      mute: "#a9b6d8",
      accent: "#5ef2c2",
      accentg: "linear-gradient(135deg,#5ef2c2,#7a6cff)",
      onacc: "#08101f",
      r: "24px",
      rs: "16px",
      bd: "1px solid rgba(255,255,255,.14)",
      bdt: "1px solid rgba(255,255,255,.12)",
      blur: "blur(16px)",
      well: "rgba(255,255,255,.07)",
      sh: "0 10px 30px rgba(0,0,0,.35)",
      shs: "0 4px 14px rgba(0,0,0,.3)",
      sin: "inset 0 2px 6px rgba(0,0,0,.4)",
      sht: "0 8px 22px rgba(0,0,0,.3)",
      shbtn: "0 8px 24px rgba(94,242,194,.35)"
    }
  },
  material: {
    id: "material",
    name: "Material Design 3",
    vars: {
      bg: "#fef7ff",
      bgc: "#fef7ff",
      card: "#f3edf7",
      ink: "#1d1b20",
      mute: "#49454f",
      accent: "#6750a4",
      accentg: "#6750a4",
      greeng: "#386a20",
      r: "28px",
      rs: "16px",
      well: "#e7e0ec",
      barfill: "#ffd8e4",
      sh: "0 1px 2px rgba(0,0,0,.2),0 2px 6px rgba(0,0,0,.1)",
      shs: "0 1px 2px rgba(0,0,0,.2)",
      sin: "none",
      sht: "0 1px 3px rgba(0,0,0,.2)",
      shbtn: "0 2px 6px rgba(103,80,164,.35)",
      font: "Roboto,'Nunito',system-ui,sans-serif",
      fonth: "Roboto,'Nunito',system-ui,sans-serif"
    }
  },
  pixel: {
    id: "pixel",
    name: "Pixel Art",
    vars: {
      bg: "#1a1c2c",
      bgc: "#1a1c2c",
      card: "#29366f",
      ink: "#f4f4f4",
      mute: "#a7b4ff",
      accent: "#ffcd75",
      accentg: "#ef7d57",
      onacc: "#1a1c2c",
      greeng: "#38b764",
      green: "#38b764",
      r: "0",
      rs: "0",
      bd: "4px solid #f4f4f4",
      bdt: "3px solid #f4f4f4",
      well: "#1a1c2c",
      barfill: "#ffcd75",
      sh: "6px 6px 0 #000",
      shs: "3px 3px 0 #000",
      sin: "none",
      sht: "5px 5px 0 #000",
      shbtn: "4px 4px 0 #000",
      font: "'VT323',monospace",
      fonth: "'Press Start 2P','VT323',monospace"
    }
  },
  synth: {
    id: "synth",
    name: "Synthwave",
    vars: {
      bg: "repeating-linear-gradient(0deg,rgba(255,255,255,.04) 0 2px,transparent 2px 40px),linear-gradient(180deg,#1a0536,#4a0a6b 50%,#c2186b)",
      bgc: "#1a0536",
      card: "rgba(26,5,54,.72)",
      ink: "#ffe8ff",
      mute: "#d89cf0",
      accent: "#2ee6ff",
      accentg: "linear-gradient(135deg,#ff2a8a,#ff9e2c)",
      onacc: "#1a0536",
      r: "14px",
      rs: "10px",
      bd: "2px solid #ff2a8a",
      bdt: "1px solid rgba(255,42,138,.7)",
      well: "rgba(0,0,0,.35)",
      barfill: "#2ee6ff",
      sh: "0 0 18px rgba(255,42,138,.5)",
      shs: "0 0 10px rgba(255,42,138,.5)",
      sin: "inset 0 0 8px rgba(0,0,0,.6)",
      sht: "0 0 14px rgba(255,42,138,.55)",
      shbtn: "0 0 22px rgba(255,158,44,.6)",
      fonth: "'Orbitron',system-ui,sans-serif",
      tsh: "0 0 10px rgba(255,42,138,.8)"
    }
  },
  paper: {
    id: "paper",
    name: "Paper",
    vars: {
      bg: "repeating-linear-gradient(transparent 0 31px,rgba(80,120,200,.2) 31px 32px),#f6efe0",
      bgc: "#f6efe0",
      card: "#fffdf6",
      ink: "#3a3a4a",
      mute: "#7a7566",
      accent: "#d9534f",
      accentg: "#e35d4f",
      greeng: "#58a55c",
      r: "10px",
      rs: "8px",
      bd: "2px solid #3a3a4a",
      bdt: "1.5px solid #3a3a4a",
      well: "#efe6d0",
      barfill: "#ffd966",
      sh: "3px 3px 0 rgba(58,58,74,.35)",
      shs: "2px 2px 0 rgba(58,58,74,.35)",
      sin: "inset 1px 1px 0 rgba(58,58,74,.3)",
      sht: "3px 3px 0 rgba(58,58,74,.35)",
      shbtn: "3px 3px 0 #3a3a4a",
      font: "'Patrick Hand','Nunito',cursive",
      fonth: "'Caveat','Patrick Hand',cursive"
    }
  },
  oled: {
    id: "oled",
    name: "OLED",
    vars: {
      bg: "#000",
      bgc: "#000",
      card: "#0b0b0b",
      ink: "#f5f5f5",
      mute: "#8a8a8a",
      accent: "#4de1c1",
      accentg: "#4de1c1",
      onacc: "#000",
      greeng: "#3ddc84",
      r: "20px",
      rs: "14px",
      bd: "1px solid #2a2a2a",
      bdt: "1px solid #2a2a2a",
      well: "#141414",
      barfill: "#4de1c1",
      sh: "none",
      shs: "none",
      sin: "none",
      sht: "none",
      shbtn: "none"
    }
  },
  bento: {
    id: "bento",
    name: "Bento",
    vars: {
      bg: "#f2f2f0",
      bgc: "#f2f2f0",
      card: "#fff",
      ink: "#111",
      mute: "#6b6b6b",
      accent: "#ff5a1f",
      accentg: "#ff5a1f",
      greeng: "#22b455",
      r: "30px",
      rs: "20px",
      bd: "1px solid #e6e6e2",
      bdt: "1px solid #e6e6e2",
      well: "#f0f0ec",
      barfill: "#ffd23f",
      sh: "none",
      shs: "none",
      sin: "inset 0 0 0 1px #e6e6e2",
      sht: "none",
      shbtn: "none"
    }
  },
  pop: {
    id: "pop",
    name: "Pop",
    vars: {
      bg: "radial-gradient(circle at 10% 5%,rgba(255,122,184,.25),transparent 40%),radial-gradient(circle at 95% 60%,rgba(18,194,233,.22),transparent 45%),#fff7fb",
      bgc: "#fff7fb",
      card: "linear-gradient(135deg,#ffe3f1,#e3ebff)",
      ink: "#2a2140",
      mute: "#6b628a",
      accent: "#c471ed",
      accentg: "linear-gradient(135deg,#12c2e9,#c471ed,#f64f59)",
      greeng: "linear-gradient(135deg,#43e97b,#38f9d7)",
      ongr: "#06371f",
      r: "30px",
      rs: "22px",
      well: "#f1ecff",
      barfill: "#ffe66d",
      sh: "0 12px 28px rgba(120,60,200,.28)",
      shs: "0 6px 14px rgba(120,60,200,.25)",
      sin: "inset 0 2px 6px rgba(120,60,200,.2)",
      sht: "0 8px 18px rgba(120,60,200,.3)",
      shbtn: "0 10px 22px rgba(196,113,237,.55)"
    }
  },
  aero: {
    id: "aero",
    name: "Aero",
    vars: {
      bg: "radial-gradient(circle at 18% 28%,rgba(255,255,255,.85) 0 16px,transparent 17px),radial-gradient(circle at 82% 62%,rgba(255,255,255,.7) 0 26px,transparent 27px),linear-gradient(180deg,#5fc8ff,#bff0ff 45%,#e6ffd9)",
      bgc: "#bff0ff",
      card: "linear-gradient(180deg,rgba(255,255,255,.9),rgba(255,255,255,.5))",
      ink: "#0b3a5a",
      mute: "#3b6b8a",
      accent: "#0b82d6",
      accentg: "linear-gradient(180deg,#8ae0ff,#1a9be6 50%,#0b82d6 51%,#4cc2ff)",
      greeng: "linear-gradient(180deg,#9cf08e,#3bb44a 50%,#2f9d3d 51%,#62d96d)",
      r: "22px",
      rs: "16px",
      bd: "1px solid rgba(255,255,255,.95)",
      bdt: "1px solid rgba(255,255,255,.9)",
      blur: "blur(10px)",
      well: "rgba(255,255,255,.55)",
      barfill: "#fff27a",
      sh: "0 8px 20px rgba(0,100,160,.3),inset 0 1px 0 #fff,inset 0 -8px 14px rgba(120,200,255,.35)",
      shs: "0 4px 10px rgba(0,100,160,.3),inset 0 1px 0 #fff,inset 0 -5px 8px rgba(120,200,255,.3)",
      sin: "inset 0 2px 5px rgba(0,100,160,.3)",
      sht: "0 6px 14px rgba(0,100,160,.3),inset 0 1px 0 #fff,inset 0 -6px 10px rgba(120,200,255,.3)",
      shbtn: "0 4px 10px rgba(0,80,150,.45),inset 0 1px 0 rgba(255,255,255,.8)"
    }
  },
  term: {
    id: "term",
    name: "Terminal",
    vars: {
      bg: "#0a0f0a",
      bgc: "#0a0f0a",
      card: "#0d140d",
      ink: "#33ff66",
      mute: "#1fae45",
      accent: "#33ff66",
      accentg: "#33ff66",
      onacc: "#001a07",
      green: "#33ff66",
      greeng: "#33ff66",
      ongr: "#001a07",
      r: "4px",
      rs: "3px",
      bd: "1px solid #33ff66",
      bdt: "1px solid #1fae45",
      well: "#050a05",
      barfill: "#ffd33d",
      sh: "0 0 10px rgba(51,255,102,.25)",
      shs: "0 0 6px rgba(51,255,102,.25)",
      sin: "none",
      sht: "0 0 8px rgba(51,255,102,.25)",
      shbtn: "0 0 14px rgba(51,255,102,.45)",
      font: "'Share Tech Mono',monospace",
      fonth: "'Share Tech Mono',monospace",
      tsh: "0 0 8px rgba(51,255,102,.6)"
    }
  },
  cartoon: {
    id: "cartoon",
    name: "Cartoon",
    vars: {
      bg: "radial-gradient(rgba(0,0,0,.13) 2px,transparent 2.5px) 0 0/18px 18px,#7ad7ff",
      bgc: "#7ad7ff",
      card: "#fff",
      ink: "#1b1b1b",
      mute: "#4a4a4a",
      accent: "#ff4757",
      accentg: "#ff4757",
      onacc: "#fff",
      greeng: "#2ecc71",
      green: "#2ecc71",
      r: "22px",
      rs: "16px",
      bd: "4px solid #1b1b1b",
      bdt: "3px solid #1b1b1b",
      well: "#fff",
      barfill: "#ffe14d",
      sh: "5px 5px 0 #1b1b1b",
      shs: "3px 3px 0 #1b1b1b",
      sin: "none",
      sht: "4px 4px 0 #1b1b1b",
      shbtn: "4px 4px 0 #1b1b1b",
      font: "'Comic Neue','Nunito',cursive",
      fonth: "'Bangers','Comic Neue',cursive"
    }
  }
};
function renderHome(state, route) {
  const topGames = GAMES.slice(0, 3);
  const topSubjects = SUBJECTS.slice(0, 3);
  const theme = THEMES[state.theme || "clay"];
  (theme == null ? void 0 : theme.vars) || {};
  const gameCards = topGames.map(
    (game) => `
    <button class="tile raise" data-go="/game/${game.id}" style="--t: ${game.tint}">
      <div style="font-size: 48px; margin-bottom: 8px">${game.emoji}</div>
      <div style="font-weight: 800; font-size: 13px">${game.name}</div>
      <div style="font-size: 11px; color: var(--mute); margin-top: 4px">${game.desc || ""}</div>
    </button>
  `
  ).join("");
  const subjectCards = topSubjects.map(
    (subject) => `
    <button class="tile raise" data-go="/course/${subject.id}" style="--t: ${subject.tint}">
      <div style="font-size: 48px; margin-bottom: 8px">${subject.emoji}</div>
      <div style="font-weight: 800; font-size: 13px">${subject.name}</div>
      <div style="font-size: 11px; color: var(--mute); margin-top: 4px">${subject.lessons} Lessons</div>
    </button>
  `
  ).join("");
  return `
    <div class="phone">
      <div class="top">
        <h1 style="margin: 0; flex: 1">Style Lab</h1>
        <div class="star" style="font-size: 18px; padding: 8px 16px">${state.stars || 0} ⭐</div>
      </div>

      <div style="margin-bottom: 24px">
        <h2 style="font-size: 14px; font-weight: 800; margin: 0 0 12px 0; color: var(--mute)">QUICK GAMES</h2>
        <div class="row">${gameCards}</div>
      </div>

      <div style="margin-bottom: 24px">
        <h2 style="font-size: 14px; font-weight: 800; margin: 0 0 12px 0; color: var(--mute)">LEARN</h2>
        <div class="row">${subjectCards}</div>
      </div>

      <div style="margin-bottom: 24px">
        <button class="cta" data-go="/games" style="width: 100%; margin-bottom: 10px">
          👾 All Games
        </button>
        <button class="cta" data-go="/explore" style="width: 100%; margin-bottom: 10px">
          🗺️ Explore All Subjects
        </button>
      </div>

      <style>
        .row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .tile {
          padding: 16px 12px;
          border-radius: var(--r);
          border: none;
          cursor: pointer;
          background: var(--t, var(--card));
          color: var(--ink);
          font-family: inherit;
          text-align: center;
          transition: 0.2s;
          box-shadow: var(--sh);
        }
        .tile:active {
          transform: scale(0.97);
          box-shadow: var(--sin);
        }
      </style>
    </div>
  `;
}
function renderExplore(state, route) {
  const subjectCards = SUBJECTS.map((subject) => {
    var _a, _b, _c, _d;
    const isCompleted = ((_b = (_a = state.done) == null ? void 0 : _a[subject.id]) == null ? void 0 : _b.length) > 0;
    const lessonsDone = ((_d = (_c = state.done) == null ? void 0 : _c[subject.id]) == null ? void 0 : _d.length) || 0;
    return `
      <button class="tile raise" data-go="/course/${subject.id}" style="--t: ${subject.tint}">
        <div style="font-size: 48px; margin-bottom: 8px">${subject.emoji}</div>
        <div style="font-weight: 800; font-size: 14px">${subject.name}</div>
        <div style="font-size: 11px; color: var(--mute); margin-top: 8px">
          ${lessonsDone}/${subject.lessons} lessons
        </div>
        ${isCompleted ? '<div style="margin-top: 8px">✅ Started</div>' : ""}
      </button>
    `;
  }).join("");
  return `
    <div class="phone">
      <div class="top">
        <button class="back" data-go="/home" style="background: none; border: none; cursor: pointer; font-size: 24px; padding: 0">←</button>
        <h1 style="margin: 0; flex: 1; text-align: center">All Subjects</h1>
        <div class="star" style="font-size: 18px; padding: 8px 16px">${state.stars || 0} ⭐</div>
      </div>

      <div class="row4" style="margin-top: 24px">
        ${subjectCards}
      </div>

      <style>
        .row4 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .tile {
          padding: 16px 12px;
          border-radius: var(--r);
          border: none;
          cursor: pointer;
          background: var(--t, var(--card));
          color: var(--ink);
          font-family: inherit;
          text-align: center;
          transition: 0.2s;
          box-shadow: var(--sh);
        }
        .tile:active {
          transform: scale(0.97);
          box-shadow: var(--sin);
        }
        .back {
          font-size: 24px;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--rs);
        }
        .back:active {
          background: var(--card);
        }
      </style>
    </div>
  `;
}
function renderGames(state, route) {
  const singlePlayerGames = GAMES.filter((g) => !g.p2);
  const twoPlayerGames = GAMES.filter((g) => g.p2);
  const renderGameCard = (game) => {
    var _a;
    const bestScore = ((_a = state.gb) == null ? void 0 : _a[game.id]) || 0;
    return `
      <button class="tile raise" data-go="/game/${game.id}" style="--t: ${game.tint}">
        <div style="font-size: 48px; margin-bottom: 8px">${game.emoji}</div>
        <div style="font-weight: 800; font-size: 13px">${game.name}</div>
        <div style="font-size: 10px; color: var(--mute); margin-top: 4px">${game.desc || ""}</div>
        ${bestScore > 0 ? `<div style="font-size: 11px; margin-top: 8px; color: var(--green)">🏆 ${bestScore}</div>` : ""}
      </button>
    `;
  };
  const singlePlayerCards = singlePlayerGames.map(renderGameCard).join("");
  const twoPlayerCards = twoPlayerGames.map(renderGameCard).join("");
  return `
    <div class="phone">
      <div class="top">
        <button class="back" data-go="/home" style="background: none; border: none; cursor: pointer; font-size: 24px; padding: 0">←</button>
        <h1 style="margin: 0; flex: 1; text-align: center">Games</h1>
        <div class="star" style="font-size: 18px; padding: 8px 16px">${state.stars || 0} ⭐</div>
      </div>

      <div style="margin-top: 24px">
        <h2 style="font-size: 14px; font-weight: 800; margin: 0 0 12px 0; color: var(--mute)">SINGLE PLAYER (${singlePlayerGames.length})</h2>
        <div class="row3">
          ${singlePlayerCards}
        </div>
      </div>

      <div style="margin-top: 24px">
        <h2 style="font-size: 14px; font-weight: 800; margin: 0 0 12px 0; color: var(--mute)">TWO PLAYER (${twoPlayerGames.length})</h2>
        <div class="row3">
          ${twoPlayerCards}
        </div>
      </div>

      <style>
        .row3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .tile {
          padding: 16px 12px;
          border-radius: var(--r);
          border: none;
          cursor: pointer;
          background: var(--t, var(--card));
          color: var(--ink);
          font-family: inherit;
          text-align: center;
          transition: 0.2s;
          box-shadow: var(--sh);
        }
        .tile:active {
          transform: scale(0.97);
          box-shadow: var(--sin);
        }
        .back {
          font-size: 24px;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--rs);
        }
        .back:active {
          background: var(--card);
        }
      </style>
    </div>
  `;
}
function renderGame(state, route) {
  var _a;
  const { id: gameId } = route.params;
  const gameMetadata = GAMES.find((g) => g.id === gameId);
  if (!gameMetadata) {
    return `
      <div class="phone">
        <div class="top">
          <button class="back" data-go="/games">←</button>
          <h1 style="margin: 0">Game Not Found</h1>
        </div>
        <div style="text-align: center; margin-top: 40px">
          <p>Sorry, this game doesn't exist.</p>
          <button class="cta" data-go="/games">Back to Games</button>
        </div>
      </div>
    `;
  }
  return `
    <div class="phone" id="game-screen">
      <div class="top">
        <button class="back" data-go="/games" style="background: none; border: none; cursor: pointer; font-size: 24px; padding: 0">←</button>
        <h1 style="margin: 0; flex: 1">${gameMetadata.name}</h1>
        <div class="star" style="font-size: 18px; padding: 8px 16px">${((_a = state.gb) == null ? void 0 : _a[gameId]) || 0}</div>
      </div>

      <div class="gstage" id="game-content">
        <p style="text-align: center; color: var(--mute)">Loading game...</p>
      </div>

      <script type="module">
        (function() {
          const gameId = '${gameId}';
          const gameContainer = document.getElementById('game-content');
          if (!gameContainer) return;

          // Import game starter dynamically
          import('/src/games/index.js').then(module => {
            const { startGame } = module;
            try {
              const cleanup = startGame(gameId, gameContainer);
              // Store cleanup function for potential later cleanup
              window.__currentGameCleanup = cleanup;
            } catch (error) {
              console.error('Error starting game:', error);
              gameContainer.innerHTML = '<p style="color: red">Error loading game</p>';
            }
          }).catch(err => {
            console.error('Failed to load game module:', err);
            gameContainer.innerHTML = '<p style="color: red">Failed to load game</p>';
          });
        })();
      <\/script>

      <style>
        .gstage {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 20px 0;
        }
        .back {
          font-size: 24px;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--rs);
        }
        .back:active {
          background: var(--card);
        }
      </style>
    </div>
  `;
}
function renderCourse(state, route) {
  var _a, _b;
  const { id: subjectId } = route.params;
  const subject = getSubject(subjectId);
  if (!subject) {
    return `
      <div class="phone">
        <div class="top">
          <button class="back" data-go="/explore">←</button>
          <h1 style="margin: 0">Subject Not Found</h1>
        </div>
        <div style="text-align: center; margin-top: 40px">
          <p>Sorry, this subject doesn't exist.</p>
          <button class="cta" data-go="/explore">Back to Subjects</button>
        </div>
      </div>
    `;
  }
  const lessonsDone = ((_b = (_a = state.done) == null ? void 0 : _a[subjectId]) == null ? void 0 : _b.length) || 0;
  const lessons = Array.from({ length: subject.lessons }, (_, i) => {
    var _a2, _b2;
    const isLocked = i > lessonsDone && lessonsDone > 0;
    const isDone = (_b2 = (_a2 = state.done) == null ? void 0 : _a2[subjectId]) == null ? void 0 : _b2.includes(i);
    return `
      <button 
        class="lesson-card raise" 
        data-go="/lesson/${subjectId}/${i}"
        style="--t: ${subject.tint}; opacity: ${isLocked ? 0.5 : 1}; pointer-events: ${isLocked ? "none" : "auto"}"
      >
        <div style="font-size: 48px; margin-bottom: 8px">
          ${isDone ? "✅" : i + 1}
        </div>
        <div style="font-weight: 800; font-size: 14px">Lesson ${i + 1}</div>
        ${isDone ? '<div style="font-size: 11px; color: var(--green); margin-top: 4px">Completed</div>' : ""}
        ${isLocked ? '<div style="font-size: 11px; color: var(--mute); margin-top: 4px">🔒 Locked</div>' : ""}
      </button>
    `;
  }).join("");
  return `
    <div class="phone">
      <div class="top">
        <button class="back" data-go="/explore" style="background: none; border: none; cursor: pointer; font-size: 24px; padding: 0">←</button>
        <div style="text-align: center; flex: 1">
          <div style="font-size: 40px; margin-bottom: 8px">${subject.emoji}</div>
          <h1 style="margin: 0">${subject.name}</h1>
        </div>
        <div class="star" style="font-size: 18px; padding: 8px 16px">${state.stars || 0} ⭐</div>
      </div>

      <div style="margin-top: 16px; text-align: center; color: var(--mute)">
        <p style="margin: 0; font-size: 13px">Progress: ${lessonsDone}/${subject.lessons} lessons completed</p>
      </div>

      <div class="lessons-grid" style="margin-top: 24px">
        ${lessons}
      </div>

      <button class="cta" data-go="/quiz/${subjectId}" style="width: 100%; margin-top: 24px">
        📝 Take Quiz
      </button>

      <style>
        .lessons-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .lesson-card {
          padding: 20px 16px;
          border-radius: var(--r);
          border: none;
          cursor: pointer;
          background: var(--t, var(--card));
          color: var(--ink);
          font-family: inherit;
          text-align: center;
          transition: 0.2s;
          box-shadow: var(--sh);
        }
        .lesson-card:active {
          transform: scale(0.97);
          box-shadow: var(--sin);
        }
        .back {
          font-size: 24px;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--rs);
        }
        .back:active {
          background: var(--card);
        }
      </style>
    </div>
  `;
}
const LESSON_CONTENT = {
  math: [
    { title: "Counting 1-10", content: "Learn to count from 1 to 10" },
    { title: "Basic Addition", content: "Learn simple addition (1+1, 1+2)" },
    { title: "Subtraction Basics", content: "Learn simple subtraction" },
    { title: "Numbers 1-20", content: "Count and recognize numbers 1-20" },
    { title: "Skip Counting", content: "Count by 2s, 5s, and 10s" }
  ],
  science: [
    { title: "The Sun", content: "Learn about our star" },
    { title: "The Moon", content: "Explore Earth's moon" },
    { title: "Animals", content: "Meet different animals" },
    { title: "Plants", content: "Learn about plants" },
    { title: "Weather", content: "Understand weather patterns" }
  ],
  reading: [
    { title: "Letter A", content: "Recognize and learn letter A" },
    { title: "Letter B", content: "Recognize and learn letter B" },
    { title: "Short Vowels", content: "Learn A, E, I, O, U sounds" },
    { title: "Simple Words", content: "Read simple 3-letter words" },
    { title: "Rhymes", content: "Learn rhyming words" }
  ],
  art: [
    { title: "Primary Colors", content: "Red, Yellow, and Blue" },
    { title: "Secondary Colors", content: "Mixing primary colors" },
    { title: "Warm Colors", content: "Red, orange, yellow" },
    { title: "Cool Colors", content: "Blue, purple, green" },
    { title: "Shapes", content: "Circle, square, triangle" }
  ],
  music: [
    { title: "Beat", content: "Feel the rhythm" },
    { title: "Notes", content: "Learn musical notes" },
    { title: "Instruments", content: "Explore different instruments" },
    { title: "Melody", content: "Learn to sing melodies" },
    { title: "Rhythm", content: "Keep the beat" }
  ],
  puzzle: [
    { title: "Patterns", content: "Find the pattern" },
    { title: "Logic", content: "Solve logic puzzles" },
    { title: "Shapes", content: "Match and sort shapes" },
    { title: "Sequences", content: "Continue the sequence" },
    { title: "Matching", content: "Find matching pairs" }
  ],
  animals: [
    { title: "Pets vs Wild", content: "Pets are animals we keep" },
    { title: "Farm Animals", content: "Cow, pig, chicken, sheep" },
    { title: "Jungle Animals", content: "Lion, tiger, monkey, elephant" },
    { title: "Ocean Animals", content: "Fish, dolphin, whale, octopus" },
    { title: "Flying Animals", content: "Birds and insects" }
  ],
  space: [
    { title: "The Sun", content: "Our bright star" },
    { title: "The Moon", content: "Earth's natural satellite" },
    { title: "Planets", content: "Explore our solar system" },
    { title: "Stars", content: "Twinkle, twinkle little star" },
    { title: "Astronauts", content: "People who travel to space" }
  ],
  world: [
    { title: "Continents", content: "The 7 continents" },
    { title: "Countries", content: "Different countries" },
    { title: "Landmarks", content: "Famous landmarks" },
    { title: "India", content: "Learn about India" },
    { title: "Flags", content: "Country flags" }
  ],
  hindi: [
    { title: "अ (A)", content: "Learn Hindi letter अ" },
    { title: "आ (Aa)", content: "Learn Hindi letter आ" },
    { title: "इ (I)", content: "Learn Hindi letter इ" },
    { title: "ई (Ee)", content: "Learn Hindi letter ई" },
    { title: "Numbers 1-10", content: "Count in Hindi" }
  ],
  health: [
    { title: "The Senses", content: "See, hear, touch, taste, smell" },
    { title: "Healthy Food", content: "Eat fruits and vegetables" },
    { title: "Hygiene", content: "Wash hands and brush teeth" },
    { title: "Exercise", content: "Play and stay active" },
    { title: "Sleep", content: "Get enough rest" }
  ],
  money: [
    { title: "Coins", content: "Learn about coins" },
    { title: "Counting Money", content: "Count coins and notes" },
    { title: "Save vs Spend", content: "Learn to save money" },
    { title: "Buying Things", content: "Use money to buy" },
    { title: "Making Change", content: "Learn about change" }
  ]
};
function renderLesson(state, route) {
  const { id: subjectId, index: lessonIndex } = route.params;
  const subject = getSubject(subjectId);
  const lessonNum = parseInt(lessonIndex);
  if (!subject || isNaN(lessonNum) || lessonNum < 0 || lessonNum >= subject.lessons) {
    return `
      <div class="phone">
        <div class="top">
          <button class="back" data-go="/explore">←</button>
          <h1 style="margin: 0">Lesson Not Found</h1>
        </div>
      </div>
    `;
  }
  const lessons = LESSON_CONTENT[subjectId] || LESSON_CONTENT.math;
  const lesson = lessons[lessonNum] || { title: `Lesson ${lessonNum + 1}`, content: "" };
  return `
    <div class="phone">
      <div class="top">
        <button class="back" data-go="/course/${subjectId}" style="background: none; border: none; cursor: pointer; font-size: 24px; padding: 0">←</button>
        <h1 style="margin: 0; flex: 1; text-align: center">${subject.name}</h1>
        <div class="star" style="font-size: 18px; padding: 8px 16px">${state.stars || 0} ⭐</div>
      </div>

      <div class="les raise" style="margin-top: 24px; padding: 24px; text-align: center">
        <div style="font-size: 64px; margin-bottom: 16px">${subject.emoji}</div>
        <h2 style="margin: 0 0 16px 0; font-size: 20px">${lesson.title}</h2>
        <p style="margin: 0; color: var(--mute); font-size: 14px; line-height: 1.6">
          ${lesson.content}
        </p>
      </div>

      <div style="margin-top: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px">
        <button class="cta alt" data-go="/course/${subjectId}" style="width: 100%">
          ← Previous
        </button>
        <button class="cta" data-go="/quiz/${subjectId}" style="width: 100%">
          Next →
        </button>
      </div>

      <style>
        .les {
          border-radius: var(--r);
          box-shadow: var(--sh);
        }
        .back {
          font-size: 24px;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--rs);
        }
        .back:active {
          background: var(--card);
        }
      </style>
    </div>
  `;
}
const QUIZ_DATA = {
  math: [
    { q: "What is 1 + 1?", opts: ["2", "3", "1"], ans: 0 },
    { q: "What is 2 + 2?", opts: ["4", "5", "3"], ans: 0 },
    { q: "What is 5 - 2?", opts: ["3", "4", "2"], ans: 0 },
    { q: "Count: 1, 2, 3, ?", opts: ["4", "2", "1"], ans: 0 },
    { q: "What is 3 + 2?", opts: ["5", "4", "6"], ans: 0 }
  ],
  science: [
    { q: "The sun gives us?", opts: ["Light", "Cold", "Wind"], ans: 0 },
    { q: "Birds can?", opts: ["Fly", "Swim", "Run only"], ans: 0 },
    { q: "Plants need?", opts: ["Water", "Fire", "Ice"], ans: 0 },
    { q: "We breathe?", opts: ["Air", "Water", "Soil"], ans: 0 },
    { q: "Leaves are?", opts: ["Green", "Blue", "Red"], ans: 0 }
  ],
  reading: [
    { q: "Which letter is this: A", opts: ["A", "B", "C"], ans: 0 },
    { q: "Which letter is this: B", opts: ["A", "B", "C"], ans: 1 },
    { q: "CAT ends with?", opts: ["T", "A", "C"], ans: 0 },
    { q: "DOG starts with?", opts: ["D", "O", "G"], ans: 0 },
    { q: "Which rhymes with CAT?", opts: ["BAT", "DOG", "SUN"], ans: 0 }
  ],
  art: [
    { q: "Red and blue make?", opts: ["Purple", "Green", "Orange"], ans: 0 },
    { q: "Yellow is a?", opts: ["Warm color", "Cool color", "Dark color"], ans: 0 },
    { q: "How many sides has a square?", opts: ["4", "3", "5"], ans: 0 },
    { q: "A circle has how many sides?", opts: ["0", "1", "4"], ans: 0 },
    { q: "Blue is a?", opts: ["Cool color", "Warm color", "Bright color"], ans: 0 }
  ],
  music: [
    { q: "A beat helps us?", opts: ["Keep rhythm", "Sleep", "Eat"], ans: 0 },
    { q: "A song has?", opts: ["Melody", "Food", "Toys"], ans: 0 },
    { q: "Drums are?", opts: ["Instruments", "Toys", "Clothes"], ans: 0 },
    { q: "We sing with?", opts: ["Our voice", "Our feet", "Our hands"], ans: 0 },
    { q: "Piano has?", opts: ["Keys", "Strings", "Holes"], ans: 0 }
  ],
  puzzle: [
    { q: "What comes next: 1, 2, 3, ?", opts: ["4", "2", "1"], ans: 0 },
    { q: "What is different: ⭕ ⭕ 🟩 ⭕", opts: ["🟩", "⭕", "Nothing"], ans: 0 },
    { q: "Continue: 2, 4, 6, ?", opts: ["8", "5", "3"], ans: 0 },
    { q: "Find the pattern: A, B, A, B, ?", opts: ["A", "C", "B"], ans: 0 },
    { q: "What is similar: 🍎 🍊 🍌 🚗", opts: ["Nothing", "All round", "All food"], ans: 2 }
  ],
  animals: [
    { q: "A cow is a?", opts: ["Farm animal", "Wild animal", "Bird"], ans: 0 },
    { q: "A lion lives in?", opts: ["Jungle", "Farm", "Ocean"], ans: 0 },
    { q: "Fish live in?", opts: ["Water", "Air", "Land"], ans: 0 },
    { q: "Birds have?", opts: ["Wings", "Fins", "Legs only"], ans: 0 },
    { q: "A pet is?", opts: ["Animal we keep", "Wild animal", "Toy"], ans: 0 }
  ],
  space: [
    { q: "The sun is a?", opts: ["Star", "Planet", "Moon"], ans: 0 },
    { q: "The moon looks?", opts: ["Round", "Square", "Triangle"], ans: 0 },
    { q: "Stars are?", opts: ["Far away", "Close", "On Earth"], ans: 0 },
    { q: "Astronauts travel to?", opts: ["Space", "Ocean", "Desert"], ans: 0 },
    { q: "We live on?", opts: ["Earth", "Moon", "Sun"], ans: 0 }
  ],
  world: [
    { q: "How many continents?", opts: ["7", "5", "10"], ans: 0 },
    { q: "India is in?", opts: ["Asia", "Africa", "Europe"], ans: 0 },
    { q: "We live on a?", opts: ["Planet", "Star", "Moon"], ans: 0 },
    { q: "A country has?", opts: ["A flag", "A star", "A sun"], ans: 0 },
    { q: "The ocean is?", opts: ["Water", "Land", "Sky"], ans: 0 }
  ],
  hindi: [
    { q: "हिंदी letter अ is?", opts: ["A", "B", "C"], ans: 0 },
    { q: "Count 1 in Hindi?", opts: ["एक", "दो", "तीन"], ans: 0 },
    { q: "Count 2 in Hindi?", opts: ["दो", "एक", "तीन"], ans: 0 },
    { q: "Count 3 in Hindi?", opts: ["तीन", "एक", "दो"], ans: 0 },
    { q: "What letter is आ?", opts: ["Aa", "A", "E"], ans: 0 }
  ],
  health: [
    { q: "We see with?", opts: ["Eyes", "Ears", "Nose"], ans: 0 },
    { q: "We hear with?", opts: ["Ears", "Eyes", "Mouth"], ans: 0 },
    { q: "We taste with?", opts: ["Tongue", "Nose", "Skin"], ans: 0 },
    { q: "Vegetables are?", opts: ["Healthy", "Candy", "Junk"], ans: 0 },
    { q: "We should wash?", opts: ["Hands", "Face", "Both"], ans: 2 }
  ],
  money: [
    { q: "1 + 1 coin = ?", opts: ["2", "1", "3"], ans: 0 },
    { q: "To save means?", opts: ["Keep money", "Spend", "Lose"], ans: 0 },
    { q: "We use money to?", opts: ["Buy things", "Play", "Sleep"], ans: 0 },
    { q: "Coins are?", opts: ["Metal money", "Paper", "Plastic"], ans: 0 },
    { q: "A coin worth 5 = ?", opts: ["5 coins of 1", "1 coin of 10", "Paper"], ans: 0 }
  ]
};
function renderQuiz(state, route) {
  var _a;
  const { id: subjectId } = route.params;
  const subject = getSubject(subjectId);
  if (!subject) {
    return `
      <div class="phone">
        <div class="top">
          <button class="back" data-go="/explore">←</button>
          <h1 style="margin: 0">Quiz Not Found</h1>
        </div>
      </div>
    `;
  }
  const questions = QUIZ_DATA[subjectId] || QUIZ_DATA.math;
  const bestScore = ((_a = state.best) == null ? void 0 : _a[subjectId]) || 0;
  const optionsHTML = questions[0].opts.map(
    (opt, i) => `
    <button class="opt raise" data-answer="${i}" style="width: 100%; padding: 16px; margin-bottom: 12px; border: none; border-radius: var(--r); cursor: pointer; background: var(--card); font-family: inherit; font-size: 14px; font-weight: 600;">
      ${opt}
    </button>
  `
  ).join("");
  return `
    <div class="phone">
      <div class="top">
        <button class="back" data-go="/course/${subjectId}" style="background: none; border: none; cursor: pointer; font-size: 24px; padding: 0">←</button>
        <div style="text-align: center; flex: 1">
          <h1 style="margin: 0; font-size: 16px">Quiz: ${subject.name}</h1>
          <div style="font-size: 12px; color: var(--mute); margin-top: 4px">Question 1 of ${questions.length}</div>
        </div>
        <div class="star" style="font-size: 18px; padding: 8px 16px">${state.stars || 0} ⭐</div>
      </div>

      <div class="qcard raise" style="margin-top: 24px; padding: 24px; text-align: center; border-radius: var(--r); box-shadow: var(--sh)">
        <div style="font-size: 48px; margin-bottom: 16px">${subject.emoji}</div>
        <h2 style="margin: 0; font-size: 18px">${questions[0].q}</h2>
      </div>

      <div class="opts" style="margin-top: 24px">
        ${optionsHTML}
      </div>

      <div style="margin-top: 24px; text-align: center; font-size: 12px; color: var(--mute)">
        ${bestScore > 0 ? `<p>Best score: ${bestScore}/${questions.length}</p>` : "<p>Take the quiz to earn stars!</p>"}
      </div>

      <style>
        .qcard {
          background: var(--card);
        }
        .opts {
          display: flex;
          flex-direction: column;
        }
        .opt:active {
          transform: scale(0.98);
          box-shadow: var(--sin);
        }
        .back {
          font-size: 24px;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--rs);
        }
        .back:active {
          background: var(--card);
        }
      </style>
    </div>
  `;
}
function renderSettings(state, route) {
  const currentTheme = state.theme || "clay";
  const themeIds = Object.keys(THEMES);
  const themeCards = themeIds.map((id) => {
    var _a, _b;
    const theme = THEMES[id];
    const isActive = id === currentTheme;
    return `
        <button 
          class="theme-card raise" 
          data-theme="${id}"
          data-act="changeTheme"
          style="
            --t: ${((_a = theme.vars) == null ? void 0 : _a.accent) || "#7c5cf0"};
            border: ${isActive ? "3px solid var(--accent)" : "none"};
            opacity: ${isActive ? 1 : 0.7};
          "
        >
          <div style="font-size: 24px; margin-bottom: 8px; display: inline-block; width: 48px; height: 48px; border-radius: var(--r); background: ${((_b = theme.vars) == null ? void 0 : _b.bg) || "#ece8fb"}"></div>
          <div style="font-weight: 800; font-size: 12px; margin-top: 8px">${theme.name}</div>
          ${isActive ? '<div style="font-size: 11px; color: var(--green); margin-top: 4px">✓ Selected</div>' : ""}
        </button>
      `;
  }).join("");
  return `
    <div class="phone">
      <div class="top">
        <button class="back" data-go="/home" style="background: none; border: none; cursor: pointer; font-size: 24px; padding: 0">←</button>
        <h1 style="margin: 0; flex: 1; text-align: center">Settings</h1>
        <div class="star" style="font-size: 18px; padding: 8px 16px">${state.stars || 0} ⭐</div>
      </div>

      <div style="margin-top: 24px">
        <h2 style="font-size: 14px; font-weight: 800; margin: 0 0 12px 0; color: var(--mute)">SOUND & VOLUME</h2>
        
        <div class="raise" style="padding: 16px; border-radius: var(--r); box-shadow: var(--sh); margin-bottom: 16px">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px">
            <label style="font-weight: 700; cursor: pointer">
              🔊 Sound Effects
            </label>
            <button 
              class="toggle-btn" 
              data-act="toggleSound"
              style="
                width: 50px;
                height: 28px;
                border-radius: 14px;
                border: none;
                background: ${state.sound ? "var(--green)" : "var(--mute)"};
                cursor: pointer;
                transition: 0.2s;
                position: relative;
              "
            >
              <div style="
                position: absolute;
                width: 24px;
                height: 24px;
                background: white;
                border-radius: 12px;
                top: 2px;
                left: ${state.sound ? 24 : 2}px;
                transition: 0.2s;
              "></div>
            </button>
          </div>
          
          <div style="font-size: 12px; color: var(--mute)">
            Volume: <span id="volDisplay">${Math.round((state.vol || 0.7) * 100)}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value="${Math.round((state.vol || 0.7) * 100)}"
            data-act="changeVolume"
            style="width: 100%; cursor: pointer; margin-top: 8px"
          />
        </div>
      </div>

      <div style="margin-top: 24px">
        <h2 style="font-size: 14px; font-weight: 800; margin: 0 0 12px 0; color: var(--mute)">THEMES (${themeIds.length})</h2>
        
        <div class="themes-grid">
          ${themeCards}
        </div>
      </div>

      <div style="margin-top: 24px">
        <h2 style="font-size: 14px; font-weight: 800; margin: 0 0 12px 0; color: var(--mute)">PROFILE</h2>
        
        <div class="raise" style="padding: 16px; border-radius: var(--r); box-shadow: var(--sh); margin-bottom: 16px">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <div>
              <div style="font-weight: 700; margin-bottom: 4px">Player Name</div>
              <div style="font-size: 13px; color: var(--mute)">${state.name || "Explorer"}</div>
            </div>
            <button class="cta alt" data-go="/profile" style="padding: 8px 16px; font-size: 12px">
              Edit
            </button>
          </div>
        </div>

        <button 
          class="cta alt" 
          data-act="resetProfile"
          style="width: 100%; padding: 12px; margin-top: 12px"
        >
          🔄 Reset Profile
        </button>
      </div>

      <div style="margin-top: 24px; text-align: center; font-size: 11px; color: var(--mute)">
        <p>Version 1.0 | Style Lab Arcade Games</p>
      </div>

      <style>
        .themes-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .theme-card {
          padding: 12px;
          border-radius: var(--r);
          border: none;
          cursor: pointer;
          background: var(--card);
          color: var(--ink);
          font-family: inherit;
          text-align: center;
          transition: 0.2s;
          box-shadow: var(--sh);
        }
        .theme-card:active {
          transform: scale(0.97);
        }
        .back {
          font-size: 24px;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--rs);
        }
        .back:active {
          background: var(--card);
        }
      </style>
    </div>
  `;
}
function renderProfile(state, route) {
  const totalStats = {
    stars: state.stars || 0,
    gamesPlayed: Object.values(state.gb || {}).filter((s) => s > 0).length,
    lessonsCompleted: Object.values(state.done || {}).reduce((acc, done) => acc + ((done == null ? void 0 : done.length) || 0), 0),
    totalCoin: state.coin || 0
  };
  return `
    <div class="phone">
      <div class="top">
        <button class="back" data-go="/settings" style="background: none; border: none; cursor: pointer; font-size: 24px; padding: 0">←</button>
        <h1 style="margin: 0; flex: 1; text-align: center">Profile</h1>
        <div class="star" style="font-size: 18px; padding: 8px 16px">${state.stars || 0} ⭐</div>
      </div>

      <div class="raise" style="padding: 24px; border-radius: var(--r); box-shadow: var(--sh); margin-top: 24px; text-align: center">
        <div style="font-size: 64px; margin-bottom: 16px">👤</div>
        <h2 style="margin: 0 0 8px 0; font-size: 18px">${state.name || "Explorer"}</h2>
        <div style="font-size: 12px; color: var(--mute)">Player since today</div>
      </div>

      <div style="margin-top: 24px">
        <h2 style="font-size: 14px; font-weight: 800; margin: 0 0 12px 0; color: var(--mute)">STATISTICS</h2>
        
        <div class="stats-grid">
          <div class="stat-card raise" style="padding: 16px; border-radius: var(--r); box-shadow: var(--sh); text-align: center">
            <div style="font-size: 32px; margin-bottom: 8px">⭐</div>
            <div style="font-weight: 800; font-size: 20px">${totalStats.stars}</div>
            <div style="font-size: 11px; color: var(--mute); margin-top: 4px">Stars Earned</div>
          </div>
          
          <div class="stat-card raise" style="padding: 16px; border-radius: var(--r); box-shadow: var(--sh); text-align: center">
            <div style="font-size: 32px; margin-bottom: 8px">🎮</div>
            <div style="font-weight: 800; font-size: 20px">${totalStats.gamesPlayed}</div>
            <div style="font-size: 11px; color: var(--mute); margin-top: 4px">Games Played</div>
          </div>
          
          <div class="stat-card raise" style="padding: 16px; border-radius: var(--r); box-shadow: var(--sh); text-align: center">
            <div style="font-size: 32px; margin-bottom: 8px">📚</div>
            <div style="font-weight: 800; font-size: 20px">${totalStats.lessonsCompleted}</div>
            <div style="font-size: 11px; color: var(--mute); margin-top: 4px">Lessons Done</div>
          </div>
          
          <div class="stat-card raise" style="padding: 16px; border-radius: var(--r); box-shadow: var(--sh); text-align: center">
            <div style="font-size: 32px; margin-bottom: 8px">💰</div>
            <div style="font-weight: 800; font-size: 20px">${totalStats.totalCoin}</div>
            <div style="font-size: 11px; color: var(--mute); margin-top: 4px">Total Coins</div>
          </div>
        </div>
      </div>

      <div style="margin-top: 24px">
        <h2 style="font-size: 14px; font-weight: 800; margin: 0 0 12px 0; color: var(--mute)">EDIT PROFILE</h2>
        
        <div class="raise" style="padding: 16px; border-radius: var(--r); box-shadow: var(--sh)">
          <label style="display: block; font-weight: 700; margin-bottom: 8px">Player Name</label>
          <input 
            type="text" 
            id="playerName"
            value="${state.name || "Explorer"}"
            placeholder="Enter your name"
            maxlength="20"
            style="
              width: 100%;
              padding: 12px;
              border: none;
              border-radius: var(--rs);
              background: var(--well);
              color: var(--ink);
              font-family: inherit;
              font-size: 14px;
              box-sizing: border-box;
            "
          />
          <button 
            class="cta" 
            data-act="saveName"
            style="width: 100%; margin-top: 12px"
          >
            Save Name
          </button>
        </div>
      </div>

      <style>
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .stat-card {
          background: var(--card);
        }
        .back {
          font-size: 24px;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--rs);
        }
        .back:active {
          background: var(--card);
        }
      </style>
    </div>
  `;
}
function renderNotFound(state, route) {
  return `
    <div class="phone">
      <div class="top">
        <h1 style="margin: 0; flex: 1; text-align: center">Page Not Found</h1>
      </div>

      <div class="raise" style="padding: 48px 24px; border-radius: var(--r); box-shadow: var(--sh); margin-top: 40px; text-align: center">
        <div style="font-size: 80px; margin-bottom: 24px">🤔</div>
        <h2 style="margin: 0 0 16px 0; font-size: 18px">404</h2>
        <p style="margin: 0 0 24px 0; color: var(--mute); font-size: 14px">
          Oops! This page doesn't exist.
        </p>
        <p style="margin: 0 0 32px 0; color: var(--mute); font-size: 13px">
          Requested path: <code style="background: var(--well); padding: 4px 8px; border-radius: 4px; font-family: monospace">${(route == null ? void 0 : route.path) || "unknown"}</code>
        </p>
        
        <button class="cta" data-go="/home" style="width: 100%; padding: 12px">
          ← Back to Home
        </button>
      </div>

      <style>
        code {
          display: inline-block;
        }
      </style>
    </div>
  `;
}
function renderError(state, route, error) {
  const errorMessage = (error == null ? void 0 : error.message) || "An unexpected error occurred";
  const errorStack = (error == null ? void 0 : error.stack) || "";
  return `
    <div class="phone">
      <div class="top">
        <button class="back" data-go="/home" style="background: none; border: none; cursor: pointer; font-size: 24px; padding: 0">←</button>
        <h1 style="margin: 0; flex: 1; text-align: center">Error</h1>
      </div>

      <div class="raise" style="padding: 24px; border-radius: var(--r); box-shadow: var(--sh); margin-top: 24px">
        <div style="font-size: 64px; text-align: center; margin-bottom: 16px">⚠️</div>
        
        <div style="background: var(--well); padding: 16px; border-radius: var(--rs); margin-bottom: 16px">
          <div style="font-weight: 700; color: #e74c3c; margin-bottom: 8px">Error Message:</div>
          <code style="display: block; font-family: monospace; font-size: 12px; color: var(--ink); word-break: break-all; white-space: pre-wrap">
            ${errorMessage}
          </code>
        </div>

        ${errorStack ? `
          <details style="margin-bottom: 16px; cursor: pointer">
            <summary style="font-weight: 700; color: var(--mute); user-select: none">Stack Trace</summary>
            <pre style="background: var(--well); padding: 12px; border-radius: var(--rs); font-size: 11px; overflow-x: auto; margin-top: 8px; white-space: pre-wrap; word-break: break-all">${errorStack}</pre>
          </details>
        ` : ""}

        <p style="font-size: 12px; color: var(--mute); margin-bottom: 16px">
          Route: <code style="background: var(--well); padding: 2px 6px; border-radius: 3px">${(route == null ? void 0 : route.path) || "unknown"}</code>
        </p>

        <button class="cta" data-go="/home" style="width: 100%; padding: 12px; margin-bottom: 8px">
          🏠 Go Home
        </button>
        
        <button class="cta alt" data-go="/games" style="width: 100%; padding: 12px">
          🎮 Go to Games
        </button>
      </div>

      <style>
        code {
          display: inline;
        }
        details {
          border-left: 2px solid var(--accent);
          padding-left: 12px;
        }
        summary {
          outline: none;
        }
      </style>
    </div>
  `;
}
const PAGE_REGISTRY = {
  "/home": renderHome,
  "/explore": renderExplore,
  "/games": renderGames,
  "/game/:id": renderGame,
  "/course/:id": renderCourse,
  "/lesson/:id/:index": renderLesson,
  "/quiz/:id": renderQuiz,
  "/settings": renderSettings,
  "/profile": renderProfile,
  "/404": renderNotFound,
  "/error": renderError
};
function parseRouteParams(pattern, path) {
  const patternParts = pattern.split("/");
  const pathParts = path.split("/");
  const params = {};
  patternParts.forEach((part, i) => {
    if (part.startsWith(":")) {
      const paramName = part.slice(1);
      params[paramName] = pathParts[i];
    }
  });
  return params;
}
function getPageRenderer(path) {
  if (PAGE_REGISTRY[path]) {
    return (state, route) => PAGE_REGISTRY[path](state, { ...route, params: {} });
  }
  for (const [pattern, renderer] of Object.entries(PAGE_REGISTRY)) {
    if (pattern.includes(":")) {
      const patternRegex = pattern.split("/").map((part) => part.startsWith(":") ? "([^/]+)" : part).join("/");
      const regex = new RegExp(`^${patternRegex}$`);
      if (regex.test(path)) {
        const params = parseRouteParams(pattern, path);
        return (state, route) => renderer(state, { ...route, params });
      }
    }
  }
  return null;
}
function getRoutePattern(path) {
  if (PAGE_REGISTRY[path]) {
    return path;
  }
  for (const pattern of Object.keys(PAGE_REGISTRY)) {
    if (pattern.includes(":")) {
      const patternRegex = pattern.split("/").map((part) => part.startsWith(":") ? "([^/]+)" : part).join("/");
      const regex = new RegExp(`^${patternRegex}$`);
      if (regex.test(path)) {
        return pattern;
      }
    }
  }
  return null;
}
let S = initState();
document.documentElement.dataset.theme = S.theme || "clay";
console.log("✓ Style Lab Arcade - Modularized Build");
console.log("✓ Services: Storage, Router, Navigator, Bootstrap");
console.log("✓ Pages: Registry with 11 routes");
console.log("✓ Audio System: Web Audio API, 19 themes, synthesizer");
console.log("✓ State initialized:", { theme: S.theme, sound: S.sound, volume: S.vol });
console.log("✓ Audio supported:", canPlayAudio());
window.S = S;
window.go = go;
window.save = () => save(S);
window.showToast = showToast;
window.esc = esc;
window.sfx = (event, arg) => sfx(event, arg, S);
function initializeNavigation() {
  const nav = document.querySelector("#nav");
  if (!nav) return;
  const navButtons = [
    { id: "nav-home", emoji: "🏠", label: "Home", path: "/home" },
    { id: "nav-explore", emoji: "🗺️", label: "Explore", path: "/explore" },
    { id: "nav-games", emoji: "👾", label: "Games", path: "/games" },
    { id: "nav-settings", emoji: "⚙️", label: "Settings", path: "/settings" },
    { id: "nav-profile", emoji: "👤", label: "Profile", path: "/profile" }
  ];
  nav.innerHTML = navButtons.map(
    (btn) => `
    <button id="${btn.id}" data-go="${btn.path}" style="display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 8px 1px; border-radius: var(--rs); font-size: 10px; font-weight: 800; color: var(--mute); background: transparent; border: none; cursor: pointer; text-align: center; flex: 1">
      <span style="font-size: 21px">${btn.emoji}</span>
      ${btn.label}
    </button>
  `
  ).join("");
  nav.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const path = btn.getAttribute("data-go");
      go(path);
    });
  });
}
const routeToNavId = {
  "/home": "nav-home",
  "/explore": "nav-explore",
  "/games": "nav-games",
  "/settings": "nav-settings",
  "/profile": "nav-profile"
};
function onRouteChange(route) {
  console.log("Route:", route.path);
  try {
    const renderer = getPageRenderer(route.path);
    if (!renderer) {
      console.warn("No renderer for route:", route.path);
      render(renderNotFound(S, route));
      setActiveNav(null);
      return;
    }
    const html = renderer(S, route);
    render(html);
    const routePattern = getRoutePattern(route.path);
    const baseRoute = route.path.split("/")[1] ? `/${route.path.split("/")[1]}` : route.path;
    setActiveNav(routeToNavId[baseRoute] || null);
    attachEventHandlers();
  } catch (error) {
    console.error("Error rendering page:", error);
    render(renderError(S, route, error));
    setActiveNav(null);
  }
}
function attachEventHandlers() {
  document.querySelectorAll("[data-go]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const path = btn.getAttribute("data-go");
      go(path);
    });
  });
  document.querySelectorAll('[data-act="changeTheme"]').forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const themeId = btn.getAttribute("data-theme");
      S.theme = themeId;
      document.documentElement.dataset.theme = themeId;
      save(S);
      sfx("tap", 0);
      showToast("Theme changed!");
      const route = parseRoute();
      onRouteChange(route);
    });
  });
  document.querySelectorAll('[data-act="toggleSound"]').forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      S.sound = !S.sound;
      save(S);
      sfx("tap", 0);
      showToast(S.sound ? "Sound on" : "Sound off");
    });
  });
  document.querySelectorAll('[data-act="changeVolume"]').forEach((input) => {
    input.addEventListener("input", (e) => {
      const value = parseInt(e.target.value) / 100;
      S.vol = Math.max(0, Math.min(1, value));
      const display = document.getElementById("volDisplay");
      if (display) display.textContent = Math.round(S.vol * 100) + "%";
      save(S);
    });
  });
  document.querySelectorAll('[data-act="resetProfile"]').forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (confirm("Are you sure you want to reset your profile? This will clear all progress.")) {
        const theme = S.theme;
        const sound = S.sound;
        const vol = S.vol;
        S = initState();
        S.theme = theme;
        S.sound = sound;
        S.vol = vol;
        save(S);
        window.S = S;
        showToast("Profile reset!");
        go("/home");
      }
    });
  });
  document.querySelectorAll('[data-act="saveName"]').forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const input = document.getElementById("playerName");
      if (input && input.value.trim()) {
        S.name = input.value.trim();
        save(S);
        showToast("Name saved!");
      }
    });
  });
}
initializeNavigation();
initRouter(onRouteChange);
