# Technical Design: Route-Based Page Registry & Renderer Architecture

**Document Version:** 1.0  
**Status:** Design Ready for Implementation  
**Target Phase:** MISSION 002 - Route-Based Rendering Implementation  
**Date:** 2025

---

## Executive Overview

This design establishes a centralized, route-driven page rendering system for the Style Lab modularized application. The architecture maps all application routes (home, explore, games, courses, lessons, profiles, settings, etc.) to standalone renderer functions, each responsible for generating the HTML for its page. This replaces the need for a full React/Vue component tree while maintaining clean separation of concerns, reusability, and extensibility.

**Key architectural decisions:**
- **Page Registry Pattern**: Single source of truth mapping routes → renderer functions
- **Parameterized Route Matching**: Support for both exact routes (`/home`) and parameterized routes (`/game/:id`, `/course/:id`)
- **Function-Based Renderers**: Each page is a pure function: `(state, route) => htmlString`
- **DOM Utilities Integration**: Reuse existing `dom.js` utilities (`$()`, `setHTML()`, `render()`)
- **Event Delegation**: Single click handler at the top level for all page interactions
- **State Pass-Through**: Global state object `S` flows to all renderers for read-only access

---

## 1. Page Registry Architecture

### 1.1 Registry Structure (`src/pages/registry.js`)

The registry is a configuration object that maps route patterns to renderer functions. Routes support:
- **Exact match**: `/home` → `renderHome`
- **Parameterized match**: `/game/:id` → `renderGame`
- **Catch-all**: `*` → `renderNotFound`

**Route Pattern Syntax:**
- Exact routes: `/home`, `/explore`, `/settings`
- Parameters: `:id` (single segment), `:id/:subId` (nested)
- Example: `/game/:gameId` matches `/game/simon`, `/game/balloon`, etc.

**Registry Definition:**
```javascript
export const PAGE_REGISTRY = {
  // Exact routes (exact match)
  exact: {
    '/home': renderHome,
    '/explore': renderExplore,
    '/games': renderGames,
    '/themes': renderThemes,
    '/settings': renderSettings,
    '/profile': renderProfile,
    '/progress': renderProgress,
    '/about': renderAbout,
  },

  // Parameterized routes (pattern matching)
  patterns: [
    { pattern: '/game/:gameId', renderer: renderGame },
    { pattern: '/course/:courseId', renderer: renderCourse },
    { pattern: '/lesson/:courseId/:lessonId', renderer: renderLesson },
    { pattern: '/quiz/:courseId', renderer: renderQuiz },
  ],

  // Fallback
  notFound: renderNotFound,
  error: renderError,
};
```

### 1.2 Route Matching Function

Implement a route matcher that:
1. Checks exact routes first (fastest path)
2. Iterates through parameterized patterns
3. Extracts parameters from URL segments
4. Returns renderer and extracted params

**Function Signature:**
```javascript
/**
 * Get the page renderer for a given route path
 * @param {string} path - Route path (e.g., '/game/simon', '/course/math')
 * @returns {Object} { renderer: Function, params: Object } or { renderer: renderNotFound, params: {} }
 */
export function getPageRenderer(path) {
  // Normalize: remove trailing slash, leading hash
  const normalized = path.replace(/^#/, '').replace(/\/$/, '') || '/home'

  // Check exact matches first
  if (PAGE_REGISTRY.exact[normalized]) {
    return {
      renderer: PAGE_REGISTRY.exact[normalized],
      params: {}
    }
  }

  // Try pattern matches
  for (const { pattern, renderer } of PAGE_REGISTRY.patterns) {
    const match = matchPattern(pattern, normalized)
    if (match) {
      return {
        renderer,
        params: match.params
      }
    }
  }

  // Not found
  return {
    renderer: PAGE_REGISTRY.notFound,
    params: { path: normalized }
  }
}
```

