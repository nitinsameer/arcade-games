/**
 * Course (Subject) Page Renderer
 * Browse lessons for a specific subject
 */

import { SUBJECTS, getSubject } from '../subjects/index.js'

/**
 * Render course page
 * @param {Object} state - Application state
 * @param {Object} route - Route information with params
 * @returns {string} HTML content
 */
export function renderCourse(state, route) {
  const { id: subjectId } = route.params
  const subject = getSubject(subjectId)

  if (!subject) {
    return `
      <div class="phone">
        <div class="top">
          <button class="back" data-go="/explore">←</button>
          <h1 style="margin: 0">Subject Not Found</h1>
        </div>
        <div style="text-align: center; margin-top: 40px">
          <p>Sorry, this subject doesn't exist.</p>
          <button class="cta" data-go="/explore">Back to Subjects</button>
        </div>
      </div>
    `
  }

  const lessonsDone = state.done?.[subjectId]?.length || 0
  const lessons = Array.from({ length: subject.lessons }, (_, i) => {
    const isLocked = i > lessonsDone && lessonsDone > 0
    const isDone = state.done?.[subjectId]?.includes(i)

    return `
      <button 
        class="lesson-card raise" 
        data-go="/lesson/${subjectId}/${i}"
        style="--t: ${subject.tint}; opacity: ${isLocked ? 0.5 : 1}; pointer-events: ${isLocked ? 'none' : 'auto'}"
      >
        <div style="font-size: 48px; margin-bottom: 8px">
          ${isDone ? '✅' : i + 1}
        </div>
        <div style="font-weight: 800; font-size: 14px">Lesson ${i + 1}</div>
        ${isDone ? '<div style="font-size: 11px; color: var(--green); margin-top: 4px">Completed</div>' : ''}
        ${isLocked ? '<div style="font-size: 11px; color: var(--mute); margin-top: 4px">🔒 Locked</div>' : ''}
      </button>
    `
  }).join('')

  return `
    <div class="phone">
      <div class="top">
        <button class="back" data-go="/explore" style="background: none; border: none; cursor: pointer; font-size: 24px; padding: 0">←</button>
        <div style="text-align: center; flex: 1">
          <div style="font-size: 40px; margin-bottom: 8px">${subject.emoji}</div>
          <h1 style="margin: 0">${subject.name}</h1>
        </div>
        <div class="star" style="font-size: 18px; padding: 8px 16px">${state.stars || 0} ⭐</div>
      </div>

      <div style="margin-top: 16px; text-align: center; color: var(--mute)">
        <p style="margin: 0; font-size: 13px">Progress: ${lessonsDone}/${subject.lessons} lessons completed</p>
      </div>

      <div class="lessons-grid" style="margin-top: 24px">
        ${lessons}
      </div>

      <button class="cta" data-go="/quiz/${subjectId}" style="width: 100%; margin-top: 24px">
        📝 Take Quiz
      </button>

      <style>
        .lessons-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .lesson-card {
          padding: 20px 16px;
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
        .lesson-card:active {
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
