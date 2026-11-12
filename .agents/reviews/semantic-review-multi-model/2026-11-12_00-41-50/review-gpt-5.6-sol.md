# Semantic Code Review: Arcade Games Modularization

**Target:** feature/modularization branch  
**Base:** main  
**Files Changed:** 79 (new src/ modules, updated build config, docs)  
**Diff Size:** 16,713 lines  
**Generated:** 2026-11-12  

---

## Summary

The feature/modularization branch refactors the monolithic 705-line `www/index.html` into a structured ES module architecture using Vite, extracting bootstrap, router, audio services, and all 15 games into independent modules while preserving exact functional behavior. The refactoring introduces clear ownership boundaries: audio synthesis lives in `src/audio/`, games are wrapped in `src/games/`, storage is isolated in `src/storage.js`, and the build pipeline is transparent via `vite.config.js`. 

**Watch for:** (1) **Game lifecycle incomplete** — wrapper modules delegate to legacy implementations without exposing cleanup functions; timers and listeners leak on quit. (2) **Context injection missing** — game wrappers don't initialize `globalState` and `globalSfx` that legacy games expect; high scores and sounds fail silently. (3) **Audio context lifecycle missing** — no pause/resume hooks for Web Audio API when app backgrounds. (4) **Build verification gap** — no evidence of successful `npm run build` or `npx cap sync android`.

**Verdict**: NEEDS_CHANGES

---

## High-level View

The modularization succeeds in separating concerns. The state object `S` is now managed through a storage module with validation, audio synthesis is isolated into context/synthesizer/soundThemes, and each of the 15 games is wrapped in its own module. The structure is clear and maintainable.

However, the game wrapper layer is incomplete. Wrappers delegate to legacy implementations but don't expose lifecycle functions (destroy, pause, resume). Without these, games cannot clean up timers or event listeners, creating orphaned resources when players quit. This violates the stated design and conflicts with workspace acceptance gates requiring cleanup verification.

Additionally, wrappers don't initialize the context that legacy games expect. The legacy code uses `globalState` and `globalSfx` variables set via `setGameContext()`, but none of the wrappers call this function. High scores won't load (silently return 0) and sounds won't play (silently disabled).

The audio system extraction is well-structured but lacks lifecycle management. The Web Audio API context should suspend/resume when the app backgrounds to prevent battery drain and resource conflicts on mobile.

Build verification is missing. The diff shows vite.config.js and source structure but no evidence of a successful `npm run build` producing `www/index.html`, or testing that the bundled output works with `npx cap sync android`.

---

## Issues

<details>
<summary>Issues (6)</summary>

1. **Game lifecycle functions missing** — Each game wrapper (simon.js, balloon.js, etc.) only delegates to legacy functions without exposing `destroy()`, `pause()`, `resume()`, or `create()` exports. Timers and event listeners from legacy games are not cleaned up on quit, violating game lifecycle design and acceptance gate requirements.

2. **Context injection missing from game wrappers** — Game wrappers don't call `setGameContext(S, sfx)` before delegating to legacy functions. Legacy code reads `globalState` and `globalSfx` to update high scores and play audio, so both fail silently with `globalState` undefined.

3. **Audio context cleanup on app pause/resume** — No lifecycle hooks to suspend/resume the Web Audio API context when app backgrounds or returns. Can result in battery drain and audio conflicts on mobile.

4. **Vite build end-to-end verification gap** — The diff includes vite.config.js and source modules but no evidence of a successful `npm run build` producing `www/index.html`, or testing that the bundled output works with Capacitor. Build output must be verified before device testing.

5. **State persistence call sites not audited** — Storage module is well-designed, but the diff doesn't show all call sites where game completion updates `S.gb` or lessons update `S.done`. Without confirming `save(S)` is called after mutations, progress silently fails to persist.

6. **Router module incomplete in diff** — `src/services/router.js` is 77 lines but content not visible in excerpt. Route parameter parsing, screen rendering, and page cleanup functions are unclear.

