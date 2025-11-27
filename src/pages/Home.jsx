import { MessageCircle, Users, Clock, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/Layout/Navbar'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Xin chào, {user?.user_metadata?.full_name}! 👋
          </h2>
          <p className="text-xl text-white opacity-90">
            {user?.user_metadata?.role === 'counselor' 
              ? 'Sẵn sàng hỗ trợ học sinh hôm nay' 
              : 'Bạn cần hỗ trợ gì hôm nay?'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Link
            to="/chat"
            className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 cursor-pointer"
          >
            <div className="inline-block p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
              <MessageCircle size={40} className="text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Chat với Tư vấn viên
            </h3>
            <p className="text-gray-600">
              Kết nối trực tiếp với giáo viên tâm lý để được hỗ trợ ngay lập tức
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
              Chia sẻ câu chuyện và kết nối với những người cùng hoàn cảnh
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-purple-600">
              <Shield size={16} />
              <span>100% Ẩn danh</span>
            </div>
          </Link>
        </div>

        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">💡 Tại sao chọn chúng tôi?</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="text-3xl mb-2">🛡️</div>
                <h4 className="font-semibold mb-1">Bảo mật tuyệt đối</h4>
                <p className="text-purple-100 text-sm">Thông tin được mã hóa và bảo vệ</p>
              </div>
              <div>
                <div className="text-3xl mb-2">⚡</div>
                <h4 className="font-semibold mb-1">Hỗ trợ tức thời</h4>
                <p className="text-purple-100 text-sm">Nhiều tư vấn viên luôn sẵn sàng</p>
              </div>
              <div>
                <div className="text-3xl mb-2">❤️</div>
                <h4 className="font-semibold mb-1">Cộng đồng thân thiện</h4>
                <p className="text-purple-100 text-sm">Được chia sẻ và đồng cảm</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
