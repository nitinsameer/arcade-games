# Investigation Report: Original Monolithic Application Structure

**Date:** Investigation Complete  
**Analysis Scope:** d:\NishaanTech\style-repo\temp-original.html and .agents/original-index.html  
**Purpose:** Extract page-rendering logic for modularized route-based rendering

---

## Executive Summary

The original application is a **monolithic single-file HTML5 app** (705 lines) with hash-based routing (#/route) that renders entire pages to a single DOM container. All games, subjects, themes, and pages are defined inline with template literals and event delegation.

**Key Architecture:**
- Single-page app with 9 main routes
- 12 subjects (curriculum)
- 15 games (9 single-player, 6 two-player)
- 19 themes (CSS custom properties)
- Global state `S` persisted to localStorage
- Hash-based navigation using `go(path)` and window hash changes
- Direct DOM mutation with template literals

---

## Routes and Page Structure

### All Supported Routes

| Route | Function | Purpose | Navigation Source |
|-------|----------|---------|-------------------|
| `/home` | `home()` | Home screen, daily goal, subject grid, featured games, continue learning | Default (blank hash) |
| `/explore` | `explore()` | View all subjects in list format | Home "Explore" or nav button |
| `/course/{id}` | `course(id)` | Subject details, lessons, final quiz | Subject tile click |
| `/lesson/{id}/{i}` | `lesson(id, i)` | Single lesson content | Lesson button in course |
| `/quiz/{id}` | `startQuiz(id)` + `quiz()` | Quiz for subject | Course "Final Quiz" button |
| `/games` | `gamesList()` | All games grid (2-player and 1-player separated) | Home "Games" button or nav |
| `/game/{id}` | `gameScreen(id)` | Game wrapper with arena | Game tile click |
| `/themes` | `themes()` | Theme selector grid (19 options) | Home/Profile theme button |
| `/profile` (implied as `/settings` in nav) | `profile()` | Player name, sound toggle, volume slider, reset button | Nav button |

**Total Unique Routes:** 9 main routes + game-specific rendering

---

## HTML Structure for Each Route

### 1. HOME ROUTE (`/home`)

**Function:** `home()`

**HTML Structure:**
```html
<div class="top">
  <div class="hello">
    <div class="av">🎮</div>
    <div>
      <small>Hi, {playerName}! 👋</small>
      <h1>Ready to learn something new?</h1>
    </div>
  </div>
  <div style="display:flex;gap:8px">
    <button class="star" data-act="snd">{soundIcon}</button>
    <button class="star" data-go="/themes">🎨</button>
    <div class="star">⭐ {stars}</div>
  </div>
</div>

<!-- Daily Goal Card -->
<div class="goal">
  <div>
    <small>Today's Goal</small>
    <b>{lessonsToday}/3 Lessons</b>
    <div class="bar"><i style="width:{progress}%"></i></div>
  </div>
  <div class="emo">{emoji}</div>
</div>

<!-- Explore Subjects Section -->
<div class="sec"><h3>Explore by Subject</h3></div>
<div class="subs">
  {SUBJECTS tiles grid}
</div>

<!-- Featured Games Section -->
<div class="sec">
  <h3>Fun Games</h3>
  <button class="star" data-go="/games">See all</button>
</div>
<div class="subs">
  {3 featured games: simon, ttt2, tug}
</div>

<!-- Continue Learning Section -->
<div class="sec"><h3>Continue Learning</h3></div>
{up to 2 in-progress subjects as rows}
```

**State Displayed:**
- Player name: `S.name`
- Stars: `S.stars`
- Sound toggle state: `S.sound`
- Today's lesson count: calculated from `S.done`
- Daily goal progress: `Math.min(n, 3) / 3`

**Interactive Elements:**
- Sound button: `data-act="snd"`
- Theme button: `data-go="/themes"`
- Subject tiles: `data-go="/course/{id}"`
- Game tiles: `data-go="/game/{id}"`
- "See all games" button: `data-go="/games"`

---

### 2. EXPLORE ROUTE (`/explore`)

**Function:** `explore()`

**HTML Structure:**
```html
<div class="top">
  <h1>Explore</h1>
  <div class="star">⭐ {stars}</div>
</div>

{all SUBJECTS rendered as .row elements}
{each row shows subject title, name, level, progress bar}
```

**Differences from Home:**
- Shows ALL subjects (not filtered)
- Uses `.row` layout (button with flex layout)
- Each row displays: emoji, title, name, level, progress percentage, progress bar

---

### 3. COURSE ROUTE (`/course/{id}`)

**Function:** `course(id)`

**HTML Structure:**
```html
<!-- Hero Section -->
<div class="hero" style="background:linear-gradient({sky[0]},{sky[1]})">
  <button class="back" data-go="/home">←</button>
  {decorative emojis positioned absolutely}
  <div class="big">{hero emoji}</div>
</div>

<!-- Course Card -->
<div class="raise ccard">
  <!-- Header -->
  <div class="chead">
    <span class="ti sm" style="--t:{tint}">{emoji}</span>
    <div>
      <small>{name}</small>
      <h2>{title}</h2>
    </div>
    <span class="lvl">Level {level}</span>
  </div>

  <!-- Description -->
  <p>{blurb}</p>

  <!-- Stats -->
  <div class="stats">
    <span>📚 {lesson.count} Lessons</span>
    <span>⏱️ {lesson.count * 5} mins</span>
    <span>❓ {quiz.length} Quiz</span>
  </div>

  <!-- Lessons Section -->
  <h4>Lessons</h4>
  {for each lesson:
    <button class="les {done|cur|locked}" {disabled?}>
      <span class="num">{checkmark|number|lock}</span>
      <div>
        <b>{lesson[0]}</b>
        <small>5 min</small>
      </div>
      <span>{done-icon|current-icon|lock-icon}</span>
    </button>
  }

  <!-- Final Quiz Button -->
  <button class="les {all?cur:locked}" {disabled?}>
    <span class="num">?</span>
    <div>
      <b>Final Quiz</b>
      <small>{quiz.length} questions {if best: '┃ Best {score}/{total}'}</small>
    </div>
    <span>{current-icon|lock-icon}</span>
  </button>

  <!-- CTA Button -->
  <button class="cta" data-go="{route}">
    {all?'Take the Quiz':'Start/Continue Lesson'} ➜
  </button>
</div>
```

**State:**
- Progress: lessons completed stored in `S.done[id]` (array of indices)
- Next lesson: found by `findIndex` of first incomplete lesson
- All done: `nextI < 0`
- Quiz best: `S.best[id]`

**Styling:**
- Hero background: gradient from `SUBJECTS[id].sky`
- Tint color: `SUBJECTS[id].tint`
- Decorative elements: positioned via `data-theme` styling

---

### 4. LESSON ROUTE (`/lesson/{id}/{i}`)

**Function:** `lesson(id, i)`

**HTML Structure:**
```html
<!-- Header -->
<div class="top">
  <button class="back" style="position:static" data-go="/course/{id}">←</button>
  <div class="star">Lesson {i+1} of {total}</div>
</div>

<!-- Lesson Content Card -->
<div class="raise lesson">
  <div class="big2">{subject.emoji}</div>
  <h2>{lesson[0]}</h2>
  <p>{lesson[1]}</p>
  <button class="cta green" data-act="complete" data-id="{id}" data-i="{i}">
    {completed?'Back to course':'I got it! +10 ⭐'}
  </button>
</div>
```

**Lesson Data Structure:**
- `SUBJECTS[id].lessons` = array of `[title, content]` tuples
- `lesson[0]` = title
- `lesson[1]` = content text (HTML-escaped)

**Completion Logic:**
- Check if already done: `S.done[id].includes(i)`
- Add to done: `S.done[id] = [...S.done[id], i]`
- Award stars: `gadd(10)` (via `S.stars += n`)
- Save state: `save()`

---

### 5. QUIZ ROUTE (`/quiz/{id}`)

**Function:** `startQuiz(id)` + `quiz()`

**HTML Structure - In-Progress:**
```html
<!-- Header -->
<div class="top">
  <button class="back" style="position:static" data-go="/course/{id}">←</button>
  <div class="star">⭐ {stars}</div>
</div>

<!-- Progress Segments -->
<div class="segs">
  {for each question:
    <i class="{passed|current|pending}"></i>
  }
</div>
<small>Question {i+1} of {total}</small>

<!-- Question Card -->
<div class="raise qcard">
  <h2>{question}</h2>
  <span class="qe">{subject.emoji}</span>
</div>

<!-- Answer Options -->
{for each option:
  <button class="opt {right|wrong|neutral}" data-act="pick" data-k="{index}">
    <span class="let">{A|B|C|D}</span>
    {option text}
  </button>
}

<!-- Next Button -->
<button class="cta green" data-act="next" {disabled?}>
  {last?'Finish':'Next Question'} ➜
</button>
```

**HTML Structure - Results:**
```html
<div class="center">
  <div class="trophy">{emoji}</div>
  <h1>{score}/{total} correct!</h1>
  <p style="color:var(--mute)">{message}</p>
  <div class="star" style="display:inline-block">+{score*10} ⭐ earned</div>
  <button class="cta" data-act="retry">Try again</button>
  <button class="cta alt" data-go="/course/{id}">Back to course</button>
</div>
```

**Quiz State:**
```javascript
Q = {
  id: subjectId,
  i: currentQuestionIndex,
  score: pointsEarned,
  picked: selectedAnswerIndex,
  items: [
    { q: questionText, o: [options], a: correctIndex },
    ...
  ],
  end: boolean
}
```

**Scoring:**
- Stars awarded: `score * 10`
- Best score saved: `S.best[id]` (kept if higher than previous)
- Shuffling: questions and options randomized each quiz

---

### 6. GAMES LIST ROUTE (`/games`)

**Function:** `gamesList()`

**HTML Structure:**
```html
<div class="top">
  <h1>Games</h1>
  <div class="star">⭐ {stars}</div>
</div>

<!-- 2-Player Games Section -->
<div class="sechead"><h3>👥 2 Players · one phone</h3></div>
<div class="tgrid">
  {for each 2-player game:
    <button class="gc" data-go="/game/{id}">
      <span class="gi" style="--t:{tint}">{emoji}</span>
      <b>{name}</b>
      <small>{description}</small>
      <span class="bs">👥 2 players</span>
    </button>
  }
</div>

<!-- 1-Player Games Section -->
<div class="sechead"><h3>🎮 1 Player</h3></div>
<div class="tgrid">
  {for each single-player game:
    <button class="gc" data-go="/game/{id}">
      <span class="gi" style="--t:{tint}">{emoji}</span>
      <b>{name}</b>
      <small>{description}</small>
      <span class="bs">{best-score|'New!'}</span>
    </button>
  }
</div>
```

**Games Filtered By:** `GAMES.filter(g => g.p2)` and `GAMES.filter(g => !g.p2)`

---

### 7. GAME SCREEN ROUTE (`/game/{id}`)

**Function:** `gameScreen(id)` + individual game mount functions

**HTML Structure - Wrapper:**
```html
<div class="top">
  <button class="back" style="position:static" data-go="/games">←</button>
  <h1 style="flex:1;margin-left:6px">{game.name}</h1>
  <div class="star" id="gstar">⭐ {stars}</div>
</div>

<!-- Game Arena (populated by game-specific mount()) -->
<div class="raise gstage" id="gstage"></div>
```

**Game Flow:**
1. `gameScreen(id)` renders wrapper
2. Game's `mount(el)` function called with `#gstage` element
3. Game-specific HTML injected into `.gstage`
4. On end, `endScreen(el, id, score, unit, againFn)` replaces content

**End Screen HTML:**
```html
<div class="trophy">{emoji}</div>
<h2>{score} {unit}</h2>
<p style="color:var(--mute)">{message}</p>
<p><span class="star" style="display:inline-block">+{score*2} ⭐</span></p>
<button class="cta" id="again">Play again</button>
```

---

### 8. THEMES ROUTE (`/themes`)

**Function:** `themes()`

**HTML Structure:**
```html
<div class="top">
  <h1>Themes</h1>
  <div class="star">{totalThemes} styles</div>
</div>

<p style="color:var(--mute);margin:0 0 16px">
  Pick a look. The whole app changes instantly.
</p>

<div class="tgrid">
  {for each theme [key, name, description]:
    <button class="tp {selected?sel:''}" data-act="theme" data-t="{key}">
      <!-- Theme preview -->
      <div class="tpv" data-theme="{key}">
        <div class="mc">
          <b>Aa</b>
          <span></span>
        </div>
        <div class="mb">Play</div>
      </div>
      <b>{name}</b>
      <small>{description}</small>
      {selected?' ✓ Active':''}
    </button>
  }
</div>
```

**Theme Data:**
- THEMES array: `[[key, name, description], ...]`
- Active theme: `S.theme` (matches theme key)
- CSS applied: `document.documentElement.dataset.theme = S.theme`

---

### 9. PROFILE ROUTE (`/profile` or `/settings`)

**Function:** `profile()`

**HTML Structure:**
```html
<div class="top">
  <h1>Profile</h1>
</div>

<div class="raise" style="padding:20px">
  <!-- Avatar -->
  <div class="center">
    <div class="av" style="margin:0 auto 12px;width:90px;height:90px;font-size:50px">
      🎮
    </div>
  </div>

  <!-- Name Input -->
  <label for="nm"><small>Your name</small></label>
  <input class="field" id="nm" maxlength="14" value="{playerName}">
  <button class="cta" data-act="name">Save name</button>

  <!-- Sound Toggle -->
  <div class="sndrow">
    <span>🔊 Sound effects</span>
    <button class="star" data-act="snd">{On|Off}</button>
  </div>

  <!-- Volume Slider -->
  <label for="vol"><small>Volume</small></label>
  <input type="range" id="vol" min="0" max="100" value="{volume}">

  <!-- Theme Button -->
  <button class="cta alt" data-go="/themes">Change theme</button>

  <!-- Reset Button -->
  <button class="cta alt" data-act="reset">Reset progress</button>
</div>
```

**State Controls:**
- Name: `S.name` (saved via `data-act="name"`)
- Sound: `S.sound` (toggled via `data-act="snd"`)
- Volume: `S.vol` (range 0-1, saved from input value)
- Reset: clears `S.done`, `S.best`, `S.gb`, `S.stars`

---

## CSS Classes and Layout Patterns

### Core Container Classes

| Class | Purpose | Structure |
|-------|---------|-----------|
| `.phone` | Main wrapper, max-width 480px | `max-width: 480px; margin: 0 auto; padding: 18px 18px calc(110px + safe-area);` |
| `.top` | Header bar with flex layout | `display: flex; justify-content: space-between; align-items: center;` |
| `.raise` | Elevated card with shadow | `background: var(--card); box-shadow: var(--sh); border-radius: var(--r);` |

### Content Layout Classes

| Class | Purpose | Display |
|-------|---------|---------|
| `.subs` | Subject/game grid | `display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;` |
| `.tgrid` | Theme/game detailed grid | `display: grid; grid-template-columns: 1fr 1fr; gap: 14px;` |
| `.row` | Horizontal item row | `display: flex; align-items: center; gap: 14px; width: 100%;` |
| `.les` | Lesson item (flex row) | `display: flex; align-items: center; gap: 12px;` |

### Button and Interactive Classes

| Class | Purpose | Styling |
|-------|---------|---------|
| `.cta` | Primary call-to-action button | `background: var(--accentg); color: var(--onacc); padding: 16px;` |
| `.cta.alt` | Secondary button (outline style) | `background: var(--card); color: var(--ink);` |
| `.cta.green` | Success/positive action | `background: var(--greeng);` |
| `.star` | Pill-shaped accent button | `background: var(--card); border-radius: 99px; padding: 9px 14px;` |
| `.tile` | Subject/game tile (card) | `display: flex; flex-direction: column; align-items: center;` |
| `.back` | Back button (circular) | `position: absolute; width: 46px; height: 46px; border-radius: 50%;` |

### State and Modifier Classes

| Class | Purpose |
|-------|---------|
| `.done` | Completed lesson (on `.les`) |
| `.cur` | Current/active lesson (on `.les`) |
| `.sel` | Selected theme (on `.tp`) |
| `.lit` | Lit pad in Simon game (on `.pad`) |
| `.right` | Correct answer (on `.opt`) |
| `.wrong` | Wrong answer (on `.opt`) |
| `.up` | Mole popped up (on `.hole`) |

### Game-Specific Classes

| Class | Purpose | Games |
|-------|---------|-------|
| `.pads` | 4-pad grid | Simon |
| `.pad` | Individual pad | Simon |
| `.mgrid` | 3x3 mole grid | Whack-a-Mole |
| `.hole` | Mole hole | Whack-a-Mole |
| `.balloon` | Floating balloon | Balloon Pop |
| `.cells` | 3x3 tic-tac-toe grid | Tic-Tac-Toe |
| `.c4grid` | Connect-4 7x6 grid | Connect Four |
| `.duel` | Two-player split screen | Tug, React, Math Duel, RPS |

---

## Event Handler Patterns

### Data Attributes for Navigation

```javascript
data-go="/path"           // Navigate to route
data-act="actionName"     // Trigger action
data-t="themeId"          // Theme identifier
data-p="playerId"         // Player ID (0 or 1)
data-v="value"            // Generic value
data-id="subjectId"       // Subject ID
data-i="lessonIndex"      // Lesson index
data-k="questionIndex"    // Question/answer index
data-c="column"           // Column number
data-e="emoji"            // Emoji value
```

### Event Delegation Pattern

```javascript
document.addEventListener('click', (e) => {
  // Navigation: data-go
  if (e.target.dataset.go) go(e.target.dataset.go);
  
  // Actions: data-act
  if (e.target.dataset.act === 'actionName') handleAction(e);
  
  // Other: specific element selection for inputs, etc.
});
```

### Input Handling

**Name Save:**
```javascript
data-act="name" → read #nm value → S.name = value → save()
```

**Volume Control:**
```javascript
#vol (type=range) → S.vol = value / 100 → save()
```

**Sound Toggle:**
```javascript
data-act="snd" → S.sound = !S.sound → save()
```

**Reset Profile:**
```javascript
data-act="reset" → S = { ...DEFAULT_STATE, theme: S.theme } → save()
```

---

## Navigation Structure

### Active Route Indicator (Navigation Bar)

The navigation bar at the bottom has 5 buttons:

```html
<nav id="nav">
  <button class="on" aria-label="Home">🏠</button>      <!-- /home -->
  <button aria-label="Explore">🔍</button>               <!-- /explore -->
  <button aria-label="Progress">📊</button>              <!-- /progress (implied) -->
  <button aria-label="Games">🎮</button>                 <!-- /games -->
  <button aria-label="Profile">👤</button>               <!-- /profile -->
</nav>
```

**Active State Logic:**
```javascript
nav button.on { 
  color: var(--accent); 
  background: var(--card); 
  box-shadow: var(--shs);
}
```

**Routes to Nav Buttons Mapping:**
- `/home` → nav button 0 (.on)
- `/explore` → nav button 1 (.on)
- `/progress` → nav button 2 (.on)
- `/games` → nav button 3 (.on)
- `/profile` → nav button 4 (.on)
- All sub-routes inherit parent active state

---

## DOM Element IDs Used

| ID | Purpose | Route |
|----|---------|----|
| `view` | Main content container | All |
| `nav` | Navigation bar | All |
| `toast` | Toast notification area | All |
| `nm` | Name input field | /profile |
| `vol` | Volume range input | /profile |
| `gstage` | Game arena container | /game/:id |
| `gstar` | Stars display in game | /game/:id |
| Various game-specific IDs | Game state elements | Games |

---

## Global Functions and Utilities

### Navigation
```javascript
function go(path)              // Navigate to route (set hash)
function parseRoute()          // Parse current hash into { path, route, params }
function navigate(path)        // Set location.hash
```

### State
```javascript
function save(state)           // Persist state to localStorage
function load(defaultState)    // Load state from localStorage
function initState()           // Initialize state with defaults
```

### DOM Manipulation
```javascript
function $(selector)           // querySelector shorthand
function addClass(el, cls)     // Add CSS class
function removeClass(el, cls)  // Remove CSS class
function esc(input)            // HTML escape for XSS prevention
```

### Notifications
```javascript
function showToast(message, duration)  // Show toast notification
```

### Games
```javascript
function gadd(n)               // Add n stars to S.stars and save
function gbest(id, v)          // Update best score for game
function gb(id)                // Get best score for game
```

### Audio
```javascript
function sfx(eventName, arg, state)  // Play sound effect
function getContext(volume)    // Get audio context
function canPlayAudio()        // Check audio support
```

---

## Games Array Structure

### GAMES Registry

```javascript
const GAMES = [
  // Single-player games
  { id, name, emoji, tint, desc, mount },
  // Two-player games
  { id, name, emoji, tint, desc, p2: 1, mount },
  ...
];
```

### All 15 Games

**Single-Player (9):**
1. **simon** - Memory pattern game (repeat color sequence)
2. **balloon** - Tap the correct number of balloons
3. **scramble** - Unscramble the word
4. **hangman** - Guess the animal (20 questions style)
5. **mole** - Whack-a-Mole (tap moles, avoid bombs)
6. **odd** - Find the different emoji
7. **snake** - Snake game (eat apples)
8. **farm** - Count the animals
9. **colormatch** - Tap the ink color

**Two-Player (6):**
1. **ttt2** - Tic-Tac-Toe (alternate turns, one phone)
2. **connect4** - Connect Four (gravity-based)
3. **tug** - Tug of War (tap fastest)
4. **react** - Reaction Duel (first to tap green)
5. **mathduel** - Math Duel (solve equation first)
6. **rps2** - Rock Paper Scissors (pick in secret, reveal)

---

## Subjects Array Structure

### SUBJECTS Registry

```javascript
const SUBJECTS = [
  {
    id: string,
    name: string,           // Category name
    title: string,          // Display title
    emoji: string,          // Icon emoji
    tint: string,           // CSS hex color
    hero: string,           // Large emoji for hero section
    sky: [string, string],  // Gradient colors [start, end]
    deco: string,           // Decorative emojis (comma-separated)
    blurb: string,          // Subject description
    level: number,          // Difficulty level
    lessons: [
      [string, string],     // [lesson_title, lesson_content]
      ...
    ],
    quiz: [
      [string, string, string, string, string], // [question, answer, option2, option3, option4]
      ...
    ]
  },
  ...
];
```

### All 12 Subjects

1. **math** - Counting, adding, times tables
2. **science** - Dinosaurs, facts-based learning
3. **reading** - Letters, rhymes, story structure
4. **art** - Primary colors, mixing, warm/cool
5. **music** - Beat, notes, instruments
6. **puzzle** - Patterns, logic, shapes
7. **animals** - Pets vs wild, habitats, types
8. **space** - Sun, planets, moon
9. **world** - Continents, landmarks, India facts
10. **hindi** - Letters (वर्ण), vowels (स्वर), numbers
11. **health** - Senses, nutrition, hygiene
12. **money** - Coins, counting, save vs spend

---

## Themes Array Structure

### THEMES Registry

```javascript
const THEMES = [
  [key, name, description],  // Theme identifier tuple
  ...
];
```

### All 19 Themes

1. **clay** - Light, soft claymorphism (default)
2. **claydark** - Dark claymorphism variant
3. **glass** - Glassmorphism with blur
4. **neu** - Neumorphism (soft UI)
5. **brutal** - Bold, brutal design system
6. **cyber** - Neon cyberpunk aesthetic
7. **minimal** - Clean, Apple-style minimal
8. **skeuo** - Realistic skeuomorphism
9. **aurora** - Frosted glass aurora
10. **material** - Material Design 3
11. **pixel** - Retro pixel art style
12. **synth** - Synthwave neon colors
13. **paper** - Handwritten, paper-like
14. **oled** - Pure black, OLED-optimized
15. **bento** - Bento box layout vibes
16. **pop** - Vibrant, colorful gradients
17. **aero** - Aero glass (Windows Vista)
18. **term** - Terminal/monospace hacker
19. **cartoon** - Comic Sans, comic style

---

## Key Data Structures

### Global State `S`

```javascript
S = {
  name: string,           // Player name ("Explorer")
  theme: string,          // Active theme key ("clay")
  sound: boolean,         // Audio enabled (true)
  vol: number,            // Volume 0-1 (0.7)
  gb: {                   // Game best scores
    [gameId]: number,
    ...
  },
  done: {                 // Completed lessons
    [subjectId]: [index, index, ...],
    ...
  },
  stars: number,          // Total achievement stars (0)
  best: {                 // Quiz best scores per subject
    [subjectId]: number,
    ...
  },
  day: {                  // Daily tracking
    d: string,            // Date ("YYYY-MM-DD")
    n: number             // Lessons completed today
  }
}
```

### Quiz State `Q`

```javascript
Q = {
  id: string,             // Subject ID
  i: number,              // Current question index
  score: number,          // Points earned
  picked: number,         // Selected answer index (-1 = not picked)
  items: [
    { q: string, o: [string, ...], a: number },  // q=question, o=options, a=answer_index
    ...
  ],
  end: boolean            // Quiz finished
}
```

---

## Calculated Functions

### Progress Tracking

```javascript
function pct(subject)              // Percentage of subject complete (0-100)
function doneN(subjectId)          // Number of lessons completed
function todayN()                  // Lessons completed today
function sub(id)                   // Get subject by ID
```

### Helper Utilities

```javascript
function tiles()                   // Generate subject tiles HTML
function rowFor(s)                 // Generate subject row HTML
function shuffle(array)            // Randomize array
function chips(array)              // Generate status chips HTML
const rand = n => Math.floor(Math.random() * n)  // Random 0-n
```

---

## Audio and Sound Effects

### Sound Event Types

- **tap** - Button press feedback
- **correct** - Right answer (musical notes)
- **wrong** - Incorrect answer (declining tone)
- **lesson** - Lesson completed (ascending notes)
- **end** - Game end (varies by outcome: 0=loss, 1=partial, 2=victory)
- **note** - Musical note (arg 0-3 for C-G)
- **pop** - Balloon pop (noise burst)
- **theme** - Theme changed (cymbal-like)

### 19 Sound Themes

Each theme defines: waveform (w), pitch multiplier (p), duration multiplier (d), volume (v), effects (fx), click type (k), bend

---

## Toast Notification System

```javascript
showToast(message, duration)  // Show notification at bottom center
                              // Duration: default 1800ms
                              // Appears via .show class
                              // Auto-hides after duration
```

---

## Total File Statistics

| Metric | Count |
|--------|-------|
| Total lines (original HTML) | 705 |
| Routes (unique) | 9 |
| Pages/screens | 9+ (including game-specific) |
| CSS classes | 50+ |
| Global functions | 30+ |
| Subjects | 12 |
| Games | 15 |
| Themes | 19 |
| Sound effects | 8 types |

---

## Key Observations for Modularization

### 1. Page Rendering Pattern
Every page is rendered via a named function that returns HTML string. Routes map 1:1 to functions:
```javascript
route → renderFunction → HTML string → el.innerHTML = html
```

### 2. Event Delegation
All interactivity uses `data-*` attributes on elements. Single global click listener handles navigation and actions. No component-specific event listeners (except games).

### 3. State Persistence
State changes always trigger `save()`. Changes must be committed to `S` object for persistence. localStorage is the single source of truth.

### 4. Game Architecture
Games are self-contained functions that:
- Receive DOM element as parameter
- Return cleanup function
- Inject their own HTML/CSS
- Use global `gadd()`, `gbest()`, `sfx()` utilities

### 5. Navigation Model
- All navigation via hash: `#/route/params`
- Parsing via `parseRoute()`
- Handler receives route object with path, route, params
- No browser Back button (history not used)

---

## Recommendations for Route Registry Implementation

Based on this structure, create a route registry like:

```javascript
const ROUTES = {
  '/home': () => home(),
  '/explore': () => explore(),
  '/course/:id': (id) => course(id),
  '/lesson/:id/:i': (id, i) => lesson(id, i),
  '/quiz/:id': (id) => { 
    startQuiz(id); 
    return quiz(); 
  },
  '/games': () => gamesList(),
  '/game/:id': (id) => gameScreen(id),
  '/themes': () => themes(),
  '/profile': () => profile(),
  '/progress': () => progress(),
  '*': () => home()  // 404 fallback
};

// Router processes:
const { route, params } = parseRoute();
const renderer = ROUTES[route] || ROUTES['*'];
const html = renderer(...params);
$('#view').innerHTML = html;
```

---

**Report Generated:** Investigation Complete  
**Status:** Ready for Implementation  
**Next Step:** Implement route-based rendering in modularized app
