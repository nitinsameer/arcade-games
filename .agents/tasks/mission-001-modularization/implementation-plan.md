# Mission 001: Modularize Arcade Application — Implementation Plan

**Task ID:** mission-001-modularization  
**Workflow:** overnight-delivery  
**Design Reference:** Design v2.0 (02-design.md)  
**Repository:** nitinsameer/arcade-games  
**Target Branch:** feature/modularization (never merge to main)  
**Baseline Build:** www/index.html (794 lines, ~50 KB monolithic)  
**Output Target:** www/index.html (Vite-bundled), ES modules in src/

---

## Executive Summary

This plan executes Mission 001 as a phased refactor of the monolithic Style Lab arcade application into maintainable ES modules with Vite bundler. All 15 games, 19 themes, 12 subjects, and user data preservation are **non-negotiable**. The work is structured into 9 phases (Baseline → Integration → Testing → Android Build), each leaving the codebase in a buildable state. Estimated effort: 19 hours over 3 days with parallel QA/review cycles.

**Quality Gates:**
- ✅ All 15 games playable without errors
- ✅ All 19 themes apply correctly
- ✅ All 12 subjects + lessons unlock properly
- ✅ User progress persists across sessions
- ✅ Android Gradle build succeeds
- ✅ APK installs and launches on device
- ✅ Zero regression failures
- ✅ Zero critical defects

---

## Pre-Implementation Checklist

### Prerequisites Verification
- [ ] Node.js 20+ installed: `node --version` (target: v20.x)
- [ ] npm 10+ installed: `npm --version`
- [ ] Java 17 installed: `java -version` (for Gradle)
- [ ] Git worktree clean: `git status` (no uncommitted changes)
- [ ] Internet access: Can download npm packages
- [ ] 2+ GB free disk space (node_modules, android/)

### Approval Gate (MUST READ)
- [ ] **Design v2.0 reviewed and approved**
- [ ] **All 15 games identified and playable** (baseline test completed)
- [ ] **15-game preservation requirement understood** (no game rewrites)
- [ ] **No production behavior changes** during refactoring
- [ ] **Scope constraints accepted:** Vite only, no React/Kotlin, single www/index.html output

---

# PHASE 0: BASELINE TESTING (3 hours)

**Objective:** Establish regression baseline by playtesting all 15 games in the monolithic build. Document game behavior, scoring, highscore persistence, and identify any pre-existing issues.

**Acceptance Criterion:** A complete Baseline Test Report documenting all 15 games as PASS or identifying blockers.

---

## Phase 0a: Baseline Environment Setup

- [ ] **Step 1: Install Dependencies & Verify Build**
  - Run: `npm install` in repository root
  - Verify: `npm list @capacitor/core` shows version 6.2.0
  - Expected: All packages installed without errors
  - Output: `node_modules/` directory present with all 4 dependencies
  
- [ ] **Step 2: Open Monolithic App in Browser**
  - Open `www/index.html` in Chrome (or Firefox) using local file:// URL or `npx http-server www`
  - Navigate to `http://localhost:8080/` if using http-server
  - Expected: App loads without console errors
  - Output: Home screen visible with "Style Lab" header, profile section, subject list, themes visible

- [ ] **Step 3: Verify Current Build System**
  - Check `package.json` for build scripts (currently none)
  - Note: Current build is manual (no webpack/Vite), served as-is by Capacitor
  - Document in baseline report: "No build system in place; Vite will be introduced"
  - Output: Baseline report section on current build state

---

## Phase 0b: Game Registry Documentation

- [ ] **Step 4: Extract Game Registry from index.html**
  - Find `const GAMES = [...]` in www/index.html (line ~450–650)
  - Document all 15 games in a spreadsheet or markdown:
    | ID | Name | Emoji | Tint | Type (1P/2P) | Playable (Y/N) | Notes |
    |----|------|-------|------|-----|-----|-------|
    
  - Expected: All 15 games listed with metadata confirmed
  - Output: `baseline-game-registry.md` with complete table

---

## Phase 0c: Game Playthrough Checklist

**For each of 15 games, perform this sequence:**

- [ ] **Step 5: Single-Player Games (9 games)**

  **Simon:**
  - [ ] Launch from home screen (click Simon tile)
  - [ ] Sequence plays (visual + audio feedback)
  - [ ] Repeat 2–3 rounds
  - [ ] Quit game
  - [ ] **Verify:** Highscore saved (visible in game screen)
  - [ ] **Verify:** No console errors
  - [ ] **Verify:** Sequence length increments each round
  - [ ] **Verify:** Wrong sequence ends game
  - [ ] **Status:** PASS/FAIL + notes

  **Whack-a-Mole:**
  - [ ] Launch from home screen
  - [ ] Tap moles as they pop up for 30 seconds
  - [ ] Note final score
  - [ ] Quit game
  - [ ] **Verify:** Score saved as highscore
  - [ ] **Verify:** Moles appear randomly
  - [ ] **Verify:** Taps register correctly
  - [ ] **Status:** PASS/FAIL + notes

  **Typing/Spell Game:**
  - [ ] Launch from home screen
  - [ ] Type letters when prompted
  - [ ] Complete a round
  - [ ] **Verify:** Keyboard input recognized
  - [ ] **Verify:** Score increments
  - [ ] **Status:** PASS/FAIL + notes

  **Word Slots (Hangman):**
  - [ ] Launch from home screen
  - [ ] Guess 3–5 letters
  - [ ] Complete or fail round
  - [ ] **Verify:** Guesses register
  - [ ] **Verify:** Score updates
  - [ ] **Status:** PASS/FAIL + notes

  **Quiz Flashcard:**
  - [ ] Launch from home screen
  - [ ] Answer 5 quiz questions
  - [ ] Note score
  - [ ] **Verify:** Questions display
  - [ ] **Verify:** Answer selection works
  - [ ] **Verify:** Score calculation correct
  - [ ] **Status:** PASS/FAIL + notes

  **Connect Four:**
  - [ ] Launch from home screen
  - [ ] Make 3–4 moves
  - [ ] **Verify:** Board state updates
  - [ ] **Verify:** Turn switching works
  - [ ] **Status:** PASS/FAIL + notes

  **Balloon Pop:**
  - [ ] Launch from home screen
  - [ ] Tap balloons rapidly for 30 seconds
  - [ ] Note final score
  - [ ] **Verify:** Taps register
  - [ ] **Verify:** Balloons disappear
  - [ ] **Verify:** Score persists
  - [ ] **Status:** PASS/FAIL + notes

  **Drum Kit:**
  - [ ] Launch from home screen
  - [ ] Tap 5 drum pads
  - [ ] **Verify:** Sounds play (if audio enabled)
  - [ ] **Verify:** Visual feedback on tap
  - [ ] **Status:** PASS/FAIL + notes

  **Memory/Match:**
  - [ ] Launch from home screen
  - [ ] Flip 4–6 cards
  - [ ] Match 2–3 pairs
  - [ ] **Verify:** Cards flip correctly
  - [ ] **Verify:** Matched pairs stay revealed
  - [ ] **Verify:** Score updates on match
  - [ ] **Status:** PASS/FAIL + notes

- [ ] **Step 6: Two-Player Games (6 games)**

  **Tic-Tac-Toe 2P:**
  - [ ] Launch from home screen
  - [ ] Player 1 makes 2 moves
  - [ ] Player 2 makes 2 moves
  - [ ] **Verify:** Turn indicator clear
  - [ ] **Verify:** Device-pass flow works (both players can play)
  - [ ] **Verify:** Game detects win/draw
  - [ ] **Status:** PASS/FAIL + notes

  **Tug of War 2P:**
  - [ ] Launch from home screen
  - [ ] Player 1 taps button 3 times
  - [ ] Player 2 taps button 3 times
  - [ ] **Verify:** Meter updates per player
  - [ ] **Verify:** Winner determined
  - [ ] **Status:** PASS/FAIL + notes

  **Rock Paper Scissors 2P:**
  - [ ] Launch from home screen
  - [ ] Player 1 makes selection
  - [ ] Player 2 makes selection
  - [ ] **Verify:** Result determined correctly
  - [ ] **Verify:** Plays 3 rounds
  - [ ] **Status:** PASS/FAIL + notes

  **Quiz Duel 2P:**
  - [ ] Launch from home screen
  - [ ] Player 1 answers question
  - [ ] Player 2 answers question
  - [ ] **Verify:** Turn-based flow correct
  - [ ] **Verify:** Scores tracked per player
  - [ ] **Status:** PASS/FAIL + notes

  **Rhythm Simon 2P:**
  - [ ] Launch from home screen
  - [ ] Player 1 copies pattern
  - [ ] Pattern passes to Player 2
  - [ ] **Verify:** Device-pass UI clear
  - [ ] **Verify:** Player 2 can input pattern
  - [ ] **Status:** PASS/FAIL + notes

  **Number Race 2P:**
  - [ ] Launch from home screen
  - [ ] Player 1 competes for 30 seconds
  - [ ] Player 2 competes for 30 seconds
  - [ ] **Verify:** Timer works
  - [ ] **Verify:** Turn switching seamless
  - [ ] **Verify:** Winner declared
  - [ ] **Status:** PASS/FAIL + notes

---

## Phase 0d: Global State & Persistence Testing

- [ ] **Step 7: Verify State Persistence**
  - Complete 2 games (record scores)
  - Refresh browser page (F5 or close/reopen)
  - **Verify:** Highscores appear in game tiles after refresh
  - **Verify:** Player name persists
  - **Verify:** Theme persists
  - **Verify:** Sound setting persists
  - **Status:** State persistence PASS/FAIL

- [ ] **Step 8: Audio System Baseline**
  - Verify audio enabled in settings
  - Play a game with sound
  - **Verify:** Sound effects play (Simon tones, pop sounds, etc.)
  - Disable audio in settings
  - Play another game
  - **Verify:** No sounds play
  - **Verify:** Audio toggle properly cached
  - **Status:** Audio PASS/FAIL

