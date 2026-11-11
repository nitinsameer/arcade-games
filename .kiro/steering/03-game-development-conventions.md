# Arcade Games: Game Development Conventions

## Game Registry Structure

All games are registered in the `GAMES` array at the top of `www/index.html`. Each entry defines metadata and configuration:

```javascript
const GAMES = [
  {
    id: 'simon',              // Unique identifier (kebab-case)
    name: 'Simon',            // Display name
    emoji: '🎮',              // Icon emoji
    tint: '#ff5a7e',          // Theme color (hex)
    bst: 'Best sequence...',  // High score label
    p2: false,                // Single-player: false, Two-player: true
    // Game-specific config below
  },
  // ... 14 more games
];
```

### Required Fields
- `id`: Unique string, must match game function name
- `name`: Display name (max 12 chars recommended)
- `emoji`: Unicode emoji (1–2 chars)
- `tint`: CSS hex color for card background
- `bst`: High score label (e.g., "Best Score", "Best Time", "Longest Sequence")
- `p2`: Boolean indicating multiplayer capability

### Optional Fields
- `levels`: Array of level configurations
- `difficulty`: Starting difficulty (easy/medium/hard)
- `minPlayers`, `maxPlayers`: Constraints for multiplayer

## Game Lifecycle

### Initialization
```javascript
function [gameId]Start() {
  // 1. Clear previous game state
  // 2. Initialize game-specific state
  // 3. Set up event listeners (if not delegated)
  // 4. Render initial screen
  // 5. Start audio context
  
  let gameState = {
    active: true,
    score: 0,
    level: 1,
    startTime: Date.now(),
    sequence: [],
    userInput: [],
  };
  
  render();
}
```

### Playing
```javascript
// Game update loop (event-driven, not tick-based)
function handleGameInput(input) {
  if (!gameState.active) return;
  
  gameState.userInput.push(input);
  sfx('tap');  // Play feedback
  
  // Validate move
  if (isValidMove(input)) {
    gameState.score += points;
    render();
  } else {
    gameState.lives--;
    sfx('wrong');
    if (gameState.lives <= 0) endGame(false);
    else render();
  }
}
```

### Completion
```javascript
function endGame(won) {
  gameState.active = false;
  
  // 1. Calculate final score
  const finalScore = gameState.score;
  
  // 2. Update high score if needed
  if (finalScore > (S.gb[currentGame] || 0)) {
    S.gb[currentGame] = finalScore;
  }
  
  // 3. Play end sound
  sfx('end', won ? 2 : 0);  // arg: 2 = victory, 0 = defeat
  
  // 4. Persist state
  save();
  
  // 5. Show result screen
  renderGameOver(won, finalScore);
  
  // 6. Provide navigation back to games list
}
```

## Rendering Patterns

### Game Screen Template
```javascript
function render[GameId]() {
  return `
    <div class="top">
      <button class="back" data-go="/games">←</button>
      <h1>${GAMES.find(g => g.id === currentGame).name}</h1>
      <div class="star">${gameState.score}</div>
    </div>
    
    <div class="gstage">
      <!-- Game-specific content -->
      <div class="arena">
        <!-- Game arena (canvas/grid/buttons) -->
      </div>
      
      <!-- Controls -->
      <div class="row2">
        <button class="cta" data-act="resume" ${!gameState.active ? 'disabled' : ''}>Continue</button>
        <button class="cta alt" data-go="/games">Quit</button>
      </div>
    </div>
  `;
}
```

### Result Screen Template
```javascript
function renderGameOver(won, score) {
  const message = won 
    ? `You won! Final score: ${score}` 
    : `Game over. Score: ${score}`;
  
  return `
    <div class="gstage">
      <div class="trophy">${won ? '🏆' : '😢'}</div>
      <h2>${message}</h2>
      <div class="star">${S.gb[currentGame] || 0}</div>
      <small>Best score</small>
      <button class="cta" data-go="/game/${currentGame}">Play Again</button>
      <button class="cta alt" data-go="/games">Back to Games</button>
    </div>
  `;
}
```

## State Management

