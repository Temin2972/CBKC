/**
 * Password Strength Indicator Component
 * Shows visual feedback on password strength
 */
import { Check, X, AlertCircle } from 'lucide-react'
import { validatePasswordStrength } from '../../lib/security'

export default function PasswordStrength({ password }) {
  if (!password) return null

  const { score, errors, suggestions } = validatePasswordStrength(password)

  const getStrengthColor = () => {
    if (score <= 1) return 'bg-red-500'
    if (score <= 2) return 'bg-orange-500'
    if (score <= 3) return 'bg-yellow-500'
    if (score <= 4) return 'bg-green-400'
    return 'bg-green-500'
  }

  const getStrengthText = () => {
    if (score <= 1) return 'Rất yếu'
    if (score <= 2) return 'Yếu'
    if (score <= 3) return 'Trung bình'
    if (score <= 4) return 'Mạnh'
    return 'Rất mạnh'
  }

  const getStrengthTextColor = () => {
    if (score <= 1) return 'text-red-600'
    if (score <= 2) return 'text-orange-600'
    if (score <= 3) return 'text-yellow-600'
    if (score <= 4) return 'text-green-600'
    return 'text-green-700'
  }

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${(score / 5) * 100}%` }}
          />
        </div>
        <span className={`text-xs font-medium ${getStrengthTextColor()}`}>
          {getStrengthText()}
        </span>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <div key={index} className="flex items-center gap-1 text-xs text-red-600">
              <X size={12} />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && score < 5 && (
        <div className="space-y-1">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-center gap-1 text-xs text-gray-500">
              <AlertCircle size={12} />
              <span>{suggestion}</span>
            </div>
          ))}
        </div>
      )}

      {/* Success message */}
      {score >= 4 && errors.length === 0 && (
        <div className="flex items-center gap-1 text-xs text-green-600">
          <Check size={12} />
          <span>Mật khẩu đủ mạnh!</span>
        </div>
      )}
    </div>
  )
}