- [ ] **Step 9: Theme Switching Baseline**
  - Open themes menu
  - Switch to 3 different themes (e.g., clay → glass → cyber)
  - **Verify:** Colors change immediately
  - **Verify:** Font styles update
  - **Verify:** All UI elements styled correctly
  - Refresh page
  - **Verify:** Selected theme persists
  - **Status:** Theme switching PASS/FAIL

---

## Phase 0e: Baseline Report

- [ ] **Step 10: Create Phase 0 Baseline Report**
  - **Document:** `baseline-report.md` in `.agents/tasks/mission-001-modularization/`
  - **Contents:**
    ```
    # Phase 0: Baseline Test Report
    
    **Date:** [date]
    **Build:** www/index.html (794 lines, ~50 KB)
    **Environment:** Node 20, Chrome [version]
    **Tester:** [agent name]
    
    ## Game Registry Status
    [Table of all 15 games with status]
    
    ## Single-Player Games (9)
    - Simon: PASS ✓ (Notes: sequence length incremented, sound played)
    - Whack-a-Mole: PASS ✓ (Notes: moles random, scoring works)
    - [... 7 more games ...]
    
    ## Two-Player Games (6)
    - Tic-Tac-Toe 2P: PASS ✓ (Notes: turn switching works, device pass OK)
    - [... 5 more games ...]
    
    ## State Persistence
    - Highscores persist: PASS ✓
    - Player name persists: PASS ✓
    - Theme persists: PASS ✓
    - Sound setting persists: PASS ✓
    
    ## Audio System
    - Sounds play when enabled: PASS ✓
    - Sounds mute when disabled: PASS ✓
    - Audio theme (SND) correct: PASS ✓
    
    ## Theme System
    - Theme switching updates colors: PASS ✓
    - All 19 themes load: [verify count]
    - Theme persists after refresh: PASS ✓
    
    ## Pre-Existing Issues
    - None identified
    
    ## Summary
    **Status:** All 15 games PLAYABLE. Baseline established.
    **Blockers:** None
    **Regression Baseline:** See game-by-game details above
    ```
  
  - **Verification:** Baseline report created and all games status recorded

---

## Phase 0 Success Criteria

✅ **Gate 0a:** All 15 games launch without critical errors  
✅ **Gate 0b:** Game registry documented (metadata, IDs, types)  
✅ **Gate 0c:** Each game tested for 2+ minutes; scores verified  
✅ **Gate 0d:** State persistence verified (scores, theme, audio setting)  
✅ **Gate 0e:** Baseline report completed with PASS/FAIL for each game  
✅ **Gate 0f:** No blockers identified before proceeding to Phase 1

---

# PHASE 1: VITE SETUP & PROJECT STRUCTURE (2 hours)

**Objective:** Install Vite, configure build output for Capacitor, set up src/ directory structure, establish build scripts.

**Acceptance Criterion:** `npm run build` successfully bundles src/main.js into www/index.html with no errors.

---

## Phase 1a: Vite Installation & Configuration

- [ ] **Step 1: Install Vite & Build Dependencies**
  - Run: `npm install --save-dev vite@5 @vitejs/plugin-vue@4 @rollup/plugin-replace`
  - Verify: `npm list vite` shows version 5.x
  - Output: `node_modules/vite/` directory created

- [ ] **Step 2: Create vite.config.js**
  - File: `d:\NishaanTech\style-repo\vite.config.js`
  - Contents:
    ```javascript
    import { defineConfig } from 'vite';

    export default defineConfig({
      root: './',
      publicDir: 'public',
      build: {
        outDir: 'www',
        emptyOutDir: false,        // Preserve existing www/ assets
        rollupOptions: {
          input: 'src/main.js',
          output: {
            entryFileNames: 'index.js',
            dir: 'www',
          },
        },
      },
    });
    ```
  - Verify: File creates without errors; `vite.config.js` present

- [ ] **Step 3: Add Build Scripts to package.json**
  - Update `package.json`:
    ```json
    {
      "scripts": {
        "dev": "vite --host",
        "build": "vite build",
        "preview": "vite preview"
      }
    }
    ```
  - Verify: `npm run build` command available; `npm run dev` available

---

## Phase 1b: Create src/ Directory Structure

- [ ] **Step 4: Create Directories**
  ```
  mkdir -p src/audio src/games/{singleplayer,multiplayer} src/subjects src/themes src/ui src/utils
  ```
  - Verify: All directories present

- [ ] **Step 5: Create Index/Placeholder Files**
  - Create `src/main.js` (entry point - leave empty for now)
  - Create `src/bootstrap.js`
  - Create `src/router.js`
  - Create `src/navigator.js`
  - Create `src/storage.js`
  - Create `src/config.js`
  - Create `src/audio/index.js`
  - Create `src/games/index.js`
  - Create `src/subjects/index.js`
  - Create `src/themes/index.js`
  - Create `src/utils/index.js`
  - Create `src/ui/styles.css` (extract CSS later)
  - Verify: All files created (empty for now)

---

## Phase 1c: Create Minimal Build Test

- [ ] **Step 6: Create Minimal main.js**
  - File: `src/main.js`
  - Contents:
    ```javascript
    console.log('Style Lab Arcade - Modularized Build');
    document.body.innerHTML = '<h1>App Loading...</h1>';
    ```
  - Verify: File saves without errors

- [ ] **Step 7: Test Vite Build**
  - Run: `npm run build`
  - Expected: Build completes without errors
  - Output: `www/index.html` exists and is valid HTML
  - Verify: `www/index.html` contains script tag referencing bundled code

---

## Phase 1d: Verify Capacitor Compatibility

- [ ] **Step 8: Check Capacitor Config**
  - File: `capacitor.config.json`
  - Verify: `webDir: 'www'` is set
  - Verify: `appId: 'com.nishaan.stylelab'` is correct
  - Output: Config confirmed compatible with Vite output

---

## Phase 1 Success Criteria

✅ **Gate 1a:** Vite installed (version 5.x)  
✅ **Gate 1b:** vite.config.js creates without errors  
✅ **Gate 1c:** Build scripts added to package.json  
✅ **Gate 1d:** `npm run build` completes successfully  
✅ **Gate 1e:** www/index.html generated with valid HTML structure  
✅ **Gate 1f:** No console errors on app startup  

---

# PHASE 2: CORE SERVICES (4 hours)

**Objective:** Implement bootstrap, storage, router, and navigator modules. These form the foundation all other modules depend on.

**Acceptance Criterion:** Core services initialize without errors; state persists; routing works; nav bar renders.

---

## Phase 2a: Storage Module (State Management)

- [ ] **Step 1: Implement src/storage.js**
  - Reference: Design v2.0, Section 1 "Storage Module"
  - Implement:
    - `defaultState` object (14 fields with correct types)
    - `validateState(state)` function with type checking for all 14 fields
    - `loadState()` function (read from localStorage, validate, merge defaults)
    - `saveState(state)` function (write to localStorage with quota error handling)
    - Export: `S`, `loadState`, `saveState`, `validateState`, `defaultState`
  - File: `src/storage.js`
  - Verify: File syntax valid; all exports present

- [ ] **Step 2: Create Unit Tests for Storage**
  - File: `src/storage.test.js` (or add to test runner if configured)
  - Test cases:
    - `validateState()` resets invalid `name` to 'Explorer'
    - `validateState()` resets invalid `theme` to 'clay'
    - `loadState()` merges stored state with defaults
    - `saveState()` writes valid JSON to localStorage
    - State schema has exactly 14 fields
  - Verify: Tests pass (or documented as manual if no test framework)

---

## Phase 2b: Bootstrap Module (App Initialization)

- [ ] **Step 3: Implement src/bootstrap.js**
  - Reference: Design v2.0, Section 1 "Bootstrap Module"
  - Implement:
    - Import `S`, `loadState`, `saveState` from storage.js
    - Export `S` as global state (or attach to window)
    - `bootstrap()` async function:
      - Load state: `S = loadState()`
      - Apply theme: `document.documentElement.dataset.theme = S.theme`
      - Initialize audio context (deferred to Phase 3; stub for now)
      - Return initialized `S`
    - `applyTheme(themeId)` function:
      - Update state: `S.theme = themeId`
      - Update DOM: `document.documentElement.dataset.theme = themeId`
      - Persist: `saveState(S)`
      - Trigger audio theme update (stub for now)
    - `resetProfile()` function (for ParentCare reset button):
      - Reset `S` to `defaultState`
      - Persist: `saveState(S)`
      - Reload page or re-render
  - File: `src/bootstrap.js`
  - Verify: Exports and functions compile; no syntax errors

---

## Phase 2c: Router Module (Hash-Based Navigation)

- [ ] **Step 4: Implement src/router.js**
  - Reference: Design v2.0, Section "Router Module"
  - Implement:
    - Screen registry: map route paths to render functions
    - `go(path)` function:
      - Update `window.location.hash = path`
      - Parse route and render corresponding screen
      - Handle 404 (redirect to `/home`)
    - `currentRoute()` function:
      - Return parsed hash (e.g., `/game/simon` → `{ screen: 'game', id: 'simon' }`)
    - Route parameter parsing:
      - `/home` → home screen
      - `/explore` → explore/subjects screen
      - `/course/:id` → course/lesson screen (e.g., `/course/math`)
      - `/game/:id` → game screen (e.g., `/game/simon`)
      - `/theme/:id` → theme shop screen
      - Default: home screen
    - Render function stubs for each screen (return placeholder HTML for now)
    - Hash change event listener:
      ```javascript
      window.addEventListener('hashchange', () => {
        const route = currentRoute();
        renderScreen(route);
      });
      ```
  - File: `src/router.js`
  - Verify: Router compiles; `go()` function callable; routes parse correctly

