/**
 * Router Service
 * Hash-based routing for single-page app navigation
 */

let currentRoute = '#/home'
let routeHandlers = {}

/**
 * Register a route handler
 * @param {string} route - Route pattern (e.g., '/home', '/game/:id')
 * @param {Function} handler - Callback function for this route
 */
export function registerRoute(route, handler) {
  routeHandlers[route] = handler
}

/**
 * Register multiple routes at once
 * @param {Object} routes - Map of route -> handler
 */
export function registerRoutes(routes) {
  Object.assign(routeHandlers, routes)
}

/**
 * Get current route hash
 * @returns {string} Current hash path (e.g., '/home')
 */
export function getCurrentRoute() {
  return currentRoute
}

/**
 * Navigate to a route
 * @param {string} path - Path to navigate to
 */
export function navigate(path) {
  location.hash = path
}

/**
 * Parse current hash and return route + params
 * @returns {Object} { route, params }
 */
export function parseRoute() {
  const hash = location.hash.slice(1) || '/home'
  const [route, ...parts] = hash.split('/')
  return {
    path: hash,
    route: `/${route}`,
    params: parts
  }
}

/**
 * Initialize router - call on app startup
 * @param {Function} onRouteChange - Callback when route changes
 */
export function initRouter(onRouteChange) {
  const handleHashChange = () => {
    currentRoute = location.hash.slice(1) || '/home'
    onRouteChange(parseRoute())
  }

  window.addEventListener('hashchange', handleHashChange)
  // Initial route
  handleHashChange()
}

/**
 * Get all registered routes
 * @returns {Object} Map of routes
 */
export function getRoutes() {
  return { ...routeHandlers }
}
