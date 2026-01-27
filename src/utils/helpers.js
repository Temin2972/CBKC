/**
 * General helper utility functions
 */

import { USER_ROLES, STUDENT_EMAIL_DOMAIN } from '../constants'

/**
 * Check if user has counselor privileges
 * @param {Object} user - User object
 * @returns {boolean}
 */
export function isCounselor(user) {
  const role = user?.user_metadata?.role
  return role === USER_ROLES.COUNSELOR || role === USER_ROLES.ADMIN
}

/**
 * Check if user is an admin
 * @param {Object} user - User object
 * @returns {boolean}
 */
export function isAdmin(user) {
  return user?.user_metadata?.role === USER_ROLES.ADMIN
}

/**
 * Check if user is a student
 * @param {Object} user - User object
 * @returns {boolean}
 */
export function isStudent(user) {
  return user?.user_metadata?.role === USER_ROLES.STUDENT
}

/**
 * Get user's role
 * @param {Object} user - User object
 * @returns {string | undefined}
 */
export function getUserRole(user) {
  return user?.user_metadata?.role
}

/**
 * Get user's display name
 * @param {Object} user - User object
 * @returns {string}
 */
export function getUserDisplayName(user) {
  return user?.user_metadata?.full_name || user?.email || 'Người dùng'
}

/**
 * Convert username to student email format
 * @param {string} username - Username
 * @returns {string} Email format
 */
export function usernameToEmail(username) {
  return `${username}.student@${STUDENT_EMAIL_DOMAIN}`
}

/**
 * Generate a unique filename for uploads
 * @param {string} userId - User ID
 * @param {string} originalFilename - Original filename
 * @returns {string} Unique filename
 */
export function generateUploadFilename(userId, originalFilename) {
  const extension = originalFilename.split('.').pop()
  return `${userId}-${Date.now()}.${extension}`
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Create a simple unique ID
 * @returns {string}
 */
export function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

/**
 * Check if browser supports notifications
 * @returns {boolean}
 */
export function supportsNotifications() {
  return 'Notification' in window
}

/**
 * Check if notification permission is granted
 * @returns {boolean}
 */
export function hasNotificationPermission() {
  return supportsNotifications() && Notification.permission === 'granted'
}

/**
 * Request notification permission
 * @returns {Promise<boolean>}
 */
export async function requestNotificationPermission() {
  if (!supportsNotifications()) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false

  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

/**
 * Show browser notification
 * @param {string} title - Notification title
 * @param {Object} options - Notification options
 */
export function showBrowserNotification(title, options = {}) {
  if (!hasNotificationPermission()) return

  new Notification(title, {
    icon: '/icon.svg',
    badge: '/icon.svg',
    ...options,
  })
}

/**
 * Safely parse JSON
 * @param {string} json - JSON string
 * @param {*} fallback - Fallback value if parsing fails
 * @returns {*}
 */
export function safeParseJSON(json, fallback = null) {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}