- [ ] **Step 5: Test Router Navigation**
  - Manual test in browser:
    - Call `go('/home')` → hash updates to `#/home`
    - Call `go('/game/simon')` → hash updates to `#/game/simon`
    - Verify: Route parsing extracts correct screen and parameters
  - Output: Router navigation verified in console

---

## Phase 2d: Navigator Module (Bottom Nav Bar)

- [ ] **Step 6: Implement src/navigator.js**
  - Implement:
    - Render function for bottom nav bar (5 buttons: home, explore, profile, theme, more)
    - Navigation event handlers:
      - Home button → `go('/home')`
      - Explore button → `go('/explore')`
      - Profile button → `go('/profile')`
      - Theme button → `go('/theme/shop')`
      - More button → `go('/more')`
    - Highlight current screen in nav (add `.active` class to matching button)
    - Persist nav selection in state (optional: which tab user was on last)
  - File: `src/navigator.js`
  - Verify: Nav bar renders; buttons trigger navigation

---

## Phase 2e: Integration Test

- [ ] **Step 7: Update main.js to Use Core Services**
  - File: `src/main.js`
  - Contents:
    ```javascript
    import { bootstrap } from './bootstrap.js';
    import { router, go } from './router.js';
    import { renderNav } from './navigator.js';
    
    async function main() {
      // Initialize state
      const state = await bootstrap();
      console.log('App bootstrapped:', state);
      
      // Set up routing
      router();
      
      // Render initial screen
      go('/home');
      
      // Render nav bar
      renderNav();
    }
    
    // Start app when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', main);
    } else {
      main();
    }
    ```
  - Verify: main.js compiles without errors

- [ ] **Step 8: Test Build with Core Services**
  - Run: `npm run build`
  - Expected: Build succeeds without errors
  - Open: Browser dev tools console
  - Verify: `"App bootstrapped: {...}"` appears in console
  - Verify: No critical console errors (warnings OK)

---

## Phase 2 Success Criteria

✅ **Gate 2a:** Storage module compiles; 14-field state schema implemented  
✅ **Gate 2b:** Bootstrap module initializes state correctly  
✅ **Gate 2c:** Theme application works (CSS variables update)  
✅ **Gate 2d:** Router navigates between routes  
✅ **Gate 2e:** Route parameter parsing works (`/game/simon` → id=`simon`)  
✅ **Gate 2f:** Navigator renders and responds to clicks  
✅ **Gate 2g:** `npm run build` succeeds with core services  

---

# PHASE 3: AUDIO SYSTEM (3 hours)

**Objective:** Implement Web Audio API context, synthesizer, theme-based sound parameters, and sfx() function.

**Acceptance Criterion:** Audio context initializes on first user interaction; sfx() plays sounds; theme changes affect tone synthesis.

---

## Phase 3a: Audio Context Management

- [ ] **Step 1: Implement src/audio/context.js**
  - Implement:
    - Global `ctx` (Web Audio API context) - deferred initialization
    - `getContext()` function:
      - If `ctx` not initialized, create new AudioContext (WebKit fallback)
      - Handle iOS requirement: audio context locked until first user interaction
      - Return context
    - `unlockAudio()` function:
      - Create dummy audio node and play to unlock
      - Called on first user tap/click
    - Lifecycle functions:
      - `initAudio()` - initialize context
      - `cleanupAudio()` - stop all sounds, close context (for app unmount)
    - Export: `getContext`, `unlockAudio`, `initAudio`, `cleanupAudio`
  - File: `src/audio/context.js`
  - Verify: File compiles; context functions callable

---

## Phase 3b: Synthesizer Module

- [ ] **Step 2: Implement src/audio/synthesizer.js**
  - Implement:
    - `playTone(freq, duration, waveform, gain, attack, decay, filter)`
      - `freq`: frequency in Hz (e.g., 440 for A4)
      - `duration`: length in milliseconds
      - `waveform`: 'sine', 'square', 'sawtooth', 'triangle'
      - `gain`: volume 0–1 (default: 0.3)
      - `attack`: attack time in ms (default: 10)
      - `decay`: decay time in ms (default: 100)
      - `filter`: lowpass frequency (optional, e.g., 4000 for muffled)
    - `playNoise(duration, gain, color, filter)`
      - `duration`: length in ms
      - `gain`: volume 0–1
      - `color`: 'white', 'pink', 'brown' (default: 'white')
      - `filter`: lowpass frequency
    - Helper: `getFreq(note)` - convert note name (e.g., 'A4') to frequency
    - Export: `playTone`, `playNoise`, `getFreq`
  - File: `src/audio/synthesizer.js`
  - Verify: Synthesizer compiles; no syntax errors

---

## Phase 3c: Sound Themes Module

- [ ] **Step 3: Implement src/audio/soundThemes.js**
  - Reference: Original index.html SND object (themes like clay, cyber, etc.)
  - Implement:
    - `SND` object: theme-specific waveform/parameter presets
    - Each theme has parameters for:
      - `waveform`: default waveform (sine, square, sawtooth, triangle)
      - `attack`: default attack time
      - `decay`: default decay time
      - `filter`: default lowpass filter frequency
      - Example:
        ```javascript
        const SND = {
          clay: {
            waveform: 'sine',
            attack: 10,
            decay: 150,
            filter: null,
          },
          cyber: {
            waveform: 'sawtooth',
            attack: 5,
            decay: 50,
            filter: 8000,
          },
          // ... all 19 themes
        };
        ```
    - `getSoundParams(themeId)` - return theme-specific params
    - Export: `SND`, `getSoundParams`
  - File: `src/audio/soundThemes.js`
  - Verify: SND object complete with all themes; params structure valid

---

## Phase 3d: Sound Effects Registry

- [ ] **Step 4: Implement src/audio/sfx.js**
  - Reference: Original index.html sfx() function and event definitions
  - Implement:
    - Sound event registry:
      - `tap`: quick beep (Simon input)
      - `correct`: ascending tone (right answer)
      - `wrong`: descending tone (wrong answer)
      - `lesson`: celebration tone (lesson complete)
      - `end`: long tone (game end; varies by outcome)
      - `note`: musical note (Simon sequence, drum kit)
      - `pop`: short burst noise (balloon pop)
      - `theme`: confirmation tone (theme switch)
      - `coin`: jingle-like tone (earned coins)
    - `sfx(eventName, arg)` function:
      - Checks if `S.sound === true` (respect audio setting)
      - Gets sound params from current theme
      - Calls `playTone()` or `playNoise()` with theme-specific params
      - Example:
        ```javascript
        export function sfx(eventName, arg) {
          if (!S.sound) return;  // Respect audio setting
          
          const ctx = getContext();
          if (!ctx) return;  // Audio not available
          
          const theme = S.theme;
          const params = getSoundParams(theme);
          
          switch(eventName) {
            case 'tap':
              playTone(800, 80, params.waveform, 0.2, params.attack, params.decay);
              break;
            case 'correct':
              playTone(1200, 150, params.waveform, 0.3);
              break;
            // ... more events
          }
        }
        ```
    - Graceful degradation: if audio context unavailable, sfx() silently returns
    - Export: `sfx`
  - File: `src/audio/sfx.js`
  - Verify: sfx() callable; switches through all event types

- [ ] **Step 5: Create Audio Index**
  - File: `src/audio/index.js`
  - Re-export: `getContext`, `unlockAudio`, `initAudio`, `cleanupAudio`, `playTone`, `playNoise`, `getSoundParams`, `sfx`
  - Verify: All audio exports available from single import

---

## Phase 3e: Integration with Bootstrap

- [ ] **Step 6: Update bootstrap.js to Initialize Audio**
  - Modify `src/bootstrap.js`:
    - Import `initAudio`, `unlockAudio` from audio module
    - In `bootstrap()` function:
      - Call `initAudio()` (defers context until first interaction)
      - Attach `unlockAudio()` to first click event: `document.addEventListener('click', unlockAudio, { once: true })`
    - Export audio module for use in games
  - Verify: Audio initialization happens; no early errors

---

## Phase 3f: Audio System Testing

- [ ] **Step 7: Manual Audio System Test**
  - Build: `npm run build`
  - Open app in browser
  - Open dev tools console
  - Test:
    - Call `sfx('tap')` → should play beep (if audio enabled)
    - Call `sfx('correct')` → should play ascending tone
    - Call `sfx('wrong')` → should play descending tone
    - Disable audio: `S.sound = false; save()`
    - Call `sfx('tap')` → no sound
    - Enable audio: `S.sound = true; save()`
    - Switch theme: `applyTheme('cyber'); sfx('tap')` → tone should have different quality
  - Verify: Each test produces expected audio behavior

---

## Phase 3 Success Criteria

✅ **Gate 3a:** Audio context deferred to first user interaction  
✅ **Gate 3b:** Synthesizer generates tones and noise  
✅ **Gate 3c:** Sound themes define theme-specific parameters  
✅ **Gate 3d:** sfx() plays correct sounds for events  
✅ **Gate 3e:** Audio respects `S.sound` setting  
✅ **Gate 3f:** Theme changes affect tone synthesis quality  
✅ **Gate 3g:** No audio errors when context unavailable  

---

# PHASE 4: GAMES & SUBJECTS (6 hours)

**Objective:** Extract all 15 games and 12 subjects into individual modules. Implement game registry, game runner lifecycle, and subject progression.

**Acceptance Criterion:** All 15 games launch and play without errors; all 12 subjects unlock correctly.

---

## Phase 4a: Game Registry

- [ ] **Step 1: Extract Game Metadata**
  - Reference: Original index.html GAMES array
  - Create: `src/games/registry.js`
  - Document all 15 games with metadata:
    ```javascript
    export const GAMES = [
      {
        id: 'simon',
        name: 'Simon',
        emoji: '🎮',
        tint: '#ff5a7e',
        bst: 'Best sequence',
        p2: false,
        subjects: ['puzzle'],  // Which subjects unlock this game
        difficulty: 'easy',
      },
      // ... 14 more games
    ];
    ```
  - Verify: All 15 games present; metadata matches original

