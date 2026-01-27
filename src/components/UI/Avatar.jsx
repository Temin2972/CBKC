/**
 * Avatar component with initials fallback
 */
import { getInitials } from '../../utils/formatters'

const sizes = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-2xl',
}

export default function Avatar({
  name,
  src,
  size = 'md',
  className = '',
}) {
  const initials = getInitials(name)

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={`${sizes[size]} rounded-full object-cover ${className}`}
      />
    )
  }

  return (
    <div
      className={`${sizes[size]} bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold ${className}`}
    >
      {initials}
    </div>
  )
}
