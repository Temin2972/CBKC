/**
 * Custom hook for form state management
 */
import { useState, useCallback } from 'react'

/**
 * Hook for managing form state
 * @param {Object} initialValues - Initial form values
 * @returns {Object} Form state and handlers
 */
export function useForm(initialValues = {}) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    // Clear error when field is modified
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }, [errors])

  const handleBlur = useCallback((e) => {
    const { name } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
  }, [])

  const setValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }))
  }, [])

  const setError = useCallback((name, error) => {
    setErrors((prev) => ({ ...prev, [name]: error }))
  }, [])

  const setFieldErrors = useCallback((newErrors) => {
    setErrors((prev) => ({ ...prev, ...newErrors }))
  }, [])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  const validate = useCallback((validationSchema) => {
    const newErrors = {}
    let isValid = true

    Object.entries(validationSchema).forEach(([field, validators]) => {
      const value = values[field]
      
      for (const validator of validators) {
        const result = validator(value, values)
        if (result) {
          newErrors[field] = result
          isValid = false
          break
        }
      }
    })

    setErrors(newErrors)
    return isValid
  }, [values])

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setValue,
    setError,
    setFieldErrors,
    reset,
    validate,
    setValues,
  }
}

/**
 * Common validators
 */
export const validators = {
  required: (message = 'Trường này không được để trống') => (value) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return message
    }
    return null
  },

  email: (message = 'Email không hợp lệ') => (value) => {
    if (!value) return null
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value) ? null : message
  },

  minLength: (min, message) => (value) => {
    if (!value) return null
    return value.length >= min ? null : message || `Tối thiểu ${min} ký tự`
  },

  match: (field, message = 'Giá trị không khớp') => (value, allValues) => {
    return value === allValues[field] ? null : message
  },
}

export default useForm
