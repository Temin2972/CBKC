/**
 * Login Page Component
 * Handles user authentication
 */
import { useState, useCallback, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Heart, ArrowRight, MessageCircle, User, GraduationCap, Shield } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useQuotes } from '../hooks/useQuotes'
import { useForm, validators } from '../hooks/useForm'
import { Input, PasswordInput, Button, Alert, Card } from '../components/UI'
import { ROUTES } from '../constants'
import { AUTH_MESSAGES, BUTTON_LABELS } from '../constants/messages'
import { isDemoMode } from '../lib/supabaseClient'
import { DEMO_CREDENTIALS } from '../lib/demoData'

// Feature messages based on redirect origin
const FEATURE_MESSAGES = {
  chat: {
    title: 'Bạn muốn trò chuyện với Tư vấn viên',
    description: 'Đăng nhập để kết nối với các tư vấn viên tâm lý',
    icon: MessageCircle,
  },
  community: {
    title: 'Bạn muốn tham gia Cộng đồng',
    description: 'Đăng nhập để chia sẻ và được lắng nghe',
    icon: Heart,
  },
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

// Demo accounts section
function DemoAccountsSection({ onSelectAccount }) {
  if (!isDemoMode) return null

  const roleIcons = {
    student: GraduationCap,
    counselor: User,
    admin: Shield
  }

  const roleColors = {
    student: 'bg-blue-50 text-blue-600 border-blue-200',
    counselor: 'bg-purple-50 text-purple-600 border-purple-200',
    admin: 'bg-amber-50 text-amber-600 border-amber-200'
  }

  return (
    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-4 mb-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
        <span className="text-sm font-medium text-teal-700">🎮 Chế độ Demo - Chọn tài khoản để test</span>
      </div>
      <div className="grid gap-2">
        {DEMO_CREDENTIALS.map((cred, idx) => {
          const Icon = roleIcons[cred.role]
          return (
            <button
              key={idx}
              onClick={() => onSelectAccount(cred.username, cred.password)}
              className={`flex items-center gap-3 p-2.5 rounded-lg border ${roleColors[cred.role]} hover:opacity-80 transition-all text-left text-sm`}
            >
              <Icon size={16} />
              <span className="flex-1">{cred.label}</span>
              <span className="text-xs opacity-60">→</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function Login() {
  const { signIn } = useAuth()
  const { quote, loading: quoteLoading } = useQuotes()
  const navigate = useNavigate()
  const location = useLocation()

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { values, errors, handleChange, validate, setValue } = useForm({
    identifier: '',
    password: '',
  })

  // Handle demo account selection
  const handleDemoAccountSelect = useCallback((username, password) => {
    setValue('identifier', username)
    setValue('password', password)
  }, [setValue])

  // Get feature message if redirected from a specific feature
  const featureMessage = useMemo(() => {
    const fromFeature = location.state?.from
    return FEATURE_MESSAGES[fromFeature] || null
  }, [location.state?.from])

  const validationSchema = {
    identifier: [validators.required('Vui lòng nhập tên đăng nhập hoặc email')],
    password: [validators.required('Vui lòng nhập mật khẩu')],
  }

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      setError('')

      if (!validate(validationSchema)) return

      setLoading(true)

      const { error: signInError } = await signIn(values.identifier, values.password)

      if (signInError) {
        setError(AUTH_MESSAGES.LOGIN_ERROR)
        setLoading(false)
      } else {
        navigate(ROUTES.HOME)
      }
    },
    [values, signIn, validate, navigate]
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
        
        {/* Demo Accounts Section */}
        <DemoAccountsSection onSelectAccount={handleDemoAccountSelect} />

        <div className="bg-white/70 backdrop-blur-sm border border-gray-100 shadow-xl rounded-2xl p-7 mb-5">
          {/* Header */}
          <header className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-50 rounded-2xl mb-3">
              <Heart size={28} className="text-teal-500" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-1">Đăng nhập</h1>
            <p className="text-gray-500 text-sm">Chào mừng bạn trở lại</p>
          </header>

          <Alert variant="error" className="mb-4">
            {error}
          </Alert>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                name="identifier"
                label="Tên đăng nhập hoặc Email"
                value={values.identifier}
                onChange={handleChange}
                placeholder="Nhập tên đăng nhập hoặc email"
                error={errors.identifier}
                disabled={loading}
                autoComplete="username"
                variant="light"
              />
              <p className="text-xs text-gray-400 mt-1">
                Học sinh: Tên đăng nhập | Tư vấn viên: Email
              </p>
            </div>

            <PasswordInput
              name="password"
              value={values.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
              error={errors.password}
              disabled={loading}
              autoComplete="current-password"
              variant="light"
            />

            <Button 
              type="submit" 
              size="lg" 
              loading={loading} 
              disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-600"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>

          {/* Footer Links */}
          <p className="mt-5 text-center text-gray-600 text-sm">
            Chưa có tài khoản?{' '}
            <Link to={ROUTES.REGISTER} className="text-teal-600 font-medium hover:text-teal-700 transition-colors">
              Đăng ký ngay
            </Link>
          </p>

          <div className="mt-3 text-center">
            <Link to={ROUTES.LANDING} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              ← Quay lại trang chủ
            </Link>
          </div>
        </div>

        <QuoteSection quote={quote} loading={quoteLoading} />
      </div>
    </div>
  )
}
