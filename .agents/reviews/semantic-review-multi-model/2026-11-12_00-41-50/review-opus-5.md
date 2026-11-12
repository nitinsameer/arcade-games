# Monolithic App Refactored into ES Modules with Vite — Missing Game Implementation and No Test Evidence

The feature/modularization branch refactors the arcade app from a single 178KB HTML file into an ES module structure with Vite bundling. Services (storage, router, navigator, bootstrap, audio) are extracted into dedicated modules. Games are declared as stubs and mapped to legacy implementations. CSS and themes are centralized. The build chain is updated to use Vite 5 and Capacitor 6.2. However, the modularization is architectural only—game logic remains entirely in legacy/games.js unmodified, and only a framework is introduced without evidence that it builds, runs, or passes any tests. The branch should have integrated at least the Simon game to prove the module-to-game lifecycle works end-to-end; without this, architectural correctness is unverified.

**Watch for:**
- **Game modules are shells with no implementation** (confirmed): Each game file contains only a 3-line wrapper delegating to legacy/games.js. The refactor claims to extract games into modules, but extraction means moving logic, not wrapping it. This is incomplete modularization.
- **No test evidence provided** (confirmed): No test results, no console output showing games launch, no APK testing proof, no regression verification for any of the 15 games.
- **Missing page renderers** (likely): Services exist but there's no code that connects them to render game screens, home, lessons, or themes. main.js initializes state and services but has no onRouteChange handler. The app has a router with no routes registered.
- **Legacy games.js is the actual system of record** (confirmed): The entire game logic is still in src/legacy/games.js (318 lines), untouched. All 15 games still live there, still share global scope, still have the original lifecycle issues the refactor was supposed to fix.
- **Build output structure broken or incomplete** (likely): www/ contains only 4 KB index.html and 53 bytes index.js—no app code. Vite built to www/ but emptyOutDir is false (config line), so old assets weren't cleared, suggesting build succeeded but output is not usable.
- **Unused audio/index.js placeholder** (confirmed): src/audio/index.js exports a no-op sfx() function. Real sfx.js exists but isn't wired into main.js or used by games.

**Verdict**: NEEDS_CHANGES — The refactor is architectural scaffolding only. Core modularization (moving game logic into modules and proving they integrate) is incomplete. No operational evidence (build, test, device run) is provided. Cannot merge without: (1) at least one game fully implemented in a module, (2) test evidence of app launching and a game running, (3) regression verification of all 15 games or clear plan for phased rollout.

---

## High-level view

The refactor introduces Vite as a bundler and ES modules to replace the monolithic HTML approach. Storage, router, navigator, and bootstrap services are cleanly extracted with documented APIs and single responsibilities—this architectural direction is sound. The audio subsystem (synthesizer, context, sfx) is complete and ready. Games are declared in a registry and mapped through a games/index.js aggregator, which is the right design.

However, the games themselves are unimplemented stubs wrapping legacy code. The refactor preserves all legacy game logic in src/legacy/games.js untouched, defeating the goal of extracting games into independent modules. A shell wrapper doesn't constitute extraction. Page renderers (home, game screens, lessons, themes UI) are missing entirely—only services exist; no code connects them to actually render anything. The router is initialized but has no routes registered and no handler that calls page renderers.

The build output is minimal: the bundled JS output exists in www/assets/ but the index.html loaded in www/ is only 4 KB and references asset paths that may not be correct. There is no evidence that Capacitor sync succeeds, that the APK builds, or that any game runs. The mission required Stage 4 regression verification (all 15 games individually tested); this branch provides no test results, no console logs, no device testing.

The refactor is a foundation: solid service extraction, correct module structure, sound registry pattern. But the house isn't built on it yet—only the frame and foundation.

---

<details>
<summary>Issues (6)</summary>

1. **Game logic not extracted into modules** — Game files are stubs; all logic remains in src/legacy/games.js. Each game module imports the legacy function and re-exports it. This is wrapping, not extraction. Move logic out of legacy/ and into individual game modules, or document phased rollout plan.

2. **No test results or operational evidence** — No console output, no test framework configured, no proof that app launches, no game tested on device. Mission Stage 4 required regression verification of all 15 games; this branch provides none. Run games and attach test results before merge.

3. **Page renderers not implemented** — Home screen, game view, settings, lesson pages, theme selector—no code exists. main.js has no onRouteChange handler; router has no registered routes. App cannot render anything. Add renderers or document plan.

4. **Router initialized but unused** — initRouter() called in main.js but no routes registered, no handler connects router to page renderers. Router is dead code. Either wire it to renderers or remove it from initialization.

5. **Build output incomplete or incorrect** — www/ contains only index.html (4 KB) and index.js (53 bytes). Vite built assets to www/assets/ but the main index.html may not reference them correctly. Verify www/ is the correct final artifact and test loading it in a browser.

