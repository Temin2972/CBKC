import { Link, useNavigate } from 'react-router-dom'
import { Home, MessageCircle, Users, Shield, LogOut, CalendarClock } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import NotificationBell from '../Notifications/NotificationBell'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    const { error } = await signOut()
    if (!error) {
      navigate('/login')
    }
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="text-purple-600" size={32} />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              S-Net
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/home"
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Home size={18} />
              Trang chủ
            </Link>
            
            <Link
              to="/chat"
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MessageCircle size={18} />
              Tin nhắn
            </Link>

            <Link
              to="/community"
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Users size={18} />
              Cộng đồng
            </Link>

            <Link
              to="/booking"
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <CalendarClock size={18} />
              Đặt lịch
            </Link>

            {/* Notification Bell */}
            <NotificationBell userId={user?.id} />

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
