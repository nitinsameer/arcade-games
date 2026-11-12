/**
 * Quiz Page Renderer
 * Display quiz questions for a subject
 */

import { getSubject } from '../subjects/index.js'

// Sample quiz questions (would be extended with real content)
const QUIZ_DATA = {
  math: [
    { q: 'What is 1 + 1?', opts: ['2', '3', '1'], ans: 0 },
    { q: 'What is 2 + 2?', opts: ['4', '5', '3'], ans: 0 },
    { q: 'What is 5 - 2?', opts: ['3', '4', '2'], ans: 0 },
    { q: 'Count: 1, 2, 3, ?', opts: ['4', '2', '1'], ans: 0 },
    { q: 'What is 3 + 2?', opts: ['5', '4', '6'], ans: 0 }
  ],
  science: [
    { q: 'The sun gives us?', opts: ['Light', 'Cold', 'Wind'], ans: 0 },
    { q: 'Birds can?', opts: ['Fly', 'Swim', 'Run only'], ans: 0 },
    { q: 'Plants need?', opts: ['Water', 'Fire', 'Ice'], ans: 0 },
    { q: 'We breathe?', opts: ['Air', 'Water', 'Soil'], ans: 0 },
    { q: 'Leaves are?', opts: ['Green', 'Blue', 'Red'], ans: 0 }
  ],
  reading: [
    { q: 'Which letter is this: A', opts: ['A', 'B', 'C'], ans: 0 },
    { q: 'Which letter is this: B', opts: ['A', 'B', 'C'], ans: 1 },
    { q: 'CAT ends with?', opts: ['T', 'A', 'C'], ans: 0 },
    { q: 'DOG starts with?', opts: ['D', 'O', 'G'], ans: 0 },
    { q: 'Which rhymes with CAT?', opts: ['BAT', 'DOG', 'SUN'], ans: 0 }
  ],
  art: [
    { q: 'Red and blue make?', opts: ['Purple', 'Green', 'Orange'], ans: 0 },
    { q: 'Yellow is a?', opts: ['Warm color', 'Cool color', 'Dark color'], ans: 0 },
    { q: 'How many sides has a square?', opts: ['4', '3', '5'], ans: 0 },
    { q: 'A circle has how many sides?', opts: ['0', '1', '4'], ans: 0 },
    { q: 'Blue is a?', opts: ['Cool color', 'Warm color', 'Bright color'], ans: 0 }
  ],
  music: [
    { q: 'A beat helps us?', opts: ['Keep rhythm', 'Sleep', 'Eat'], ans: 0 },
    { q: 'A song has?', opts: ['Melody', 'Food', 'Toys'], ans: 0 },
    { q: 'Drums are?', opts: ['Instruments', 'Toys', 'Clothes'], ans: 0 },
    { q: 'We sing with?', opts: ['Our voice', 'Our feet', 'Our hands'], ans: 0 },
    { q: 'Piano has?', opts: ['Keys', 'Strings', 'Holes'], ans: 0 }
  ],
  puzzle: [
    { q: 'What comes next: 1, 2, 3, ?', opts: ['4', '2', '1'], ans: 0 },
    { q: 'What is different: ⭕ ⭕ 🟩 ⭕', opts: ['🟩', '⭕', 'Nothing'], ans: 0 },
    { q: 'Continue: 2, 4, 6, ?', opts: ['8', '5', '3'], ans: 0 },
    { q: 'Find the pattern: A, B, A, B, ?', opts: ['A', 'C', 'B'], ans: 0 },
    { q: 'What is similar: 🍎 🍊 🍌 🚗', opts: ['Nothing', 'All round', 'All food'], ans: 2 }
  ],
  animals: [
    { q: 'A cow is a?', opts: ['Farm animal', 'Wild animal', 'Bird'], ans: 0 },
    { q: 'A lion lives in?', opts: ['Jungle', 'Farm', 'Ocean'], ans: 0 },
    { q: 'Fish live in?', opts: ['Water', 'Air', 'Land'], ans: 0 },
    { q: 'Birds have?', opts: ['Wings', 'Fins', 'Legs only'], ans: 0 },
    { q: 'A pet is?', opts: ['Animal we keep', 'Wild animal', 'Toy'], ans: 0 }
  ],
  space: [
    { q: 'The sun is a?', opts: ['Star', 'Planet', 'Moon'], ans: 0 },
    { q: 'The moon looks?', opts: ['Round', 'Square', 'Triangle'], ans: 0 },
    { q: 'Stars are?', opts: ['Far away', 'Close', 'On Earth'], ans: 0 },
    { q: 'Astronauts travel to?', opts: ['Space', 'Ocean', 'Desert'], ans: 0 },
    { q: 'We live on?', opts: ['Earth', 'Moon', 'Sun'], ans: 0 }
  ],
  world: [
    { q: 'How many continents?', opts: ['7', '5', '10'], ans: 0 },
    { q: 'India is in?', opts: ['Asia', 'Africa', 'Europe'], ans: 0 },
    { q: 'We live on a?', opts: ['Planet', 'Star', 'Moon'], ans: 0 },
    { q: 'A country has?', opts: ['A flag', 'A star', 'A sun'], ans: 0 },
    { q: 'The ocean is?', opts: ['Water', 'Land', 'Sky'], ans: 0 }
  ],
  hindi: [
    { q: 'हिंदी letter अ is?', opts: ['A', 'B', 'C'], ans: 0 },
    { q: 'Count 1 in Hindi?', opts: ['एक', 'दो', 'तीन'], ans: 0 },
    { q: 'Count 2 in Hindi?', opts: ['दो', 'एक', 'तीन'], ans: 0 },
    { q: 'Count 3 in Hindi?', opts: ['तीन', 'एक', 'दो'], ans: 0 },
    { q: 'What letter is आ?', opts: ['Aa', 'A', 'E'], ans: 0 }
  ],
  health: [
    { q: 'We see with?', opts: ['Eyes', 'Ears', 'Nose'], ans: 0 },
    { q: 'We hear with?', opts: ['Ears', 'Eyes', 'Mouth'], ans: 0 },
    { q: 'We taste with?', opts: ['Tongue', 'Nose', 'Skin'], ans: 0 },
    { q: 'Vegetables are?', opts: ['Healthy', 'Candy', 'Junk'], ans: 0 },
    { q: 'We should wash?', opts: ['Hands', 'Face', 'Both'], ans: 2 }
  ],
  money: [
    { q: '1 + 1 coin = ?', opts: ['2', '1', '3'], ans: 0 },
    { q: 'To save means?', opts: ['Keep money', 'Spend', 'Lose'], ans: 0 },
    { q: 'We use money to?', opts: ['Buy things', 'Play', 'Sleep'], ans: 0 },
    { q: 'Coins are?', opts: ['Metal money', 'Paper', 'Plastic'], ans: 0 },
    { q: 'A coin worth 5 = ?', opts: ['5 coins of 1', '1 coin of 10', 'Paper'], ans: 0 }
  ]
}

