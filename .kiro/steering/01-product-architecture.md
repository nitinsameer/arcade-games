# Arcade Games: Product Architecture & Context

## Application Overview

**Name:** Style Lab (Nishaan Tech Arcade Games)  
**Type:** Capacitor-based kids learning app (Android APK)  
**Target:** Kids 4-8, with age-gated onboarding  
**Tech Stack:**
- Single-page HTML5/CSS3/JavaScript application (`www/index.html` - monolithic ~50KB)
- Capacitor 6.2.0 for Android bridging
- Web Audio API for sound effects
- localStorage for persistent state

## Architecture

### Single-File Monolithic Design
- **Entry:** `www/index.html` (complete app in one file)
- **State:** Single state object `S` persisted to localStorage as JSON
- **Navigation:** Hash-based routing (#/home, #/game/simon, etc.)
- **Rendering:** Direct DOM manipulation via vanilla JS

### Subject Curriculum (12 Subjects)
1. **Math** — Counting, adding, times tables
2. **Science** — Dinosaurs, facts-based learning
3. **Reading** — Letters, rhymes, story structure
4. **Art** — Primary colors, mixing, warm/cool
5. **Music** — Beat, notes, instruments
6. **Puzzle** — Patterns, logic, shapes
7. **Animals** — Pets vs wild, habitats, types
8. **Space** — Sun, planets, moon
9. **World** — Continents, landmarks, India facts
10. **Hindi** — Letters (वर्ण), vowels (स्वर), numbers
11. **Health** — Senses, nutrition, hygiene
12. **Money** — Coins, counting, save vs spend

### Game Registry (15 Games)
**Single-Player (9):**
1. **Simon** — Memory pattern game (4-pad tones)
2. **Whack-a-Mole** — Reflexes, timing
3. **Typing/Spell** — Letter matching from keyboards
4. **Word Slots** — Hangman-style letter slots
5. **Quiz Flashcard** — Subject quizzes with timed rounds
6. **Connect Four** — Turn-based grid game
7. **Balloon Pop** — Rapid-fire tapping
8. **Drum Kit** — Sound experimentation
9. **Match/Memory** — Card flip pairs

**Two-Player (6):**
1. **Tic Tac Toe (2P)** — Turn-based X/O grid
2. **Tug of War** — Push/pull meter race
3. **Rock Paper Scissors** — Hand vs AI/player
4. **Turn-Based Quiz Duel** — Competing on same subject
5. **Rhythm Simon (2P)** — Copy pattern, pass device
6. **Number Race** — Count/math race (2 controllers)

### Core Game Loop Architecture
- **Lifecycle:** Initialize → Playing → End (win/lose/quit)
- **Scoring:** XP earned on completion (5–30 points per game)
- **Highscores:** Stored in `S.gb[gameId]`
- **Audio:** Theme-aware sound effects (18 waveform presets)
- **State Persistence:** Saved after each session end

### Theme System (19 Themes)
CSS custom properties define complete visual identity:
- Color palette (--bg, --card, --accent, --green, etc.)
- Shadow sets (--sh, --shs, --sin, --sht, --shbtn)
- Border radius, blur, typography
- Presets: Claymorphism, Glass, Neumorphism, Cyber, Pixel, Cartoon, etc.

### Economy System
**Earnings:**
- Lesson completion: +15 coins
- Quiz correct answer: +5 coins
- Perfect quiz: +10 bonus
- Games: +5 to +30 depending on score
- Daily reward: +10–30 coins

**Spending:**
- Theme unlock: 150–500 coins (16 paid, 3 free)
- Ad reward: +50 coins (max 8/day, 20s cooldown)

### Profile & Persistence
**State Object `S`:**
```javascript
{
  name: "Explorer",           // Player name
  theme: "clay",              // Active theme
  sound: true,                // Audio toggle
  vol: 0.7,                   // Volume 0–1
  gb: { [gameId]: score },    // Game best scores
  done: { [subjId]: [i] },    // Lesson completion flags (subject → lesson indices)
  stars: 0,                   // Total achievement stars
  best: { [subjId]: score },  // Quiz best score per subject
  day: { d: "", n: 0 }        // Today's lesson count
}
```

**Persistence:** `localStorage.claylearn` (auto-save after state change)

## Build & Deployment

### Android Build Pipeline
1. GitHub Actions on push to `main`
2. Node 20 + Java 17 + Gradle environment
3. Steps:
   - `npm install`
   - `npx cap add android` (creates native wrapper)
   - Configure AdMob metadata & min SDK (23)
   - `npx cap sync android` (copy web files → Android)
   - `./gradlew assembleDebug` (Gradle build)
4. Output: `android/app/build/outputs/apk/debug/app-debug.apk`
5. Artifact: `.agents/tasks/[task-name]/app-debug.apk`

### Web Build
- No webpack/bundler; app is served as-is
- Capacitor wraps the www directory in WebView

### Local Development
- Edit `www/index.html`
- Push to GitHub, GitHub Actions builds APK
- Download artifact and install: `adb install app-debug.apk`

## Testing & QA

### Automated Tests
- **Currently:** None (no test framework configured)
- **Scope:** Unit tests for game logic, quiz scoring, state transitions
- **When Added:** Jest or Vitest recommended

### Manual Testing Checklist
- [ ] App launches, home screen loads
- [ ] Theme switcher works, persistence verified
- [ ] All 12 subjects accessible
- [ ] Lesson flow: unlock → progress → quiz
- [ ] Games launch and score correctly
- [ ] Audio effects play (when enabled)
- [ ] State persists after app restart
- [ ] Two-player games swap device correctly
- [ ] High scores saved and displayed
- [ ] Economy (coins, spending) works end-to-end
- [ ] Capacitor Android sync completes
- [ ] APK installs and runs on Android device

## Privacy & Compliance

### Google Play Families Policy
- **Target Age:** Kids 4–8
- **Content Rating:** All Ages
- **Restrictions:**
  - No third-party ads or tracking (TestAdMob IDs only in debug)
  - No personal data collection
  - No social features or in-app chat
  - No exiting the app (no web links)
- **Data Handling:** localStorage only, no backend
- **Parental Consent:** Planned (age-gated at onboarding)

### Permissions
- **Current:** AdMob (test), sound
- **Never allowed:** Location, camera, microphone, contacts, SMS
- **Future:** Possibly offline persistence

### Kids Safety Considerations
- Clean, age-appropriate content only
- No advertisements (except placeholder test ads)
- No user-generated content
- No social interaction
- Easily reset profile button
- No hidden in-app purchases

## Development Constraints

### Read-Only Rules (During Setup)
- Do not create new games during setup phase
- Do not rewrite existing games
- Do not change application functionality
- Do not modify build pipeline
- Do not merge to main
- Do not publish to Play Store
- Do not expose signing keys or secrets

### When Development Work Begins
- All changes must go to feature branches
- Feature branches merge to `develop` (not `main`)
- `main` branch reserved for Play Store releases
- Existing games must continue to work (regression tests)
- New features must pass device testing
- All changes require code review

## Known Limitations & Technical Debt
- No state validation or schema enforcement
- No error handling for localStorage quota exceeded
- No offline sync mechanism
- Monolithic HTML makes code splitting impossible
- No TypeScript (runtime safety concerns)
- Sound effects tied to theme (not independently configurable)
- No analytics or crash reporting in debug build

## Success Metrics
- App launches in <2s
- All games playable without errors
- State persists across sessions
- APK builds and installs successfully
- No lint/build warnings
- Device testing passes all acceptance gates
