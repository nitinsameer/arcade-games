# Arcade Games: Acceptance & Quality Gates

## Task Success Criteria Framework

All development tasks must pass these gates before completion. Report each criterion as:
- **PASS** — Criterion met, verified
- **FAIL** — Criterion not met; work incomplete
- **BLOCKED** — Criterion cannot be verified (missing tools/environment)
- **NOT APPLICABLE** — Criterion irrelevant to task scope

## Gate 1: Feature Completeness

### Requirement: All requested functionality implemented
**Verification:**
- [ ] Task description requirements are satisfied
- [ ] Acceptance criteria from task specification met
- [ ] No features marked TODO or FIXME remain
- [ ] Feature works end-to-end from user perspective

**If game development:**
- [ ] Game launches from Games list
- [ ] Game is playable without errors
- [ ] High score saves and persists
- [ ] Quit returns to Games list cleanly

**If subject/lesson development:**
- [ ] Lesson content displays correctly
- [ ] Quiz questions appear and answer validation works
- [ ] Progress tracking updates state
- [ ] Completion unlocks next lesson

**How to verify:**
```javascript
// Manual testing checklist
- [ ] Navigate to feature (hash routing)
- [ ] Use feature from start to finish
- [ ] Verify all interactive elements respond
- [ ] Check for error messages in console
- [ ] Confirm state persists after navigation
```

**Report format:**
```
Gate 1: Feature Completeness
- Requirement 1: PASS ✓
- Requirement 2: PASS ✓
- Requirement 3: FAIL — [specific issue]
Status: FAIL (cannot proceed until fixed)
```

## Gate 2: Existing Games Regression

### Requirement: All 15 existing games continue to work
**Verification:**
- [ ] Each game in GAMES array is accessible
- [ ] Each game launches without errors
- [ ] Each game accepts user input correctly
- [ ] Each game ends gracefully
- [ ] High scores are recordable
- [ ] No console errors during play

**Manual test all 15 games:**
1. Simon (memory)
2. Whack-a-Mole (reflexes)
3. Typing/Spell (letters)
4. Word Slots (Hangman)
5. Quiz (flashcards)
6. Connect Four (grid)
7. Balloon Pop (tapping)
8. Drum Kit (audio)
9. Memory/Match (pairs)
10. Tic Tac Toe 2P (turn-based)
11. Tug of War 2P (meter race)
12. Rock Paper Scissors 2P (hand game)
13. Quiz Duel 2P (competition)
14. Rhythm Simon 2P (pattern pass)
15. Number Race 2P (counting)

**How to verify:**
```javascript
// Automated check
for (const game of GAMES) {
  if (!game.id || !game.name || !game.emoji) {
    console.error(`Game ${game.id} missing metadata`);
  }
}

// Manual: Play each for 30 seconds minimum
GAMES.forEach(g => {
  console.log(`Testing ${g.name}...`);
  go(`/game/${g.id}`);
  // Play, then check console for errors
});
```

**Report format:**
```
Gate 2: Regression Testing
- Simon: PASS ✓
- Whack-a-Mole: PASS ✓
- ...
- Number Race 2P: PASS ✓
Status: PASS (all games playable)
```

**Failure resolution:**
- If game fails to load: Check game function exists in index.html
- If game crashes: Review error message, check game state initialization
- If high score not saved: Verify `S.gb[gameId]` is updated and `save()` called
- If console errors: Debug and fix before resubmission

## Gate 3: Unit & Integration Tests

### Requirement: Relevant tests pass; no new test failures
**Test Framework:** Jest or Vitest (if configured; currently not present)

**If test framework exists:**
- [ ] All unit tests for changed functions pass
- [ ] Integration tests for affected features pass
- [ ] Test coverage unchanged or improved
- [ ] No skipped tests (marked .skip or .todo)

**How to run:**
```bash
npm run test                    # Run all tests
npm run test -- --coverage     # With coverage report
npm run test -- <filename>     # Single file
```

**Current Status:** No test framework configured
- **Action:** Setup Jest/Vitest if adding complex game logic
- **Minimal requirement:** Manual test checklist (documented)

**Report format (if tests exist):**
```
Gate 3: Tests
Test Results:
  ✓ 24 passed
  ✗ 0 failed
  ○ 0 skipped
Coverage: 78% lines, 71% branches
Status: PASS
```

**Report format (if no tests):**
```
Gate 3: Tests
Framework: Not configured
Manual Testing: [checklist passed]
Status: NOT APPLICABLE (manual testing completed)
```

## Gate 4: Linting & Build

### Requirement: No lint errors; build/sync succeeds
**Linting:** Currently not configured (ESLint could be added)

**JavaScript Validation:**
- [ ] No syntax errors in www/index.html
- [ ] No undefined variables
- [ ] No unused variables (code should be clean)
- [ ] No console.log() left in production code

**How to check manually:**
```bash
# 1. Open www/index.html in browser dev tools
# 2. Check Console for errors/warnings
# 3. Run basic syntax check
node -c www/index.html  # (Won't work for HTML; use online validators)

# Or use a linter if installed
npx eslint www/index.html
```

