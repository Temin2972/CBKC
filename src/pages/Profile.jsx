/**
 * Profile Page Component
 * User profile customization with avatar presets
 */
import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase, isDemoMode, getDemoState } from '../lib/supabaseClient'
import { AVATAR_PRESETS, DEMO_USERS } from '../lib/demoData'
import Navbar from '../components/Layout/Navbar'
import { Button, Alert } from '../components/UI'
import { 
  User, 
  Save, 
  Check,
  Camera,
  Mail,
  GraduationCap,
  Shield,
  Sparkles
} from 'lucide-react'

export default function Profile() {
  const { user, isCounselor, isAdmin, role } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  
  // Profile state
  const [displayName, setDisplayName] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState('')
  const [bio, setBio] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [anonymousName, setAnonymousName] = useState('')

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    if (isDemoMode) {
      setDisplayName(user.user_metadata?.full_name || '')
      setSelectedAvatar(user.user_metadata?.avatar_url || AVATAR_PRESETS[0].url)
      setBio(user.user_metadata?.bio || '')
      setIsAnonymous(user.user_metadata?.is_anonymous || false)
      setAnonymousName(user.user_metadata?.anonymous_name || generateAnonymousName())
    } else {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (data) {
        setDisplayName(data.full_name || '')
        setSelectedAvatar(data.avatar_url || AVATAR_PRESETS[0].url)
        setBio(data.bio || '')
        setIsAnonymous(data.is_anonymous || false)
        setAnonymousName(data.anonymous_name || generateAnonymousName())
      }
    }
  }

  const generateAnonymousName = () => {
    const adjectives = ['Vui Vẻ', 'Năng Động', 'Thông Minh', 'Dũng Cảm', 'Tự Tin', 'Lạc Quan']
    const nouns = ['Sóc', 'Cáo', 'Gấu', 'Thỏ', 'Mèo', 'Chim']
    return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`
  }

  const handleSave = async () => {
    setLoading(true)
    setError('')
    setSaved(false)

    try {
      const profileData = {
        full_name: displayName,
        avatar_url: selectedAvatar,
        bio,
        is_anonymous: isAnonymous,
        anonymous_name: anonymousName,
        updated_at: new Date().toISOString()
      }

      if (isDemoMode) {
        // Update demo state
        const state = getDemoState()
        const userKey = Object.keys(DEMO_USERS).find(key => 
          DEMO_USERS[key].id === user.id
        )
        if (userKey && state.users[userKey]) {
          state.users[userKey].user_metadata = {
            ...state.users[userKey].user_metadata,
            ...profileData
          }
        }
      } else {
        await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', user.id)
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const getRoleInfo = () => {
    switch (role) {
      case 'admin':
        return { label: 'Quản trị viên', icon: Shield, color: 'text-purple-600 bg-purple-100' }
      case 'counselor':
        return { label: 'Tư vấn viên', icon: GraduationCap, color: 'text-blue-600 bg-blue-100' }
      default:
        return { label: 'Học sinh', icon: User, color: 'text-teal-600 bg-teal-100' }
    }
  }

  const roleInfo = getRoleInfo()

  return (
    <div className="min-h-screen bg-animated-gradient relative overflow-hidden">
      {/* Floating Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="floating-orb floating-orb-1"></div>
        <div className="floating-orb floating-orb-2"></div>
        <div className="floating-orb floating-orb-3"></div>
      </div>

      <Navbar />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full text-sm text-teal-700 mb-4 border border-teal-100">
            <User size={16} />
            <span>Trang cá nhân</span>
          </div>
          <h1 className="text-3xl font-semibold text-gray-800 mb-2">
            Hồ sơ của bạn
          </h1>
          <p className="text-gray-600">
            Tuỳ chỉnh thông tin và ảnh đại diện
          </p>
        </header>

        {/* Profile Card */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-xl p-6 mb-6">
          {/* Current Avatar & Role */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-cyan-300 p-1">
                <img 
                  src={selectedAvatar || AVATAR_PRESETS[0].url} 
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover bg-white"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                <Camera size={14} className="text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {displayName || user?.user_metadata?.full_name || 'Người dùng'}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${roleInfo.color}`}>
                  <roleInfo.icon size={12} />
                  {roleInfo.label}
                </span>
              </div>
              {user?.email && (
                <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
                  <Mail size={14} />
                  {user.email}
                </div>
              )}
            </div>
          </div>

          {error && <Alert variant="error" className="mb-6">{error}</Alert>}
          {saved && (
            <Alert variant="success" className="mb-6">
              <Check size={16} className="inline mr-2" />
              Đã lưu thay đổi!
            </Alert>
          )}

          {/* Avatar Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Chọn ảnh đại diện
            </label>
            <div className="grid grid-cols-5 gap-3">
              {AVATAR_PRESETS.map(avatar => (
                <button
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar.url)}
                  className={`relative p-1 rounded-full transition-all ${
                    selectedAvatar === avatar.url
                      ? 'ring-2 ring-teal-500 ring-offset-2 scale-110'
                      : 'hover:scale-105'
                  }`}
                  title={avatar.name}
                >
                  <img 
                    src={avatar.url} 
                    alt={avatar.name}
                    className="w-14 h-14 rounded-full object-cover bg-gray-100"
                  />
                  {selectedAvatar === avatar.url && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Display Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên hiển thị
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Nhập tên của bạn"
              className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
            />
          </div>

          {/* Bio (for counselors) */}
          {(isCounselor || isAdmin) && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giới thiệu bản thân
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Chia sẻ về chuyên môn, kinh nghiệm của bạn..."
                className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none resize-none h-32"
              />
            </div>
          )}

          {/* Anonymous Mode (for students) */}
          {!isCounselor && !isAdmin && (
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Sparkles className="text-purple-500" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 mb-1">
                    Chế độ ẩn danh
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Khi bật, tên và avatar của bạn sẽ được thay thế bằng tên ngẫu nhiên khi đăng bài trên cộng đồng
                  </p>
                  
                  <div className="flex items-center gap-3 mb-3">
                    <button
                      onClick={() => setIsAnonymous(!isAnonymous)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        isAnonymous ? 'bg-purple-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        isAnonymous ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                    <span className="text-sm text-gray-600">
                      {isAnonymous ? 'Đang bật' : 'Đang tắt'}
                    </span>
                  </div>

                  {isAnonymous && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Tên ẩn danh:</span>
                      <span className="px-3 py-1 bg-white rounded-lg text-sm font-medium text-purple-600">
                        {anonymousName}
                      </span>
                      <button
                        onClick={() => setAnonymousName(generateAnonymousName())}
                        className="text-xs text-purple-500 hover:text-purple-700"
                      >
                        Đổi tên khác
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <Button
            onClick={handleSave}
            loading={loading}
            disabled={loading}
            size="lg"
            className="w-full"
            icon={Save}
          >
            Lưu thay đổi
          </Button>
        </div>

        {/* Demo Mode Info */}
        {isDemoMode && (
          <div className="text-center text-sm text-gray-500">
            <p>🔧 Demo Mode: Thay đổi sẽ chỉ lưu trong phiên hiện tại</p>
          </div>
        )}
      </div>
    </div>
  )
}