6. **Audio not wired into app** — sfx.js is complete, but audio/index.js exports a no-op. main.js imports sfx directly but calls it without importing the required context and synthesizer modules. Audio will not play. Either wire audio fully or mark as Phase 2+ deferred work.

</details>

---

<details>
<summary>Details</summary>

### Game Modules Are Stubs, Not Extracted Logic

Each game file in src/games/ (simon.js, balloon.js, etc.) contains 3–10 lines. Simon is representative:

```javascript
export function simon(el) {
  return simonLegacy(el);
}
```

The simonLegacy function is imported from src/legacy/games.js, which is 318 lines of unmodified original code. This design satisfies the module registry structure—there is a games/index.js that can import and export all 15 games, and main.js can call startGame(gameId, element). But the actual game logic is still in legacy/games.js, and moving it there didn't move logic; it copied a reference.

The mission required "Extract each game into its own module" (Stage 2) and "Standardize: create, mount, pause, resume, destroy" (Stage 3). Extracting means moving logic, refactoring it to a clear lifecycle, and decoupling it from global scope. This refactor has not done that. The legacy games still use shared globals, timers, and event listeners. None of the lifecycle methods (pause, resume, destroy) exist in the module versions.

**Action:** Either move game logic from src/legacy/games.js into individual game modules and refactor to the standardized lifecycle, or document that game extraction is deferred to a follow-up phase. If deferred, update the acceptance criteria to reflect what's done (service extraction only) vs. what's not (game modularization).

### No Operational Evidence: Build, Test, Device Run

The mission required:

- Stage 4: "Verify all 15 games individually. Starting and finishing a game. Restarting a game. Scoring and best-score persistence. Navigation and back button. App background and resume. Offline gameplay. Repeated game sessions. No duplicate listeners or orphaned timers."
- Stage 5: "Capacitor synchronization. Android Gradle build. APK generation. Installation and launch test."

This branch provides none of these. There are no test results, no console logs showing games launching, no proof that npm run build completes without errors, no evidence that npx cap sync android succeeded, no APK artifact, no device test.

The www/ directory contains only 4 KB of index.html and 53 bytes of index.js. Vite should have compiled src/main.js and all imports into bundle files in www/assets/. The www/index.html references assets, but with no test evidence, it's unknown if those paths are correct or if the bundles load.

**Action:** Run the build locally, verify no errors. Test the bundled app in a browser (npm run preview or live server) and confirm at least one page renders. Verify that games/simon.js can be imported and simon() executes. Provide console output, screenshot, or video proof. Then test on device with Capacitor sync and APK.

### Page Renderers Do Not Exist

The monolithic www/index.html (before refactor) contained inline functions like `render_home()`, `render_game()`, `render_lessons()`, etc., and a click handler that called them. The refactor has stripped them out but provided no replacement.

src/main.js calls initRouter() and defines onRouteChange callback:

```javascript
function onRouteChange(route) {
  console.log('Route:', route.path)
  // This will be connected to page renderers in Phase 4+
}
```

But there is no Phase 4+. The route is logged and then nothing happens. No page is rendered. There are no page functions. The router exists but is inert.

Additionally, utils/dom.js exports render() and other DOM utilities, but render() is never called from main.js. DOM utilities without call sites are scaffolding.

**Action:** Create page renderers (or document phased rollout). Minimum: a home() renderer that shows the games list, and a gameScreen() renderer that loads and displays a game. Wire them to onRouteChange so navigation actually renders something.

### Game Module Imports Legacy Functions Without Lifecycle Refactoring

The games/simon.js file imports from src/legacy/games.js:

```javascript
import { simon as simonLegacy, setGameContext } from '../legacy/games.js';
```

But setGameContext is never called, and the legacy simon() function is invoked directly with only the element argument. The legacy implementation expects global scope (window.S, window.go, etc.), which does exist because main.js sets:

```javascript
window.S = S
window.go = navigator.go
window.save = () => save(S)
```

This is a bridge that works but couples games tightly to the global state object. If the goal was to extract games into modules with clear inputs/outputs, they should receive state as a parameter, not read from window.S. Games are now dependent on a global side effect.

The lack of lifecycle methods (pause, resume, destroy, cleanup) means timers and event listeners in legacy games are never cleaned up. Mission Stage 3 required "Ensure timers, event listeners, animation frames, audio resources and touch handlers are cleaned up correctly." This is not done.

**Action:** Refactor at least one game (e.g., simon) to accept state as a parameter, expose lifecycle methods (pause, resume, destroy), and ensure cleanup happens. Use it as a proof-of-concept for the remaining games.

### Build Output Incomplete or Asset Paths Incorrect

Vite config:

```javascript
export default defineConfig({
  root: './',
  build: {
    outDir: 'www',
    emptyOutDir: false,  // Preserve existing www/ assets
  },
});
```

The root is './', meaning Vite treats the project root as the source root and builds to www/. Typically, Vite bundles src/main.js and all dependencies into www/assets/index-[hash].js. The new www/index.html references:

