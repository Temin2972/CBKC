import { MessageCircle, Users, Clock, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useQuotes } from '../hooks/useQuotes'
import Navbar from '../components/Layout/Navbar'
import CautionSection from '../components/Counselor/CautionSection'
import PendingSection from '../components/Counselor/PendingSection'

export default function Home() {
  const { user } = useAuth()
  const { quote, loading: quoteLoading } = useQuotes()
  
  const isCounselor = user?.user_metadata?.role === 'counselor' || 
                       user?.user_metadata?.role === 'admin'

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
              ? 'Sẵn sàng hỗ trợ học sinh hôm nay' 
              : 'Bạn cần hỗ trợ gì hôm nay?'}
          </p>
        </div>

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

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Link
            to="/chat"
            className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 cursor-pointer"
          >
            <div className="inline-block p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
              <MessageCircle size={40} className="text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {isCounselor ? 'Phòng Tư vấn' : 'Chat với Tư vấn viên'}
            </h3>
            <p className="text-gray-600">
              {isCounselor 
                ? 'Xem và trả lời các yêu cầu tư vấn từ học sinh'
                : 'Kết nối trực tiếp với giáo viên tâm lý để được hỗ trợ ngay lập tức'}
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
              <Clock size={16} />
              <span>Hoạt động: 7:00 - 22:00</span>
            </div>
          </Link>

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
              <span>100% Ẩn danh</span>
            </div>
          </Link>
        </div>

        {/* Simple Quote Section */}
        {!quoteLoading && quote && (
          <div className="mt-8 max-w-4xl mx-auto">
            <div className="p-6 text-center">
              <p className="text-xl text-white">
                "{quote.content}"
              </p>
              {quote.author && (
                <p className="text-sm text-white">
                  — {quote.author} —
                </p>
              )}
            </div>
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
                <span>Nội dung hung hăng/bạo lực sẽ tự động bị chặn</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 font-bold">•</span>
                <span>AI phân tích nội dung để phát hiện sớm các trường hợp cần hỗ trợ</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
