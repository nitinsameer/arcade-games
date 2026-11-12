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
let S = initState();
document.documentElement.dataset.theme = S.theme || "clay";
console.log("✓ Style Lab Arcade - Modularized Build");
console.log("✓ Services: Storage, Router, Navigator, Bootstrap");
console.log("✓ State initialized:", { theme: S.theme, sound: S.sound, volume: S.vol });
window.S = S;
window.go = go;
window.save = () => save(S);
window.showToast = showToast;
window.esc = esc;
function onRouteChange(route) {
  console.log("Route:", route.path);
}
initRouter(onRouteChange);
