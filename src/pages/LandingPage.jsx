import { Link, useNavigate } from 'react-router-dom'
import { MessageCircle, Users, Shield, Clock, Heart, Lock, ArrowRight, CheckCircle, Star } from 'lucide-react'
import { useQuotes } from '../hooks/useQuotes'

export default function LandingPage() {
  const navigate = useNavigate()
  const { quote, loading: quoteLoading } = useQuotes()

  const handleFeatureClick = (feature) => {
    // Redirect to register page with a message
    navigate('/register', { state: { from: feature } })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400">
      {/* Navbar for non-authenticated users */}
      <nav className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-gray-200 sticky top-0 z-50">
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
                to="/login"
                className="px-4 py-2 text-gray-700 hover:text-purple-600 transition-colors font-medium"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-all font-medium shadow-lg"
              >
                Đăng ký ngay
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="mb-8 animate-fade-in">
          <div className="inline-block p-4 bg-white/20 backdrop-blur-sm rounded-3xl mb-6">
            <Shield size={80} className="text-white" />
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Nền tảng hỗ trợ tâm lý học đường
            <br />
            <span className="bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
              Dành cho Fschool
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            Nơi an toàn để học sinh chia sẻ, được lắng nghe và nhận sự hỗ trợ từ các tư vấn viên tâm lý chuyên nghiệp
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/register"
              className="px-8 py-4 bg-white text-purple-600 rounded-full text-lg font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl flex items-center gap-2"
            >
              Đăng ký ngay
              <ArrowRight size={20} />
            </Link>
            <button
              onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-full text-lg font-bold hover:bg-white/30 transition-all border-2 border-white"
            >
              Tìm hiểu thêm
            </button>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-16">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-white">
            <Shield size={32} className="mx-auto mb-2" />
            <div className="text-3xl font-bold">100%</div>
            <div className="text-sm opacity-90">Bảo mật</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-white">
            <Users size={32} className="mx-auto mb-2" />
            <div className="text-3xl font-bold">24/7</div>
            <div className="text-sm opacity-90">Hỗ trợ</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-white">
            <Heart size={32} className="mx-auto mb-2" />
            <div className="text-3xl font-bold">1+</div>
            <div className="text-sm opacity-90">Học sinh</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-white">
            <Star size={32} className="mx-auto mb-2" />
            <div className="text-3xl font-bold">0.0/5</div>
            <div className="text-sm opacity-90">Đánh giá</div>
          </div>
        </div>
      </div>

      {/* Features Preview Section */}
      <div id="features" className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-bold text-white mb-4">
            Các tính năng nổi bật
          </h3>
          <p className="text-xl text-white/90">
            Trải nghiệm đầy đủ sau khi đăng ký tài khoản
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Private Chat Feature */}
          <button
            onClick={() => handleFeatureClick('chat')}
            className="group relative p-8 bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all transform hover:-translate-y-2 text-left overflow-hidden"
          >
            {/* Lock overlay */}
            <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
              <Lock size={14} />
              Cần đăng ký
            </div>

            <div className="inline-block p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
              <MessageCircle size={40} className="text-blue-600" />
            </div>

            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Chat riêng tư với Tư vấn viên
            </h3>

            <p className="text-gray-600 mb-4">
              Kết nối trực tiếp một-một với các tư vấn viên tâm lý được đào tạo chuyên nghiệp. Mọi cuộc trò chuyện được mã hóa và bảo mật tuyệt đối.
            </p>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle size={16} className="text-green-500" />
                <span>Bảo mật 100%, không ai khác xem được</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle size={16} className="text-green-500" />
                <span>Tư vấn viên phản hồi nhanh trong giờ làm việc</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle size={16} className="text-green-500" />
                <span>Chọn tư vấn viên phù hợp với bạn</span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 text-sm text-purple-600 font-semibold group-hover:gap-3 transition-all">
              Đăng ký để sử dụng
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>

            {/* Gradient glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-3xl"></div>
          </button>

          {/* Community Feature */}
          <button
            onClick={() => handleFeatureClick('community')}
            className="group relative p-8 bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all transform hover:-translate-y-2 text-left overflow-hidden"
          >
            {/* Lock overlay */}
            <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
              <Lock size={14} />
              Cần đăng ký
            </div>

            <div className="inline-block p-4 bg-gradient-to-br from-purple-100 to-pink-200 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
              <Users size={40} className="text-purple-600" />
            </div>

            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Cộng đồng Ẩn danh
            </h3>

            <p className="text-gray-600 mb-4">
              Chia sẻ câu chuyện và kết nối với những người có cùng hoàn cảnh trong một môi trường hoàn toàn ẩn danh và an toàn.
            </p>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle size={16} className="text-green-500" />
                <span>Hoàn toàn ẩn danh - Không ai biết bạn là ai</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle size={16} className="text-green-500" />
                <span>AI kiểm duyệt nội dung tự động</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle size={16} className="text-green-500" />
                <span>Đăng bài, bình luận và tương tác tự do</span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 text-sm text-purple-600 font-semibold group-hover:gap-3 transition-all">
              Đăng ký để sử dụng
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>

            {/* Gradient glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-3xl"></div>
          </button>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">
            Tại sao chọn S-Net?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield size={32} className="text-white" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">
                Bảo mật tuyệt đối
              </h4>
              <p className="text-white/80">
                Mọi thông tin của bạn được mã hóa và bảo mật theo tiêu chuẩn quốc tế
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart size={32} className="text-white" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">
                Tư vấn viên chuyên nghiệp
              </h4>
              <p className="text-white/80">
                Đội ngũ tư vấn viên tâm lý được đào tạo bài bản và có kinh nghiệm
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock size={32} className="text-white" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">
                Hỗ trợ liên tục
              </h4>
              <p className="text-white/80">
                Luôn có tư vấn viên sẵn sàng hỗ trợ bạn trong giờ làm việc
              </p>
            </div>
          </div>
        </div>
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

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-12 text-center shadow-2xl">
          <h3 className="text-4xl font-bold text-white mb-4">
            Sẵn sàng bắt đầu hành trình của bạn?
          </h3>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Đăng ký miễn phí ngay hôm nay và trải nghiệm một môi trường an toàn, thân thiện để chia sẻ và được hỗ trợ
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 bg-white text-purple-600 rounded-full text-lg font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl flex items-center justify-center gap-2"
            >
              Đăng ký miễn phí
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-full text-lg font-bold hover:bg-white/30 transition-all border-2 border-white"
            >
              Đã có tài khoản? Đăng nhập
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/10 backdrop-blur-md border-t border-white/20 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-white/80">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield size={24} className="text-white" />
            <span className="text-xl font-bold text-white">S-Net</span>
          </div>
          <p className="text-sm mb-2">
            Nền tảng hỗ trợ tâm lý học đường
          </p>
          <p className="text-xs">
            © 2025 S-Net by CBKC. All rights reserved.
          </p>
          <div className="mt-4">
            <p className="text-xs">
              Đường dây nóng hỗ trợ tâm lý: <strong>1800 599 920</strong>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
