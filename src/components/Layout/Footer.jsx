/**
 * Footer Component
 * Contains hotline, address, and links to Info/Contact/Donate pages
 */
import { Link } from 'react-router-dom'
import { 
  Heart, 
  Phone, 
  MapPin, 
  Mail,
  ExternalLink,
  Facebook,
  Info,
  HeartHandshake,
  MessageCircle,
  BookOpen
} from 'lucide-react'
import { ROUTES, EXTERNAL_LINKS } from '../../constants'

const HOTLINES = [
  { name: 'Hotline Tâm lý Quốc gia', number: '1800 599 920', note: 'Miễn phí 24/7' },
  { name: 'Phòng Tâm lý Học đường', number: '024 7300 1866', note: 'Trong giờ hành chính' },
]

const QUICK_LINKS = [
  { to: ROUTES.GUIDE, icon: BookOpen, label: 'Hướng dẫn sử dụng' },
  { to: ROUTES.INFO, icon: Info, label: 'Về chúng tôi' },
  { to: ROUTES.CONTACT, icon: MessageCircle, label: 'Liên hệ' },
  { to: ROUTES.DONATE, icon: HeartHandshake, label: 'Ủng hộ dự án' },
]

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-800 to-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand & Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-8 h-8 text-teal-400" />
              <span className="text-xl font-bold">S-Net</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Nền tảng hỗ trợ sức khỏe tâm lý học đường, kết nối học sinh với các chuyên gia tâm lý.
            </p>
            <p className="text-gray-500 text-xs">
              by CBKC Team - THPT FPT Hà Nội
            </p>
          </div>

          {/* Hotlines */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Phone size={18} className="text-teal-400" />
              Hotline Tâm lý
            </h3>
            <div className="space-y-3">
              {HOTLINES.map((hotline, index) => (
                <div key={index} className="bg-gray-700/50 rounded-lg p-3">
                  <a 
                    href={`tel:${hotline.number.replace(/\s/g, '')}`}
                    className="text-teal-400 font-semibold text-lg hover:text-teal-300 transition-colors"
                  >
                    {hotline.number}
                  </a>
                  <p className="text-gray-300 text-sm">{hotline.name}</p>
                  <p className="text-gray-500 text-xs">{hotline.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              {QUICK_LINKS.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.to}
                    className="flex items-center gap-2 text-gray-400 hover:text-teal-400 transition-colors"
                  >
                    <link.icon size={16} />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={EXTERNAL_LINKS.FACEBOOK_FANPAGE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors"
                >
                  <Facebook size={16} />
                  <span>Bức Thư Chiều Thứ 6</span>
                  <ExternalLink size={12} />
                </a>
              </li>
            </ul>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-teal-400" />
              Địa chỉ
            </h3>
            <div className="space-y-3 text-gray-400 text-sm">
              <p>
                <strong className="text-gray-300">Phòng Tâm lý Học đường</strong>
              </p>
              <p>
                Trường THPT FPT Hà Nội<br />
                Khu Công nghệ cao Hòa Lạc<br />
                Thạch Thất, Hà Nội
              </p>
              <a 
                href="mailto:support@snet.fpt.edu.vn"
                className="flex items-center gap-2 hover:text-teal-400 transition-colors"
              >
                <Mail size={14} />
                support@snet.fpt.edu.vn
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © 2026 S-Net by CBKC. Made with ❤️ for students.
          </p>
          <div className="flex items-center gap-4 text-gray-500 text-sm">
            <span>Bạn không cô đơn. Chúng tôi luôn ở đây.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