### Local Game State
```javascript
// Declare at game function scope
let gameState = {
  active: true,
  score: 0,
  lives: 3,
  level: 1,
  moves: [],
  // Game-specific fields
};

// Update via spread (if complex)
gameState = { ...gameState, score: gameState.score + 10 };

// Direct mutation OK for local game state (not global S)
gameState.lives--;
```

### High Score Persistence
```javascript
// Write to global state after game ends
S.gb = {
  ...S.gb,
  [currentGame]: Math.max(S.gb[currentGame] || 0, finalScore)
};
save();

// Read for display
const bestScore = S.gb[currentGame] || 0;
```

### Avoid Global State Leakage
```javascript
// ❌ Bad: Game state persisted to S
S.currentSequence = [];

// ✅ Good: Local game state only
let gameState = { sequence: [] };
```

## Input Handling

### Delegated Event Listeners
```javascript
// Add to top-level click handler
document.addEventListener('click', (e) => {
  if (e.target.dataset.act === 'gameInput') {
    const inputType = e.target.dataset.input;
    handleGameInput(inputType);
  }
});
```

### Two-Player Input Swapping
```javascript
function handleTwoPlayerInput(input) {
  gameState.currentPlayer = gameState.currentPlayer === 0 ? 1 : 0;
  
  if (gameState.currentPlayer === 1) {
    // Show "Pass device to Player 2" toast
    toast('Pass the device to Player 2');
    setTimeout(() => continueGame(), 2000);
  }
}
```

### Keyboard Input (for typing games)
```javascript
document.addEventListener('keypress', (e) => {
  if (!currentScreen.startsWith('game/')) return;
  if (!gameState.active) return;
  
  const key = e.key.toLowerCase();
  handleGameInput(key);
});
```

## Audio & Sound Effects

### Theme-Aware Sound Synthesis
```javascript
// Define in SND object (already complete)
const SND = {
  clay: { w: 'sine', p: 1, d: 1, v: 1 },
  cyber: { w: 'sawtooth', p: 1, d: 1, v: 0.4, fx: 1 },
  // ...
};

// Call sfx() with event name
sfx('tap');        // Input feedback
sfx('correct');    // Right answer
sfx('wrong');      // Wrong answer
sfx('lesson');     // Lesson complete
sfx('end', 2);     // Victory (arg: 2=victory, 1=good, 0=loss)
sfx('note', idx);  // Note (arg: 0–3 for musical notes)
sfx('pop');        // Pop/bubble burst
sfx('theme');      // Theme change confirmation
```

### Fallback for Silent Mode
```javascript
// sfx() checks S.sound automatically
if (!S.sound) return;  // No sound effects if disabled

// Graceful audio context failure
const ctx = ac();
if (!ctx) return;  // Audio not supported
```

## Scoring Patterns

### Consistent Point Awards
```javascript
const POINTS = {
  gameWin: 30,      // Winning a game
  gameLose: 5,      // Losing but participating
  levelComplete: 10,
  perfectRound: 15,
  speedBonus: 5,    // For time-based challenges
};

gameState.score += POINTS.gameWin;
```

### Time-Based Scoring
```javascript
function calculateTimeBonus(elapsedMs, maxMs) {
  const ratio = Math.max(0, 1 - (elapsedMs / maxMs));
  return Math.floor(ratio * 20);  // Max 20 bonus points
}
```

## Two-Player Game Patterns

### Turn Switching
```javascript
function switchPlayer() {
  gameState.currentPlayer = gameState.currentPlayer === 0 ? 1 : 0;
  gameState.players[gameState.currentPlayer].ready = false;
  toast(`Player ${gameState.currentPlayer + 1}'s turn`);
  renderTurn();
}
```

### Score Tracking Per Player
```javascript
let gameState = {
  players: [
    { name: 'Player 1', score: 0 },
    { name: 'Player 2', score: 0 },
  ],
  currentPlayer: 0,
};

