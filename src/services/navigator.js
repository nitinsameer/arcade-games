/**
 * Navigator Service
 * High-level screen/page transition utilities
 */

import { navigate } from './router.js'

/**
 * Navigate to home screen
 */
export function goHome() {
  navigate('/home')
}

/**
 * Navigate to explore (all subjects)
 */
export function goExplore() {
  navigate('/explore')
}

/**
 * Navigate to progress tracking
 */
export function goProgress() {
  navigate('/progress')
}

/**
 * Navigate to themes selector
 */
export function goThemes() {
  navigate('/themes')
}

/**
 * Navigate to user profile
 */
export function goProfile() {
  navigate('/profile')
}

/**
 * Navigate to games list
 */
export function goGames() {
  navigate('/games')
}

/**
 * Navigate to a specific game
 * @param {string} gameId - ID of game to launch
 */
export function goGame(gameId) {
  navigate(`/game/${gameId}`)
}

/**
 * Navigate to a course/subject
 * @param {string} subjectId - ID of subject
 */
export function goCourse(subjectId) {
  navigate(`/course/${subjectId}`)
}

/**
 * Navigate to a lesson
 * @param {string} subjectId - ID of subject
 * @param {number} lessonIndex - Index of lesson in subject
 */
export function goLesson(subjectId, lessonIndex) {
  navigate(`/lesson/${subjectId}/${lessonIndex}`)
}

/**
 * Navigate to quiz for a subject
 * @param {string} subjectId - ID of subject to quiz on
 */
export function goQuiz(subjectId) {
  navigate(`/quiz/${subjectId}`)
}

/**
 * Generic navigation function
 * @param {string} path - Full path to navigate to
 */
export function go(path) {
  navigate(path)
}
