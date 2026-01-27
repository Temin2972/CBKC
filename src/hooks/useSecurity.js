/**
 * Security Hook
 * Provides security utilities and session management for React components
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import {
  isRateLimited,
  getRateLimitRemaining,
  logSecurityEvent,
  startSessionMonitor,
  stopSessionMonitor,
  sanitizeText,
  validateInput,
  setCSRFToken
} from '../lib/security'
import { ROUTES } from '../constants'

// Session timeout in minutes
const SESSION_TIMEOUT_MINUTES = 30

/**
 * Hook for managing user security context
 */
export function useSecurity() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [sessionExpiring, setSessionExpiring] = useState(false)
  const warningTimeoutRef = useRef(null)

  // Initialize CSRF token on mount
  useEffect(() => {
    setCSRFToken()
  }, [])

  // Session timeout management
  useEffect(() => {
    if (!user) {
      stopSessionMonitor()
      return
    }

    const handleSessionTimeout = () => {
      logSecurityEvent('session_timeout', { userId: user.id })
      setSessionExpiring(false)
      signOut()
      navigate(ROUTES.LOGIN, { 
        state: { message: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' }
      })
    }

    // Start monitoring with a warning before timeout
    startSessionMonitor(() => {
      // Show warning 5 minutes before timeout
      setSessionExpiring(true)
      
      warningTimeoutRef.current = setTimeout(() => {
        handleSessionTimeout()
      }, 5 * 60 * 1000) // 5 minutes warning
    })

    return () => {
      stopSessionMonitor()
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current)
      }
    }
  }, [user, signOut, navigate])

  // Extend session
  const extendSession = useCallback(() => {
    setSessionExpiring(false)
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current)
    }
    logSecurityEvent('session_extended', { userId: user?.id })
  }, [user])

  return {
    sessionExpiring,
    extendSession
  }
}

/**
 * Hook for rate limiting actions
 */
export function useRateLimit(action, options = {}) {
  const { maxAttempts = 5, windowMs = 60000 } = options
  const [isLimited, setIsLimited] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0)

  const checkLimit = useCallback(() => {
    const limited = isRateLimited(action, maxAttempts, windowMs)
    setIsLimited(limited)
    
    if (limited) {
      const remaining = getRateLimitRemaining(action, windowMs)
      setRemainingTime(remaining)
      logSecurityEvent('rate_limit_exceeded', { action, remainingSeconds: remaining })
    }
    
    return !limited
  }, [action, maxAttempts, windowMs])

  // Update remaining time while limited
  useEffect(() => {
    if (!isLimited) return

    const interval = setInterval(() => {
      const remaining = getRateLimitRemaining(action, windowMs)
      setRemainingTime(remaining)
      
      if (remaining <= 0) {
        setIsLimited(false)
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isLimited, action, windowMs])

  return {
    isLimited,
    remainingTime,
    checkLimit
  }
}

/**
 * Hook for secure form handling
 */
export function useSecureForm(initialValues = {}) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = useCallback((name, value, options = {}) => {
    // Sanitize input
    const sanitized = options.allowHTML ? value : sanitizeText(value)
    
    setValues(prev => ({ ...prev, [name]: sanitized }))
    
    // Validate if options provided
    if (options.validate) {
      const validation = validateInput(sanitized, options)
      if (!validation.isValid) {
        setErrors(prev => ({ ...prev, [name]: validation.error }))
      } else {
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors[name]
          return newErrors
        })
      }
    }
  }, [])

  const handleSubmit = useCallback(async (submitFn, validateFn) => {
    setIsSubmitting(true)
    
    try {
      // Run validation if provided
      if (validateFn) {
        const validationErrors = validateFn(values)
        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors)
          logSecurityEvent('form_validation_failed', { errors: Object.keys(validationErrors) })
          return false
        }
      }
      
      await submitFn(values)
      logSecurityEvent('form_submitted', { fields: Object.keys(values) })
      return true
    } catch (error) {
      logSecurityEvent('form_submit_error', { error: error.message })
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }, [values])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
  }, [initialValues])

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    reset,
    setErrors
  }
}

/**
 * Hook for logging security events
 */
export function useSecurityLog() {
  const { user } = useAuth()

  const log = useCallback((event, details = {}) => {
    logSecurityEvent(event, {
      ...details,
      userId: user?.id,
      timestamp: new Date().toISOString()
    })
  }, [user])

  return { log }
}

/**
 * Hook for protecting sensitive actions
 */
export function useProtectedAction(options = {}) {
  const { requireAuth = true, requireRole = null, rateLimitAction = null } = options
  const { user } = useAuth()
  const { checkLimit, isLimited, remainingTime } = useRateLimit(rateLimitAction || 'default')

  const canPerform = useCallback(() => {
    // Check auth
    if (requireAuth && !user) {
      logSecurityEvent('unauthorized_action_attempt', { reason: 'not_authenticated' })
      return { allowed: false, reason: 'Bạn cần đăng nhập để thực hiện hành động này' }
    }

    // Check role
    if (requireRole && user?.user_metadata?.role !== requireRole) {
      logSecurityEvent('unauthorized_action_attempt', { 
        reason: 'insufficient_role',
        required: requireRole,
        actual: user?.user_metadata?.role
      })
      return { allowed: false, reason: 'Bạn không có quyền thực hiện hành động này' }
    }

    // Check rate limit
    if (rateLimitAction && !checkLimit()) {
      return { 
        allowed: false, 
        reason: `Vui lòng đợi ${remainingTime} giây trước khi thử lại` 
      }
    }

    return { allowed: true, reason: null }
  }, [user, requireAuth, requireRole, rateLimitAction, checkLimit, remainingTime])

  const execute = useCallback(async (action) => {
    const check = canPerform()
    if (!check.allowed) {
      throw new Error(check.reason)
    }
    return await action()
  }, [canPerform])

  return {
    canPerform,
    execute,
    isLimited,
    remainingTime
  }
}

export default {
  useSecurity,
  useRateLimit,
  useSecureForm,
  useSecurityLog,
  useProtectedAction
}