function endTwoPlayerGame() {
  const p1Score = gameState.players[0].score;
  const p2Score = gameState.players[1].score;
  
  if (p1Score > p2Score) {
    renderGameOver(true, p1Score, 'Player 1 Wins!');
  } else if (p2Score > p1Score) {
    renderGameOver(true, p2Score, 'Player 2 Wins!');
  } else {
    renderGameOver(false, p1Score, 'Tie!');
  }
}
```

## Common Game Patterns

### Memory/Sequence Game
```javascript
function playSequence() {
  gameState.sequence.push(Math.floor(Math.random() * 4));
  gameState.userInput = [];
  
  gameState.sequence.forEach((note, i) => {
    setTimeout(() => {
      highlightPad(note);
      sfx('note', note);
    }, (i + 1) * 600);
  });
}

function checkUserInput(input) {
  gameState.userInput.push(input);
  sfx('note', input);
  
  const index = gameState.userInput.length - 1;
  if (gameState.userInput[index] !== gameState.sequence[index]) {
    sfx('wrong');
    endGame(false);
    return false;
  }
  
  if (gameState.userInput.length === gameState.sequence.length) {
    gameState.level++;
    setTimeout(playSequence, 1000);
  }
  return true;
}
```

### Quiz Game
```javascript
function renderQuiz(question, options) {
  return `
    <div class="qcard">
      <div><span class="qe">${question.emoji || '🤔'}</span></div>
      <h2>${question.text}</h2>
    </div>
    <div class="opts3">
      ${options.map((opt, i) => `
        <button class="mb2" data-act="answer" data-idx="${i}">
          ${opt}
        </button>
      `).join('')}
    </div>
  `;
}

function handleAnswer(selectedIdx) {
  const correct = selectedIdx === 0;  // First option is always correct
  sfx(correct ? 'correct' : 'wrong');
  gameState.score += correct ? 10 : 0;
  
  if (gameState.questionIndex < gameState.questions.length - 1) {
    gameState.questionIndex++;
    render();
  } else {
    endGame(gameState.score > gameState.questions.length * 5);
  }
}
```

### Tapping/Reflexes Game
```javascript
function startRound() {
  gameState.targets = generateRandomTargets(5);
  gameState.tapped = 0;
  gameState.roundStart = Date.now();
  gameState.active = true;
  render();
}

function handleTap(targetId) {
  if (!gameState.targets.find(t => t.id === targetId)) {
    sfx('wrong');
    return;  // Missed target
  }
  
  gameState.tapped++;
  sfx('correct');
  gameState.targets = gameState.targets.filter(t => t.id !== targetId);
  
  if (gameState.tapped === 5) {
    const time = Date.now() - gameState.roundStart;
    gameState.score += Math.max(5, 100 - time / 10);
    endGame(true);
  }
}
```

## Testing Guidelines

### Game Logic Unit Tests
```javascript
// Test sequence validation
assert(checkUserInput(0) === true);  // Correct
assert(checkUserInput(1) === false); // Wrong sequence

// Test scoring
assert(calculateScore(300) === 20);  // Time bonus

// Test state transitions
assert(gameState.active === false);  // After end game
```

### Manual Gameplay Testing
- [ ] Game starts from "Games" list
- [ ] Initial state renders correctly
- [ ] User input is recognized and scored
- [ ] Sound effects play (when enabled)
- [ ] High score is saved and persists
- [ ] Game over screen shows final score
- [ ] Quit returns to games list without saving
- [ ] Two-player: turn switching works
- [ ] Two-player: both players can input
- [ ] No console errors during play

## Performance Optimization

### Avoid Layout Thrashing
```javascript
// ❌ Bad: Forces reflow in loop
for (let i = 0; i < 10; i++) {
  element.style.left = getComputedStyle(element).left;
}

// ✅ Good: Batch DOM reads/writes
const positions = Array.from(elements).map(el => el.offsetLeft);
elements.forEach((el, i) => el.style.left = positions[i] + 'px');
```

### Efficient Rendering
```javascript
// For animations, use CSS transitions
element.style.transition = 'transform 0.2s';
element.style.transform = 'scale(0.97)';

// Not JS timers for visual effects
```

### Memory Cleanup
```javascript
function endGame() {
  // Cancel pending timeouts/intervals
  clearTimeout(gameState.timer);
  clearInterval(gameState.loop);
  
  // Remove dynamic event listeners (if game-specific)
  document.removeEventListener('keypress', handleGameKeypress);
  
  gameState = null;  // Release reference
}
```