**Build Verification:**
- [ ] `npm install` succeeds without errors
- [ ] `npx cap sync android` succeeds
- [ ] No build warnings or errors

**How to verify build:**
```bash
npm install
npx cap sync android
echo "Build sync successful" || echo "Build sync failed"
```

**Report format:**
```
Gate 4: Linting & Build
Lint Status: No errors detected
Build Status: PASS
  ✓ npm install completed
  ✓ npx cap sync android completed
Status: PASS
```

## Gate 5: Capacitor & Android Build

### Requirement: Capacitor sync succeeds; Android APK builds
**Prerequisites:**
- Node 20 installed
- Java 17 installed (for local build)
- GitHub Actions available (for CI build)

**Local Build (if possible):**
```bash
npm install
npx cap add android
npx cap sync android
cd android
./gradlew assembleDebug
```

**Verify:**
- [ ] `android/app/build/outputs/apk/debug/app-debug.apk` exists
- [ ] APK file size reasonable (>5 MB typical)
- [ ] No Gradle errors in build output

**CI Build (via GitHub Actions):**
- [ ] Push feature branch to GitHub
- [ ] GitHub Actions workflow triggers
- [ ] APK artifact available in Actions tab
- [ ] APK download succeeds

**How to verify:**
```bash
# After build
ls -lh android/app/build/outputs/apk/debug/app-debug.apk

# Check file is valid (unzip should work)
unzip -t app-debug.apk > /dev/null && echo "APK valid" || echo "APK corrupted"
```

**Report format:**
```
Gate 5: Android Build
Local Build: PASS
  - Capacitor sync: ✓ succeeded
  - Gradle build: ✓ succeeded (2m 34s)
  - APK size: 6.2 MB
  - APK valid: ✓ verified

OR

CI Build: PASS
  - GitHub Actions run: ✓ completed
  - APK artifact: ✓ available
  - Download verified: ✓ successful
Status: PASS
```

## Gate 6: Device Testing (APK Installation)

### Requirement: APK installs and app launches on Android device
**Prerequisites:**
- Android device (Android 6.0+) or emulator
- USB debugging enabled
- `adb` (Android Debug Bridge) installed

**Installation:**
```bash
adb devices  # Verify device detected
adb install -r app-debug.apk
adb shell am start -n com.nishaan.stylelab/.MainActivity
```

**Verification Checklist:**
- [ ] APK installs without errors
- [ ] App launches (splash screen appears)
- [ ] Home screen loads (no white screen hang)
- [ ] Navigation works (can open different screens)
- [ ] Feature from current task works as expected
- [ ] No crashes or force-closes
- [ ] App responds to user input
- [ ] Audio/sound effects work (if applicable)
- [ ] Theme system works (can switch themes)

**How to verify:**
```bash
# After installation, check app is running
adb shell pm list packages | grep stylelab

# Check for crashes in logs
adb logcat | grep "stylelab\|crash\|error"

# Install and launch
adb install -r app-debug.apk
adb shell am start -n com.nishaan.stylelab/.MainActivity

# Wait 5 seconds, then check if app is still running
sleep 5
adb shell pgrep -f com.nishaan.stylelab && echo "App running" || echo "App crashed"
```

**Report format:**
```
Gate 6: Device Testing
Device: Pixel 6a (Android 14)
Installation: PASS ✓
App Launch: PASS ✓ (1.2s)
Navigation: PASS ✓
Feature Test: PASS ✓ [feature name]
Crashes: None
Errors: None
Status: PASS
```

**Failure resolution:**
- White screen: Check www/index.html renders, no syntax errors
- Crashes on startup: Check console errors, verify state initialization
- Feature not working: Verify feature code in index.html, test in browser first
- Audio not playing: Check S.sound is true, audio context available

## Gate 7: No Critical or High-Severity Defects

### Requirement: No blocking bugs remain
**Severity Levels:**
- **Critical:** App crashes, cannot use feature, data loss
- **High:** Feature partially broken, major usability issue
- **Medium:** Visual glitch, minor functionality missing
- **Low:** Polish, rarely-used feature, non-blocking

**Acceptance Policy:**
- ❌ **FAIL:** If any Critical or High-severity defects remain
- ✅ **PASS:** If only Low/Medium or no defects exist
- ⏸️ **BLOCKED:** If defect cannot be reproduced

**How to identify:**
```javascript
// During testing, categorize issues:

// CRITICAL (must fix)
- App crashes on feature use
- Feature completely non-functional
- User data lost
- Cannot navigate away

// HIGH (should fix before launch)
- Feature partially broken (some inputs fail)
- Highscore doesn't save
- Audio doesn't work on device
- UI completely broken

// MEDIUM (nice to fix)
- Visual misalignment
- Non-critical animation missing
- Theme doesn't apply fully

// LOW (future improvements)
- Code could be cleaner
- Performance could be better
- Additional feature ideas
```

**Report format:**
```
Gate 7: Defect Review
Critical Issues: 0
High-Severity Issues: 0
Medium Issues: 1 (visual glitch in theme X, low priority)
Low Issues: 2 (code cleanup recommendations)
Status: PASS (no blockers)
```