**Pattern Matcher Implementation:**
```javascript
/**
 * Match a URL against a pattern and extract params
 * @param {string} pattern - Pattern like '/game/:gameId'
 * @param {string} path - Actual path like '/game/simon'
 * @returns {Object|null} { params: { gameId: 'simon' } } or null
 */
function matchPattern(pattern, path) {
  const patternSegments = pattern.split('/').filter(Boolean)
  const pathSegments = path.split('/').filter(Boolean)

  // Must have same number of segments
  if (patternSegments.length !== pathSegments.length) {
    return null
  }

  const params = {}

  for (let i = 0; i < patternSegments.length; i++) {
    const patternSeg = patternSegments[i]
    const pathSeg = pathSegments[i]

    if (patternSeg.startsWith(':')) {
      // Parameter: extract value
      const paramName = patternSeg.slice(1)
      params[paramName] = pathSeg
    } else {
      // Literal: must match exactly
      if (patternSeg !== pathSeg) {
        return null
      }
    }
  }

  return { params }
}
```

---

## 2. Page Renderer Functions

### 2.1 Renderer Function Signature

All renderers follow this contract:

```javascript
/**
 * Render a page
 * @param {Object} state - Global state object (read-only)
 * @param {Object} route - Route info: { path, params }
 * @returns {string} HTML to render in #view div
 */
export function renderPageName(state, route) {
  // 1. Extract params from route
  const { someParam } = route.params || {}

  // 2. Validate params
  if (!someParam) {
    return renderError({ message: 'Missing parameter' })
  }

  // 3. Prepare data (read from state, call utilities)
  const data = {
    ...state,
    // Any computed values
  }

  // 4. Build HTML using template literals
  return `
    <div class="top">
      <button class="back" data-go="/home">←</button>
      <h1>${esc(data.title)}</h1>
    </div>
    <!-- Page content -->
  `
}
```

**Key principles:**
- **Read-only state**: Renderers read from `state` but do not modify it
- **Input validation**: Check route params before using them
- **HTML escaping**: Use `esc()` utility on all user input
- **Pure function**: Same inputs always produce same output (no side effects)
- **Return full HTML**: Complete page content goes into `#view`

### 2.2 State Dependencies per Renderer

| Renderer | Route Pattern | State Reads | Route Params | Notes |
|----------|---------------|------------|--------------|-------|
| `renderHome` | `/home` | `name`, `theme`, `coins`, `stars` | None | Main screen with greetings & quick nav |
| `renderExplore` | `/explore` | `theme`, `subjects.*`, `done.*` | None | Browse all 12 subjects |
| `renderCourse` | `/course/:courseId` | `courseId`, `lessons`, `done[courseId]` | `courseId` | Lessons for a subject |
| `renderLesson` | `/lesson/:courseId/:lessonId` | `lesson content`, `subjects` | `courseId`, `lessonId` | Display lesson content |
| `renderGame` | `/game/:gameId` | `game metadata`, `gb[gameId]` | `gameId` | Game screen (delegates to game function) |
| `renderQuiz` | `/quiz/:courseId` | `quiz questions`, `best[courseId]` | `courseId` | Quiz for subject |
| `renderGames` | `/games` | `games registry`, `gb[gameId]` | None | List all 15 games |
| `renderThemes` | `/themes` | `theme`, `themes list`, `coins` | None | Theme switcher & purchase |
| `renderSettings` | `/settings` | `sound`, `vol`, `theme` | None | Audio & preferences |
| `renderProfile` | `/profile` | `name`, `coins`, `stars`, `done count` | None | Player stats & profile |
| `renderProgress` | `/progress` | `done[*]`, `best[*]`, `gb[*]` | None | Learning progress view |
| `renderAbout` | `/about` | None | None | Static about page |
| `renderNotFound` | (any unmapped) | None | `path` | 404 error page |
| `renderError` | (error case) | None | `error message` | Generic error display |

---

## 3. File Organization & Module Structure

### 3.1 Directory Structure

