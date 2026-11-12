# Final consolidated issues report — Arcade Games modularization (feature/modularization)

Issues are sorted from highest to lowest combined importance/confidence.

---

## 1. No operational evidence: build, test, device verification

**Severity: High**

- **User impact:** Cannot deploy. The refactored code has never been executed or tested. There is no proof that the app builds, renders, runs a game, or works on device. Acceptance gates require evidence of build success, APK generation, device installation, and gameplay regression testing—none exist.
- **Issue:** Mission Stage 4 requires regression verification of all 15 games (starting, finishing, restarting, scoring, persistence, navigation, background/resume, offline play, repeated sessions, no orphaned listeners). Stage 5 requires Capacitor sync, Gradle build, APK generation, and installation test. This branch provides no console output, test results, device logs, APK artifact, or gameplay evidence. The www/ directory shows only 4 KB index.html and 53 bytes index.js (suggesting incomplete Vite compilation). No npm run build output, no npx cap sync logs, no device test.
- **Recommendation:** Execute full build pipeline locally: (1) npm run build and verify no errors; (2) check www/assets/ contains compiled bundles; (3) npm run preview and confirm app renders a page (home, games, or any screen) in browser; (4) execute npx cap sync android and verify success; (5) build APK with ./gradlew assembleDebug; (6) install and launch on device or emulator; (7) test at least one game end-to-end (start, play, finish, verify score persisted). Attach console logs, screenshots, and device test evidence before merge request.

## 2. Game lifecycle functions missing — timers and listeners leak on quit

