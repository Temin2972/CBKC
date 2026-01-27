/**
 * Validation utility functions
 */

import { PASSWORD_RULES, FILE_LIMITS } from '../constants'
import { validatePasswordStrength, validateUsername as secureValidateUsername } from '../lib/security'

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether the email is valid
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength (enhanced)
 * @param {string} password - Password to validate
 * @returns {{ isValid: boolean, error: string | null, score: number }}
 */
export function validatePassword(password) {
  if (!password) {
    return { isValid: false, error: 'Mật khẩu không được để trống', score: 0 }
  }

  // Use enhanced validation
  const strength = validatePasswordStrength(password)
  
  if (!strength.isValid) {
    return {
      isValid: false,
      error: strength.errors[0] || 'Mật khẩu chưa đủ mạnh',
      score: strength.score
    }
  }

  return { isValid: true, error: null, score: strength.score }
}

/**
 * Validate username (enhanced with security checks)
 * @param {string} username - Username to validate
 * @returns {{ isValid: boolean, error: string | null }}
 */
export function validateUsernameFormat(username) {
  return secureValidateUsername(username)
}

/**
 * Validate password confirmation
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {{ isValid: boolean, error: string | null }}
 */
export function validatePasswordMatch(password, confirmPassword) {
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Mật khẩu không khớp' }
  }

  return { isValid: true, error: null }
}

/**
 * Validate image file
 * @param {File} file - File to validate
 * @returns {{ isValid: boolean, error: string | null }}
 */
export function validateImageFile(file) {
  if (!file) {
    return { isValid: true, error: null }
  }

  if (file.size > FILE_LIMITS.MAX_IMAGE_SIZE) {
    return {
      isValid: false,
      error: `Kích thước ảnh không được vượt quá ${FILE_LIMITS.MAX_IMAGE_SIZE / (1024 * 1024)}MB`,
    }
  }

  if (!FILE_LIMITS.ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Định dạng ảnh không được hỗ trợ',
    }
  }

  return { isValid: true, error: null }
}

/**
 * Validate required fields
 * @param {Object} fields - Object with field names and values
 * @returns {{ isValid: boolean, errors: Object }}
 */
export function validateRequired(fields) {
  const errors = {}
  let isValid = true

  Object.entries(fields).forEach(([key, value]) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      errors[key] = 'Trường này không được để trống'
      isValid = false
    }
  })

  return { isValid, errors }
}

/**
 * Check if identifier is an email or username
 * @param {string} identifier - Email or username
 * @returns {boolean} True if email, false if username
 */
export function isEmail(identifier) {
  return identifier.includes('@')
}
