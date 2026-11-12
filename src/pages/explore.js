/**
 * Explore Page Renderer
 * Browse all 12 subjects with lessons
 */

import { SUBJECTS } from '../subjects/index.js'

/**
 * Render explore (all subjects) page
 * @param {Object} state - Application state
 * @param {Object} route - Route information
 * @returns {string} HTML content
 */
export function renderExplore(state, route) {
  const subjectCards = SUBJECTS.map(subject => {
    const isCompleted = state.done?.[subject.id]?.length > 0
    const lessonsDone = state.done?.[subject.id]?.length || 0

    return `
      <button class="tile raise" data-go="/course/${subject.id}" style="--t: ${subject.tint}">
        <div style="font-size: 48px; margin-bottom: 8px">${subject.emoji}</div>
        <div style="font-weight: 800; font-size: 14px">${subject.name}</div>
        <div style="font-size: 11px; color: var(--mute); margin-top: 8px">
          ${lessonsDone}/${subject.lessons} lessons
        </div>
        ${isCompleted ? '<div style="margin-top: 8px">✅ Started</div>' : ''}
      </button>
    `
  }).join('')

  return `
    <div class="phone">
      <div class="top">
        <button class="back" data-go="/home" style="background: none; border: none; cursor: pointer; font-size: 24px; padding: 0">←</button>
        <h1 style="margin: 0; flex: 1; text-align: center">All Subjects</h1>
        <div class="star" style="font-size: 18px; padding: 8px 16px">${state.stars || 0} ⭐</div>
      </div>

      <div class="row4" style="margin-top: 24px">
        ${subjectCards}
      </div>

      <style>
        .row4 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .tile {
          padding: 16px 12px;
          border-radius: var(--r);
          border: none;
          cursor: pointer;
          background: var(--t, var(--card));
          color: var(--ink);
          font-family: inherit;
          text-align: center;
          transition: 0.2s;
          box-shadow: var(--sh);
        }
        .tile:active {
          transform: scale(0.97);
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
