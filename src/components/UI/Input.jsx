/**
 * Reusable Input component with light/dark mode support
 */
import { forwardRef } from 'react'

const Input = forwardRef(function Input(
  {
    label,
    error,
    type = 'text',
    className = '',
    wrapperClassName = '',
    variant = 'light', // 'light' | 'dark'
    ...props
  },
  ref
) {
  const baseStyles = variant === 'dark'
    ? 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200'
    : 'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:bg-white transition-all duration-200'

  const errorStyles = error
    ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
    : ''

  const labelStyles = variant === 'dark' 
    ? 'block text-sm font-medium text-gray-300 mb-1.5'
    : 'block text-sm font-medium text-gray-700 mb-1.5'

  const errorTextStyles = variant === 'dark'
    ? 'mt-1 text-sm text-rose-400'
    : 'mt-1 text-sm text-rose-600'

  return (
    <div className={wrapperClassName}>
      {label && (
        <label className={labelStyles}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={`${baseStyles} ${errorStyles} ${className}`}
        {...props}
      />
      {error && (
        <p className={errorTextStyles}>{error}</p>
      )}
    </div>
  )
})

export default Input
