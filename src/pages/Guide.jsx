/**
 * Guide Page Component (HDSD - Hướng dẫn sử dụng)
 * Walkthrough scroll style user guide
 */
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { 
  MessageCircle, 
  Users, 
  Shield, 
  Bell, 
  User, 
  Heart,
  ChevronDown,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Lock,
  Send,
  ClipboardList,
  MessageSquarePlus
} from 'lucide-react'
import Navbar from '../components/Layout/Navbar'
import Footer from '../components/Layout/Footer'
import { ROUTES } from '../constants'

const GUIDE_SECTIONS = [
  {
    id: 'welcome',
    title: 'Chào mừng đến với S-Net',
    subtitle: 'Nền tảng hỗ trợ sức khỏe tâm lý học đường',
    description: 'S-Net là cầu nối giữa học sinh và các chuyên gia tâm lý tại trường. Hãy cùng khám phá các tính năng giúp bạn được lắng nghe và hỗ trợ.',
    icon: Heart,
    color: 'from-teal-400 to-cyan-500',
    image: null // Will add later
  },
  {
    id: 'chat',
    title: 'Tư vấn trực tuyến',
    subtitle: 'Chat 1-1 hoặc nhóm với tư vấn viên',
    description: 'Bạn có thể trò chuyện trực tiếp với các thầy cô tư vấn tâm lý. Mọi cuộc trò chuyện đều được bảo mật và chỉ có bạn và tư vấn viên mới xem được.',
    icon: MessageCircle,
    color: 'from-blue-400 to-indigo-500',
    features: [
      'Chat riêng tư với tư vấn viên',
      'Nhiều tư vấn viên có thể hỗ trợ bạn',
      'Lưu lịch sử tin nhắn an toàn',
      'Thông báo khi có phản hồi'
    ],
    image: null
  },
  {
    id: 'community',
    title: 'Cộng đồng ẩn danh',
    subtitle: 'Chia sẻ và kết nối với mọi người',
    description: 'Đăng bài chia sẻ tâm sự hoàn toàn ẩn danh. Không ai biết bạn là ai, nhưng bạn có thể nhận được sự đồng cảm và hỗ trợ từ cộng đồng.',
    icon: Users,
    color: 'from-purple-400 to-pink-500',
    features: [
      'Đăng bài hoàn toàn ẩn danh',
      'Bình luận và tương tác',
      'AI kiểm duyệt nội dung độc hại',
      'Tư vấn viên theo dõi và hỗ trợ'
    ],
    image: null
  },
  {
    id: 'anonymous',
    title: 'Bảo mật & Ẩn danh',
    subtitle: 'An toàn là ưu tiên hàng đầu',
    description: 'Khi bật chế độ ẩn danh, tên và avatar của bạn sẽ được thay thế bằng tên ngẫu nhiên. Không ai có thể biết bạn là ai.',
    icon: Lock,
    color: 'from-amber-400 to-orange-500',
    features: [
      'Tên hiển thị ngẫu nhiên',
      'Avatar ẩn danh',
      'Chỉ tư vấn viên mới biết danh tính (bảo mật)',
      'Bạn có thể tắt/bật bất cứ lúc nào'
    ],
    image: null
  },
  {
    id: 'survey',
    title: 'Khảo sát & Góp ý',
    subtitle: 'Giúp chúng tôi phục vụ bạn tốt hơn',
    description: 'Tham gia các khảo sát về sức khỏe tâm lý và góp ý để cải thiện dịch vụ.',
    icon: ClipboardList,
    color: 'from-green-400 to-emerald-500',
    features: [
      'Khảo sát sức khỏe tâm lý định kỳ',
      'Đánh giá phiên tư vấn',
      'Góp ý website',
      'Đề xuất tính năng mới'
    ],
    image: null
  },
  {
    id: 'notifications',
    title: 'Thông báo',
    subtitle: 'Không bỏ lỡ tin nhắn quan trọng',
    description: 'Nhận thông báo khi có tin nhắn mới, bình luận hoặc cập nhật từ tư vấn viên.',
    icon: Bell,
    color: 'from-rose-400 to-red-500',
    features: [
      'Thông báo tin nhắn mới',
      'Thông báo bình luận',
      'Badge hiển thị số chưa đọc',
      'Có thể bật thông báo trình duyệt'
    ],
    image: null
  },
  {
    id: 'start',
    title: 'Bắt đầu ngay!',
    subtitle: 'Chỉ vài bước đơn giản',
    description: 'Đăng nhập và bắt đầu trải nghiệm S-Net. Chúng tôi luôn ở đây để lắng nghe bạn.',
    icon: Sparkles,
    color: 'from-teal-400 to-cyan-500',
    cta: true,
    image: null
  }
]