---

## Phase 4b: Game Runner (Lifecycle)

- [ ] **Step 2: Implement src/games/runner.js**
  - Implement game lifecycle:
    - `createGame(gameId)` - instantiate game state
    - `mountGame(gameId, container)` - attach game to DOM
    - `pauseGame(gameId)` - pause game (cleanup timers, listeners)
    - `resumeGame(gameId)` - resume game
    - `destroyGame(gameId)` - cleanup and detach
  - Implement:
    - Game state registry (track active game, state per game)
    - Timer/interval cleanup (cancel all on destroy)
    - Event listener cleanup (remove delegated listeners on destroy)
    - Animation frame cleanup (cancel requestAnimationFrame on destroy)
    - Audio cleanup (stop all playing sounds on destroy)
  - Export: `createGame`, `mountGame`, `pauseGame`, `resumeGame`, `destroyGame`
  - File: `src/games/runner.js`
  - Verify: Runner compiles; lifecycle functions callable

---

## Phase 4c: Extract Individual Games (9 Single-Player)

For each game, follow this pattern:

- [ ] **Step 3: Extract Simon Game**
  - Create: `src/games/singleplayer/simon.js`
  - Extract from original index.html:
    - Game state object (sequence, userInput, level, score, lives, etc.)
    - Initialization function
    - Render function (returns HTML string)
    - Input handlers (process user tap on each of 4 pads)
    - Cleanup function (clear timers, listeners, audio)
    - Scoring logic
    - Win/lose conditions
  - Implement:
    ```javascript
    export const simon = {
      id: 'simon',
      name: 'Simon',
      state: {},
      
      init(container) {
        this.state = {
          active: true,
          sequence: [],
          userInput: [],
          level: 1,
          score: 0,
          lives: 3,
        };
      },
      
      render() {
        // Return HTML string for game screen
      },
      
      handleInput(padNumber) {
        // Process user tap on 1–4 pads
      },
      
      cleanup() {
        // Cancel timers, remove listeners
      },
    };
    ```
  - Extract remaining 8 single-player games in same pattern:
    - Whack-a-Mole
    - Typing/Spell
    - Word Slots (Hangman)
    - Quiz Flashcard
    - Connect Four
    - Balloon Pop
    - Drum Kit
    - Memory/Match
  - Verify: Each game file compiles; exports game object

---

## Phase 4d: Extract Two-Player Games (6 Multiplayer)

- [ ] **Step 4: Extract Two-Player Games**
  - Create: `src/games/multiplayer/ttt2.js` (Tic-Tac-Toe 2P)
  - Same pattern as single-player, but add:
    - Player state: `players: [{ name, score }, { name, score }]`
    - Current player tracking: `currentPlayer: 0 or 1`
    - Turn switching logic
    - Device-pass UI (show "Pass device to Player 2" toast)
  - Extract remaining 5 multiplayer games:
    - Connect Four (2P)
    - Tug of War (2P)
    - React (2P)
    - Math Duel (2P)
    - Rock Paper Scissors (2P)
  - Verify: Each 2P game compiles; player switching works

---

## Phase 4e: Games Index & Registry

- [ ] **Step 5: Create Games Index**
  - File: `src/games/index.js`
  - Import all 15 game modules
  - Re-export: `GAMES` (registry), all game objects
  - Create game lookup: `getGame(gameId)` function
  - Verify: All 15 games accessible from single import

---

## Phase 4f: Extract Subjects

- [ ] **Step 6: Create Subjects Registry**
  - File: `src/subjects/registry.js`
  - Define 12 subjects:
    ```javascript
    export const SUBJECTS = [
      {
        id: 'math',
        name: 'Math',
        emoji: '🧮',
        color: '#ff5a7e',
        lessons: [...],  // Array of lesson objects
      },
      // ... 11 more subjects
    ];
    ```
  - Each lesson object:
    ```javascript
    {
      id: 'lesson1',
      title: 'Counting 1-10',
      content: 'Learn to count...',
      quiz: { questions: [...] },
      reward: 15,  // coins earned
    }
    ```
  - Verify: All 12 subjects present; lessons count > 0

---

## Phase 4g: Subject Progress Tracking

- [ ] **Step 7: Implement src/subjects/lessons.js**
  - Implement:
    - `renderLesson(subjectId, lessonIndex)` - show lesson content
    - `renderQuiz(subjectId, lessonIndex)` - show quiz for lesson
    - `completeLesson(subjectId, lessonIndex)` - mark lesson done
    - `canUnlockLesson(subjectId, lessonIndex)` - check prerequisites (previous lesson done)
    - Integrate with state: `S.done[subjectId]` tracks completed lesson indices
  - Export: `renderLesson`, `renderQuiz`, `completeLesson`, `canUnlockLesson`
  - File: `src/subjects/lessons.js`
  - Verify: Lesson progression logic works

---

## Phase 4h: Quiz System

- [ ] **Step 8: Implement src/subjects/quiz.js**
  - Implement:
    - `renderQuestion(questionObj)` - show quiz question
    - `validateAnswer(questionObj, selectedIdx)` - check if answer correct
    - `calculateScore(questionsAnswered, correctCount)` - compute quiz score
    - `completeQuiz(subjectId, score)` - save quiz score to `S.best[subjectId]`
    - Update state: award coins on quiz completion
  - Export: `renderQuestion`, `validateAnswer`, `calculateScore`, `completeQuiz`
  - File: `src/subjects/quiz.js`
  - Verify: Quiz validation and scoring work correctly

---

## Phase 4i: Subjects Index

- [ ] **Step 9: Create Subjects Index**
  - File: `src/subjects/index.js`
  - Re-export: `SUBJECTS`, `renderLesson`, `renderQuiz`, `completeLesson`, `completeQuiz`, `calculateScore`
  - Verify: All subjects exports available from single import

---

## Phase 4j: Integration Testing

- [ ] **Step 10: Build and Test Games/Subjects**
  - Build: `npm run build`
  - Open app in browser, go to `/game/simon`
  - Verify: Game loads (or placeholder UI appears)
  - Go to `/explore` (subjects list)
  - Verify: All 12 subjects visible
  - Click on a subject → `/course/math`
  - Verify: Lessons listed; can click lesson
  - Verify: No console errors

---

## Phase 4 Success Criteria

✅ **Gate 4a:** Game registry contains all 15 games with correct metadata  
✅ **Gate 4b:** Each game module exports correctly  
✅ **Gate 4c:** Game runner lifecycle functions work  
✅ **Gate 4d:** All 9 single-player games extracted  
✅ **Gate 4e:** All 6 two-player games extracted with player switching  
✅ **Gate 4f:** All 12 subjects present with lessons  
✅ **Gate 4g:** Lesson progression tracking works (S.done updates)  
✅ **Gate 4h:** Quiz validation and scoring work  
✅ **Gate 4i:** No console errors in game/subject screens  

---

# PHASE 5: THEMES & UTILITIES (2 hours)

**Objective:** Extract theme registry, CSS variables per theme, utility functions (XSS protection, shuffling, etc.).

**Acceptance Criterion:** All 19 themes apply correctly; utilities available; no XSS vulnerabilities.

---

## Phase 5a: Themes Registry

- [ ] **Step 1: Create src/themes/registry.js**
  - Extract from original index.html all 19 theme names and metadata
  - Define THEMES array:
    ```javascript
    export const THEMES = [
      { id: 'clay', name: 'Claymorphism', emoji: '🪨', price: 0, owned: true },
      { id: 'claydark', name: 'Clay Dark', emoji: '🌙', price: 0, owned: true },
      { id: 'minimal', name: 'Minimal', emoji: '⚪', price: 0, owned: true },
      // ... 16 more themes (all others have price 150-500)
    ];
    ```
  - Verify: All 19 themes present; prices match original; free themes marked

---

## Phase 5b: CSS Variables Module

- [ ] **Step 2: Create src/themes/cssVariables.js**
  - Extract from original index.html all CSS custom properties
  - For each theme, define object with all variables:
    ```javascript
    export const cssVars = {
      clay: {
        '--bg': '#ece8fb',
        '--card': '#f7f4ff',
        '--ink': '#2d2650',
        // ... 40+ more variables
      },
      cyber: {
        '--bg': 'radial-gradient(...)',
        // ... all variables for cyber theme
      },
      // ... 17 more themes
    };
    ```
  - Implement `injectThemeVars(themeId)` function:
    - Gets CSS vars for theme from `cssVars[themeId]`
    - Injects into `:root` element
  - Export: `cssVars`, `injectThemeVars`
  - Verify: All 19 themes have complete variable sets; no missing vars

---

## Phase 5c: Theme Shop & Unlocking

- [ ] **Step 3: Create src/themes/shop.js**
  - Implement:
    - `renderThemeShop()` - display all themes with price, owned status
    - `canAffordTheme(themeId)` - check if `S.coins >= THEMES[themeId].price`
    - `unlockTheme(themeId)` - deduct coins, add to `S.owned`, save state
    - `isThemeUnlocked(themeId)` - check if in `S.owned` array
  - Export: `renderThemeShop`, `canAffordTheme`, `unlockTheme`, `isThemeUnlocked`
  - File: `src/themes/shop.js`
  - Verify: Theme purchasing logic works

---

## Phase 5d: Utilities Module

- [ ] **Step 4: Create src/utils/esc.js**
  - Implement HTML escape function (XSS protection):
    ```javascript
    export function esc(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }
    ```
  - Verify: Escapes HTML entities correctly

- [ ] **Step 5: Create src/utils/shuffle.js**
  - Implement Fisher-Yates shuffle:
    ```javascript
    export function shuffle(arr) {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    }
    ```
  - Verify: Shuffle function works; preserves array length

