/**
 * Home Page Component
 * Dashboard with feature cards and notifications
 */
import { MessageCircle, Users, Clock, Shield, Bell, Heart, CalendarClock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useQuotes } from '../hooks/useQuotes'
import { useUnreadMessages } from '../hooks/useUnreadMessages'
import { Card } from '../components/UI'
import Navbar from '../components/Layout/Navbar'
import Footer from '../components/Layout/Footer'
import CautionSection from '../components/Counselor/CautionSection'
import PendingSection from '../components/Counselor/PendingSection'
import NotificationPermissionPrompt from '../components/Notifications/NotificationPermissionPrompt'
import { ROUTES, EXTERNAL_LINKS, OPERATING_HOURS } from '../constants'
import { HOME_MESSAGES } from '../constants/messages'
import { getUserDisplayName } from '../utils/helpers'

// Background image - Psychology room (blurred)
const HOME_BG = 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=1920&q=80'

// Feature card configuration
const getFeatureCards = (isCounselor, hasNewMessages, unreadCount) => [
  {
    to: ROUTES.CHAT,
    icon: MessageCircle,
    title: isCounselor ? 'Phòng Tư vấn' : 'Chat với giáo viên tâm lý',
    description: isCounselor
      ? 'Xem và trả lời các yêu cầu tư vấn từ học sinh'
      : 'Kết nối trực tiếp với giáo viên tâm lý để được hỗ trợ ngay lập tức',
    badge: hasNewMessages ? `${unreadCount} mới` : null,
    iconBg: hasNewMessages
      ? 'bg-gradient-to-br from-orange-400 to-red-400'
      : 'bg-gradient-to-br from-blue-100 to-blue-200',
    iconColor: hasNewMessages ? 'text-white' : 'text-blue-600',
    highlighted: hasNewMessages,
    footer: { icon: Clock, text: `Hoạt động: ${OPERATING_HOURS.DISPLAY}`, color: 'text-green-600' },
  },
  {
    to: ROUTES.COMMUNITY,
    icon: Users,
    title: 'Cộng đồng Ẩn danh',
    description: isCounselor
      ? 'Giám sát và hỗ trợ trong cộng đồng học sinh'
      : 'Chia sẻ câu chuyện và kết nối với những người cùng hoàn cảnh',
    iconBg: 'bg-gradient-to-br from-purple-100 to-pink-200',
    iconColor: 'text-purple-600',
    footer: { icon: Shield, text: 'Ẩn danh hoàn toàn', color: 'text-purple-600' },
  },
]

const getSecondaryCards = (isCounselor) => [
  {
    to: ROUTES.BOOKING,
    icon: CalendarClock,
    title: 'Đặt lịch tư vấn',
    description: isCounselor ? 'Xem lịch hẹn của học sinh' : 'Đặt lịch hẹn trực tiếp tại phòng tư vấn',
    iconBg: 'bg-gradient-to-br from-green-100 to-teal-200',
    iconColor: 'text-green-600',
    footer: { icon: CalendarClock, text: 'Nhấn để đặt lịch', color: 'text-green-600' },
    external: false,
  },
  {
    to: EXTERNAL_LINKS.FACEBOOK_FANPAGE,
    icon: Heart,
    title: 'BTCT6',
    description: 'Truy cập fanpage Bức Thư Chiều Thứ 6',
    iconBg: 'bg-gradient-to-br from-red-100 to-pink-200',
    iconColor: 'text-red-500',
    footer: { icon: Heart, text: 'Nhấn để truy cập', color: 'text-red-600', fill: true },
    external: true,
  },
]