</details>

---

<details>
<summary>Details</summary>

### Game Lifecycle and Cleanup

Games are wrapped in individual modules (src/games/simon.js, balloon.js, etc.) but wrappers are function-only delegations to legacy implementations in src/legacy/games.js. The legacy functions set up timers and event listeners that return cleanup functions on completion. When a player quits, the wrapper returns immediately without calling cleanup. Timers keep running off-screen, event listeners remain attached, and repeating the game attaches duplicate listeners.

The legacy simon includes:
```javascript
const later = (f, ms) => { tm.push(setTimeout(f, ms)) };
return () => tm.forEach(clearTimeout);
```

But the wrapper doesn't expose this cleanup:
```javascript
export function simon(el) {
  return simonLegacy(el);
}
```

The design specifies `create → mount → pause → resume → destroy`, but wrappers export only single functions. The game runner has no way to call cleanup without explicit lifecycle functions.

**Confirmed.** Game wrappers export only function delegations, no lifecycle API.

---

### Context Injection Missing

Game wrappers import legacy functions but don't initialize the context they expect. The legacy module defines `globalState` and `globalSfx` set via `setGameContext(state, sfxFn)`. None of the wrappers call this. Looking at the legacy code:

```javascript
const gb = (id) => globalState?.gb?.[id] || 0;
const sfx = (ev, arg) => { if (globalSfx) globalSfx(ev, arg); };
```

If `globalState` is undefined, `gb(gameId)` silently returns 0 (high score treated as 0). If `globalSfx` is undefined, sounds are disabled. Wrappers must call `setGameContext(S, sfx)` before delegating to the legacy function.

**Confirmed.** Game wrappers do not initialize context.

---

### Audio Context Lifecycle

The audio system is well-modularized into context.js, synthesizer.js, soundThemes.js, and sfx.js. The context.js module initializes a single Web Audio API AudioContext on first call and caches it.

However, there are no lifecycle hooks to suspend/resume the context when the app backgrounds or returns to foreground (Capacitor pauseResume events, or browser blur/focus). Leaving an AudioContext running indefinitely can drain battery on mobile devices and may prevent other apps' audio from playing correctly.

**Likely.** Code paths through Capacitor lifecycle (pause/resume) are not in this diff, so context lifecycle is not addressed.

---

### Vite Build End-to-End

The diff includes vite.config.js with output to `www/` directory, which is correct for Capacitor compatibility. However, no evidence exists that `npm run build` has been executed or that the output `www/index.html` is correct. The build process must:

1. Bundle all modules in src/ into JavaScript file
2. Generate www/index.html with correct script tags
3. Include fonts and CSS custom properties
4. Test that `npx cap sync android` sees the updated www/

Without execution evidence (build log, APK artifact, device test), it's possible the Vite output is malformed or incompatible with Capacitor.

**Confirmed.** No build execution evidence in this diff.

---

### State Persistence Call Sites

The storage module (src/services/storage.js) provides `save(state)` and `load(defaultState)` with proper error handling. The bootstrap module calls `initState()` to load and validate state.

However, the diff doesn't show all call sites that trigger `save()`. Some state mutations (game best scores updating `S.gb`, lessons updating `S.done`) are not visible in the diff. It's possible these mutations bypass `save()`, leading to silent persistence failures where progress is lost on app restart.

**Likely.** Call sites not fully visible in diff; coverage unclear.

---

### Router Module Incomplete

