/**
 * Lesson Page Renderer
 * Display lesson content and quiz
 */

import { getSubject } from '../subjects/index.js'

// Sample lesson content data (would be extended with real content)
const LESSON_CONTENT = {
  math: [
    { title: 'Counting 1-10', content: 'Learn to count from 1 to 10' },
    { title: 'Basic Addition', content: 'Learn simple addition (1+1, 1+2)' },
    { title: 'Subtraction Basics', content: 'Learn simple subtraction' },
    { title: 'Numbers 1-20', content: 'Count and recognize numbers 1-20' },
    { title: 'Skip Counting', content: 'Count by 2s, 5s, and 10s' }
  ],
  science: [
    { title: 'The Sun', content: 'Learn about our star' },
    { title: 'The Moon', content: 'Explore Earth\'s moon' },
    { title: 'Animals', content: 'Meet different animals' },
    { title: 'Plants', content: 'Learn about plants' },
    { title: 'Weather', content: 'Understand weather patterns' }
  ],
  reading: [
    { title: 'Letter A', content: 'Recognize and learn letter A' },
    { title: 'Letter B', content: 'Recognize and learn letter B' },
    { title: 'Short Vowels', content: 'Learn A, E, I, O, U sounds' },
    { title: 'Simple Words', content: 'Read simple 3-letter words' },
    { title: 'Rhymes', content: 'Learn rhyming words' }
  ],
  art: [
    { title: 'Primary Colors', content: 'Red, Yellow, and Blue' },
    { title: 'Secondary Colors', content: 'Mixing primary colors' },
    { title: 'Warm Colors', content: 'Red, orange, yellow' },
    { title: 'Cool Colors', content: 'Blue, purple, green' },
    { title: 'Shapes', content: 'Circle, square, triangle' }
  ],
  music: [
    { title: 'Beat', content: 'Feel the rhythm' },
    { title: 'Notes', content: 'Learn musical notes' },
    { title: 'Instruments', content: 'Explore different instruments' },
    { title: 'Melody', content: 'Learn to sing melodies' },
    { title: 'Rhythm', content: 'Keep the beat' }
  ],
  puzzle: [
    { title: 'Patterns', content: 'Find the pattern' },
    { title: 'Logic', content: 'Solve logic puzzles' },
    { title: 'Shapes', content: 'Match and sort shapes' },
    { title: 'Sequences', content: 'Continue the sequence' },
    { title: 'Matching', content: 'Find matching pairs' }
  ],
  animals: [
    { title: 'Pets vs Wild', content: 'Pets are animals we keep' },
    { title: 'Farm Animals', content: 'Cow, pig, chicken, sheep' },
    { title: 'Jungle Animals', content: 'Lion, tiger, monkey, elephant' },
    { title: 'Ocean Animals', content: 'Fish, dolphin, whale, octopus' },
    { title: 'Flying Animals', content: 'Birds and insects' }
  ],
  space: [
    { title: 'The Sun', content: 'Our bright star' },
    { title: 'The Moon', content: 'Earth\'s natural satellite' },
    { title: 'Planets', content: 'Explore our solar system' },
    { title: 'Stars', content: 'Twinkle, twinkle little star' },
    { title: 'Astronauts', content: 'People who travel to space' }
  ],
  world: [
    { title: 'Continents', content: 'The 7 continents' },
    { title: 'Countries', content: 'Different countries' },
    { title: 'Landmarks', content: 'Famous landmarks' },
    { title: 'India', content: 'Learn about India' },
    { title: 'Flags', content: 'Country flags' }
  ],
  hindi: [
    { title: 'अ (A)', content: 'Learn Hindi letter अ' },
    { title: 'आ (Aa)', content: 'Learn Hindi letter आ' },
    { title: 'इ (I)', content: 'Learn Hindi letter इ' },
    { title: 'ई (Ee)', content: 'Learn Hindi letter ई' },
    { title: 'Numbers 1-10', content: 'Count in Hindi' }
  ],
  health: [
    { title: 'The Senses', content: 'See, hear, touch, taste, smell' },
    { title: 'Healthy Food', content: 'Eat fruits and vegetables' },
    { title: 'Hygiene', content: 'Wash hands and brush teeth' },
    { title: 'Exercise', content: 'Play and stay active' },
    { title: 'Sleep', content: 'Get enough rest' }
  ],
  money: [
    { title: 'Coins', content: 'Learn about coins' },
    { title: 'Counting Money', content: 'Count coins and notes' },
    { title: 'Save vs Spend', content: 'Learn to save money' },
    { title: 'Buying Things', content: 'Use money to buy' },
    { title: 'Making Change', content: 'Learn about change' }
  ]
}

/**
 * Render lesson page
 * @param {Object} state - Application state
 * @param {Object} route - Route information with params
 * @returns {string} HTML content
 */
export function renderLesson(state, route) {
  const { id: subjectId, index: lessonIndex } = route.params
  const subject = getSubject(subjectId)
  const lessonNum = parseInt(lessonIndex)

  if (!subject || isNaN(lessonNum) || lessonNum < 0 || lessonNum >= subject.lessons) {
    return `
      <div class="phone">
        <div class="top">
          <button class="back" data-go="/explore">←</button>
          <h1 style="margin: 0">Lesson Not Found</h1>
        </div>
      </div>
    `
  }

  const lessons = LESSON_CONTENT[subjectId] || LESSON_CONTENT.math
  const lesson = lessons[lessonNum] || { title: `Lesson ${lessonNum + 1}`, content: '' }

  return `
    <div class="phone">
      <div class="top">
        <button class="back" data-go="/course/${subjectId}" style="background: none; border: none; cursor: pointer; font-size: 24px; padding: 0">←</button>
        <h1 style="margin: 0; flex: 1; text-align: center">${subject.name}</h1>
        <div class="star" style="font-size: 18px; padding: 8px 16px">${state.stars || 0} ⭐</div>
      </div>

      <div class="les raise" style="margin-top: 24px; padding: 24px; text-align: center">
        <div style="font-size: 64px; margin-bottom: 16px">${subject.emoji}</div>
        <h2 style="margin: 0 0 16px 0; font-size: 20px">${lesson.title}</h2>
        <p style="margin: 0; color: var(--mute); font-size: 14px; line-height: 1.6">
          ${lesson.content}
        </p>
      </div>

      <div style="margin-top: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px">
        <button class="cta alt" data-go="/course/${subjectId}" style="width: 100%">
          ← Previous
        </button>
        <button class="cta" data-go="/quiz/${subjectId}" style="width: 100%">
          Next →
        </button>
      </div>

      <style>
        .les {
          border-radius: var(--r);
          box-shadow: var(--sh);
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