- [ ] **Step 6: Create src/utils/events.js**
  - Implement delegated event handling setup:
    ```javascript
    export function setupEventDelegation(handlers) {
      // handlers = { 'click [data-go]': (e) => go(e.target.dataset.go) }
      document.addEventListener('click', (e) => {
        for (const [selector, handler] of Object.entries(handlers)) {
          const [event, sel] = selector.split(' ');
          if (e.target.matches(sel)) handler(e);
        }
      });
    }
    ```
  - Verify: Event delegation setup works

---

## Phase 5e: Utilities Index

- [ ] **Step 7: Create src/utils/index.js**
  - Re-export: `esc`, `shuffle`, `setupEventDelegation`
  - Verify: All utilities accessible from single import

---

## Phase 5f: Config Module

- [ ] **Step 8: Create src/config.js**
  - Define constants from original index.html:
    - `ADS` object (AdMob IDs, testing flag, max ads per day)
    - `PRICE` object (coin rewards, costs)
    - `ACHIEVEMENT` thresholds
  - Example:
    ```javascript
    export const ADS = {
      appId: 'ca-app-pub-3940256099942544~3347511713',
      rewardedId: 'ca-app-pub-3940256099942544/5224354917',
      testing: true,
      maxPerDay: 8,
      cooldown: 20000,  // ms between ad requests
    };
    
    export const PRICE = {
      themeUnlock: 150,  // base theme price
      coins: {
        lessonComplete: 15,
        quizCorrect: 5,
        perfectQuiz: 10,
        gameWin: 30,
        adReward: 50,
        dailyReward: 20,
      },
    };
    ```
  - Verify: All constants present and match original

---

## Phase 5g: Integration Testing

- [ ] **Step 9: Build and Test Themes**
  - Build: `npm run build`
  - Open app, go to theme shop (`/theme/shop`)
  - Verify: All 19 themes visible
  - Click theme → should switch if owned or show cost if not
  - Verify: Theme persists after refresh
  - Check console: no errors

---

## Phase 5 Success Criteria

✅ **Gate 5a:** All 19 themes in registry  
✅ **Gate 5b:** CSS variables defined for all themes  
✅ **Gate 5c:** Theme switching updates DOM without errors  
✅ **Gate 5d:** Theme unlocking logic works (coins deducted, added to owned)  
✅ **Gate 5e:** XSS protection (esc function works)  
✅ **Gate 5f:** Utilities (shuffle, events) callable  
✅ **Gate 5g:** Config constants complete  

---

# PHASE 6: BUILD & INTEGRATION (2 hours)

**Objective:** Extract and integrate CSS, resolve module imports, generate final www/index.html, ensure Capacitor compatibility.

**Acceptance Criterion:** `npm run build` produces valid www/index.html that launches in browser without errors.

---

## Phase 6a: Extract CSS

- [ ] **Step 1: Extract CSS from Original index.html**
  - Copy all CSS from original `<style>` tag (starting from `:root,[data-theme]{...}`)
  - Create: `src/ui/styles.css`
  - Organize CSS by component:
    ```css
    /* Variables (moved to JS via cssVariables.js, but can keep CSS fallbacks) */
    /* Layout */
    .phone { ... }
    
    /* Components */
    .tile { ... }
    .row { ... }
    .les { ... }
    .cta { ... }
    
    /* Screens */
    /* Home */
    /* Game */
    /* Subject/Lesson */
    /* Quiz */
    /* Theme Shop */
    ```
  - Verify: CSS file is valid; no syntax errors

- [ ] **Step 2: Import CSS in main.js**
  - Add to `src/main.js`:
    ```javascript
    import './ui/styles.css';
    ```
  - Verify: Vite recognizes CSS import

---

## Phase 6b: Update HTML Template

- [ ] **Step 3: Create HTML Template**
  - Create: `src/index.html` (Vite will use this as template)
  - Contents:
    ```html
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
      <meta name="description" content="Style Lab: Learn through games">
      <title>Style Lab</title>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@600;800;900&family=Space+Grotesk:wght@500;700&family=Orbitron:wght@700;900&family=Press+Start+2P&family=VT323&family=Patrick+Hand&family=Caveat:wght@700&family=Share+Tech+Mono&family=Bangers&family=Comic+Neue:wght@700&display=swap" rel="stylesheet">
    </head>
    <body>
      <div id="app"></div>
      <script type="module" src="/src/main.js"></script>
    </body>
    </html>
    ```
  - Verify: HTML is valid; points to correct entry point

- [ ] **Step 4: Update vite.config.js for HTML Template**
  - Modify `vite.config.js`:
    ```javascript
    export default defineConfig({
      root: './',
      publicDir: 'public',
      build: {
        outDir: 'www',
        emptyOutDir: false,
        rollupOptions: {
          input: 'src/index.html',  // Changed from src/main.js
          output: {
            entryFileNames: 'index.js',
            dir: 'www',
          },
        },
      },
    });
    ```
  - Verify: Config file valid

---

## Phase 6c: Resolve All Module Imports

- [ ] **Step 5: Complete src/main.js Imports**
  - Update `src/main.js` to import all modules:
    ```javascript
    import './ui/styles.css';
    
    import { bootstrap, applyTheme, resetProfile } from './bootstrap.js';
    import { go, currentRoute, renderScreen } from './router.js';
    import { renderNav } from './navigator.js';
    import { S, saveState } from './storage.js';
    import { sfx } from './audio/index.js';
    import { GAMES, getGame } from './games/index.js';
    import { SUBJECTS } from './subjects/index.js';
    import { THEMES } from './themes/registry.js';
    
    // Expose globals for browser console debugging
    window.S = S;
    window.go = go;
    window.saveState = saveState;
    window.sfx = sfx;
    window.applyTheme = applyTheme;
    window.resetProfile = resetProfile;
    
    async function main() {
      const state = await bootstrap();
      console.log('Style Lab initialized', state);
      go('/home');  // Start at home screen
    }
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', main);
    } else {
      main();
    }
    ```
  - Verify: All imports are resolvable

---

## Phase 6d: Implement Screen Renderers

- [ ] **Step 6: Implement src/router.js Screen Renderers**
  - Update router.js with render functions for each screen:
    - `renderHome()` - profile, stats, subject links, theme picker
    - `renderExplore()` - subject list (12 subjects)
    - `renderCourse(subjectId)` - lessons for subject
    - `renderLesson(subjectId, lessonIndex)` - lesson content + quiz
    - `renderGame(gameId)` - game container + game-specific UI
    - `renderThemeShop()` - theme list + purchase UI
    - `renderProfile()` - player profile, reset button
  - Each render function returns HTML string
  - Set up router to call correct render function based on current route
  - Verify: Router logic complete; all routes covered

---

## Phase 6e: Build & Verify Output

- [ ] **Step 7: Full Build Test**
  - Run: `npm run build`
  - Expected: Build completes without errors
  - Output: `www/index.html` generated
  - Check `www/index.html`:
    - Contains `<!DOCTYPE html>`
    - Contains `<script>` tags with bundled code
    - Contains styles or link to CSS
    - All theme definitions included
    - All game/subject code bundled
  - Verify: Output is valid single HTML file (~200 KB after minification)

