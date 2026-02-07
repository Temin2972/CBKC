import { Link, useNavigate } from 'react-router-dom'
import { MessageCircle, Users, Shield, Clock, Heart, Lock, ArrowRight, CheckCircle, Star, Sparkles, Zap, Brain, Quote, Leaf, BookOpen } from 'lucide-react'
import { useQuotes } from '../hooks/useQuotes'
import Footer from '../components/Layout/Footer'
import { ROUTES } from '../constants'

export default function LandingPage() {
  const navigate = useNavigate()
  const { quote, loading: quoteLoading } = useQuotes()

  const handleFeatureClick = (feature) => {
    navigate('/register', { state: { from: feature } })
  }

  return (
    <div className="min-h-screen bg-animated-gradient text-gray-900 overflow-hidden relative">
      {/* Floating Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="floating-orb floating-orb-1"></div>
        <div className="floating-orb floating-orb-2"></div>
        <div className="floating-orb floating-orb-3"></div>
      </div>

      {/* Navbar - Clean design like reference */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <Heart className="w-8 h-8 text-teal-500 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                <div className="absolute inset-0 bg-teal-400/20 blur-lg rounded-full" />
              </div>
              <span className="text-xl font-semibold text-gray-800">S-Net</span>
            </Link>

            {/* Center Nav Items */}
            <div className="hidden md:flex items-center gap-1 bg-gray-50/80 rounded-full px-2 py-1">
              <button
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-teal-600 rounded-full transition-colors"
              >
                Tính năng
              </button>
              <Link
                to={ROUTES.GUIDE}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-teal-600 rounded-full transition-colors flex items-center gap-1"
              >
                <BookOpen size={14} />
                Hướng dẫn
              </Link>
              <button
                onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-teal-600 rounded-full transition-colors"
              >
                Về chúng tôi
              </button>
              <button
                onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-teal-600 rounded-full transition-colors"
              >
                Liên hệ
              </button>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-full text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Bắt đầu
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content wrapper with z-index */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="relative pt-28 pb-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md border border-white/50 rounded-full mb-6 shadow-lg">
                <Leaf size={16} className="text-teal-600" />
                <span className="text-sm font-medium text-gray-700">Phòng tham vấn tâm lý trực tuyến cho học sinh</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl md:text-6xl font-bold mb-5 text-gray-800 leading-tight">
                Nơi an toàn để
                <br />
                <span className="text-teal-400">bạn được lắng nghe</span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-gray-800 mb-8 max-w-2xl mx-auto leading-relaxed">
                Kết nối với tư vấn viên tâm lý hoặc chia sẻ ẩn danh trong cộng đồng an toàn, được bảo vệ bởi AI
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Link
                  to="/register"
                  className="group px-8 py-3.5 bg-teal-500 hover:bg-teal-600 text-white rounded-full text-base font-medium shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 transition-all duration-200 flex items-center gap-2"
                >
                  Bắt đầu ngay
                  <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <button
                  onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-3.5 bg-white/90 backdrop-blur-md text-gray-800 rounded-full text-base font-medium hover:bg-white transition-all duration-200 border border-white/50 shadow-lg"
                >
                  Tìm hiểu thêm
                </button>
              </div>

              {/* Stats */}
              <div className="mt-14 grid grid-cols-3 gap-6 max-w-lg mx-auto">
                <div className="text-center p-4 bg-white/85 backdrop-blur-md rounded-2xl border border-white/50 shadow-lg">
                  <div className="text-2xl md:text-3xl font-bold text-teal-600">100%</div>
                  <div className="text-gray-600 text-sm mt-1 font-medium">Bảo mật</div>
                </div>
                <div className="text-center p-4 bg-white/85 backdrop-blur-md rounded-2xl border border-white/50 shadow-lg">
                  <div className="text-2xl md:text-3xl font-bold text-cyan-600">24/7</div>
                  <div className="text-gray-600 text-sm mt-1 font-medium">Cộng đồng</div>
                </div>
                <div className="text-center p-4 bg-white/85 backdrop-blur-md rounded-2xl border border-white/50 shadow-lg">
                  <div className="text-2xl md:text-3xl font-bold text-purple-600">AI</div>
                  <div className="text-gray-600 text-sm mt-1 font-medium">Kiểm duyệt</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-3">
                Dịch vụ <span className="text-teal-600">hỗ trợ</span>
              </h2>
              <p className="text-gray-600">
                Chọn phương thức phù hợp với bạn
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Private Chat Card */}
              <button
                onClick={() => handleFeatureClick('chat')}
                className="group relative p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 hover:border-teal-200 shadow-sm hover:shadow-lg transition-all duration-300 text-left hover:-translate-y-1"
              >
                <div className="absolute top-4 right-4 px-3 py-1 bg-teal-50 text-teal-600 rounded-full text-xs font-medium flex items-center gap-1">
                  <Lock size={12} />
                  Đăng ký
                </div>

                <div className="w-12 h-12 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <MessageCircle size={24} className="text-teal-600" strokeWidth={1.5} />
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Chat với Tư vấn viên
                </h3>

                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  Kết nối 1-1 với tư vấn viên tâm lý. Mọi cuộc trò chuyện được bảo mật tuyệt đối.
                </p>

                <div className="space-y-2">
                  {['Bảo mật 100%', 'Phản hồi nhanh', 'Chọn tư vấn viên'].map((text, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle size={14} className="text-teal-500" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center gap-2 text-teal-600 text-sm font-medium">
                  Bắt đầu ngay
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Community Card */}
              <button
                onClick={() => handleFeatureClick('community')}
                className="group relative p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 hover:border-purple-200 shadow-sm hover:shadow-lg transition-all duration-300 text-left hover:-translate-y-1"
              >
                <div className="absolute top-4 right-4 px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-medium flex items-center gap-1">
                  <Lock size={12} />
                  Đăng ký
                </div>

                <div className="w-12 h-12 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Users size={24} className="text-purple-600" strokeWidth={1.5} />
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Cộng đồng Ẩn danh
                </h3>

                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  Chia sẻ câu chuyện trong môi trường hoàn toàn ẩn danh và an toàn.
                </p>

                <div className="space-y-2">
                  {['Hoàn toàn ẩn danh', 'AI kiểm duyệt', 'Đăng bài tự do'].map((text, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle size={14} className="text-purple-500" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center gap-2 text-purple-600 text-sm font-medium">
                  Khám phá ngay
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section id="about" className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-10 text-center">
                Tại sao chọn <span className="text-teal-600">S-Net</span>?
              </h2>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { icon: Shield, title: 'Bảo mật tuyệt đối', desc: 'Mọi thông tin được mã hóa theo chuẩn quốc tế', color: 'from-teal-400 to-cyan-400', bg: 'bg-teal-50' },
                  { icon: Heart, title: 'Chuyên nghiệp', desc: 'Đội ngũ tư vấn viên được đào tạo bài bản', color: 'from-rose-400 to-pink-400', bg: 'bg-rose-50' },
                  { icon: Clock, title: 'Hỗ trợ liên tục', desc: 'Luôn sẵn sàng hỗ trợ trong giờ làm việc', color: 'from-purple-400 to-violet-400', bg: 'bg-purple-50' },
                ].map(({ icon: Icon, title, desc, color, bg }, i) => (
                  <div key={i} className="text-center">
                    <div className={`w-14 h-14 ${bg} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                      <Icon size={26} className={`bg-gradient-to-r ${color} bg-clip-text`} style={{ color: color.includes('teal') ? '#14b8a6' : color.includes('rose') ? '#f43f5e' : '#a855f7' }} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
                    <p className="text-gray-600 text-sm">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Quote Section */}
        {!quoteLoading && quote && (
          <section className="py-12 px-4">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100 p-8 text-center">
                <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-teal-500 text-xl">"</span>
                </div>
                <p className="text-lg md:text-xl text-gray-700 mb-3 italic leading-relaxed">
                  {quote.content}
                </p>
                {quote.author && (
                  <p className="text-gray-500 text-sm">— {quote.author}</p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Final CTA Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl p-10 md:p-14 text-center overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>

              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
                  Sẵn sàng bắt đầu?
                </h2>
                <p className="text-lg text-white/90 mb-8 max-w-xl mx-auto">
                  Đăng ký miễn phí và trải nghiệm môi trường an toàn để được hỗ trợ
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    to="/register"
                    className="group px-8 py-3 bg-white text-teal-600 rounded-full font-medium hover:bg-gray-50 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    Đăng ký miễn phí
                    <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link
                    to="/login"
                    className="px-8 py-3 bg-white/20 backdrop-blur-sm text-white rounded-full font-medium hover:bg-white/30 transition-all border border-white/40"
                  >
                    Đăng nhập
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}
