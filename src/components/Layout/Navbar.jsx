/**
 * Navbar Component
 * Clean, professional design for psychological counseling platform
 */
import { useCallback, useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Home, MessageCircle, Users, Shield, LogOut, CalendarClock, Heart, ClipboardList, MessageSquarePlus, User, ChevronDown } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { ROUTES } from '../../constants'
import { NAVIGATION_LABELS } from '../../constants/messages'
import NotificationBell from '../Notifications/NotificationBell'

const NAV_ITEMS = [
  { path: ROUTES.HOME, icon: Home, label: 'Trang chủ' },
  { path: ROUTES.CHAT, icon: MessageCircle, label: 'Tư vấn' },
  { path: ROUTES.COMMUNITY, icon: Users, label: 'Cộng đồng' },
  { path: ROUTES.BOOKING, icon: CalendarClock, label: 'Đặt lịch' },
]

const MORE_ITEMS = [
  { path: ROUTES.SURVEY, icon: ClipboardList, label: 'Khảo sát' },
  { path: ROUTES.FEEDBACK, icon: MessageSquarePlus, label: 'Góp ý' },
]

export default function Navbar() {
  const { user, signOut, id: userId, fullName, avatar } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showMore, setShowMore] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const moreRef = useRef(null)
  const userMenuRef = useRef(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreRef.current && !moreRef.current.contains(event.target)) {
        setShowMore(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = useCallback(async () => {
    const { error } = await signOut()
    if (!error) {
      navigate(ROUTES.LOGIN)
    }
  }, [signOut, navigate])

  const isActive = (path) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm animate-slide-down">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex items-center gap-2 group">
            <div className="relative">
              <Heart className="w-8 h-8 text-teal-500 group-hover:scale-110 transition-transform hover-heartbeat" strokeWidth={1.5} />
              <div className="absolute inset-0 bg-teal-400/20 blur-lg rounded-full group-hover:bg-teal-400/30 transition-colors" />
            </div>
            <span className="text-xl font-semibold text-gray-800">S-Net</span>
          </Link>

          {/* Center Navigation */}
          <div className="flex items-center gap-1 bg-gray-50/80 rounded-full px-2 py-1">
            {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive(path)
                    ? 'bg-teal-50 text-teal-600'
                    : 'text-gray-600 hover:text-teal-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={18} strokeWidth={1.5} />
                <span>{label}</span>
              </Link>
            ))}

            {/* More Dropdown */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setShowMore(!showMore)}
                className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  MORE_ITEMS.some(item => isActive(item.path))
                    ? 'bg-teal-50 text-teal-600'
                    : 'text-gray-600 hover:text-teal-600 hover:bg-gray-100'
                }`}
              >
                <span>Thêm</span>
                <ChevronDown size={16} className={`transition-transform ${showMore ? 'rotate-180' : ''}`} />
              </button>

              {showMore && (
                <div className="absolute top-full left-0 mt-2 py-2 bg-white rounded-xl shadow-lg border border-gray-100 min-w-[160px] z-50 modal-content-enter">
                  {MORE_ITEMS.map(({ path, icon: Icon, label }, index) => (
                    <Link
                      key={path}
                      to={path}
                      onClick={() => setShowMore(false)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm transition-all duration-200 list-item-enter ${
                        isActive(path)
                          ? 'bg-teal-50 text-teal-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-teal-600'
                      }`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <Icon size={16} className="group-hover:scale-110 transition-transform" />
                      <span>{label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <NotificationBell userId={userId} />

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-medium overflow-hidden">
                  {avatar ? (
                    <img src={avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    fullName?.charAt(0)?.toUpperCase() || 'U'
                  )}
                </div>
                <span className="text-sm text-gray-700 font-medium hidden sm:block">
                  {'Tài khoản'}
                </span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {showUserMenu && (
                <div className="absolute top-full right-0 mt-2 py-2 bg-white rounded-xl shadow-lg border border-gray-100 min-w-[180px] z-50 modal-content-enter">
                  <Link
                    to={ROUTES.PROFILE}
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-teal-600 transition-all duration-200 list-item-enter"
                    style={{ animationDelay: '0.05s' }}
                  >
                    <User size={16} />
                    <span>Trang cá nhân</span>
                  </Link>
                  <div className="h-px bg-gray-100 my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 list-item-enter"
                    style={{ animationDelay: '0.1s' }}
                  >
                    <LogOut size={16} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
