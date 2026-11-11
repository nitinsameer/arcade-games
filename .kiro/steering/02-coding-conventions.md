# Arcade Games: Coding Conventions & Standards

## JavaScript Style Guide

### Naming Conventions
```javascript
// Variables: camelCase
let playerScore, currentTheme, isGameActive;

// Constants: SCREAMING_SNAKE_CASE
const MAX_PLAYERS = 2;
const GAME_TIMEOUT = 3000;

// Functions: camelCase
function calculateScore() {}
const playSound = () => {};

// CSS Custom Properties: --kebab-case
--bg, --accent, --sh, --barfill

// Classes/Constructors: PascalCase (rarely used in this codebase)
class GameEngine {}

// Private functions: Prefix with _ (convention only)
const _validateInput = () => {};
```

### Code Organization
1. **Imports & Setup** → HTML meta, fonts
2. **CSS Variables & Themes** → Complete theme definitions
3. **Global State** → State object `S`, utility variables
4. **Audio System** → SND object, audio context, sfx()
5. **Core Functions** → DOM rendering, navigation
6. **Page Renderers** → home(), explore(), course(), game screens
7. **Event Handlers** → Click, input, hash change
8. **Game Logic** → Individual game implementations

### Syntax Standards
- **Arrow functions preferred** for callbacks: `const fn = () => {}`
- **Ternary for simple conditions:** `x ? y : z`
- **Template literals for strings:** `` `text ${var}` ``
- **Destructuring where readable:** `const { name, score } = player`
- **const > let > var** (var is banned)
- **No semicolons** (project convention—rely on ASI)

### Comments & Documentation
```javascript
// Single-line comments for brief context
// Multi-line comments for complex logic blocks

/**
 * Function documentation (if needed)
 * @param {type} name - Description
 * @returns {type} Description
 */

// TODO: Future improvements
// FIXME: Known issue to address
// NOTE: Important context for maintainers
```

## HTML & DOM Conventions

### Data Attributes for Interactivity
```html
<button data-go="/path">Navigation</button>
<button data-act="actionName">Action</button>
<button data-t="themeId">Theme selector</button>
<div data-game="gameId">Game container</div>
```

### CSS Class Naming (BEM-inspired)
- **Block:** `.tile`, `.row`, `.cta` (standalone reusable)
- **Element:** `.row .m` (modifier within block)
- **State:** `.done`, `.cur`, `.sel`, `.lit` (semantic states)

### Accessible HTML
```html
<button class="cta">Action</button>
<div class="toast" id="toast" role="status"></div>
<nav id="nav" aria-label="Main"></nav>
<input id="field" aria-label="Input description">
```
- Use `id` for unique elements
- Use `aria-label` for icon-only buttons
- Use `role` for status/notification regions
- Focus visible outlines enforced

## State Management

### Immutability Patterns
```javascript
// Spread syntax for updates (not mutation)
S = { ...S, name: "NewName" };
S.best = { ...S.best, [subjId]: score };

// Avoid mutation
S.done.push(lesson);  // ❌ Bad
S.done = [...S.done, lesson];  // ✅ Good
```

### State Validation
```javascript
// Type checking patterns (runtime only)
if (typeof S.vol !== 'number' || S.vol < 0 || S.vol > 1) {
  S.vol = 0.7;  // Reset to default
}
```

### Persistence
```javascript
const save = () => {
  try {
    localStorage.setItem('claylearn', JSON.stringify(S));
  } catch (e) {
    // Silent fail; app continues with in-memory state
  }
};
```

## Game Implementation Template

### Game Registry Entry
```javascript
const GAMES = [
  {
    id: 'simon',
    name: 'Simon',
    emoji: '🎮',
    tint: '#ff5a7e',
    bst: 'Best sequence length',
    p2: false,  // false = single-player, true = two-player
    // ... levels/config
  }
];
```

### Game Loop Structure
```javascript
let gameState = {
  active: true,
  score: 0,
  level: 1,
  lives: 3
};

function startGame() {
  gameState.active = true;
  render();
  // Game logic
}

function endGame() {
  gameState.active = false;
  const finalScore = calculateFinalScore();
  S.gb[currentGame] = Math.max(S.gb[currentGame] || 0, finalScore);
  save();
  // Show result screen
}

function render() {
  // Update DOM with gameState
}
```

### Game Input Handling
```javascript
// Delegated event listeners at top level
document.addEventListener('click', (e) => {
  if (e.target.dataset.go) go(e.target.dataset.go);
  if (e.target.dataset.act === 'gameInput') handleGameInput(e);
});
```