```html
<script type="module" crossorigin src="/assets/index-r0kuDW7v.js"></script>
```

But without test evidence, it's unknown if this path is correct for Capacitor's WebView or if the bundle actually loads. Capacitor typically serves assets from android/app/src/main/assets/public/, and Capacitor's config points to webDir: 'www'. The sync should copy www/ to that path.

The size of the output (4 KB index.html) is suspiciously small. The original monolithic index.html was 178 KB. The refactored HTML is much smaller because styles and scripts are moved to Vite bundles. But 53 bytes for index.js (only a comment?) suggests it's not the actual bundled app.

**Action:** Verify that vite build produces the correct output. Check www/assets/ exists and contains compiled bundles. Test www/index.html locally with npm run preview. Confirm the bundled app loads in a browser and renders at least the home screen.

### Audio Is Incomplete and Not Imported in Main

The audio subsystem has three parts: src/audio/context.js (audio context singleton), src/audio/synthesizer.js (waveform synthesis), and src/audio/sfx.js (high-level API). The src/audio/index.js file is a placeholder that exports a no-op sfx():

```javascript
export function sfx(eventName, arg) {
  // Placeholder
}
```

main.js imports sfx directly from src/audio/sfx.js and exports it to window:

```javascript
import { sfx, canPlayAudio } from './audio/sfx.js'
...
window.sfx = (event, arg) => sfx(event, arg, S)
```

This actually works—games can call window.sfx() and audio will play (if the context and synthesizer are correct). However, src/audio/index.js is unused dead code, and the main export point (audio/index.js) is not the real implementation. This is confusing and unmaintainable.

src/audio/sfx.js imports context and synthesizer:

```javascript
import { getContext, isAudioSupported } from './context.js'
import { playTone, playNoise, playClick, playTick, playBend } from './synthesizer.js'
```

Both of these are new modules and haven't been tested with the refactored app. There's no evidence they work with the Vite build or that audio plays on device.

**Action:** Either wire audio fully (make audio/index.js the real export and remove placeholder) or document audio as Phase 2+ deferred work. Either way, test audio by building, loading www/index.html, and triggering a sound effect in a browser DevTools console.

### Missing Routes Registration

The router is initialized but has no routes registered. main.js calls:

```javascript
initRouter(onRouteChange);
```

And onRouteChange logs the route but does nothing else. There's no code that registers routes like:

```javascript
registerRoute('/home', homePage)
registerRoute('/game/:id', gameScreen)
```

The router functions (registerRoute, navigate, parseRoute) exist but are never used. Either remove router initialization or add route registration and handlers.

### Legacy Games Module Is Massive and Untouched

src/legacy/games.js is 318 lines of all 15 games' code, sharing globals, timers, and event listeners. It's the same code as the original monolithic app, just moved to a .js file. Refactoring goals included extracting this into separate modules and standardizing lifecycle. It's not done.

If the intent is to defer game extraction to a later phase, the acceptance criteria and documentation should state that clearly. If not, the work is incomplete.

</details>

---

<details>
<summary>File map</summary>

**Source structure (new):**
- src/main.js — App entry point, initializes state and services, exports window globals
- src/services/bootstrap.js — State initialization with defaults, validation, theme/volume setters
- src/services/storage.js — localStorage persistence wrapper
- src/services/router.js — Hash-based router with route registration and parsing
- src/services/navigator.js — Navigation helpers
- src/audio/context.js — Web Audio API context singleton
- src/audio/synthesizer.js — Waveform synthesis (tone, noise, click, tick, bend)
- src/audio/sfx.js — High-level sound effect API mapped to game events
- src/audio/soundThemes.js — 19 theme presets for audio
- src/games/registry.js — Game metadata (15 games: name, emoji, tint, description)
- src/games/index.js — Game aggregator, exports all game functions
- src/games/simon.js, balloon.js, etc. — Game wrappers (15 files, all stubs)
- src/legacy/games.js — Original monolithic game logic (unmodified)
- src/themes/index.js — All 19 theme CSS custom property sets
- src/utils/dom.js — DOM utility functions (query, render, class toggle, etc.)
- src/utils/sanitize.js — XSS protection via esc() function
- src/utils/constants.js — App constants (game IDs, theme names, etc.)
- vite.config.js — Vite bundler configuration
- index.html — Vite entry point (module script loads src/main.js)
- www/ — Build output (Vite compiled assets)

**Configuration & docs (new):**
- .kiro/ — Kiro agent definitions and steering documents
- .agents/ — Implementation phase reports and task documentation

**Diff summary:** 79 files changed, 15,527 insertions (+), 687 deletions (−). Old monolithic www/index.html (178 KB) replaced with modular src/ structure. Original games logic moved to src/legacy/games.js. Vite + Capacitor build chain added. Acceptance reports and phase deliverables included but no build/test evidence.

Full diff: `git diff main..feature/modularization`

</details>