```
src/
├── pages/                          # NEW: Page registry and renderers
│   ├── registry.js                 # Registry, route matching, export all renderers
│   ├── renderers/
│   │   ├── home.js                 # Home screen
│   │   ├── explore.js              # Subject browser
│   │   ├── course.js               # Lessons for subject
│   │   ├── lesson.js               # Lesson content + quiz
│   │   ├── game.js                 # Game launcher screen
│   │   ├── quiz.js                 # Quiz mode
│   │   ├── games.js                # Games list screen
│   │   ├── themes.js               # Theme selector
│   │   ├── settings.js             # Audio/prefs
│   │   ├── profile.js              # User profile
│   │   ├── progress.js             # Learning dashboard
│   │   ├── about.js                # About/info
│   │   ├── error.js                # Error pages
│   │   └── components/             # EXISTING: Reusable HTML builders
│   │       ├── header.js           # Header with title & back button
│   │       ├── card.js             # Subject/game tiles
│   │       ├── button.js           # CTA buttons
│   │       ├── nav.js              # Bottom nav bar
│   │       └── ...
│   └── utils/                      # Page-building helpers
│       └── builders.js             # HTML builders (headers, tiles, etc.)
│
├── main.js                         # Updated: Route change handler calls getPageRenderer()
├── services/
│   ├── router.js                   # EXISTING: Route parsing & hash change
│   ├── navigator.js                # EXISTING: Navigation utilities
│   ├── storage.js                  # EXISTING: State persistence
│   └── bootstrap.js                # EXISTING: Initial state
│
├── games/                          # EXISTING: 15 game implementations
├── subjects/                       # EXISTING: 12 subject definitions
├── themes/                         # EXISTING: 19 theme definitions
├── audio/                          # EXISTING: Audio system
└── utils/                          # EXISTING: Utilities
    ├── dom.js                      # DOM manipulation ($, render, etc.)
    ├── sanitize.js                 # HTML escaping (esc)
    └── ...
```

### 3.2 Module Exports

**`src/pages/registry.js` (Main Registry):**
```javascript
export const PAGE_REGISTRY = { ... }
export function getPageRenderer(path) { ... }
export function matchPattern(pattern, path) { ... }

// Re-export all renderers for convenience
export { renderHome } from './renderers/home.js'
export { renderExplore } from './renderers/explore.js'
export { renderCourse } from './renderers/course.js'
// ... all others
```

**`src/pages/renderers/home.js` (Example Renderer):**
```javascript
export function renderHome(state, route) {
  // Implementation
  return `<div>...</div>`
}
```

---

## 4. Implementation Examples

### 4.1 Home Screen Renderer (`renderHome`)

```javascript
/**
 * Home Screen - Main landing page
 * Shows player greeting, quick navigation, and daily stats
 *
 * State needed: name, theme, coins, stars, done (progress)
 */
export function renderHome(state, route) {
  const playerName = state.name || 'Explorer'
  const coins = state.coins || 0
  const stars = state.stars || 0
  const subjectsDone = Object.keys(state.done || {}).length
  const totalSubjects = 12

  return `
    <div class="top">
      <div class="hello">
        <div class="av">👤</div>
        <div>
          <small>Welcome back</small>
          <h1>${esc(playerName)}</h1>
        </div>
      </div>
      <div class="star">${coins} 🪙</div>
    </div>

    <div class="goal">
      <div>
        <b>${stars} ⭐</b>
        <small>Total Stars</small>
      </div>
      <div class="emo">🎯</div>
    </div>

    <div class="sec">
      <h3>Your Progress</h3>
      <small>${subjectsDone}/${totalSubjects} subjects explored</small>
    </div>
    <div class="bar">
      <i style="width: ${(subjectsDone / totalSubjects) * 100}%"></i>
    </div>

    <h3 style="margin-top: 24px;">Quick Access</h3>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
      <button class="tile" data-go="/explore" style="--t: #ff6b6b;">
        <div class="ti">🔢</div>
        <small>Learn</small>
      </button>
      <button class="tile" data-go="/games" style="--t: #ffc93d;">
        <div class="ti">🎮</div>
        <small>Play</small>
      </button>
      <button class="tile" data-go="/progress" style="--t: #51cf66;">
        <div class="ti">📊</div>
        <small>Progress</small>
      </button>
      <button class="tile" data-go="/settings" style="--t: #339af0;">
        <div class="ti">⚙️</div>
        <small>Settings</small>
      </button>
    </div>
  `
}
```

