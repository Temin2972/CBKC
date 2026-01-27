/**
 * Reusable Button component with variants and modern styling
 */
import { Loader2 } from 'lucide-react'

const variants = {
  primary:
    'bg-teal-500 text-white hover:bg-teal-600 shadow-lg shadow-teal-500/20 hover:shadow-xl hover:shadow-teal-500/30',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  danger: 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20',
  ghost: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
  success: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20',
  outline: 'border-2 border-teal-500 text-teal-600 hover:bg-teal-50',
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5',
  lg: 'px-7 py-3.5 text-lg',
  xl: 'w-full py-4 text-lg font-semibold',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  icon: Icon,
  iconPosition = 'left',
  onClick,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={18} />}
          {children}
          {Icon && iconPosition === 'right' && <Icon size={18} />}
        </>
      )}
    </button>
  )
}