**Severity: High** · *(cluster: game integration — see also #3, #4)*

- **User impact:** Games leave orphaned timers and event listeners running after the player quits or navigates away. Repeated play sessions attach duplicate listeners, causing performance degradation, audio conflicts, and unpredictable state. The app becomes increasingly unstable the longer it runs.
- **Issue:** Game wrapper modules (src/games/simon.js, balloon.js, etc.) export only single-function delegations to legacy implementations. The legacy code (src/legacy/games.js) sets up timers and event listeners and provides cleanup functions on completion. Wrappers do not expose these cleanup functions, so the game runner has no way to call destroy/pause/resume/cleanup. When players quit or navigate away mid-game, timers keep running off-screen and event listeners remain attached. Mission Stage 3 required standardized lifecycle (create, mount, pause, resume, destroy) with cleanup verification; this is not implemented.
- **Recommendation:** Add lifecycle functions to each game wrapper: export destroy(), pause(), resume(), create() that call the corresponding cleanup functions from legacy implementations. Ensure cleanup is called when router navigates away from game screen. Example: simon.js should export both the game function and a destroy() that clears timers. Wire game runner to call destroy() on quit or route change before rendering next screen.

## 3. Context injection missing from game wrappers — high scores and audio fail silently

**Severity: High** · *(cluster: game integration — see also #2, #4)*

- **User impact:** High scores do not save. Sound effects do not play. Games function but provide no feedback and make no progress. Players experience a broken game.
- **Issue:** Game wrappers (src/games/*.js) import legacy game functions but never initialize the context those functions expect. Legacy code reads `globalState` and `globalSfx` variables (set via setGameContext()) to update high scores in S.gb and play audio. Wrappers don't call setGameContext(); both globalState and globalSfx remain undefined. High score reads return 0 (fallback), and audio calls silently fail. The wrappers rely on global scope (window.S, window.sfx) set in main.js, which creates coupling and fragile integration.
- **Recommendation:** Call setGameContext(S, sfx) in each game wrapper before delegating to the legacy function. Verify that S is passed as state and sfx callback is wired correctly. Alternatively, refactor legacy game functions to accept state and sfx as parameters instead of reading from globals, making them pure functions. Either approach eliminates silent failures and makes game integration explicit.

## 4. Page renderers not implemented — app cannot render any screen

**Severity: High** · *(cluster: game integration — see also #2, #3)*

- **User impact:** App initializes but shows nothing. No home screen, no games list, no settings, no theme selector, no lesson pages. The app is a blank shell. Players cannot navigate or play.
- **Issue:** The monolithic www/index.html contained page renderer functions (render_home, render_game, render_lessons, render_settings, etc.) and a click handler that called them. The refactor removed these functions and provided no ES module replacements. main.js initializes router and defines onRouteChange callback, but onRouteChange only logs the route and does nothing else. There is no code that renders home screen, game view, lessons, settings, or theme selector. Router is dead code—initialized but not wired to renderers.
- **Recommendation:** Create page renderer functions: home(), gameScreen(), lessonsView(), settingsView(), themeSelector(). Wire onRouteChange callback to call the appropriate renderer based on route.path. Test at minimum: home() renders the games list, gameScreen('/game/:id') loads and renders a game. Alternatively, document page renderers as Phase 2+ deferred work and adjust acceptance criteria to reflect service extraction only (no UI rendering).

## 5. Game logic not extracted into modules — remains in legacy/games.js

**Severity: High**

- **User impact:** The 15 games still share global scope, timers, and event listeners from the original monolithic code. They cannot be independently developed, tested, or maintained. The modularization architecture is built around empty stubs; the actual system of record is still the monolithic legacy file.
- **Issue:** Game modules (src/games/simon.js, src/games/balloon.js, etc.) are 3–10 line wrappers that import a legacy function and re-export it unchanged. The actual game logic—all 318 lines covering all 15 games—remains in src/legacy/games.js exactly as it was in the original monolithic HTML. Extraction means moving logic from legacy/ into individual modules and refactoring to a clear lifecycle (create, mount, pause, resume, destroy). This refactor wraps, not extracts. Mission Stage 2 required "Extract each game into its own module." This is not done.
- **Recommendation:** Move game logic from src/legacy/games.js into individual game modules (src/games/simon.js, src/games/balloon.js, etc.), one game per file. Refactor each game to export lifecycle functions (create, mount, pause, resume, destroy). Accept state and sfx callback as parameters instead of reading from globals. Test one game end-to-end as proof-of-concept. Alternatively, document game extraction as deferred Phase 2+ work and update acceptance criteria to reflect that the current stage is service extraction only (storage, router, audio services) and game modularization is planned for follow-up.

## 6. Vite build end-to-end verification missing — no evidence build succeeds or output is correct

**Severity: High**

- **User impact:** Cannot confirm the bundled app is valid or compatible with Capacitor. Build may have failed silently or produced incorrect output. Device deployment is unknown.
- **Issue:** The diff includes vite.config.js and source modules but no evidence that npm run build has been executed, that www/ contains correct bundled assets, or that npx cap sync android succeeded. The www/ directory shows only index.html (4 KB) and index.js (53 bytes)—suspiciously small. Vite should bundle src/main.js and all dependencies into compiled files in www/assets/. The output size and lack of test evidence suggests build may not have completed correctly. Vite config includes emptyOutDir: false, preserving old assets, which could mask build failures.
- **Recommendation:** Execute npm run build locally and verify no errors in console output. Check www/assets/ directory for compiled JavaScript and CSS bundles (should be >50 KB). Test www/index.html locally with npm run preview or live server and confirm app loads in browser. Verify Capacitor sync: npx cap sync android and check output logs. If all succeed, provide build logs and screenshot as evidence. If build fails, fix Vite config or source issues and re-run.

## 7. Audio context lifecycle incomplete — no pause/resume hooks for Web Audio API

**Severity: Medium**

- **User impact:** On Android, audio context may drain battery when app is backgrounded. Other apps may be unable to play audio while this app's context is active. Audio may not resume correctly when app returns to foreground.
- **Issue:** The audio system (src/audio/context.js, synthesizer.js, sfx.js) is well-structured and complete, but lacks lifecycle hooks to suspend/resume the Web Audio API context when app backgrounds or returns to foreground. The context is initialized once and never managed after. Capacitor provides pauseResume events; Vite-based apps should listen for app blur/focus events. Without lifecycle management, the context remains active indefinitely, consuming battery and potentially blocking other app audio.
- **Recommendation:** Add pause() and resume() functions to src/audio/context.js that call context.suspend() and context.resume(). Wire these to Capacitor's pauseResume event (or window blur/focus events). Call pause on app background, resume on foreground. Test by launching app, playing a sound, backgrounding app, and confirming context suspends. Resume to foreground and verify audio plays again.

## 8. Router initialized but no routes registered — router is dead code

**Severity: Medium**

- **User impact:** Navigation is incomplete. The router is set up but unused, creating confusion and maintenance burden.
- **Issue:** main.js calls initRouter(onRouteChange) and defines onRouteChange callback that logs the route, but no routes are registered. The router module provides registerRoute() and parseRoute() functions but neither is called from main.js. Routes are never mapped to page renderers. The router is scaffolding with no functionality.
- **Recommendation:** Either register routes in main.js (registerRoute('/home', homePage); registerRoute('/game/:id', gameScreen); etc.) or document the router as Phase 2+ deferred work and remove router initialization from main.js until renderers exist.

## 9. State persistence call sites not audited — possible silent failures

**Severity: Medium**

- **User impact:** Progress may not persist. Players complete lessons, earn coins, or unlock themes, but on restart the app shows no progress.
- **Issue:** The storage module (src/services/storage.js) provides save(state) and load(defaultState) functions with proper error handling. However, the diff does not show all call sites where game completion updates S.gb or lessons update S.done. Without confirming save(S) is called immediately after every mutation, progress silently fails to persist. Some state changes (scoring a game, completing a lesson) may be missing save() calls or may bypass persistence entirely.
- **Recommendation:** Search codebase for all locations where S is mutated (game completion, lesson progression, coin earning, theme purchase, profile reset). Add save(S) call immediately after each mutation. Add JSDoc comment `@mutates S` to document side effects. Run full game session (play a game, check high score persisted after restart; complete a lesson, verify progress persisted) to confirm end-to-end.

## 10. Build output structure incomplete — www/ may not be ready for Capacitor

**Severity: Medium**

- **User impact:** Capacitor sync may fail or produce incorrect APK. App may not launch on device due to missing assets or incorrect paths.
- **Issue:** Vite is configured to output to www/, and Vite config includes emptyOutDir: false to preserve existing assets. This can mask build issues if old assets aren't cleared. The output www/assets/ should contain compiled bundles (index-[hash].js, styles-[hash].css), but the diff shows www/index.html (4 KB) and www/index.js (53 bytes), which is incomplete. No verification that www/index.html correctly references asset paths for Capacitor's WebView or that fonts and CSS custom properties are included in the build.
- **Recommendation:** Verify Vite build output manually: (1) delete www/ entirely; (2) run npm run build; (3) check www/ is recreated with index.html (should be >50 KB), www/assets/ containing bundles, and all fonts/CSS present. (4) Test www/index.html loads correctly in browser locally. (5) Run npx cap sync android and verify www/ is copied to android/app/src/main/assets/public/ correctly. Provide build directory listing as evidence.

## 11. Audio module exports placeholder—implementation unclear

**Severity: Low** · *(cluster: audio wiring — see also #7)*

- **User impact:** Dead code in codebase creates confusion. Audio implementation may be complete but export point is unclear.
- **Issue:** src/audio/index.js exports a no-op placeholder sfx() function, but the real implementation is in src/audio/sfx.js. main.js imports sfx directly from sfx.js and re-exports to window, bypassing the placeholder. The intended export point is unclear, and the placeholder is unused dead code.
- **Recommendation:** Either remove src/audio/index.js and import sfx directly from src/audio/sfx.js in main.js, or make audio/index.js the real export point by moving sfx.js logic there. Choose one approach and remove dead code.

## 12. DOM utilities exported but call sites missing

**Severity: Low**

- **User impact:** Unmaintainable code. Utility functions exist but are never used, cluttering the codebase.
- **Issue:** src/utils/dom.js exports render() and other DOM utilities, but these are never called from main.js or page renderers (which don't exist). These utilities are scaffolding without purpose.
- **Recommendation:** Remove unused utilities or document their intended use in page renderers (Phase 2+). Once page renderers are implemented, call these utilities from there.
