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
function addClass(el, cls) {
  const elem = typeof el === "string" ? $(el) : el;
  if (elem) elem.classList.add(cls);
}
function removeClass(el, cls) {
  const elem = typeof el === "string" ? $(el) : el;
  if (elem) elem.classList.remove(cls);
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
let S = initState();
document.documentElement.dataset.theme = S.theme || "clay";
console.log("✓ Style Lab Arcade - Modularized Build");
console.log("✓ Services: Storage, Router, Navigator, Bootstrap");
console.log("✓ Audio System: Web Audio API, 19 themes, synthesizer");
console.log("✓ State initialized:", { theme: S.theme, sound: S.sound, volume: S.vol });
console.log("✓ Audio supported:", canPlayAudio());
window.S = S;
window.go = go;
window.save = () => save(S);
window.showToast = showToast;
window.esc = esc;
window.sfx = (event, arg) => sfx(event, arg, S);
function onRouteChange(route) {
  console.log("Route:", route.path);
}
initRouter(onRouteChange);
