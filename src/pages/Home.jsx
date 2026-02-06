import { useState, useEffect } from 'react'
import {
  MessageCircle, Users, Clock, Shield, Bell, Heart,
  CalendarClock, Sparkles, ArrowRight, Moon, Sun,
  Activity, BookOpen, Star
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useQuotes } from '../hooks/useQuotes'
import { useUnreadMessages } from '../hooks/useUnreadMessages'
import Navbar from '../components/Layout/Navbar'
import Footer from '../components/Layout/Footer'
import CautionSection from '../components/Counselor/CautionSection'
import PendingSection from '../components/Counselor/PendingSection'
import { ROUTES, EXTERNAL_LINKS, OPERATING_HOURS } from '../constants'
import { getUserDisplayName } from '../utils/helpers'

export default function Home() {
  const { user, id: userId, role, isCounselor, fullName } = useAuth()
  const { quote, loading: quoteLoading } = useQuotes()
  const { unreadCount, hasNewMessages, loading: unreadLoading } = useUnreadMessages(userId, role)
  const [currentTime, setCurrentTime] = useState(new Date())

  const displayName = fullName || getUserDisplayName(user)

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Buổi sáng tốt lành'
    if (hour < 18) return 'Buổi chiều vui vẻ'
    return 'Buổi tối an lành'
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Image with blur */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url('/images/flying.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(3px) brightness(0.9)'
        }}
      />
      {/* Gradient overlay */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-teal-900/20 via-emerald-800/10 to-cyan-900/20" />

      {/* Content */}
      <div className="relative z-10">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <section className="mb-12">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-8 md:p-12 text-white shadow-2xl">
              {/* Background decoration */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-2xl" />
              </div>

              <div className="relative z-10">
                {/* Time greeting */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm mb-6">
                  {currentTime.getHours() < 18 ? <Sun size={16} /> : <Moon size={16} />}
                  <span>{getGreeting()}</span>
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-white/80">Đang hoạt động</span>
                </div>

                <h1 className="text-3xl md:text-5xl font-bold mb-4">
                  Xin chào, <span className="text-pink-200">{displayName}</span>! 👋
                </h1>

                <p className="text-lg md:text-xl text-white/90 max-w-2xl mb-8">
                  {isCounselor
                    ? 'Chào mừng bạn trở lại! Hãy bắt đầu ngày mới bằng việc hỗ trợ các học sinh.'
                    : 'Đây là không gian an toàn để bạn được lắng nghe, chia sẻ và hỗ trợ.'}
                </p>

                {/* Quick stats for counselors */}
                {isCounselor && (
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-3 px-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl">
                      <Activity size={20} />
                      <div>
                        <div className="text-sm text-white/70">Chat đang chờ</div>
                        <div className="text-xl font-bold">{unreadCount || 0}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl">
                      <Clock size={20} />
                      <div>
                        <div className="text-sm text-white/70">Thời gian</div>
                        <div className="text-xl font-bold">
                          {currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* CTA for students */}
                {!isCounselor && (
                  <div className="flex flex-wrap gap-4">
                    <Link
                      to={ROUTES.CHAT}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-white/90 transition-all hover:scale-105 shadow-lg"
                    >
                      <MessageCircle size={20} />
                      Chat với tư vấn viên
                      <ArrowRight size={16} />
                    </Link>
                    <Link
                      to={ROUTES.COMMUNITY}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur text-white font-semibold rounded-xl hover:bg-white/30 transition-all"
                    >
                      <Users size={20} />
                      Cộng đồng ẩn danh
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Notification Badge */}
          {hasNewMessages && !unreadLoading && (
            <div className="mb-8 animate-pulse">
              <Link
                to={ROUTES.CHAT}
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl hover:shadow-lg transition-all"
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-400 rounded-xl flex items-center justify-center text-white">
                    <Bell size={24} />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-800">Bạn có {unreadCount} tin nhắn chưa đọc!</h3>
                  <p className="text-sm text-amber-600">Nhấn vào đây để xem và trả lời</p>
                </div>
                <ArrowRight className="text-amber-500" size={20} />
              </Link>
            </div>
          )}

          {/* Main Feature Cards */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Sparkles className="text-indigo-500" size={24} />
              Dịch vụ chính
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Chat Card */}
              <Link
                to={ROUTES.CHAT}
                className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform">
                    <MessageCircle size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {isCounselor ? 'Phòng Tư vấn' : 'Chat Tâm lý'}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {isCounselor
                      ? 'Xem và trả lời các yêu cầu tư vấn'
                      : 'Kết nối với tư vấn viên ngay'}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-emerald-600">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    Đang hoạt động
                  </div>
                </div>
              </Link>

              {/* Community Card */}
              <Link
                to={ROUTES.COMMUNITY}
                className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-purple-200 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform">
                    <Users size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Cộng đồng Ẩn danh</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Chia sẻ câu chuyện với sự ẩn danh hoàn toàn
                  </p>
                  <div className="flex items-center gap-2 text-xs text-purple-600">
                    <Shield size={14} />
                    Bảo mật 100%
                  </div>
                </div>
              </Link>

              {/* Booking Card */}
              <Link
                to={ROUTES.BOOKING}
                className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-teal-200 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform">
                    <CalendarClock size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Đặt lịch hẹn</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {isCounselor ? 'Xem các lịch hẹn của học sinh' : 'Đặt lịch gặp tư vấn viên trực tiếp'}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-teal-600">
                    <Clock size={14} />
                    {OPERATING_HOURS.DISPLAY}
                  </div>
                </div>
              </Link>

              {/* BTCT6 Card */}
              <a
                href={EXTERNAL_LINKS.FACEBOOK_FANPAGE}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-rose-200 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform">
                    <Heart size={28} className="fill-current" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Bức Thư Chiều Thứ 6</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Truy cập fanpage để đọc các bức thư
                  </p>
                  <div className="flex items-center gap-2 text-xs text-rose-600">
                    <Star size={14} className="fill-current" />
                    Yêu thương luôn
                  </div>
                </div>
              </a>
            </div>
          </section>

          {/* Daily Quote */}
          {!quoteLoading && quote && (
            <section className="mb-12">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-2xl">💭</span>
                  </div>
                  <div>
                    <p className="text-lg text-gray-700 italic leading-relaxed mb-3">
                      "{quote.content}"
                    </p>
                    {quote.author && (
                      <p className="text-sm text-indigo-600 font-medium">— {quote.author}</p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Counselor-only Sections */}
          {isCounselor && (
            <section className="space-y-8">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="text-indigo-500" size={24} />
                Công cụ tư vấn viên
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <CautionSection />
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <PendingSection />
                </div>
              </div>

              {/* Counselor Tips */}
              <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-6 border border-teal-100">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-xl">📋</span>
                  Lưu ý quan trọng
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-red-500 font-bold text-sm">!</span>
                    </div>
                    <div>
                      <span className="font-medium text-red-700 text-sm">Khẩn cấp</span>
                      <p className="text-xs text-red-600 mt-1">Dấu hiệu tự tử hoặc tự gây thương tích</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-amber-500 font-bold text-sm">?</span>
                    </div>
                    <div>
                      <span className="font-medium text-amber-700 text-sm">Theo dõi</span>
                      <p className="text-xs text-amber-600 mt-1">Biểu hiện tiêu cực nhẹ - cần quan sát</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-teal-50 rounded-xl border border-teal-100">
                    <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-teal-500 text-sm">🤖</span>
                    </div>
                    <div>
                      <span className="font-medium text-teal-700 text-sm">AI hỗ trợ</span>
                      <p className="text-xs text-teal-600 mt-1">Tự động phân tích và cảnh báo nội dung</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>

        <Footer />
      </div>
    </div>
  )
}
