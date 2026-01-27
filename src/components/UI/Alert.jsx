/**
 * Alert component for displaying messages
 */

const variants = {
  error: 'bg-red-50 border-red-200 text-red-700',
  success: 'bg-green-50 border-green-200 text-green-700',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  info: 'bg-blue-50 border-blue-200 text-blue-700',
}

export default function Alert({
  children,
  variant = 'error',
  className = '',
  onClose,
}) {
  if (!children) return null

  return (
    <div
      className={`p-3 border rounded-lg text-sm ${variants[variant]} ${className}`}
      role="alert"
    >
      <div className="flex items-center justify-between">
        <span>{children}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-2 text-current opacity-50 hover:opacity-100"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}