## Gate 8: Permissions & Privacy Compliance

### Requirement: No unapproved permissions or data collection
**Verification:**
- [ ] No new permissions added to AndroidManifest.xml
- [ ] No personal data collection (email, phone, ID)
- [ ] No tracking libraries added (Google Analytics, Facebook SDK)
- [ ] No external web navigation (all links stay in app)
- [ ] No social features (no chat, leaderboards with names)
- [ ] Ad requests respect child-directed settings
- [ ] No camera/microphone requests
- [ ] No location access

**How to verify:**
```bash
# Check manifest for new permissions
grep -n "uses-permission" android/app/src/main/AndroidManifest.xml

# Check for suspicious imports in index.html
grep -i "google-analytics\|facebook\|tracking\|analytics" www/index.html

# Check for external links
grep -i "href=\"http\|window.open" www/index.html

# Verify no new npm packages (check for tracking SDKs)
npm list --depth=0
```

**Report format:**
```
Gate 8: Privacy & Compliance
New Permissions: None ✓
Personal Data Collection: None ✓
Tracking Libraries: None ✓
External Links: None ✓
Approved Ad System: ✓ AdMob test IDs
Status: PASS (COPPA-compliant)
```

## Gate 9: Changes Documentation

### Requirement: Changes are documented
**Required Documentation:**
- [ ] GitHub commit message (clear, descriptive)
- [ ] Comments in code (for complex logic)
- [ ] Updated README.md (if architecture changed)
- [ ] Known issues documented (if deferred work)

**Commit Message Format:**
```
feat: add new game (game name)

- Implemented [game logic]
- Added to GAMES registry
- Tested on device
- All existing games verified working

Acceptance criteria:
- [ ] Feature complete
- [ ] Regression tests pass
- [ ] Device testing passes
```

**Report format:**
```
Gate 9: Documentation
Commit Message: ✓ Clear and descriptive
Code Comments: ✓ Complex logic documented
README: ○ Not applicable (no architecture change)
Known Issues: None
Status: PASS
```

## Gate 10: Git Status & Commit Tracking

### Requirement: Working tree clean; commits on feature branch
**Verification:**
- [ ] All changes committed (no uncommitted files)
- [ ] Branch is feature branch (not main/master)
- [ ] Branch name descriptive (feature/..., bugfix/...)
- [ ] Commits are atomic (one logical change per commit)
- [ ] No merge conflicts

**How to verify:**
```bash
# Check working tree
git status  # Should be clean (nothing to commit)

# Check branch
git rev-parse --abbrev-ref HEAD  # Should NOT be main/master

# Check commits
git log --oneline --graph -5  # Review recent commits

# Check for uncommitted changes
git diff --stat  # Should be empty

# Check for untracked files
git ls-files --others --exclude-standard  # Should be empty
```

**Report format:**
```
Git Status & Commits
Working Tree: PASS ✓ (clean)
Branch: feature/new-game ✓ (descriptive)
Commits: 3 logical changes ✓
  1. feat: add Simon game registry entry
  2. feat: implement Simon game logic
  3. test: verify Simon game works
Conflicts: None ✓
Status: PASS
```

## Summary Report Template

Use this format for final acceptance:

```markdown
# Task Acceptance Report

**Task ID:** [task identifier]
**Feature:** [feature name]
**Branch:** feature/[feature-name]
**Developer:** [agent/name]
**Date:** [date]

## Acceptance Gate Results

| Gate | Criterion | Status | Notes |
|------|-----------|--------|-------|
| 1 | Feature Completeness | PASS ✓ | All requirements met |
| 2 | Regression Testing | PASS ✓ | All 15 games working |
| 3 | Unit Tests | NOT APPLICABLE | Manual testing completed |
| 4 | Linting & Build | PASS ✓ | No errors |
| 5 | Android Build | PASS ✓ | APK 6.2 MB, valid |
| 6 | Device Testing | PASS ✓ | Installed on Pixel 6a |
| 7 | Defect Review | PASS ✓ | No critical issues |
| 8 | Privacy & Compliance | PASS ✓ | COPPA-compliant |
| 9 | Documentation | PASS ✓ | Commits clear |
| 10 | Git Status | PASS ✓ | Clean, on feature branch |

## Final Status: ✅ APPROVED FOR MERGE

**Recommendation:** Merge to `develop` branch (ready for QA/review)

## Known Issues / Deferred Work
None

## Testing Evidence
- [APK artifact link]
- [Device test video/screenshots]
- [Console output]

---
```

## Quality Gate Override Policy

**When gates cannot be passed:**
1. **Identify blocker** — What specific gate fails?
2. **Classify severity:**
   - Environment issue (missing Java, no device) → BLOCKED
   - Technical issue (build fails) → Fix or document reason
   - Requirement issue (feature scope changed) → Discuss with lead
3. **Document decision:**
   - **BLOCKED:** Explain why, identify what's needed
   - **DEFERRED:** List as known issue, plan fix timing
   - **OVERRIDE:** Only with explicit lead approval, documented in report
4. **Never force approval** — An unmet gate means the task is incomplete

**Re-check policy:** After any fix, re-run affected gates before claiming pass.
