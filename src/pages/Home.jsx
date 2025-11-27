import { Link } from 'react-router-dom'
import { MessageCircle, Users, Lock, Heart } from 'lucide-react'
import QuoteDisplay from '../components/Common/QuoteDisplay'

export default function Home({ user }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          {user ? (
            <div className="mb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Xin chào, {user.user_metadata?.full_name || user.email}! 👋
              </h1>
              <p className="text-xl text-gray-600">
                Chào mừng trở lại với không gian tâm lý của bạn
              </p>
            </div>
          ) : (
            <div className="mb-6">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Tâm Lý Học Đường
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8">
                Không gian tâm lý an toàn và thân thiện cho học sinh
              </p>
            </div>
          )}

          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
              >
                Bắt đầu ngay
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 bg-white text-purple-600 border-2 border-purple-500 rounded-full font-semibold hover:bg-purple-50 transition-all"
              >
                Đăng nhập
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Quote Section - Replacing "Why Choose Us" */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8">
            💭 Lời động viên
          </h2>
          <QuoteDisplay />
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            ✨ Tính năng nổi bật
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="text-purple-600" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Tư vấn 1-1
              </h3>
              <p className="text-gray-600">
                Trò chuyện riêng tư với tư vấn viên chuyên nghiệp
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                <Users className="text-pink-600" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Cộng đồng
              </h3>
              <p className="text-gray-600">
                Chia sẻ và kết nối với bạn bè cùng trường
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Lock className="text-blue-600" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Bảo mật
              </h3>
              <p className="text-gray-600">
                Thông tin cá nhân được bảo vệ tuyệt đối
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Heart className="text-green-600" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Hỗ trợ 24/7
              </h3>
              <p className="text-gray-600">
                Luôn có người sẵn sàng lắng nghe và giúp đỡ bạn
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Sẵn sàng bắt đầu?
            </h2>
            <p className="text-xl mb-8 text-purple-100">
              Tham gia cộng đồng và nhận được sự hỗ trợ bạn cần
            </p>
            <Link
              to="/register"
              className="inline-block px-8 py-4 bg-white text-purple-600 rounded-full font-semibold hover:bg-gray-100 transition-all transform hover:scale-105"
            >
              Đăng ký miễn phí
            </Link>
          </div>
        </section>
      )}

      {/* Quick Links for Logged In Users */}
      {user && (
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
              🚀 Khám phá ngay
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Link
                to="/community"
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Cộng đồng
                </h3>
                <p className="text-gray-600">
                  Xem các bài viết và chia sẻ câu chuyện của bạn
                </p>
              </Link>

              <Link
                to="/chat"
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Tư vấn
                </h3>
                <p className="text-gray-600">
                  Trò chuyện riêng tư với tư vấn viên
                </p>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