The diff shows `src/services/router.js` with 77 lines, but content is not visible in the excerpt. Requirements state it must parse hash routes (#/home, #/game/:id, #/lesson/:id), render screens, and manage lifecycle. Without seeing the implementation, it's unclear whether routes are fully handled and cleanup is enforced during transitions.

**Possible.** Content not visible in truncated diff.

</details>

---

## File Map

<details>
<summary>Changed files and directory structure</summary>

**New Source Modules:**
- `src/main.js` — Entry point, initializes state and router
- `src/services/bootstrap.js` — State initialization, theme loading
- `src/services/router.js` — Hash-based routing (shell, incomplete)
- `src/services/navigator.js` — Bottom nav bar rendering and navigation
- `src/services/storage.js` — localStorage wrapper, state validation
- `src/audio/context.js` — Web Audio API context lifecycle
- `src/audio/synthesizer.js` — Tone and noise generation
- `src/audio/soundThemes.js` — Theme-specific audio presets (19 themes)
- `src/audio/sfx.js` — Sound effect definitions
- `src/audio/index.js` — Audio module re-export
- `src/games/index.js` — Game module aggregator and exports
- `src/games/registry.js` — GAMES array metadata (15 games)
- `src/games/utils.js` — Shared game utility functions (shuffle, escape, etc.)
- `src/games/simon.js`, `balloon.js`, `scramble.js`, ... (15 game wrappers total)
- `src/legacy/games.js` — Original game implementations extracted from monolithic HTML (318 lines, untouched behavior)
- `src/subjects/index.js` — Subject and lesson re-exports
- `src/themes/index.js` — All 19 theme definitions with CSS variables (538 lines)
- `src/utils/constants.js`, `dom.js`, `sanitize.js`, `shuffle.js` — Utility functions

**Build Configuration:**
- `vite.config.js` — Vite bundler configuration (output to www/)
- `package.json` — Updated with Vite dev dependencies, build scripts
- `index.html` — New Vite entry point (replaces old www/index.html)

**Documentation:**
- `.kiro/steering/` — Workspace architecture guides (6 new files, read-only reference)
- `.kiro/agents/` — Agent role definitions (7 new files, read-only reference)
- `.agents/tasks/mission-001-modularization/` — Detailed phase reports and acceptance criteria (9 new files, planning artifacts)
- `.agents/pipeline/` — Baseline, design, and review documents (planning documents)

**Original Assets Preserved:**
- `.agents/original-index.html` — Backup of original monolithic HTML for reference
- `www/assets/` — Vite-generated bundle output (index.js + CSS + maps)
- `www/index.html` — Production output (generated by Vite, reduced from 705 to 694 lines due to modularization)

**Full diff:** See `.agents/reviews/semantic-review-multi-model/2026-11-12_00-41-50/full_diff.txt`

</details>

---

## Recommendations

1. **Add game lifecycle functions** — Update each game wrapper to export `destroy()`, `pause()`, `resume()`, `create()` that properly call legacy cleanup functions and manage timer/listener lifecycle.

2. **Initialize game context** — In each wrapper, call `setGameContext(S, sfx)` before delegating to legacy function to ensure state and audio are properly injected.

3. **Add audio context pause/resume** — Hook Capacitor's pauseResume event (or browser blur/focus) to suspend and resume Web Audio API context to prevent battery drain on mobile.

4. **Execute and verify build** — Run `npm run build` locally and confirm www/index.html is correct, fonts included, and CSS preserved. Test `npx cap sync android` and APK generation before merging.

5. **Audit state mutation call sites** — Review all locations where S is mutated (game completion, lesson progression) to ensure `save(S)` is called immediately after. Add `@mutates S` JSDoc comments for clarity.

6. **Add cleanup to router navigation** — When router transitions away from game screen, ensure game's destroy() is called before next screen renders.

---

## Confidence Qualifiers

- **Game lifecycle incomplete:** **confirmed** — game wrappers provide only single-function exports, no destroy/pause/resume.
- **Context injection missing:** **confirmed** — game wrappers don't call setGameContext; high scores and sounds fail silently.
- **Audio context lifecycle missing:** **likely** — no pause/resume code visible; Capacitor integration deferred.
- **Vite build verification gap:** **confirmed** — no build execution or Capacitor sync testing visible.
- **State persistence call sites:** **likely** — call sites not fully visible in diff; coverage unclear.
- **Router module incomplete:** **possible** — content not visible in truncated diff.

