/**
 * Security Utilities
 * Comprehensive security measures for the application
 */

import DOMPurify from 'dompurify'

// ========================
// INPUT SANITIZATION
// ========================

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} dirty - Potentially dangerous HTML
 * @returns {string} Clean HTML
 */
export function sanitizeHTML(dirty) {
  if (!dirty) return ''
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'],
    ALLOWED_ATTR: []
  })
}

/**
 * Sanitize plain text - strip all HTML
 * @param {string} text - Text to sanitize
 * @returns {string} Plain text without HTML
 */
export function sanitizeText(text) {
  if (!text) return ''
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
}

/**
 * Sanitize and validate URL
 * @param {string} url - URL to validate
 * @returns {string|null} Valid URL or null
 */
export function sanitizeURL(url) {
  if (!url) return null
  
  try {
    const parsed = new URL(url)
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null
    }
    return parsed.href
  } catch {
    return null
  }
}

// ========================
// RATE LIMITING (Client-side)
// ========================

const rateLimitStore = new Map()

/**
 * Check if action is rate limited
 * @param {string} action - Action identifier
 * @param {number} maxAttempts - Max attempts allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} True if rate limited
 */
export function isRateLimited(action, maxAttempts = 5, windowMs = 60000) {
  const now = Date.now()
  const key = action
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, { attempts: 1, firstAttempt: now })
    return false
  }
  
  const record = rateLimitStore.get(key)
  
  // Reset if window has passed
  if (now - record.firstAttempt > windowMs) {
    rateLimitStore.set(key, { attempts: 1, firstAttempt: now })
    return false
  }
  
  // Check if exceeded
  if (record.attempts >= maxAttempts) {
    return true
  }
  
  // Increment
  record.attempts++
  return false
}

/**
 * Get remaining time until rate limit resets
 * @param {string} action - Action identifier
 * @param {number} windowMs - Time window in milliseconds
 * @returns {number} Remaining time in seconds
 */
export function getRateLimitRemaining(action, windowMs = 60000) {
  const record = rateLimitStore.get(action)
  if (!record) return 0
  
  const elapsed = Date.now() - record.firstAttempt
  const remaining = Math.max(0, windowMs - elapsed)
  return Math.ceil(remaining / 1000)
}

/**
 * Clear rate limit for an action
 * @param {string} action - Action identifier
 */
export function clearRateLimit(action) {
  rateLimitStore.delete(action)
}

// ========================
// CSRF PROTECTION
// ========================

/**
 * Generate CSRF token
 * @returns {string} CSRF token
 */
export function generateCSRFToken() {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Store CSRF token in session storage
 * @returns {string} Generated token
 */
export function setCSRFToken() {
  const token = generateCSRFToken()
  sessionStorage.setItem('csrf_token', token)
  return token
}

/**
 * Validate CSRF token
 * @param {string} token - Token to validate
 * @returns {boolean} Whether token is valid
 */
export function validateCSRFToken(token) {
  const storedToken = sessionStorage.getItem('csrf_token')
  return storedToken && storedToken === token
}

// ========================
// PASSWORD SECURITY
// ========================

/**
 * Validate password strength with detailed requirements
 * @param {string} password - Password to validate
 * @returns {{ isValid: boolean, score: number, errors: string[], suggestions: string[] }}
 */
export function validatePasswordStrength(password) {
  const errors = []
  const suggestions = []
  let score = 0
  
  if (!password) {
    return { isValid: false, score: 0, errors: ['Mật khẩu không được để trống'], suggestions: [] }
  }
  
  // Length check
  if (password.length < 8) {
    errors.push('Mật khẩu phải có ít nhất 8 ký tự')
  } else {
    score += 1
    if (password.length >= 12) score += 1
  }
  
  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    suggestions.push('Thêm chữ in hoa để tăng độ mạnh')
  } else {
    score += 1
  }
  
  // Lowercase check
  if (!/[a-z]/.test(password)) {
    suggestions.push('Thêm chữ thường')
  } else {
    score += 1
  }
  
  // Number check
  if (!/[0-9]/.test(password)) {
    suggestions.push('Thêm số để tăng độ mạnh')
  } else {
    score += 1
  }
  
  // Special character check
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    suggestions.push('Thêm ký tự đặc biệt (!@#$%...) để tăng độ mạnh')
  } else {
    score += 1
  }
  
  // Common patterns check
  const commonPatterns = [
    /^123456/,
    /^password/i,
    /^qwerty/i,
    /^abc123/i,
    /(.)\1{2,}/, // Repeated characters
  ]
  
  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      errors.push('Mật khẩu chứa mẫu quá phổ biến')
      score = Math.max(0, score - 2)
      break
    }
  }
  
  return {
    isValid: errors.length === 0 && score >= 3,
    score: Math.min(5, score),
    errors,
    suggestions
  }
}