**State reads:** `name`, `coins`, `stars`, `done`  
**Navigation:** Buttons use `data-go` attribute (handled by delegation)  
**HTML structure:** Uses existing CSS classes (`.top`, `.goal`, `.star`, `.tile`)

### 4.2 Explore/Subjects Renderer (`renderExplore`)

```javascript
/**
 * Explore Screen - Browse all 12 subjects
 * Shows subject tiles with progress indicators
 *
 * State needed: subjects, done[subjectId]
 */
export function renderExplore(state, route) {
  const SUBJECTS = [
    { id: 'math', name: 'Math', emoji: '🔢', tint: '#ff6b6b' },
    { id: 'science', name: 'Science', emoji: '🔬', tint: '#339af0' },
    { id: 'reading', name: 'Reading', emoji: '📖', tint: '#f06595' },
    { id: 'art', name: 'Art', emoji: '🎨', tint: '#ee5a6f' },
    // ... all 12 subjects
  ]

  const done = state.done || {}

  const subjectTiles = SUBJECTS.map(subject => {
    const isCompleted = done[subject.id]?.length > 0
    const progress = isCompleted ? 'done' : ''

    return `
      <button class="tile ${progress}" data-go="/course/${subject.id}" style="--t: ${subject.tint};">
        <div class="ti">${subject.emoji}</div>
        <div>${esc(subject.name)}</div>
        <small>${isCompleted ? 'In Progress' : 'Start'}</small>
      </button>
    `
  }).join('')

  return `
    <div class="top">
      <button class="back" data-go="/home">←</button>
      <h1>Learn</h1>
      <div style="width: 44px;"></div>
    </div>

    <h3>Choose a Subject</h3>
    <div class="subs">
      ${subjectTiles}
    </div>
  `
}
```

**State reads:** `done[subjectId]`  
**Parameterized routes:** Clicking a tile navigates to `/course/{subjectId}`  
**Reusable pattern:** Each subject rendered as a `.tile` with consistent styling

---

## 5. Router Connection (`src/main.js`)

### 5.1 Route Change Handler Integration

```javascript
// src/main.js (updated)

import { initState, setTheme } from './services/bootstrap.js'
import { save } from './services/storage.js'
import { initRouter, parseRoute } from './services/router.js'
import * as navigator from './services/navigator.js'
import { render, setActiveNav, showToast } from './utils/dom.js'
import { esc } from './utils/sanitize.js'
import { sfx, canPlayAudio } from './audio/sfx.js'
import { getPageRenderer } from './pages/registry.js'  // NEW

// Initialize application state
let S = initState()

// ... (rest of initialization)

// Route change handler - NOW CONNECTED TO PAGE REGISTRY
function onRouteChange(route) {
  console.log('📍 Route:', route.path)

  try {
    // Get renderer and params for this route
    const { renderer, params } = getPageRenderer(route.path)

    // Merge params into route object
    const fullRoute = { ...route, params }

    // Render the page
    const html = renderer(S, fullRoute)

    // Update #view with new page content
    render(html)

    // Update active nav button
    updateActiveNav(route.path)

    // Scroll to top (mobile UX)
    window.scrollTo(0, 0)

  } catch (err) {
    console.error('❌ Render error:', err)
    render(`
      <div class="center">
        <div class="trophy">😢</div>
        <h2>Something went wrong</h2>
        <p>${esc(err.message)}</p>
        <button class="cta" data-go="/home">Go Home</button>
      </div>
    `)
  }
}

// Update which nav button is highlighted
function updateActiveNav(path) {
  // Map route to nav button ID
  const navMap = {
    '/home': 'nav-home',
    '/explore': 'nav-explore',
    '/games': 'nav-games',
    '/settings': 'nav-settings',
  }

  const activeId = navMap[path] || null
  setActiveNav(activeId)
}

// Initialize router with our handler
initRouter(onRouteChange)
```

### 5.2 Event Delegation

The application uses a global event delegation pattern. Clicking any button with `data-go` or `data-act` attributes triggers navigation or actions:

