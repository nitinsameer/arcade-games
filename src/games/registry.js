/**
 * Games Registry - Metadata for all 15 arcade games
 * Each game has: id, name, emoji, tint, description, p2 flag, and function reference
 */

export const GAMES = [
  // Single-Player Games (9)
  {
    id: 'simon',
    name: 'Simon Says',
    emoji: '🎨',
    tint: '#ffd9a8',
    desc: 'Repeat the colour pattern.',
    p2: false,
    bst: 'Best Round'
  },
  {
    id: 'balloon',
    name: 'Balloon Pop',
    emoji: '🎈',
    tint: '#ffc6d9',
    desc: 'Pop the right number.',
    p2: false,
    bst: 'Best Score'
  },
  {
    id: 'scramble',
    name: 'Word Scramble',
    emoji: '🔤',
    tint: '#c4eccb',
    desc: 'Unscramble the word.',
    p2: false,
    bst: 'Best Score'
  },
  {
    id: 'hangman',
    name: 'Hangman Zoo',
    emoji: '🦁',
    tint: '#ffe3a3',
    desc: 'Guess the animal.',
    p2: false,
    bst: 'Best Score'
  },
  {
    id: 'mole',
    name: 'Whack-a-Mole',
    emoji: '🔨',
    tint: '#d9c8ff',
    desc: 'Tap moles, skip bombs.',
    p2: false,
    bst: 'Best Score'
  },
  {
    id: 'odd',
    name: 'Odd One Out',
    emoji: '🤔',
    tint: '#bfe3ff',
    desc: 'Find the different one.',
    p2: false,
    bst: 'Best Score'
  },
  {
    id: 'snake',
    name: 'Snake',
    emoji: '🐍',
    tint: '#c4eccb',
    desc: 'Eat apples, do not bite yourself.',
    p2: false,
    bst: 'Best Score'
  },
  {
    id: 'farm',
    name: 'Counting Farm',
    emoji: '🐄',
    tint: '#ffe3a3',
    desc: 'Count the animals.',
    p2: false,
    bst: 'Best Score'
  },
  {
    id: 'colormatch',
    name: 'Color Match',
    emoji: '🎨',
    tint: '#ffc6d9',
    desc: 'Tap the ink colour.',
    p2: false,
    bst: 'Best Score'
  },

  // Two-Player Games (6)
  {
    id: 'ttt2',
    name: 'Tic-Tac-Toe',
    emoji: '⭕',
    tint: '#bfe3ff',
    desc: 'Two players, one phone.',
    p2: true,
    bst: 'Wins'
  },
  {
    id: 'connect4',
    name: 'Connect Four',
    emoji: '🔴',
    tint: '#ffd9a8',
    desc: 'Get four in a row.',
    p2: true,
    bst: 'Wins'
  },
  {
    id: 'tug',
    name: 'Tug of War',
    emoji: '🏋️',
    tint: '#d9c8ff',
    desc: 'Tap fastest to win.',
    p2: true,
    bst: 'Wins'
  },
  {
    id: 'react',
    name: 'Reaction Duel',
    emoji: '⚡',
    tint: '#fff0b0',
    desc: 'First to tap on green.',
    p2: true,
    bst: 'Wins'
  },
  {
    id: 'mathduel',
    name: 'Math Duel',
    emoji: '🔢',
    tint: '#c8d4ff',
    desc: 'Solve it first.',
    p2: true,
    bst: 'Wins'
  },
  {
    id: 'rps2',
    name: 'Rock Paper Scissors',
    emoji: '✌️',
    tint: '#ffc6d9',
    desc: 'Pick in secret, then reveal.',
    p2: true,
    bst: 'Wins'
  }
];

export function getGame(gameId) {
  return GAMES.find(g => g.id === gameId);
}

export function getGamesList(groupByPlayers = false) {
  if (!groupByPlayers) {
    return GAMES;
  }
  return {
    singlePlayer: GAMES.filter(g => !g.p2),
    twoPlayer: GAMES.filter(g => g.p2)
  };
}