// ========================
// SESSION SECURITY
// ========================

const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes
let sessionTimer = null
let lastActivity = Date.now()

/**
 * Update last activity timestamp
 */
export function updateActivity() {
  lastActivity = Date.now()
}

/**
 * Check if session has timed out
 * @returns {boolean} True if timed out
 */
export function isSessionTimedOut() {
  return Date.now() - lastActivity > SESSION_TIMEOUT
}

/**
 * Start session timeout monitoring
 * @param {Function} onTimeout - Callback when session times out
 */
export function startSessionMonitor(onTimeout) {
  if (sessionTimer) {
    clearInterval(sessionTimer)
  }
  
  lastActivity = Date.now()
  
  sessionTimer = setInterval(() => {
    if (isSessionTimedOut()) {
      clearInterval(sessionTimer)
      onTimeout()
    }
  }, 60000) // Check every minute
  
  // Update activity on user interaction
  const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
  events.forEach(event => {
    document.addEventListener(event, updateActivity, { passive: true })
  })
}

/**
 * Stop session timeout monitoring
 */
export function stopSessionMonitor() {
  if (sessionTimer) {
    clearInterval(sessionTimer)
    sessionTimer = null
  }
}

// ========================
// DATA ENCRYPTION HELPERS
// ========================

/**
 * Encode data to base64
 * @param {string} data - Data to encode
 * @returns {string} Base64 encoded string
 */
export function encodeBase64(data) {
  try {
    return btoa(encodeURIComponent(data))
  } catch {
    return ''
  }
}

/**
 * Decode base64 to string
 * @param {string} encoded - Base64 string
 * @returns {string} Decoded string
 */
export function decodeBase64(encoded) {
  try {
    return decodeURIComponent(atob(encoded))
  } catch {
    return ''
  }
}

/**
 * Hash string using SHA-256 (for non-sensitive data like cache keys)
 * @param {string} message - String to hash
 * @returns {Promise<string>} Hex hash
 */
export async function hashString(message) {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// ========================
// SECURE STORAGE
// ========================

const STORAGE_PREFIX = 'snet_'

/**
 * Securely store data in localStorage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 */
export function secureStore(key, value) {
  try {
    const data = JSON.stringify({
      value,
      timestamp: Date.now()
    })
    localStorage.setItem(STORAGE_PREFIX + key, encodeBase64(data))
  } catch (e) {
    console.error('Secure store error:', e)
  }
}

/**
 * Retrieve data from secure storage
 * @param {string} key - Storage key
 * @param {number} maxAge - Max age in milliseconds (optional)
 * @returns {any} Stored value or null
 */
export function secureRetrieve(key, maxAge = null) {
  try {
    const encoded = localStorage.getItem(STORAGE_PREFIX + key)
    if (!encoded) return null
    
    const decoded = decodeBase64(encoded)
    const data = JSON.parse(decoded)
    
    // Check age if maxAge specified
    if (maxAge && Date.now() - data.timestamp > maxAge) {
      localStorage.removeItem(STORAGE_PREFIX + key)
      return null
    }
    
    return data.value
  } catch {
    return null
  }
}

/**
 * Remove data from secure storage
 * @param {string} key - Storage key
 */
export function secureRemove(key) {
  localStorage.removeItem(STORAGE_PREFIX + key)
}

/**
 * Clear all secure storage data
 */
export function secureClearAll() {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(STORAGE_PREFIX)) {
      localStorage.removeItem(key)
    }
  })
}

// ========================
// REQUEST SECURITY
// ========================

