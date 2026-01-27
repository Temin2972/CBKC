/**
 * Card component
 */

const variants = {
  default: 'bg-white shadow-lg',
  highlighted: 'bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-orange-400',
  outline: 'bg-white border border-gray-200',
}

export default function Card({
  children,
  variant = 'default',
  className = '',
  hoverable = false,
  onClick,
  ...props
}) {
  const baseStyles = 'rounded-2xl p-6'
  const hoverStyles = hoverable
    ? 'cursor-pointer hover:shadow-2xl transition-all transform hover:-translate-y-1'
    : ''

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )
}
