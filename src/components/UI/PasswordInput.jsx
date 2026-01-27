/**
 * Password input with toggle visibility and dark mode support
 */
import { useState, forwardRef } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import Input from './Input'

const PasswordInput = forwardRef(function PasswordInput(
  { label = 'Mật khẩu', variant = 'light', ...props },
  ref
) {
  const [showPassword, setShowPassword] = useState(false)

  const buttonStyles = variant === 'dark'
    ? 'absolute right-4 top-[42px] text-gray-400 hover:text-gray-200 transition-colors duration-200'
    : 'absolute right-4 top-[42px] text-gray-500 hover:text-gray-700 transition-colors duration-200'

  return (
    <div className="relative">
      <Input
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        label={label}
        variant={variant}
        className="pr-12"
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className={buttonStyles}
        tabIndex={-1}
        aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  )
})

export default PasswordInput