/**
 * Add security headers to fetch options
 * @param {Object} options - Fetch options
 * @returns {Object} Options with security headers
 */
export function secureHeaders(options = {}) {
  const csrfToken = sessionStorage.getItem('csrf_token')
  
  return {
    ...options,
    headers: {
      ...options.headers,
      'X-Requested-With': 'XMLHttpRequest',
      'X-CSRF-Token': csrfToken || '',
    }
  }
}

// ========================
// LOGGING & AUDIT
// ========================

const securityLogs = []
const MAX_LOGS = 100

/**
 * Log security event
 * @param {string} event - Event type
 * @param {Object} details - Event details
 */
export function logSecurityEvent(event, details = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details,
    userAgent: navigator.userAgent
  }
  
  securityLogs.unshift(logEntry)
  
  // Keep only recent logs
  if (securityLogs.length > MAX_LOGS) {
    securityLogs.pop()
  }
  
  // Log to console in development
  if (import.meta.env.DEV) {
    console.log('🔒 Security Event:', event, details)
  }
}

/**
 * Get security logs
 * @returns {Array} Security logs
 */
export function getSecurityLogs() {
  return [...securityLogs]
}

// ========================
// INPUT VALIDATION
// ========================

/**
 * Validate and sanitize user input
 * @param {string} input - User input
 * @param {Object} options - Validation options
 * @returns {{ isValid: boolean, value: string, error: string|null }}
 */
export function validateInput(input, options = {}) {
  const {
    minLength = 0,
    maxLength = 10000,
    allowHTML = false,
    pattern = null,
    required = false
  } = options
  
  // Check required
  if (required && (!input || !input.trim())) {
    return { isValid: false, value: '', error: 'Trường này không được để trống' }
  }
  
  if (!input) {
    return { isValid: true, value: '', error: null }
  }
  
  // Sanitize
  let value = allowHTML ? sanitizeHTML(input) : sanitizeText(input)
  
  // Length checks
  if (value.length < minLength) {
    return { isValid: false, value, error: `Tối thiểu ${minLength} ký tự` }
  }
  
  if (value.length > maxLength) {
    return { isValid: false, value, error: `Tối đa ${maxLength} ký tự` }
  }
  
  // Pattern check
  if (pattern && !pattern.test(value)) {
    return { isValid: false, value, error: 'Định dạng không hợp lệ' }
  }
  
  return { isValid: true, value, error: null }
}

/**
 * Validate username format
 * @param {string} username - Username to validate
 * @returns {{ isValid: boolean, error: string|null }}
 */
export function validateUsername(username) {
  if (!username) {
    return { isValid: false, error: 'Tên đăng nhập không được để trống' }
  }
  
  if (username.length < 3) {
    return { isValid: false, error: 'Tên đăng nhập phải có ít nhất 3 ký tự' }
  }
  
  if (username.length > 20) {
    return { isValid: false, error: 'Tên đăng nhập không được quá 20 ký tự' }
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { isValid: false, error: 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới' }
  }
  
  // Check for reserved words
  const reserved = ['admin', 'root', 'system', 'moderator', 'counselor', 'support']
  if (reserved.includes(username.toLowerCase())) {
    return { isValid: false, error: 'Tên đăng nhập này không được phép sử dụng' }
  }
  
  return { isValid: true, error: null }
}

export default {
  // Sanitization
  sanitizeHTML,
  sanitizeText,
  sanitizeURL,
  
  // Rate limiting
  isRateLimited,
  getRateLimitRemaining,
  clearRateLimit,
  
  // CSRF
  generateCSRFToken,
  setCSRFToken,
  validateCSRFToken,
  
  // Password
  validatePasswordStrength,
  
  // Session
  updateActivity,
  isSessionTimedOut,
  startSessionMonitor,
  stopSessionMonitor,
  
  // Encryption
  encodeBase64,
  decodeBase64,
  hashString,
  
  // Storage
  secureStore,
  secureRetrieve,
  secureRemove,
  secureClearAll,
  
  // Request
  secureHeaders,
  
  // Logging
  logSecurityEvent,
  getSecurityLogs,
  
  // Validation
  validateInput,
  validateUsername
}