```javascript
// In main.js or a separate event handler module

document.addEventListener('click', (e) => {
  const target = e.target.closest('button')
  if (!target) return

  // Navigation
  if (target.dataset.go) {
    e.preventDefault()
    navigator.go(target.dataset.go)
    return
  }

  // Actions (game input, settings toggle, etc.)
  if (target.dataset.act) {
    const action = target.dataset.act
    // Dispatch to action handlers
    handleAction(action, target)
    return
  }

  // Theme selector
  if (target.dataset.t) {
    setTheme(target.dataset.t)
    return
  }
})
```

---

## 6. Error Handling & Edge Cases

### 6.1 Route Matching Errors

| Scenario | Handling | Result |
|----------|----------|--------|
| Route not in registry | No match found | `renderNotFound()` called |
| Param is invalid (e.g., `/game/nonexistent`) | Renderer validates | Renderer calls `renderError()` with message |
| Route param missing (e.g., `/game/` without ID) | Pattern doesn't match segments | `renderNotFound()` called |
| Malformed hash (e.g., `#///home`) | Normalize: remove trailing slash, extras | Works correctly |

### 6.2 State Validation in Renderers

Each renderer validates required state before use:

```javascript
export function renderCourse(state, route) {
  const { courseId } = route.params || {}

  // Validate param exists
  if (!courseId) {
    return renderError({ message: 'Course ID required' })
  }

  // Validate state has course
  const course = getCourse(courseId)
  if (!course) {
    return renderError({ message: `Course "${courseId}" not found` })
  }

  // Safe to proceed
  return `...`
}
```

### 6.3 State Modification Safety

Renderers are read-only. State mutations only happen via:
1. User interactions (handled by action handlers)
2. Navigation (handled by navigator)
3. State persistence (handled by storage service)

```javascript
// ❌ BAD: Don't do this in renderers
export function renderBad(state, route) {
  state.coins += 10  // WRONG: mutation
}

// ✅ GOOD: Only read state
export function renderGood(state, route) {
  const coins = state.coins || 0
  return `<div>${coins}</div>`
}
```

---

## 7. CSS Class Reuse Strategy

### 7.1 Existing CSS Classes

All renderers reuse existing CSS classes from `index.html`:

| Class | Purpose | Example |
|-------|---------|---------|
| `.top` | Header with back button & title | Navigation bar area |
| `.tile` | Subject/game card button | Browse screens |
| `.star` | Coin/score badge | Top-right corner |
| `.row` | Horizontal content container | List items |
| `.les` | Lesson row | Course/lesson lists |
| `.opt` | Quiz option button | Quiz screens |
| `.cta` | Call-to-action button | Primary actions |
| `.cta.alt` | Alt button (secondary) | Quit/Cancel |
| `.cta.green` | Success button | Complete/Start |
| `.goal` | Highlighted banner | Progress/goals |
| `.hero` | Large header area | Course intro |
| `.subs` | Subject grid (3 columns) | Explore view |
| `.raise` | Elevated card (backdrop-filter) | Containers |
| `.back` | Back button (fixed position) | Navigation |
| `.bar` | Progress bar | Progress indicators |

### 7.2 Custom CSS Variables

Themes use CSS custom properties. Renderers set inline styles where needed:

```javascript
// Use inline styles for dynamic color
const subject = { id: 'math', tint: '#ff6b6b' }

return `
  <button class="tile" style="--t: ${subject.tint};">
    <div class="ti">🔢</div>
    Math
  </button>
`

// The CSS rule then uses:
// .tile { background: var(--tilebg); }
// where --tilebg = color-mix(in srgb, var(--t) 45%, var(--card))
```

---

## 8. Route Registry & Mapping Table

Complete list of all routes to implement:

