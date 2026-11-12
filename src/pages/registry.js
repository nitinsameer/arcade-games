/**
 * Page Registry - Central route-to-renderer mapping
 * Maps all application routes to their corresponding renderer functions
 */

import { renderHome } from './home.js'
import { renderExplore } from './explore.js'
import { renderGames } from './games.js'
import { renderGame } from './game.js'
import { renderCourse } from './course.js'
import { renderLesson } from './lesson.js'
import { renderQuiz } from './quiz.js'
import { renderSettings } from './settings.js'
import { renderProfile } from './profile.js'
import { renderNotFound } from './not-found.js'
import { renderError } from './error.js'

/**
 * Page Registry - all available routes
 */
export const PAGE_REGISTRY = {
  '/home': renderHome,
  '/explore': renderExplore,
  '/games': renderGames,
  '/game/:id': renderGame,
  '/course/:id': renderCourse,
  '/lesson/:id/:index': renderLesson,
  '/quiz/:id': renderQuiz,
  '/settings': renderSettings,
  '/profile': renderProfile,
  '/404': renderNotFound,
  '/error': renderError
}

/**
 * Parse route parameters from path
 * Converts /game/simon -> { gameId: 'simon' }
 * Converts /lesson/math/0 -> { subjectId: 'math', lessonIndex: 0 }
 */
function parseRouteParams(pattern, path) {
  const patternParts = pattern.split('/')
  const pathParts = path.split('/')
  const params = {}

  patternParts.forEach((part, i) => {
    if (part.startsWith(':')) {
      const paramName = part.slice(1)
      params[paramName] = pathParts[i]
    }
  })

  return params
}

/**
 * Get the appropriate renderer for a given path
 * Handles exact matches and parameterized routes
 * @param {string} path - Route path (e.g., '/game/simon', '/home')
 * @returns {Function|null} Renderer function or null if no match
 */
export function getPageRenderer(path) {
  // Try exact match first
  if (PAGE_REGISTRY[path]) {
    return (state, route) => PAGE_REGISTRY[path](state, { ...route, params: {} })
  }

  // Try pattern matching for parameterized routes
  for (const [pattern, renderer] of Object.entries(PAGE_REGISTRY)) {
    if (pattern.includes(':')) {
      const patternRegex = pattern
        .split('/')
        .map(part => (part.startsWith(':') ? '([^/]+)' : part))
        .join('/')

      const regex = new RegExp(`^${patternRegex}$`)
      if (regex.test(path)) {
        const params = parseRouteParams(pattern, path)
        return (state, route) => renderer(state, { ...route, params })
      }
    }
  }

  // No match found
  return null
}

/**
 * Get the route pattern that matches a path
 * Useful for setting active navigation
 */
export function getRoutePattern(path) {
  // Check exact matches
  if (PAGE_REGISTRY[path]) {
    return path
  }

  // Check pattern matches
  for (const pattern of Object.keys(PAGE_REGISTRY)) {
    if (pattern.includes(':')) {
      const patternRegex = pattern
        .split('/')
        .map(part => (part.startsWith(':') ? '([^/]+)' : part))
        .join('/')

      const regex = new RegExp(`^${patternRegex}$`)
      if (regex.test(path)) {
        return pattern
      }
    }
  }

  return null
}
