import { MessageCircle, Users, Clock, Shield, Bell, Heart, CalendarClock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useQuotes } from '../hooks/useQuotes'
import { useUnreadMessages } from '../hooks/useUnreadMessages'
import Navbar from '../components/Layout/Navbar'
import CautionSection from '../components/Counselor/CautionSection'
import PendingSection from '../components/Counselor/PendingSection'

const FACEBOOK_FANPAGE_URL = 'https://www.facebook.com/Bucthuchieuthu6' // Fanpage BTCT6

export default function Home() {
  const { user } = useAuth()
  const { quote, loading: quoteLoading } = useQuotes()
  
  const userRole = user?.user_metadata?.role
  const isCounselor = userRole === 'counselor' || userRole === 'admin'
  
  // Hook theo dõi tin nhắn chưa đọc
  const { unreadCount, hasNewMessages, loading: unreadLoading } = useUnreadMessages(
    user?.id,
    userRole
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Xin chào, {user?.user_metadata?.full_name || user?.email}! 👋
          </h2>
          <p className="text-xl text-white opacity-90">
            {isCounselor 
              ? 'Sẵn sàng hỗ trợ học sinh hôm nay?' 
              : 'Bạn cần hỗ trợ gì hôm nay?'}
          </p>
        </div>

        {/* Main Features */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Chat Card - với thông báo tin nhắn mới */}
          <Link
            to="/chat"
            className={`group p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 cursor-pointer relative ${
              hasNewMessages 
                ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-orange-400 animate-pulse-subtle' 
                : 'bg-white'
            }`}
          >
            {/* Badge tin nhắn mới */}
            {hasNewMessages && !unreadLoading && (
              <div className="absolute -top-3 -right-3 flex items-center gap-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                  <div className="relative bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                    <Bell size={14} className="animate-bounce" />
                    <span>{unreadCount} mới</span>
                  </div>
                </div>
              </div>
            )}

            <div className={`inline-block p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform ${
              hasNewMessages 
                ? 'bg-gradient-to-br from-orange-400 to-red-400' 
                : 'bg-gradient-to-br from-blue-100 to-blue-200'
            }`}>
              <MessageCircle 
                size={40} 
                className={hasNewMessages ? 'text-white' : 'text-blue-600'} 
              />
            </div>

            <h3 className={`text-2xl font-bold mb-2 ${
              hasNewMessages ? 'text-orange-700' : 'text-gray-800'
            }`}>
              {isCounselor ? 'Phòng Tư vấn' : 'Chat với giáo viên tâm lý'}
            </h3>

            {/* Text mô tả thay đổi khi có tin nhắn mới */}
            {hasNewMessages ? (
              <div className="space-y-2">
                <p className="text-orange-800 font-semibold text-lg">
                  🔔 Bạn có {unreadCount} tin nhắn chưa đọc!
                </p>
                <p className="text-orange-600 text-sm">
                  {isCounselor 
                    ? 'Học sinh đang chờ phản hồi từ bạn' 
                    : 'Tư vấn viên đã trả lời bạn'}
                </p>
              </div>
            ) : (
              <p className="text-gray-600">
                {isCounselor 
                  ? 'Xem và trả lời các yêu cầu tư vấn từ học sinh'
                  : 'Kết nối trực tiếp với giáo viên tâm lý để được hỗ trợ ngay lập tức'}
              </p>
            )}

            <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
              <Clock size={16} />
              <span>Hoạt động: 8:00 - 17:00</span>
            </div>

            {/* Hiệu ứng glow khi có tin nhắn mới */}
            {hasNewMessages && (
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-400/20 to-red-400/20 pointer-events-none"></div>
            )}
          </Link>

          {/* Community Card */}
          <Link
            to="/community"
            className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 cursor-pointer"
          >
            <div className="inline-block p-4 bg-gradient-to-br from-purple-100 to-pink-200 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
              <Users size={40} className="text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Cộng đồng Ẩn danh
            </h3>
            <p className="text-gray-600">
              {isCounselor 
                ? 'Giám sát và hỗ trợ trong cộng đồng học sinh'
                : 'Chia sẻ câu chuyện và kết nối với những người cùng hoàn cảnh'}
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-purple-600">
              <Shield size={16} />
              <span>Ẩn danh hoàn toàn</span>
            </div>
          </Link>
        </div>

        {/* Additional Features - Facebook & Booking */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-6">
          {/* Booking Form */}
          <Link
            to="/booking"
            className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 cursor-pointer relative overflow-hidden"
          >
            <div className="inline-block p-4 bg-gradient-to-br from-green-100 to-teal-200 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
              <CalendarClock size={40} className="text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              Đặt lịch tư vấn
            </h3>
            <p className="text-gray-600">
              {isCounselor 
                ? 'Xem lịch hẹn của học sinh'
                : 'Đặt lịch hẹn trực tiếp tại phòng tư vấn'}
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
              <CalendarClock size={16} />
              <span>Nhấn để đặt lịch</span>
            </div>

            {/* Gradient glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-teal-400/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl"></div>
          </Link>

          {/* Facebook Fanpage */}
          <a
            href={FACEBOOK_FANPAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 cursor-pointer relative overflow-hidden"
          >
            <div className="inline-block p-4 bg-gradient-to-br from-red-100 to-pink-200 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
              <Heart size={40} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              BTCT6
            </h3>
            <p className="text-gray-600">
              Truy cập fanpage Bức Thư Chiều Thứ 6
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-red-600">
              <Heart size={16} className="fill-red-600" />
              <span>Nhấn để truy cập</span>
            </div>

            {/* Gradient glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl"></div>
          </a>
        </div>

	{/* Quote Section */}
	{!quoteLoading && quote && (
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 text-center">
            <p className="text-2xl text-white mb-3">
              "{quote.content}"
            </p>
            {quote.author && (
              <p className="text-lg text-white/80">
                — {quote.author} —
              </p>
            )}
          </div>
        </div>
        )}
        
        {/* Caution Section - Only for counselors/admins */}
        {isCounselor && (
          <div className="mb-8">
            <CautionSection />
          </div>
        )}

        {/* Pending Section - Only for counselors/admins */}
        {isCounselor && (
          <div className="mb-8">
            <PendingSection />
          </div>
        )}

        {/* Counselor Tips */}
        {isCounselor && (
          <div className="mt-8 max-w-4xl mx-auto bg-white/90 rounded-2xl p-6 shadow-lg">
            <h3 className="font-semibold text-gray-800 mb-3">
              📋 Lưu ý cho tư vấn viên
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span><strong>Mức độ khẩn cấp (đỏ):</strong> Học sinh có dấu hiệu tự tử, tự gây thương tích hoặc trầm cảm nặng - cần liên hệ ngay</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 font-bold">•</span>
                <span><strong>Mức độ theo dõi (vàng):</strong> Học sinh có biểu hiện tiêu cực nhẹ - nên theo dõi và hỗ trợ khi cần</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 font-bold">•</span>
                <span>Nội dung bạo lực sẽ tự động bị chặn</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 font-bold">•</span>
                <span>AI sẽ phân tích nội dung để phát hiện sớm các trường hợp cần hỗ trợ</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