/**
 * Render quiz page
 * @param {Object} state - Application state
 * @param {Object} route - Route information with params
 * @returns {string} HTML content
 */
export function renderQuiz(state, route) {
  const { id: subjectId } = route.params
  const subject = getSubject(subjectId)

  if (!subject) {
    return `
      <div class="phone">
        <div class="top">
          <button class="back" data-go="/explore">←</button>
          <h1 style="margin: 0">Quiz Not Found</h1>
        </div>
      </div>
    `
  }

  const questions = QUIZ_DATA[subjectId] || QUIZ_DATA.math
  const bestScore = state.best?.[subjectId] || 0

  // Generate quiz UI with first question
  const optionsHTML = questions[0].opts
    .map(
      (opt, i) => `
    <button class="opt raise" data-answer="${i}" style="width: 100%; padding: 16px; margin-bottom: 12px; border: none; border-radius: var(--r); cursor: pointer; background: var(--card); font-family: inherit; font-size: 14px; font-weight: 600;">
      ${opt}
    </button>
  `
    )
    .join('')

  return `
    <div class="phone">
      <div class="top">
        <button class="back" data-go="/course/${subjectId}" style="background: none; border: none; cursor: pointer; font-size: 24px; padding: 0">←</button>
        <div style="text-align: center; flex: 1">
          <h1 style="margin: 0; font-size: 16px">Quiz: ${subject.name}</h1>
          <div style="font-size: 12px; color: var(--mute); margin-top: 4px">Question 1 of ${questions.length}</div>
        </div>
        <div class="star" style="font-size: 18px; padding: 8px 16px">${state.stars || 0} ⭐</div>
      </div>

      <div class="qcard raise" style="margin-top: 24px; padding: 24px; text-align: center; border-radius: var(--r); box-shadow: var(--sh)">
        <div style="font-size: 48px; margin-bottom: 16px">${subject.emoji}</div>
        <h2 style="margin: 0; font-size: 18px">${questions[0].q}</h2>
      </div>

      <div class="opts" style="margin-top: 24px">
        ${optionsHTML}
      </div>

      <div style="margin-top: 24px; text-align: center; font-size: 12px; color: var(--mute)">
        ${bestScore > 0 ? `<p>Best score: ${bestScore}/${questions.length}</p>` : '<p>Take the quiz to earn stars!</p>'}
      </div>

      <style>
        .qcard {
          background: var(--card);
        }
        .opts {
          display: flex;
          flex-direction: column;
        }
        .opt:active {
          transform: scale(0.98);
          box-shadow: var(--sin);
        }
        .back {
          font-size: 24px;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--rs);
        }
        .back:active {
          background: var(--card);
        }
      </style>
    </div>
  `
}