// Reusable Feature Card Component
function FeatureCard({ card, hasNewMessages, unreadCount, unreadLoading }) {
  const CardWrapper = card.external ? 'a' : Link
  const wrapperProps = card.external
    ? { href: card.to, target: '_blank', rel: 'noopener noreferrer' }
    : { to: card.to }

  return (
    <CardWrapper
      {...wrapperProps}
      className={`group relative p-6 rounded-2xl transition-all duration-300 cursor-pointer ${
        card.highlighted
          ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 shadow-lg shadow-amber-100'
          : 'bg-white/70 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-lg hover:bg-white hover:-translate-y-1'
      }`}
    >
      {/* Badge for new messages */}
      {card.badge && !unreadLoading && (
        <div className="absolute -top-2 -right-2">
          <div className="relative">
            <div className="absolute inset-0 bg-rose-400 rounded-full animate-ping opacity-50" />
            <div className="relative bg-rose-500 text-white text-xs font-medium px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <Bell size={12} />
              <span>{card.badge}</span>
            </div>
          </div>
        </div>
      )}

      {/* Icon */}
      <div
        className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 group-hover:scale-105 transition-transform ${card.iconBg}`}
      >
        <card.icon size={24} className={card.iconColor} strokeWidth={1.5} />
      </div>

      {/* Title */}
      <h3 className={`text-lg font-semibold mb-2 ${card.highlighted ? 'text-amber-800' : 'text-gray-800'}`}>
        {card.title}
      </h3>

      {/* Description */}
      {card.highlighted && hasNewMessages ? (
        <div className="space-y-1">
          <p className="text-amber-700 font-medium">
            {HOME_MESSAGES.NEW_MESSAGES(unreadCount)}
          </p>
          <p className="text-amber-600 text-sm">
            {card.isCounselor ? HOME_MESSAGES.COUNSELOR_WAITING : HOME_MESSAGES.STUDENT_WAITING}
          </p>
        </div>
      ) : (
        <p className="text-gray-600 text-sm leading-relaxed">{card.description}</p>
      )}

      {/* Footer */}
      {card.footer && (
        <div className={`mt-4 flex items-center gap-1.5 text-xs ${card.footer.color}`}>
          <card.footer.icon size={14} className={card.footer.fill ? 'fill-current' : ''} strokeWidth={1.5} />
          <span>{card.footer.text}</span>
        </div>
      )}
    </CardWrapper>
  )
}

// Quote Section Component
function QuoteSection({ quote, loading }) {
  if (loading || !quote) return null

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100 p-6 text-center">
        <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-teal-500 text-xl">"</span>
        </div>
        <p className="text-gray-700 text-lg italic leading-relaxed mb-3">{quote.content}</p>
        {quote.author && <p className="text-gray-500 text-sm">— {quote.author}</p>}
      </div>
    </div>
  )
}

// Counselor Tips Component
function CounselorTips() {
  const tips = [
    {
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      label: 'Khẩn cấp:',
      text: 'Học sinh có dấu hiệu tự tử hoặc tự gây thương tích',
    },
    {
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      label: 'Theo dõi:',
      text: 'Biểu hiện tiêu cực nhẹ - nên theo dõi thêm',
    },
    { 
      color: 'text-teal-600', 
      bg: 'bg-teal-50',
      text: 'AI tự động phân tích và cảnh báo nội dung cần chú ý' 
    },
  ]

  return (
    <div className="mt-8 max-w-2xl mx-auto bg-white/60 backdrop-blur-sm border border-gray-100 rounded-2xl p-5">
      <h3 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
        <span className="w-6 h-6 bg-teal-50 rounded-full flex items-center justify-center text-sm">📋</span>
        Lưu ý cho tư vấn viên
      </h3>
      <div className="space-y-2">
        {tips.map((tip, index) => (
          <div key={index} className={`flex items-start gap-3 p-3 ${tip.bg} rounded-xl`}>
            <span className={`${tip.color} font-medium text-sm`}>
              {tip.label || '•'}
            </span>
            <span className="text-gray-700 text-sm">{tip.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  const { user, id: userId, role, isCounselor, fullName } = useAuth()
  const { quote, loading: quoteLoading } = useQuotes()
  const { unreadCount, hasNewMessages, loading: unreadLoading } = useUnreadMessages(userId, role)

  const displayName = fullName || getUserDisplayName(user)
  const featureCards = getFeatureCards(isCounselor, hasNewMessages, unreadCount)
  const secondaryCards = getSecondaryCards(isCounselor)

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with blur */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${HOME_BG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px) brightness(0.85)'
        }}
      />
      {/* Gradient overlay */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-teal-900/30 via-emerald-800/20 to-cyan-900/30" />
      
      {/* Floating Orbs for depth */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="floating-orb floating-orb-1"></div>
        <div className="floating-orb floating-orb-2"></div>
        <div className="floating-orb floating-orb-3"></div>
      </div>
      
      <div className="relative z-10">
        <Navbar />
        <NotificationPermissionPrompt userId={userId} />

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Welcome Header */}
          <header className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full text-sm text-teal-700 mb-4 border border-teal-100">
              <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></span>
              Phòng Tham Vấn Tâm Lý Trực Tuyến
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold text-white mb-3 drop-shadow-lg">
              Xin chào, <span className="text-teal-300">{displayName}</span>
            </h1>
            <p className="text-white/90 text-lg max-w-xl mx-auto drop-shadow">
              {isCounselor 
                ? 'Chào mừng bạn đến với không gian hỗ trợ học sinh' 
                : 'Đây là nơi an toàn để bạn được lắng nghe và hỗ trợ'
              }
            </p>
          </header>

          {/* Main Features */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {featureCards.map((card, index) => (
              <FeatureCard
                key={index}
                card={card}
                hasNewMessages={hasNewMessages}
                unreadCount={unreadCount}
                unreadLoading={unreadLoading}
              />
            ))}
          </div>

          {/* Secondary Features */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-6">
            {secondaryCards.map((card, index) => (
              <FeatureCard key={index} card={card} />
            ))}
          </div>

          {/* Quote Section */}
          <QuoteSection quote={quote} loading={quoteLoading} />

          {/* Counselor-only Sections */}
          {isCounselor && (
            <>
              <div className="mb-8">
                <CautionSection />
              </div>
              <div className="mb-8">
                <PendingSection />
              </div>
              <CounselorTips />
            </>
          )}
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}
