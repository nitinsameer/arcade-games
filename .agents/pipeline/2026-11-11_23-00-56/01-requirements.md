# Mission 001: Modularize Existing Arcade Application — Requirements Document

**Mission:** Refactor the monolithic arcade application into a maintainable modular JavaScript + Capacitor architecture.

**Status:** Requirements Phase  
**Date:** 2026-11-11  
**Repository:** nitinsameer/arcade-games  
**Target Branch:** feature/modularization (→ develop, never main)

---

## Executive Summary

The Style Lab application is a single-file HTML5 application (794 lines, ~50 KB) containing 15 games, 12 subjects, 19 themes, audio synthesis, and state persistence. This mission establishes a modular ES module architecture using Vite, with clear separation of concerns between bootstrap, navigation, audio, storage, and game logic—without rewriting games, changing functionality, or modifying the main branch.

**Key Constraint:** All existing functionality must remain identical to the user. This is a refactoring mission, not a redesign.

---

## Functional Requirements

### Requirement 1: Application Bootstrap & Navigation Module
**Requirement:** Extract application initialization, theme loading, and hash-based routing into standalone modules.

**Acceptance Criteria:**
- [ ] Create `src/bootstrap.js` module that initializes state, loads saved data, applies theme
- [ ] Create `src/router.js` module that handles hash-based routing (#/home, #/game/:id, #/lesson/:id)
- [ ] Create `src/navigator.js` module that renders navigation UI (bottom nav bar with 5 buttons)
- [ ] App launches to home screen (#/home) on cold start
- [ ] Theme persists across navigation
- [ ] Player name and progress restored from localStorage
- [ ] All hash routes resolve to correct page screens

### Requirement 2: Audio & Sound Effects Module
**Requirement:** Extract Web Audio API context, sound synthesis, and theme-aware sound effects into a reusable service.

**Acceptance Criteria:**
- [ ] Create `src/audio/synthesizer.js` with tone generation, noise generation, filter chains
- [ ] Create `src/audio/sfx.js` with all 16+ sound effect definitions (tap, correct, wrong, etc.)
- [ ] Create `src/audio/soundThemes.js` with theme-specific waveforms and parameters (SND object)
- [ ] `sfx(eventName)` function callable from any game module
- [ ] Audio context auto-resumes on iOS
- [ ] Sound effects respect S.sound flag and S.vol level
- [ ] No console errors when audio context unavailable
- [ ] All existing sound effects playable without behavior change

### Requirement 3: Storage & Persistence Module
**Requirement:** Extract localStorage handling and state management into a dedicated service.

**Acceptance Criteria:**
- [ ] Create `src/storage.js` module with state object (S) initialization and default values
- [ ] Create `save()` function that persists S to localStorage.claylearn as JSON
- [ ] Create `load()` function that restores S from localStorage with fallback to defaults
- [ ] Implement state validation: verify S has required fields (name, theme, gb, done, etc.)
- [ ] All state changes trigger save() automatically
- [ ] localStorage quota exceeded handled gracefully (silent fail, in-memory fallback)
- [ ] State schema migration support for future changes

### Requirement 4: Game Registry & Game Runner Module
**Requirement:** Extract game metadata (15 games) and game lifecycle management into standalone modules.

**Acceptance Criteria:**
- [ ] Create `src/games/registry.js` with GAMES array and game metadata
- [ ] Create `src/games/runner.js` with standardized game lifecycle: create → mount → pause → resume → destroy
- [ ] Create `src/games/index.js` re-export that loads all 15 game modules
- [ ] Game modules are independently importable
- [ ] Game runner enforces cleanup: clears timers, removes listeners, stops audio
- [ ] Game lifecycle supports mid-play pause/resume (for app backgrounding)
- [ ] No orphaned timers or event listeners after game ends

### Requirement 5: Game Modules (15 Games)
**Requirement:** Extract each of the 15 games into independent ES modules with consistent interface.

**Acceptance Criteria:**
- [ ] Create individual module per game: `src/games/singleplayer/simon.js`, `balloon.js`, etc. (9 total)
- [ ] Create individual module per game: `src/games/multiplayer/ticTacToe2p.js`, etc. (6 total)
- [ ] Each game exports `create(config)`, `mount(container)`, `pause()`, `resume()`, `destroy()` functions
- [ ] Game state isolated (no shared state except S.gb for high scores)
- [ ] All 15 games playable end-to-end with identical rules
- [ ] Game lifecycle cleanup prevents memory leaks
- [ ] Games work offline (no external dependencies)

### Requirement 6: Subject & Lesson Module
**Requirement:** Extract subject definitions, lesson flows, and quiz mechanics into organized modules.

**Acceptance Criteria:**
- [ ] Create `src/subjects/registry.js` with all 12 subjects (SUBJECTS array)
- [ ] Create `src/subjects/lessons.js` with lesson rendering logic
- [ ] Create `src/subjects/quiz.js` with quiz mechanics (question display, answer validation, scoring)
- [ ] Lessons flow: lesson content → quiz → score → next lesson unlock
- [ ] Quiz scoring consistent (correct +5 coins, perfect round +10 bonus)
- [ ] Progress tracking updates S.done and S.best
- [ ] All 12 subjects accessible and playable

### Requirement 7: Theme System Module
**Requirement:** Extract theme definitions and CSS variable system into a maintainable module.

**Acceptance Criteria:**
- [ ] Create `src/themes/registry.js` with all 19 themes and metadata
- [ ] Create `src/themes/css-variables.js` that exports theme token definitions
- [ ] Theme switching updates DOM dataset.theme and S.theme
- [ ] All 19 themes apply correctly (colors, shadows, typography)
- [ ] CSS-in-JS or CSS variable injection works without rewriting styles
- [ ] Theme persistence works across sessions

### Requirement 8: UI Components Module (Optional Extraction)
**Requirement:** If feasible, extract common UI patterns into reusable components.

**Acceptance Criteria:**
- [ ] Identify shared UI patterns (buttons, tiles, modals, progress bars)
- [ ] Create `src/ui/components.js` with reusable render functions
- [ ] Components remain simple functions (not a framework)
- [ ] No visual changes to existing UI

### Requirement 9: Build Configuration with Vite
**Requirement:** Introduce Vite as module bundler (dev & production builds), preserving existing web assets.

**Acceptance Criteria:**
- [ ] Create `vite.config.js` with dev server on port 5173
- [ ] Create entry point `src/main.js` that imports bootstrap and renders app
- [ ] `npm run dev` launches dev server with HMR
- [ ] `npm run build` outputs production bundle to `www/`
- [ ] Production build: single index.html + optimized JS (ES module bundling)
- [ ] All assets (fonts, images) included in build
- [ ] Capacitor sync still works (www/ is entry point)
- [ ] Build size monitored (target: <100 KB gzipped, currently ~50 KB)

### Requirement 10: Migration & Backwards Compatibility
**Requirement:** Ensure modularized app is 100% functionally identical to original.

**Acceptance Criteria:**
- [ ] No user-facing feature changes
- [ ] All 15 games identical behavior
- [ ] All 19 themes visually identical
- [ ] All 12 subjects with same progression
- [ ] High score persistence unchanged
- [ ] Audio system behaves identically (respects S.sound, S.vol)
- [ ] Offline mode unchanged (all assets local)
- [ ] localStorage data format compatible (or migration provided)

---

## Non-Functional Requirements

### Performance
- **Requirement:** Modularization must not degrade performance.
  - **Criteria:** App cold start within 2 seconds (measure current baseline before modularization)
  - **Criteria:** No layout thrashing or excessive reflows
  - **Criteria:** Bundle size ≤ 100 KB gzipped

### Maintainability
- **Requirement:** Code structure enables autonomous development and independent module updates.
  - **Criteria:** Game modules independently testable
  - **Criteria:** Clear ownership of shared services (audio, storage, navigation)
  - **Criteria:** Module dependencies documented in JSDoc

### Code Quality
- **Requirement:** Modularized code follows established conventions.
  - **Criteria:** Follow workspace coding conventions (camelCase, arrow functions, no semicolons)
  - **Criteria:** No console warnings or lint errors
  - **Criteria:** All user input sanitized (XSS protection)

### Compatibility
- **Requirement:** Android & web compatibility preserved.
  - **Criteria:** Capacitor sync succeeds (`npx cap sync android`)
  - **Criteria:** Android Gradle build succeeds
  - **Criteria:** APK installs and launches on Android 6.0+
  - **Criteria:** All games playable on mobile (480px max-width)

### Privacy & Compliance
- **Requirement:** No new permissions or data collection introduced.
  - **Criteria:** No new AndroidManifest.xml permissions
  - **Criteria:** No external API calls (except optional AdMob test IDs)
  - **Criteria:** COPPA-compliant (no third-party tracking)

---

## Acceptance Criteria

### Phase 1: Baseline (Documentation)
1. [ ] All 15 games identified, documented with lifecycle behavior
2. [ ] All shared globals documented (S object schema, SND, THEMES, SUBJECTS)
3. [ ] Lifecycle issues identified (timers, listeners, audio resources)
4. [ ] Baseline build metrics recorded (bundle size, cold-start time)
5. [ ] Baseline test evidence: all 15 games playable on device

### Phase 2: Modularization (Code Refactoring)
6. [ ] Vite build configured and running
7. [ ] Bootstrap module created and app initializes
8. [ ] Router module created, all routes working
9. [ ] Audio system extracted to modules, all sfx playable
10. [ ] Storage module created, state persists
11. [ ] Game registry extracted, game modules created (15 modules)
12. [ ] Subject & lesson modules extracted
13. [ ] Theme system extracted to modules
14. [ ] All modules have clear, documented interfaces

### Phase 3: Game Lifecycle (Standardization)
15. [ ] Game lifecycle functions defined: create, mount, pause, resume, destroy
16. [ ] All 15 games updated with lifecycle interface
17. [ ] Game cleanup tested: no orphaned timers/listeners after destroy
18. [ ] App background/resume handled (pause → resume cycle)

### Phase 4: Regression Testing (Verification)
19. [ ] All 15 games tested: start, play, finish
20. [ ] High scores persist and display correctly
21. [ ] All 19 themes apply without visual glitches
22. [ ] All 12 subjects accessible and playable
23. [ ] Navigation: back button, game quit, route changes
24. [ ] Offline gameplay works (no external dependencies)
25. [ ] localStorage quota handling tested
26. [ ] No console errors during extended play (1+ hour test)

### Phase 5: Android Build & Device Testing (Integration)
27. [ ] `npx cap sync android` succeeds
28. [ ] Gradle build succeeds: `./gradlew assembleDebug`
29. [ ] APK generated: android/app/build/outputs/apk/debug/app-debug.apk
30. [ ] APK size reasonable (>5 MB, <20 MB typical)
31. [ ] APK installs: `adb install -r app-debug.apk`
32. [ ] App launches on Android device
33. [ ] All 15 games playable on device
34. [ ] No device crashes or force-closes
35. [ ] Physical device test (if available)

### Phase 6: Quality Review (Code & Architecture)
36. [ ] Code review: module interfaces, error handling, state management
37. [ ] Architecture review: clear ownership, low coupling, high cohesion
38. [ ] Security review: no XSS, no data leaks, sanitized input
39. [ ] Accessibility review: focus visible, aria-labels present
40. [ ] Performance review: no regressions vs. baseline
41. [ ] Privacy review: no new permissions, no tracking

---

## Out of Scope

1. **Game Rewrites:** Games logic remains unchanged; no algorithmic improvements
2. **React/Vue Migration:** Vanilla JS only; no framework introduction
3. **Kotlin/Native Code:** Capacitor remains the Android bridge; no native modules
4. **Product Design Changes:** UI/UX identical to original
5. **New Features:** Only modularization; no new games, subjects, or themes
6. **Main Branch Modification:** All work on feature branch → develop, never main
7. **Play Store Submission:** No automated publishing; APK for manual upload
8. **Automated Testing Framework Setup:** If tests cannot run, report BLOCKED
9. **TypeScript Migration:** JavaScript only (current codebase)
10. **Backend Integration:** Offline-first only; no cloud sync

---

## Key Assumptions

1. **Vite is Appropriate:** Assumed Vite bundler is acceptable for this project (lightweight, Vue-agnostic, supports vanilla JS).
2. **localStorage is Sufficient:** Assuming no cloud backup required; local storage only.
3. **Single Build Output:** Assuming single www/index.html is acceptable (no code splitting for 15 games).
4. **No Breaking API Changes:** Assuming existing Capacitor + Android setup remains unchanged.
5. **Development Machine Available:** Assuming local build testing possible (Java 17, Gradle).
6. **Device Testing Optional:** Assuming if no physical device available, emulator or CI APK artifact is acceptable.

---

## Git & Delivery

- **Branch Name:** `feature/modularization`
- **Commits:** Atomic commits per module (bootstrap, audio, storage, games, subjects, themes, build)
- **PR Target:** `develop` (never main)
- **Commit Message Format:** `feat: [module name] — [change description]`
- **Max Iterations:** 3 fix-review cycles before escalation

---

## Success Metrics

| Metric | Baseline | Target | Evidence |
|--------|----------|--------|----------|
| Code Maintainability | Single 794-line file | 15+ independent game modules | Module count, LOC per module |
| Test Coverage | 0% (no framework) | N/A (manual tests documented) | Test checklist passed |
| Performance | Cold start time | No regression | Stopwatch measurement |
| Bundle Size | ~50 KB | ≤ 100 KB gzipped | npm run build output |
| Device Compatibility | Android 6.0+ | Unchanged | Device test log |
| Regression Rate | 0/15 games broken | 0/15 games broken | Game playtest matrix |

---

## Definitions

- **Game Lifecycle:** create (init state) → mount (render UI) → pause (background) → resume (foreground) → destroy (cleanup)
- **Monolithic:** All code in single HTML file; no modules
- **Modular:** Code split into independent JS modules with clear interfaces
- **Regression:** Unintended behavior change in existing functionality
- **PASS/FAIL/BLOCKED/NOT APPLICABLE:** Outcome states for acceptance criteria (per workspace rules)

---

## Next Steps

1. **Design Phase** — Architect module structure, identify dependencies, propose build config
2. **Implementation Phase** — Develop modules in order: bootstrap → audio → storage → games → themes → build
3. **QA Phase** — Execute regression tests, device testing, Android build
4. **Review Phase** — Code review, architecture review, security audit
5. **Delivery** — Final report, PR creation, approval handoff

---

**Document Version:** 1.0  
**Last Updated:** 2026-11-11 23:07 UTC  
**Author:** Requirements Analyst  
**Approved By:** (pending)