export default function Guide() {
  const [activeSection, setActiveSection] = useState(0)
  const sectionRefs = useRef([])

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2

      sectionRefs.current.forEach((ref, index) => {
        if (ref) {
          const { offsetTop, offsetHeight } = ref
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(index)
          }
        }
      })
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (index) => {
    sectionRefs.current[index]?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50">
      <Navbar />

      {/* Progress Indicator */}
      <div className="fixed left-8 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-3">
        {GUIDE_SECTIONS.map((section, index) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(index)}
            className={`group flex items-center gap-3 transition-all ${
              activeSection === index ? 'scale-110' : 'opacity-50 hover:opacity-100'
            }`}
          >
            <div className={`w-3 h-3 rounded-full transition-all ${
              activeSection === index 
                ? `bg-gradient-to-r ${section.color} shadow-lg` 
                : 'bg-gray-300'
            }`} />
            <span className={`text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ${
              activeSection === index ? 'text-teal-600' : 'text-gray-500'
            }`}>
              {section.title}
            </span>
          </button>
        ))}
      </div>

      {/* Sections */}
      <div className="relative">
        {GUIDE_SECTIONS.map((section, index) => (
          <section
            key={section.id}
            ref={el => sectionRefs.current[index] = el}
            className="min-h-screen flex items-center justify-center px-4 py-20"
          >
            <div className="max-w-4xl mx-auto text-center">
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br ${section.color} shadow-2xl mb-8 animate-float`}>
                <section.icon size={48} className="text-white" />
              </div>

              {/* Content */}
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                {section.title}
              </h2>
              <p className="text-xl text-teal-600 font-medium mb-6">
                {section.subtitle}
              </p>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                {section.description}
              </p>

              {/* Features List */}
              {section.features && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
                  {section.features.map((feature, i) => (
                    <div 
                      key={i}
                      className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 shadow-sm"
                    >
                      <CheckCircle2 size={20} className="text-teal-500 flex-shrink-0" />
                      <span className="text-gray-700 text-left">{feature}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Image Placeholder */}
              {section.image === null && !section.cta && (
                <div className="bg-gray-100 rounded-2xl h-64 max-w-lg mx-auto flex items-center justify-center text-gray-400 mb-8">
                  <span>Hình ảnh minh họa sẽ được thêm sau</span>
                </div>
              )}

              {/* CTA Button */}
              {section.cta && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to={ROUTES.HOME}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                  >
                    <span>Vào trang chủ</span>
                    <ArrowRight size={20} />
                  </Link>
                  <Link
                    to={ROUTES.CHAT}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white text-teal-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border border-teal-200"
                  >
                    <MessageCircle size={20} />
                    <span>Bắt đầu chat</span>
                  </Link>
                </div>
              )}

              {/* Scroll Indicator */}
              {index < GUIDE_SECTIONS.length - 1 && (
                <button
                  onClick={() => scrollToSection(index + 1)}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-gray-400 hover:text-teal-500 transition-colors"
                >
                  <ChevronDown size={32} />
                </button>
              )}
            </div>
          </section>
        ))}
      </div>

      <Footer />
    </div>
  )
}