## CSS Conventions

### Custom Properties (Variables) Priority
```css
/* Apply all variables at :root level and theme level [data-theme] */
:root {
  --bg: #ece8fb;           /* Background */
  --card: #f7f4ff;         /* Card surface */
  --accent: #7c5cf0;       /* Primary action */
  --green: #5cc46b;        /* Success/positive */
  --ink: #2d2650;          /* Text color */
  --mute: #7a72a8;         /* Secondary text */
  --r: 26px;               /* Border radius */
  --sh: shadow-value;      /* Shadow effect */
}

[data-theme="cyber"] {
  --bg: radial-gradient(...);
  --accent: #00f5d4;
  /* All variables MUST be redefined for complete theme coverage */
}
```

### Media Queries & Responsive
```css
/* Mobile-first; max-width 480px is primary target */
.phone {
  max-width: 480px;
  margin: 0 auto;
  padding: 18px;
}

/* No media queries for desktop—app is phone-only */
```

### Animation Standards
- **Use CSS transitions for state changes:** `.12s` to `.25s`
- **Reduce motion:** `prefers-reduced-motion:reduce` disables all
- **No JavaScript animations** (prefer CSS)

## Testing Patterns

### Validation Before Game Start
```javascript
// Check state integrity
if (!GAMES.find(g => g.id === gameId)) return home();
if (typeof S.vol !== 'number') S.vol = 0.7;

// Sanitize inputs
const sanitized = esc(userInput);  // XSS protection
```

### Edge Cases to Handle
- App launched with corrupted localStorage → Reset to defaults
- Missing audio context → Graceful audio disable
- Invalid theme → Fall back to 'clay'
- Game quit mid-play → Clean up state before returning to home
- Two-player game with one player → Disable submit button

### Debugging
```javascript
// Add to browser console for state inspection
window.S  // View entire state
window.save()  // Manually trigger save
window.go('/game/simon')  // Navigate programmatically
```

## Error Handling

### Silent Failures Acceptable
```javascript
try {
  const v = localStorage.getItem('claylearn');
  if (v) S = { ...S, ...JSON.parse(v) };
} catch (e) {
  // Silent fail; app runs with defaults
}
```

### Audio Context Fallback
```javascript
function ac() {
  if (!ctx) {
    const A = window.AudioContext || window.webkitAudioContext;
    if (!A) return null;  // No audio support; sfx() will gracefully skip
    ctx = new A();
  }
  return ctx;
}
```

### DOM Not Found
```javascript
const el = document.querySelector('#nonexistent');
if (el) el.textContent = 'text';  // Guard access
```

## Performance & Optimization

### Monolithic File Constraints
- **No code splitting:** All 15 games, 12 subjects in single HTML
- **Lazy rendering:** Only render active screen (hash-based views)
- **Event delegation:** Single document listener for all clicks
- **CSS efficiency:** All variables pre-computed; no dynamic calc()

### Memory Management
```javascript
// Reuse timers
clearTimeout(toast.i);  // Clear previous before setting new
toast.i = setTimeout(() => ..., 1800);

// Avoid closures in loops
games.forEach((game, i) => {
  game.onClick = () => handleClick(i);  // Bind i once
});
```

### Audio Optimization
- **Web Audio API** context reused globally
- **Synthesis:** Procedural tone generation (no samples)
- **Polyphony:** Max 4 simultaneous notes (managed)

## Version Control & Git

### Commit Message Format
```
<type>: <subject> [<scope>]

<body>

Fixes #<issue> | Related <PR>
```

**Types:** feat, fix, refactor, style, docs, test, chore  
**Subject:** Present tense, lowercase, <50 chars  
**Body:** Explain why, not what (wrap at 72 chars)

### Branch Naming
```
feature/[feature-name]
bugfix/[bug-name]
refactor/[component-name]
```
All feature work goes to `develop`, never directly to `main`.

## Code Review Checklist

- [ ] No hardcoded values (use constants)
- [ ] All user input sanitized with `esc()`
- [ ] State changes use spread syntax, not mutation
- [ ] Existing games still playable (regression test)
- [ ] Audio/theme-aware (respects `S.sound`, `S.theme`)
- [ ] Mobile-first; responsive on 480px max-width
- [ ] CSS uses custom properties (no hardcoded colors)
- [ ] LocalStorage save called after state changes
- [ ] No console errors or warnings
- [ ] Accessibility: focus visible, aria-labels present