| Route | Pattern | Renderer | Purpose |
|-------|---------|----------|---------|
| `/home` | Exact | `renderHome` | Home/dashboard screen |
| `/explore` | Exact | `renderExplore` | Browse all subjects |
| `/games` | Exact | `renderGames` | All 15 games list |
| `/themes` | Exact | `renderThemes` | Theme selector & purchase |
| `/settings` | Exact | `renderSettings` | Sound, volume, prefs |
| `/profile` | Exact | `renderProfile` | Player stats & achievements |
| `/progress` | Exact | `renderProgress` | Learning dashboard |
| `/about` | Exact | `renderAbout` | About/info page |
| `/game/:gameId` | Param | `renderGame` | Game screen launcher |
| `/course/:courseId` | Param | `renderCourse` | Lessons for a subject |
| `/lesson/:courseId/:lessonId` | Param | `renderLesson` | Individual lesson |
| `/quiz/:courseId` | Param | `renderQuiz` | Quiz for subject |
| `*` (unmapped) | Catch-all | `renderNotFound` | 404 page |

**Initial Priority:** Focus on routes marked **Phase 1**:
- [x] `/home` → `renderHome`
- [x] `/explore` → `renderExplore`
- [ ] `/games` → `renderGames`
- [ ] `/game/:gameId` → `renderGame`
- [ ] `/settings` → `renderSettings`
- [ ] `/themes` → `renderThemes`
- [x] Error handling → `renderError`, `renderNotFound`

---

## 9. Implementation Phases

### Phase 1: Core Routing & Home (Immediate)
1. Create `src/pages/registry.js` with route matching
2. Implement `renderHome()` and `renderExplore()`
3. Update `src/main.js` to call `getPageRenderer()`
4. Test in browser: navigate `/home`, `/explore`

### Phase 2: Navigation & Games (Next)
1. Implement `renderGames()` and `renderGame()`
2. Wire game launcher to game implementations
3. Test all 15 games accessible and playable

### Phase 3: Subjects & Learning (After Phase 2)
1. Implement `renderCourse()`, `renderLesson()`, `renderQuiz()`
2. Wire to 12 subjects and lesson content
3. Test subject browsing and quiz flow

### Phase 4: Settings & Polish (Final)
1. Implement `renderSettings()`, `renderThemes()`, `renderProfile()`
2. Connect settings to state mutations
3. Test theme switching, audio toggle, coin purchases

### Phase 5: Advanced (Optional)
1. `renderProgress()` - Learning analytics
2. `renderAbout()` - Info/credits
3. Error pages and edge case handling

---

## 10. Technology Stack (Locked)

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| **Routing** | Hash-based URL | Native | `location.hash` parsing |
| **State** | Plain JavaScript Object | ES2020+ | Global `S` object |
| **Rendering** | Template Literals | ES2015+ | No JSX, raw HTML strings |
| **DOM** | Vanilla JavaScript | Native | `querySelector`, `innerHTML` |
| **Storage** | localStorage | Native | `JSON.stringify/parse` |
| **Audio** | Web Audio API | Native | Synthesizer + theme sounds |
| **CSS** | Custom Properties | CSS3 | 19 complete theme definitions |
| **Build** | Vite | 5.x | Module bundling only |

---

## 11. Testability & Quality

### 11.1 Unit Testing Strategy

Renderers can be tested in isolation:

```javascript
import { renderHome } from './renderers/home.js'

describe('renderHome', () => {
  it('should display player name', () => {
    const state = { name: 'Alice', coins: 100, stars: 5, done: {} }
    const route = { path: '/home', params: {} }
    const html = renderHome(state, route)
    expect(html).toContain('Alice')
    expect(html).toContain('100')
  })

  it('should handle missing state gracefully', () => {
    const state = {}
    const route = { path: '/home', params: {} }
    const html = renderHome(state, route)
    expect(html).toContain('Explorer')  // Default name
    expect(html).not.toThrow()
  })
})
```

### 11.2 Manual Testing Checklist

- [ ] Navigate to `/home` - displays home screen
- [ ] Click "Learn" button - navigates to `/explore`
- [ ] Click a subject tile - navigates to `/course/{id}`
- [ ] Browser back button works (hash history)
- [ ] Reload at any route - renders correct page
- [ ] Invalid route `/invalid/path` - shows 404
- [ ] All 15 games accessible via `/game/{id}`
- [ ] Theme switching persists across routes
- [ ] No console errors on any page
- [ ] Mobile layout responsive at 480px

---

## 12. Migration Path from Monolithic

