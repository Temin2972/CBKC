/**
 * Register Page Component
 * Handles student registration
 */
import { useState, useCallback, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Heart, AlertCircle, ArrowRight, MessageCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useQuotes } from '../hooks/useQuotes'
import { useForm, validators } from '../hooks/useForm'
import { Input, PasswordInput, Button, Alert, Card } from '../components/UI'
import { ROUTES, PASSWORD_RULES } from '../constants'
import { AUTH_MESSAGES, BUTTON_LABELS, FORM_LABELS } from '../constants/messages'

// Feature messages based on redirect origin
const FEATURE_MESSAGES = {
  chat: {
    title: 'Bạn muốn trò chuyện với Tư vấn viên',
    description: 'Đăng ký để kết nối với các tư vấn viên tâm lý',
    icon: MessageCircle,
  },
  community: {
    title: 'Bạn muốn tham gia Cộng đồng',
    description: 'Đăng ký để chia sẻ và được lắng nghe',
    icon: Heart,
  },
}

// Username validation
const validateUsername = (value) => {
  if (!value || value.length < 3) {
    return 'Tên đăng nhập phải có ít nhất 3 ký tự'
  }
  if (!/^[a-zA-Z0-9_]+$/.test(value)) {
    return 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới'
  }
  return null
}

// Quote display component
function QuoteSection({ quote, loading }) {
  if (loading || !quote) return null

  return (
    <div className="bg-white/60 backdrop-blur-sm border border-gray-100 rounded-2xl p-5 text-center">
      <p className="text-gray-600 italic mb-2">"{quote.content}"</p>
      {quote.author && <p className="text-gray-400 text-sm">— {quote.author}</p>}
    </div>
  )
}

// Feature message banner component
function FeatureMessage({ message }) {
  if (!message) return null
  const Icon = message.icon

  return (
    <div className="bg-white/60 backdrop-blur-sm border border-teal-100 rounded-2xl p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-teal-50 rounded-xl">
          <Icon size={18} className="text-teal-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-800 mb-0.5">{message.title}</h3>
          <p className="text-sm text-gray-600">{message.description}</p>
        </div>
      </div>
    </div>
  )
}

// Info banner component
function InfoBanner() {
  return (
    <div className="mb-5 p-3 bg-teal-50 border border-teal-100 rounded-xl">
      <div className="flex items-start gap-2">
        <AlertCircle size={18} className="text-teal-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-medium mb-0.5 text-teal-700">Dành cho học sinh</p>
          <p className="text-teal-600">Không cần email. Chỉ cần tên đăng nhập và mật khẩu.</p>
        </div>
      </div>
    </div>
  )
}

export default function Register() {
  const { signUpStudent } = useAuth()
  const { quote, loading: quoteLoading } = useQuotes()
  const navigate = useNavigate()
  const location = useLocation()

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { values, errors, handleChange, setValue, validate } = useForm({
    fullName: '',
    username: '',
    password: '',
    confirmPassword: '',
  })

  // Get feature message if redirected from a specific feature
  const featureMessage = useMemo(() => {
    const fromFeature = location.state?.from
    return FEATURE_MESSAGES[fromFeature] || null
  }, [location.state?.from])

  const validationSchema = {
    fullName: [validators.required('Vui lòng nhập tên hiển thị')],
    username: [validators.required('Vui lòng nhập tên đăng nhập'), validateUsername],
    password: [
      validators.required('Vui lòng nhập mật khẩu'),
      validators.minLength(PASSWORD_RULES.MIN_LENGTH, AUTH_MESSAGES.PASSWORD_TOO_SHORT),
    ],
    confirmPassword: [
      validators.required('Vui lòng xác nhận mật khẩu'),
      validators.match('password', AUTH_MESSAGES.PASSWORD_MISMATCH),
    ],
  }

  // Handle username change with lowercase transformation
  const handleUsernameChange = useCallback(
    (e) => {
      const lowercaseValue = e.target.value.toLowerCase()
      setValue('username', lowercaseValue)
    },
    [setValue]
  )

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      setError('')

      if (!validate(validationSchema)) return

      setLoading(true)

      const { error: signUpError } = await signUpStudent(
        values.username,
        values.password,
        values.fullName
      )

      if (signUpError) {
        if (signUpError.message?.includes('already registered')) {
          setError('Tên đăng nhập đã tồn tại')
        } else {
          setError(signUpError.message || 'Đã có lỗi xảy ra')
        }
        setLoading(false)
      } else {
        alert(AUTH_MESSAGES.REGISTER_SUCCESS)
        navigate(ROUTES.LOGIN)
      }
    },
    [values, signUpStudent, validate, navigate]
  )

  return (
    <div className="min-h-screen bg-animated-gradient flex items-center justify-center p-4 overflow-hidden">
      {/* Floating Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="floating-orb floating-orb-1"></div>
        <div className="floating-orb floating-orb-2"></div>
        <div className="floating-orb floating-orb-3"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <FeatureMessage message={featureMessage} />

        <div className="bg-white/70 backdrop-blur-sm border border-gray-100 shadow-xl rounded-2xl p-7 mb-5">
          {/* Header */}
          <header className="text-center mb-5">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-50 rounded-2xl mb-3">
              <Heart size={28} className="text-teal-500" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-1">Đăng ký Học sinh</h1>
            <p className="text-gray-500 text-sm">Tạo tài khoản để được hỗ trợ</p>
          </header>

          <InfoBanner />

          <Alert variant="error" className="mb-4">
            {error}
          </Alert>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="fullName"
              label="Tên hiển thị"
              value={values.fullName}
              onChange={handleChange}
              placeholder="Tên bạn muốn hiển thị"
              error={errors.fullName}
              disabled={loading}
              autoComplete="name"
              variant="light"
            />

            <div>
              <Input
                name="username"
                label={FORM_LABELS.USERNAME}
                value={values.username}
                onChange={handleUsernameChange}
                placeholder="Tên đăng nhập"
                error={errors.username}
                disabled={loading}
                autoComplete="username"
                variant="light"
              />
              <p className="text-xs text-gray-400 mt-1">
                Chỉ chữ cái, số và dấu gạch dưới. Tối thiểu 3 ký tự.
              </p>
            </div>

            <PasswordInput
              name="password"
              value={values.password}
              onChange={handleChange}
              placeholder="Ít nhất 6 ký tự"
              error={errors.password}
              disabled={loading}
              autoComplete="new-password"
              variant="light"
            />

            <PasswordInput
              name="confirmPassword"
              label={FORM_LABELS.CONFIRM_PASSWORD}
              value={values.confirmPassword}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu"
              error={errors.confirmPassword}
              disabled={loading}
              autoComplete="new-password"
              variant="light"
            />

            <Button 
              type="submit" 
              size="lg" 
              loading={loading} 
              disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-600"
            >
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </Button>
          </form>

          {/* Footer Link */}
          <p className="mt-5 text-center text-gray-600 text-sm">
            Đã có tài khoản?{' '}
            <Link to={ROUTES.LOGIN} className="text-teal-600 font-medium hover:text-teal-700 transition-colors">
              Đăng nhập
            </Link>
          </p>
        </div>

        <QuoteSection quote={quote} loading={quoteLoading} />
      </div>
    </div>
  )
}