- [ ] **Step 8: Browser Launch Test**
  - Open `www/index.html` in browser (file:// or http-server)
  - Check console for errors
  - Verify:
    - "Style Lab initialized" appears in console
    - Home screen renders
    - No critical errors
    - All 12 subjects visible
    - Theme switching works (click theme in home screen)
    - Navigation works (click buttons in nav bar)

---

## Phase 6f: Capacitor Compatibility Check

- [ ] **Step 9: Verify Capacitor Setup**
  - Check `capacitor.config.json`:
    ```json
    {
      "appId": "com.nishaan.stylelab",
      "appName": "Style Lab",
      "webDir": "www",
      "backgroundColor": "#ece8fb"
    }
    ```
  - Verify: `webDir` points to `www` (our output directory)
  - Run: `npx cap sync android` (if Java 17 available)
  - Expected: Sync completes without errors

---

## Phase 6 Success Criteria

✅ **Gate 6a:** CSS extracted and imported correctly  
✅ **Gate 6b:** HTML template created and valid  
✅ **Gate 6c:** All module imports resolvable  
✅ **Gate 6d:** Screen renderers implemented  
✅ **Gate 6e:** `npm run build` succeeds; www/index.html generated  
✅ **Gate 6f:** App launches in browser; home screen renders  
✅ **Gate 6g:** No critical console errors  
✅ **Gate 6h:** Capacitor compatibility verified  

---

# PHASE 7: REGRESSION TESTING (3 hours)

**Objective:** Verify all 15 games remain playable in bundled version; compare behavior to Phase 0 baseline.

**Acceptance Criterion:** All 15 games playable with no regressions vs. Phase 0 baseline.

---

## Phase 7a: Game-by-Game Regression Test

**For each of 15 games, repeat Phase 0 tests on bundled version:**

- [ ] **Step 1: Single-Player Game Testing**
  - For each of 9 single-player games:
    - Launch game from home screen
    - Play for 2+ minutes
    - Verify scoring works
    - Verify highscore persists after refresh
    - Compare to Phase 0 baseline (should be identical)
    - Document: PASS or FAIL + delta from baseline
  - Games: Simon, Whack-a-Mole, Typing, Word Slots, Quiz, Connect Four, Balloon Pop, Drum Kit, Memory

- [ ] **Step 2: Two-Player Game Testing**
  - For each of 6 two-player games:
    - Launch game
    - Player 1 makes 3 moves
    - Player 2 makes 3 moves
    - Verify turn switching clear
    - Verify device-pass UI works
    - Verify winner determined correctly
    - Compare to baseline: PASS or FAIL
  - Games: TTT 2P, Connect Four 2P, Tug, React, Math Duel, RPS 2P

---

## Phase 7b: State Persistence Regression

- [ ] **Step 3: Verify State Persistence**
  - Complete 3 games (Simon, Quiz, Balloon Pop)
  - Record scores
  - Refresh page (F5)
  - Verify: Highscores visible in game tiles
  - Verify: Scores identical to pre-refresh
  - Compare to Phase 0: PASS or FAIL

---

## Phase 7c: Global Systems Regression

- [ ] **Step 4: Audio System Regression**
  - Enable audio in settings
  - Play Simon → verify beeps play
  - Play Balloon Pop → verify pop sound plays
  - Disable audio
  - Play another game → verify no sounds
  - Verify: Audio behavior identical to Phase 0

- [ ] **Step 5: Theme System Regression**
  - Switch to 5 different themes
  - Verify: Colors, fonts, shadows update correctly
  - Verify: All UI consistent across themes
  - Play a game in 3 different themes
  - Verify: Game UI renders correctly in each theme
  - Compare to Phase 0: PASS or FAIL

- [ ] **Step 6: Navigation Regression**
  - Start at home screen
  - Navigate: home → explore → course/math → game/simon → home (circular)
  - Verify: Each transition smooth, no loading delays
  - Verify: Back button works
  - Verify: Nav bar responsive
  - Compare to Phase 0: PASS or FAIL

---

## Phase 7d: Regression Report

- [ ] **Step 7: Create Phase 7 Regression Report**
  - File: `.agents/tasks/mission-001-modularization/regression-report.md`
  - Contents:
    ```
    # Phase 7: Regression Test Report
    
    **Date:** [date]
    **Build:** www/index.html (Vite-bundled)
    **Baseline Reference:** Phase 0 baseline report
    **Tester:** [agent]
    
    ## Game Regression Status
    [Table comparing each game to Phase 0 baseline]
    
    | Game | Phase 0 Status | Phase 7 Status | Delta | Notes |
    |------|---|---|---|---|
    | Simon | PASS | PASS | None | ✓ Identical behavior |
    | Whack-a-Mole | PASS | PASS | None | ✓ Identical |
    | ... | | | | |
    
    ## State Persistence
    - Highscores persist: PASS ✓ (identical to Phase 0)
    - Theme persists: PASS ✓
    - Audio setting persists: PASS ✓
    
    ## Audio Regression
    - Sounds play: PASS ✓
    - Theme synthesis works: PASS ✓ (cyber sounds different from clay)
    - Mute works: PASS ✓
    
    ## Theme Regression
    - All 19 themes apply: PASS ✓
    - Colors match design: PASS ✓
    - Games render in all themes: PASS ✓
    
    ## Navigation Regression
    - Route changes work: PASS ✓
    - Nav bar responsive: PASS ✓
    - Back button works: PASS ✓
    
    ## Regression Summary
    **Total Regressions:** 0
    **Status:** ALL 15 GAMES FULLY PLAYABLE, NO REGRESSIONS
    ```
  - Verify: Report completed with all games tested

---

## Phase 7 Success Criteria

✅ **Gate 7a:** All 9 single-player games playable; behavior matches Phase 0  
✅ **Gate 7b:** All 6 two-player games playable; device-pass works  
✅ **Gate 7c:** Game scoring identical to Phase 0  
✅ **Gate 7d:** Highscore persistence works  
✅ **Gate 7e:** Audio behavior matches Phase 0 (correct sounds, theme synthesis, mute)  
✅ **Gate 7f:** Theme switching matches Phase 0 (all 19 themes, colors correct)  
✅ **Gate 7g:** Navigation works without regressions  
✅ **Gate 7h:** Zero unresolved game-play bugs  

---

# PHASE 8: ANDROID BUILD (2 hours)

**Objective:** Build Android APK using Gradle; verify installation and launch on device (emulator if needed).

**Acceptance Criterion:** APK builds, installs on Android device, launches without crashes.

---

## Phase 8a: Environment Verification

- [ ] **Step 1: Verify Build Tools**
  - Verify Java 17: `java -version` (should show "17.x.x")
  - Verify Android SDK: `android-ndk` available or can be installed
  - Verify Gradle 8.x: `gradle --version` (or will be auto-downloaded)
  - Note: GitHub Actions provides these; local build may vary

---

## Phase 8b: Capacitor Sync

- [ ] **Step 2: Add Android Platform**
  - Run: `npx cap add android`
  - Expected: Creates `android/` directory with Gradle project
  - Output: `android/app/`, `android/build.gradle`, `android/settings.gradle`, etc.

- [ ] **Step 3: Configure Android Build**
  - Edit: `android/app/src/main/AndroidManifest.xml`
  - Verify permissions:
    ```xml
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    ```
  - Verify: No extra permissions (camera, microphone, location, etc.)
  - Verify: AdMob metadata present (added by CI or manually)
  - Verify: No errors

- [ ] **Step 4: Capacitor Sync**
  - Run: `npx cap sync android`
  - Expected: Copies `www/` to `android/app/src/main/assets/public/`
  - Verifies: Web files in correct location
  - Output: Sync completes without errors

---

## Phase 8c: Gradle Build

- [ ] **Step 5: Build APK**
  - Navigate: `cd android`
  - Make gradlew executable: `chmod +x gradlew` (on Unix) or skip on Windows
  - Run: `./gradlew assembleDebug` (or `gradlew.bat assembleDebug` on Windows)
  - Expected: Build completes; shows "BUILD SUCCESSFUL"
  - Output: `app/build/outputs/apk/debug/app-debug.apk` (~6–8 MB)
  - Time: ~3–5 minutes

- [ ] **Step 6: Verify APK File**
  - Check file exists: `ls -lh app/build/outputs/apk/debug/app-debug.apk`
  - Expected: File size 6–8 MB
  - Verify integrity: `unzip -t app-debug.apk` (should show no errors)
  - Expected: ZIP archive containing app code, resources, etc.

---

## Phase 8d: Device Installation (if device available)

- [ ] **Step 7: Connect Device**
  - Enable USB debugging on Android device (Settings > Developer Options)
  - Connect via USB
  - Verify adb sees device: `adb devices` (should list device)

- [ ] **Step 8: Install APK**
  - Run: `adb install -r app-debug.apk`
  - Expected: Installation completes without errors
  - Output: `Success`

- [ ] **Step 9: Launch App**
  - Run: `adb shell am start -n com.nishaan.stylelab/.MainActivity`
  - Wait 3 seconds
  - Expected: App opens on device screen

- [ ] **Step 10: Launch Verification**
  - Observe: Splash screen appears
  - Wait: Home screen loads
  - Verify: Profile visible, subjects visible, nav bar present
  - Verify: No force-close or crash
  - Check adb logs: `adb logcat | grep stylelab` (should show no "crash" or "error" lines)

---

## Phase 8e: Basic Device Testing

- [ ] **Step 11: Smoke Test on Device**
  - Launch Simon game from home screen
  - Tap 2–3 pads
  - Verify: Beeps play (if audio on)
  - Verify: Tap feedback visible
  - Quit game (back button or quit button)
  - Verify: Home screen visible
  - Switch theme from home screen
  - Verify: Colors update on device
  - Conclusion: App is functional on Android

---

## Phase 8f: Build Report

- [ ] **Step 12: Create Android Build Report**
  - File: `.agents/tasks/mission-001-modularization/build-report.md`
  - Contents:
    ```
    # Phase 8: Android Build Report
    
    **Date:** [date]
    **Java Version:** 17.x.x
    **Gradle Version:** 8.x
    **Build Output:** app-debug.apk
    
    ## Build Environment
    - Java 17: ✓ Verified
    - Gradle: ✓ Downloaded/cached
    - Android SDK: ✓ Available
    
    ## Build Process
    - `npx cap add android`: ✓ Success
    - `npx cap sync android`: ✓ Success
    - `./gradlew assembleDebug`: ✓ Success (BUILD SUCCESSFUL)
    - Build time: ~3m 45s
    - APK size: 6.2 MB
    
    ## APK Verification
    - File exists: ✓ app-debug.apk
    - ZIP integrity: ✓ Valid (unzip -t passed)
    - AndroidManifest.xml: ✓ Present
    - Web assets (www/): ✓ Bundled
    
    ## Device Installation & Testing
    - Device connected: ✓ adb devices shows [device]
    - Installation: ✓ adb install -r succeeded
    - Launch: ✓ App starts on device
    - Splash screen: ✓ Visible
    - Home screen: ✓ Loads correctly
    - Smoke test (Simon game): ✓ Playable on device
    - Theme switching on device: ✓ Works
    
    ## Logs
    - adb logcat: No crash or error messages
    - Console: No forced-close
    
    ## Summary
    **Status:** APK builds successfully and launches on Android device
    **Ready for Play Store:** Not yet (requires release build, signing, AdMob IDs)
    ```
  - Verify: Report completes

---

## Phase 8 Success Criteria

✅ **Gate 8a:** Java 17 and Gradle verified  
✅ **Gate 8b:** `npx cap add android` succeeds  
✅ **Gate 8c:** `npx cap sync android` succeeds  
✅ **Gate 8d:** `./gradlew assembleDebug` succeeds; BUILD SUCCESSFUL  
✅ **Gate 8e:** APK file generated (6–8 MB)  
✅ **Gate 8f:** APK ZIP integrity valid  
✅ **Gate 8g:** APK installs on Android device  
✅ **Gate 8h:** App launches; home screen visible  
✅ **Gate 8i:** Smoke test: game playable on device  
✅ **Gate 8j:** No force-close or crash in adb logs  

---

# PHASE 9: FINAL INTEGRATION & REPORTING (3 hours)

**Objective:** Consolidate all test reports, verify acceptance gates, create PR and final delivery summary.

**Acceptance Criterion:** All acceptance gates PASS; deliverables complete; PR created and ready for review.

---

## Phase 9a: Acceptance Gate Review

- [ ] **Step 1: Verify All Gates Passed**
  - Gate 1 (Feature Completeness): All 15 games playable ✓
  - Gate 2 (Regression Testing): All 15 games work identically to Phase 0 ✓
  - Gate 3 (Tests): Manual testing completed (no test framework yet) ✓
  - Gate 4 (Linting & Build): `npm run build` succeeds ✓
  - Gate 5 (Capacitor & Android): `npx cap sync` + Gradle build succeed ✓
  - Gate 6 (Device Testing): APK installs and launches ✓
  - Gate 7 (Defects): No critical bugs; 0 regressions ✓
  - Gate 8 (Compliance): No new permissions; COPPA-compliant ✓
  - Gate 9 (Documentation): Reports created ✓
  - Gate 10 (Git Status): Working tree clean; on feature branch ✓
  - Output: All gates status documented

---

## Phase 9b: Generate Deliverables

- [ ] **Step 2: Create Comprehensive Acceptance Report**
  - File: `.agents/tasks/mission-001-modularization/acceptance-report.md`
  - Contents:
    ```
    # Acceptance Report: Mission 001 Modularize Arcade Application
    
    **Task ID:** mission-001-modularization  
    **Status:** COMPLETE (All acceptance gates PASS)  
    **Date:** [date]  
    **Effort:** 19 hours over 3 days  
    
    ## Acceptance Gate Results
    
    | Gate | Criterion | Status | Evidence |
    |------|-----------|--------|----------|
    | 1 | Feature Completeness | PASS ✓ | All 15 games playable; Phase 0 + Phase 7 reports |
    | 2 | Regression Testing | PASS ✓ | Phase 7 report: 0 regressions |
    | 3 | Unit/Integration Tests | NOT APPLICABLE | Manual testing completed; test framework not configured |
    | 4 | Linting & Build | PASS ✓ | `npm run build` succeeds; www/index.html generated |
    | 5 | Capacitor & Android Build | PASS ✓ | `npx cap sync` and `./gradlew assembleDebug` succeed |
    | 6 | Device Testing | PASS ✓ | APK installs on Android device; app launches |
    | 7 | No Critical Defects | PASS ✓ | 0 critical, 0 high-severity issues reported |
    | 8 | Compliance | PASS ✓ | No new permissions; COPPA-compliant |
    | 9 | Documentation | PASS ✓ | Phase reports and this acceptance report created |
    | 10 | Git Status | PASS ✓ | Working tree clean; on feature/modularization branch |
    
    ## Key Metrics
    - **Code organization:** 1 monolithic file → 45+ modular files
    - **Lines of code:** 794 → ~1200 (with comments and structure)
    - **Build size:** www/index.html ~50 KB (original) → ~200 KB bundled (including source maps)
    - **Games tested:** 15/15 PASS
    - **Regression rate:** 0%
    - **Test coverage:** Manual (all 15 games played end-to-end)
    - **Build time:** `npm run build` ~2 seconds; `./gradlew assembleDebug` ~3–5 minutes
    
    ## What Was Accomplished
    
    1. **Modularization:** Monolithic www/index.html decomposed into 45+ modules across src/
    2. **Build System:** Vite configured for ES module bundling
    3. **Core Services:** bootstrap, storage, router, navigator implemented and tested
    4. **Audio System:** Web Audio API, synthesizer, theme-based sound parameters working
    5. **Games:** All 15 games extracted into individual modules; lifecycle management implemented
    6. **Subjects:** 12 subjects + lessons + quiz system working; progression tracking updated
    7. **Themes:** All 19 themes extracted; CSS variables per theme; theme shop functional
    8. **Utilities:** XSS protection (esc), shuffling, event delegation available
    9. **Build Output:** Single www/index.html (Vite-bundled) compatible with Capacitor
    10. **Android Build:** APK builds successfully; installs and launches on device
    11. **Regression Baseline:** Phase 0 and Phase 7 reports confirm 0 regressions
    
    ## Known Limitations (Non-Blockers)
    - Test framework not configured (manual testing sufficient for Phase 0 baseline)
    - Source maps not included in production build (can be added if needed)
    - Code splitting not configured (monolithic bundle acceptable for app size)
    - TypeScript not used (runtime type checking in place; can migrate later)
    
    ## Next Steps (Future Missions)
    1. Mission 002: Expand game library (3 new games)
    2. Mission 003: Add Firebase analytics (non-personalized)
    3. Mission 004: Implement cloud save (with parental consent)
    4. Mission 005: Release to Play Store (with signed APK, production AdMob IDs)
    
    ## Sign-Off
    
    ✅ All 15 existing games continue to work  
    ✅ No existing functionality removed  
    ✅ State persistence maintained  
    ✅ Audio system functional  
    ✅ Theme system functional  
    ✅ Android build succeeds  
    ✅ Zero regressions vs. Phase 0 baseline  
    ✅ Ready for merge to develop branch  
    
    **Final Status:** APPROVED FOR MERGE
    ```
  - Verify: Report complete and comprehensive

- [ ] **Step 3: Create Changed Files Summary**
  - File: `.agents/tasks/mission-001-modularization/changed-files.md`
  - Contents:
    ```
    # Changed Files: Mission 001
    
    ## New Files (Created)
    
    ### Configuration
    - vite.config.js
    - src/index.html
    
    ### Core Services
    - src/bootstrap.js (app initialization, state, theme application)
    - src/router.js (hash-based routing)
    - src/navigator.js (bottom nav bar)
    - src/storage.js (state persistence, validation)
    - src/config.js (constants)
    - src/main.js (app entry point)
    
    ### Audio System
    - src/audio/context.js (Web Audio API lifecycle)
    - src/audio/synthesizer.js (tone + noise generation)
    - src/audio/soundThemes.js (theme-specific sound parameters)
    - src/audio/sfx.js (sound effect definitions)
    - src/audio/index.js (audio module export)
    
    ### Games
    - src/games/registry.js (GAMES array, metadata)
    - src/games/runner.js (game lifecycle: create, mount, pause, resume, destroy)
    - src/games/index.js (games module export)
    - src/games/singleplayer/simon.js
    - src/games/singleplayer/balloon.js
    - src/games/singleplayer/mole.js
    - src/games/singleplayer/hangman.js
    - src/games/singleplayer/scramble.js
    - src/games/singleplayer/odd.js
    - src/games/singleplayer/snake.js
    - src/games/singleplayer/farm.js
    - src/games/singleplayer/colormatch.js
    - src/games/multiplayer/ttt2.js
    - src/games/multiplayer/connect4.js
    - src/games/multiplayer/tug.js
    - src/games/multiplayer/react.js
    - src/games/multiplayer/mathduel.js
    - src/games/multiplayer/rps2.js
    
    ### Subjects
    - src/subjects/registry.js (SUBJECTS array)
    - src/subjects/lessons.js (lesson rendering, progression)
    - src/subjects/quiz.js (quiz validation, scoring)
    - src/subjects/index.js (subjects module export)
    
    ### Themes
    - src/themes/registry.js (THEMES array, metadata)
    - src/themes/cssVariables.js (CSS vars per theme)
    - src/themes/shop.js (theme unlocking, purchasing)
    - src/themes/index.js (themes module export)
    
    ### UI & Utils
    - src/ui/styles.css (all styling)
    - src/utils/esc.js (HTML escape)
    - src/utils/shuffle.js (array shuffle)
    - src/utils/events.js (event delegation)
    - src/utils/index.js (utils module export)
    
    ### Build Outputs
    - www/index.html (Vite-bundled production app)
    - www/index.js (bundled JavaScript)
    - www/styles.css (bundled CSS, if extracted by Vite)
    
    ### Testing & Reports
    - .agents/tasks/mission-001-modularization/baseline-report.md (Phase 0)
    - .agents/tasks/mission-001-modularization/regression-report.md (Phase 7)
    - .agents/tasks/mission-001-modularization/build-report.md (Phase 8)
    - .agents/tasks/mission-001-modularization/acceptance-report.md (Phase 9)
    - .agents/tasks/mission-001-modularization/changed-files.md (this file)
    
    ## Modified Files
    
    ### package.json
    - Added devDependencies: vite, @vitejs/plugin-vue, @rollup/plugin-replace
    - Added scripts: "dev", "build", "preview"
    
    ### www/index.html (REPLACED, NOT MODIFIED)
    - Original: 794 lines, monolithic
    - New: Vite-generated from src/index.html + bundled JavaScript
    - Result: Single HTML file compatible with Capacitor
    
    ### No other existing files modified
    - android/: unchanged (Capacitor management handles sync)
    - .github/workflows/: unchanged (existing CI/CD preserved)
    - README.md: unchanged (no documentation changes in Phase 0–8)
    
    ## File Statistics
    - **Total new files:** 48
    - **Total lines of code:** ~2500 (including comments, CSS, game logic)
    - **Largest module:** src/games/runner.js (~200 lines)
    - **Smallest module:** src/utils/shuffle.js (~20 lines)
    - **CSS:** src/ui/styles.css (~1500 lines)
    - **Test reports:** 4 markdown files (~200 lines each)
    ```
  - Verify: Files list complete and accurate

---

## Phase 9c: Git & PR Setup

- [ ] **Step 4: Check Git Status**
  - Run: `git status`
  - Verify: All changes staged or can be staged
  - Verify: On branch `feature/modularization`
  - Expected: No uncommitted changes after staging

- [ ] **Step 5: Create Atomic Commits**
  - Commit 1: `git commit -m "feat: set up Vite build system and src/ structure"` (vite.config.js, src/, package.json)
  - Commit 2: `git commit -m "feat: implement core services (bootstrap, storage, router, navigator)"`
  - Commit 3: `git commit -m "feat: implement audio system (context, synthesizer, sfx)"`
  - Commit 4: `git commit -m "feat: extract all 15 games into modules"`
  - Commit 5: `git commit -m "feat: extract subjects and lessons system"`
  - Commit 6: `git commit -m "feat: extract themes and utilities"`
  - Commit 7: `git commit -m "feat: integrate CSS, finalize www/index.html build"`
  - Commit 8: `git commit -m "test: verify Phase 0 baseline (monolithic app)"`
  - Commit 9: `git commit -m "test: verify Phase 7 regression (bundled app, zero regressions)"`
  - Commit 10: `git commit -m "test: verify Phase 8 Android build and device testing"`
  - Verify: All commits pushed to feature branch (no force push, no main branch changes)

- [ ] **Step 6: Create Pull Request**
  - Go to GitHub repo: https://github.com/nitinsameer/arcade-games
  - Click: "New Pull Request"
  - From: `feature/modularization` → To: `develop` (NOT main)
  - Title: `feat: modularize arcade application with Vite bundler (Mission 001)`
  - Description (from template):
    ```
    ## Objective
    Refactor monolithic www/index.html into maintainable ES modules using Vite bundler.
    
    ## Changes
    - ✅ Vite configuration + build system
    - ✅ Core services: bootstrap, storage, router, navigator
    - ✅ Audio system: Web Audio API, synthesizer, sfx()
    - ✅ All 15 games extracted into modules
    - ✅ 12 subjects + lessons + quiz system
    - ✅ All 19 themes with CSS variables
    - ✅ Utilities: XSS protection, shuffling, event delegation
    - ✅ Final www/index.html (Vite-bundled, Capacitor-compatible)
    
    ## Testing
    - [x] Phase 0: Baseline test (all 15 games playable)
    - [x] Phase 7: Regression test (zero regressions vs. Phase 0)
    - [x] Phase 8: Android build (APK builds, installs, launches)
    - [x] All acceptance gates PASS
    
    ## Files
    - New: 48 modules in src/
    - New: 4 test reports in .agents/tasks/mission-001-modularization/
    - Modified: package.json (added vite, scripts)
    - Replaced: www/index.html (now Vite-bundled)
    - Unchanged: android/, .github/, README.md
    
    ## Ready for Review
    - [x] No breaking changes
    - [x] All 15 games remain playable
    - [x] State persistence maintained
    - [x] Capacitor compatibility verified
    - [x] Android build succeeds
    ```
  - Assign reviewers: arcade-reviewer, android-policy-reviewer
  - Link issue: (if task issue exists)
  - Do NOT merge automatically

---

## Phase 9d: Final Deliverables

- [ ] **Step 7: Verify All Deliverables**
  - [ ] implementation-plan.md (this file) ✓
  - [ ] baseline-report.md (Phase 0 test results) ✓
  - [ ] regression-report.md (Phase 7 test results) ✓
  - [ ] build-report.md (Phase 8 Android build results) ✓
  - [ ] acceptance-report.md (all gates, sign-off) ✓
  - [ ] changed-files.md (file inventory) ✓
  - [ ] GitHub PR URL (created, ready for review)
  - [ ] Git commits (atomic, descriptive)
  - [ ] No secrets or signing keys exposed
  - [ ] No force push to main branch
  - [ ] Feature branch clean (all changes committed)

---

## Phase 9 Success Criteria

✅ **Gate 9a:** All 10 acceptance gates documented and PASS  
✅ **Gate 9b:** Comprehensive acceptance report created  
✅ **Gate 9c:** Changed files inventory complete  
✅ **Gate 9d:** Git commits atomic and descriptive  
✅ **Gate 9e:** Pull request created (feature/modularization → develop)  
✅ **Gate 9f:** PR description includes objective, changes, testing evidence  
✅ **Gate 9g:** No secrets or keys exposed in commits  
✅ **Gate 9h:** All deliverables present and verified  

---

# SUMMARY & GO/NO-GO DECISION

## Phase Effort Estimate

| Phase | Duration | Status |
|-------|----------|--------|
| Phase 0: Baseline | 3h | Critical (establishes regression baseline) |
| Phase 1: Vite Setup | 2h | Core (build system foundation) |
| Phase 2: Core Services | 4h | Core (bootstrap, router, state) |
| Phase 3: Audio System | 3h | Important (sound + theme synthesis) |
| Phase 4: Games & Subjects | 6h | Critical (all 15 games + 12 subjects) |
| Phase 5: Themes & Utils | 2h | Important (UI polish, XSS protection) |
| Phase 6: Build & Integration | 2h | Core (final bundling) |
| Phase 7: Regression Testing | 3h | Critical (verify no regressions) |
| Phase 8: Android Build | 2h | Important (APK generation, device test) |
| Phase 9: Final Reporting | 3h | Important (deliverables, PR) |
| **TOTAL** | **30 hours** | **Plan Complete** |

*Note: Estimate assumes sequential execution; parallel QA/review cycles can reduce elapsed time.*

---

## Feasibility Assessment

### ✅ GO (Proceed with Implementation)

**Conditions met:**
1. All 15 games identified and playable (Phase 0 baseline required)
2. Design v2.0 complete and approved
3. Vite + Capacitor compatibility verified
4. Build tools available (Node 20, Java 17, Gradle 8)
5. No blocking dependencies or external APIs required
6. State schema (14 fields) fully documented
7. Audio system scoped (Web Audio API, synthesizer, theme params)
8. Android build process documented

**Risk mitigation:**
- Phase 0 baseline ensures regression detection
- Atomic commits enable easy rollback if needed
- Parallel QA/review in Phase 9 compresses schedule
- No production dependencies on third-party services

### ⚠️ Potential Blockers (Mitigations)

| Blocker | Impact | Mitigation |
|---------|--------|-----------|
| Build time exceeds estimate | Schedule slip | Pre-stage modules; use caching |
| Audio context fails on iOS | Audio unavailable | Already handles with graceful degradation |
| Capacitor sync fails | Can't deploy | Test `npx cap sync` in Phase 1 |
| Game extraction incomplete | Regression | Phase 0 baseline + Phase 7 regression tests |
| APK build fails | Can't verify on Android | Test Gradle in Phase 8a; document Java version |

---

## Quality Gate Requirements

### Acceptance Criteria (All Must PASS)

| Criterion | Verification | Phase |
|-----------|--------------|-------|
| All 15 games playable | Played end-to-end without errors | 0, 7 |
| Zero regressions | Phase 7 report matches Phase 0 behavior | 7 |
| State persists | Highscores, theme, audio setting persist across refresh | 0, 7 |
| Audio works | Theme-aware synthesis; respects mute setting | 3, 7 |
| Themes apply | All 19 themes render correctly | 5, 7 |
| Build succeeds | `npm run build` completes; www/index.html generated | 1, 6 |
| Capacitor sync succeeds | `npx cap sync android` completes | 6, 8 |
| Android build succeeds | `./gradlew assembleDebug` produces valid APK | 8 |
| App launches on device | APK installs; app opens without force-close | 8 |
| No security issues | No XSS, no unnecessary permissions, COPPA-compliant | 5, 8 |
| No critical defects | Zero P0/P1 bugs; only minor known issues | 7, 9 |

### Failure Criteria (Any FAIL → Stop & Report)

- Any game unplayable in bundled version → REGRESSION
- Highscores not persisting → STATE BUG
- Audio crashing app → AUDIO BUG
- `npm run build` fails → BUILD ERROR
- `./gradlew assembleDebug` fails → ANDROID ERROR
- APK doesn't install → PACKAGING ERROR
- App force-closes on launch → RUNTIME CRASH

---

## Approved Architecture Decisions

1. **Single www/index.html output:** Vite bundles all modules into one file (Capacitor requirement)
2. **No framework migration:** Vanilla JS + Web Audio API; no React/Svelte/Vue
3. **Storage:** localStorage only (no cloud/Firebase in Phase 0)
4. **Audio:** Web Audio API synthesizer; no audio files/samples
5. **Styling:** CSS extracted from original; all 19 themes preserved
6. **Testing:** Manual end-to-end; no Jest/Vitest in Phase 0 (can be added later)
7. **Git:** Feature branch → develop (never directly to main)

---

## Implementation Resources

**Required:**
- Node.js 20+ (npm 10+)
- Java 17 (OpenJDK via Temurin or similar)
- Gradle 8.x (auto-downloaded by Capacitor)
- Android SDK (for APK signing, deployment)
- Git + GitHub access
- Text editor or IDE

**Recommended:**
- Chrome DevTools (browser debugging)
- adb (Android Debug Bridge, for device testing)
- http-server (local testing)

**Not Required:**
- Android Studio
- React, Vue, Svelte
- TypeScript
- Jest/Vitest (Phase 0)
- Firebase or backend services

---

## Success Definition

**Mission 001 is COMPLETE when:**

1. ✅ All 15 games remain playable in Vite-bundled www/index.html
2. ✅ Phase 0 and Phase 7 regression reports show zero bugs/regressions
3. ✅ State (14 fields) persists correctly
4. ✅ Android APK builds, installs, and launches without force-close
5. ✅ All 10 acceptance gates PASS
6. ✅ Pull request created and ready for code review
7. ✅ All deliverables present and verified
8. ✅ No critical or high-severity defects remain

**Status:** ✅ **READY FOR IMPLEMENTATION**

---

## Next Steps (if Approved)

1. **Get Executive Approval** → Confirm feasibility assessment + resource availability
2. **Phase 0 Execution** → Establish baseline test report (3 hours)
3. **Phase 1–8 Execution** → Follow plan step-by-step; document progress
4. **Phase 9 Execution** → Consolidate reports, create PR, request review
5. **Code Review** → arcade-reviewer + android-policy-reviewer examine changes
6. **Fix Findings** → If blockers, address and retest
7. **Merge to develop** → Lead approves merge (NOT to main)
8. **Prepare Mission 002** → Next task queued

---

**End of Implementation Plan**

---

**Document Metadata:**
- Plan Version: 1.0
- Generated: 2026-11-12
- Task ID: mission-001-modularization
- Repository: nitinsameer/arcade-games
- Design Reference: Design v2.0 (02-design.md)
- Status: Ready for Development Team Approval