### Original (`temp-original.html`)
```javascript
// Single render() function handles all pages via string checking
if (path.includes('/home')) { renderHome() }
else if (path.includes('/game/')) { renderGame() }
// ... cascading if/else
```

### New Architecture
```javascript
// Centralized registry, matches routes first
const { renderer, params } = getPageRenderer(path)
const html = renderer(state, route)
render(html)
```

**Benefits:**
- No more cascading if/else chains
- Route matching is declarative and extensible
- Renderers are modular and testable
- Easy to add new routes without modifying core logic

---

## 13. Reuse of Existing Systems

The registry leverages all existing services without duplication:

1. **Storage (`storage.js`)**: Renderers read from `state` (already persisted)
2. **Router (`router.js`)**: Route parsing & hash handling (unchanged)
3. **Navigator (`navigator.js`)**: High-level navigation functions (unchanged)
4. **Audio (`audio/sfx.js`)**: Theme-aware sound (called by action handlers)
5. **Themes (`themes/index.js`)**: 19 theme definitions (CSS applied via `data-theme`)
6. **DOM Utilities (`dom.js`)**: `$()`, `render()`, `showToast()` (reused in main.js)
7. **Games Registry (`games/registry.js`)**: 15 game metadata (read by `renderGames()`)
8. **Subjects Registry (`subjects/index.js`)**: 12 subjects (read by `renderExplore()`)

No existing functionality is duplicated or reimplemented.

---

## 14. Build & Deployment Impact

### No Changes Required to:
- Vite build configuration (`vite.config.js`)
- Android build pipeline (`.github/workflows/build-apk.yml`)
- Capacitor configuration (`capacitor.config.json`)
- Package dependencies (`package.json`)

### Files Modified:
- `src/main.js` - Add route → renderer connection
- `src/pages/registry.js` - NEW
- `src/pages/renderers/*.js` - NEW (8+ renderers)

### Build Output:
- Vite bundles all new modules into single JavaScript file
- No assets or structure changes
- APK packaging unchanged

---

## 15. Acceptance Criteria

The implementation is complete when:

1. ✅ Route registry (`PAGE_REGISTRY`) maps all routes
2. ✅ `getPageRenderer()` function correctly matches routes and extracts params
3. ✅ `renderHome()` displays home screen with player info
4. ✅ `renderExplore()` displays all 12 subjects with progress
5. ✅ Navigation via `data-go` attributes works correctly
6. ✅ Back button navigates correctly
7. ✅ Theme switching persists across route changes
8. ✅ All 15 games remain accessible via `/game/{id}` routes
9. ✅ Invalid routes show 404 page (not blank screen)
10. ✅ Console has no errors or warnings
11. ✅ Browser build runs and displays correctly
12. ✅ APK installs and shows home screen on device
13. ✅ Device navigation and gameplay tested manually

---

## Appendix: File Structure Summary

```
src/pages/
├── registry.js                    # Route → Renderer mapping
├── renderers/
│   ├── home.js                    # HOME SCREEN (Phase 1)
│   ├── explore.js                 # BROWSE SUBJECTS (Phase 1)
│   ├── games.js                   # GAMES LIST (Phase 2)
│   ├── game.js                    # GAME LAUNCHER (Phase 2)
│   ├── course.js                  # LESSONS FOR SUBJECT (Phase 3)
│   ├── lesson.js                  # LESSON CONTENT + QUIZ (Phase 3)
│   ├── quiz.js                    # QUIZ MODE (Phase 3)
│   ├── settings.js                # AUDIO/PREFS (Phase 4)
│   ├── themes.js                  # THEME SELECTOR (Phase 4)
│   ├── profile.js                 # USER PROFILE (Phase 4)
│   ├── progress.js                # LEARNING DASHBOARD (Phase 5)
│   ├── about.js                   # ABOUT PAGE (Phase 5)
│   └── error.js                   # ERROR PAGES
└── utils/
    └── builders.js                # Reusable HTML builders
```

---

**Document Status:** Ready for Implementation Review  
**Next Step:** Approve design, then proceed to Phase 1 (Core Routing & Home)
